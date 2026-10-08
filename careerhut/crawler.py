"""
Careerhut Crawler - Direct Company Career Page Discovery & Multi-Engine Fetcher
Integrates Agent Reach Reader (Jina), Playwright headless rendering, and direct HTTP requests.
"""

import re
import time
import asyncio
import threading
import urllib.request
import urllib.parse
from urllib.parse import urljoin, urlparse
from typing import List, Dict, Any, Optional
import requests

from .models import JobListing, ScrapeResult
from .extractor import CareerPageExtractor
from .storage import JobStorage

CAREER_PATH_CANDIDATES = [
    "/careers",
    "/jobs",
    "/careers/jobs",
    "/careers/openings",
    "/open-roles",
    "/join-us",
    "/work-with-us",
    "/about/careers",
    "/company/careers",
    "/en/careers",
    "/en/jobs"
]


class CareerCrawler:
    def __init__(self, storage: Optional[JobStorage] = None):
        self.storage = storage or JobStorage()
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9"
        })

    def _normalize_url(self, raw_url: str) -> str:
        url = raw_url.strip()
        if not url.startswith("http://") and not url.startswith("https://"):
            url = "https://" + url
        return url

    def discover_career_page_url(self, company_url: str) -> str:
        """Find the dedicated career page URL from a company domain."""
        norm_url = self._normalize_url(company_url)
        parsed = urlparse(norm_url)

        if any(keyword in parsed.path.lower() for keyword in ["career", "job", "opening", "role", "position", "work"]):
            return norm_url

        base_origin = f"{parsed.scheme}://{parsed.netloc}"

        for path in CAREER_PATH_CANDIDATES:
            target = base_origin + path
            try:
                resp = self.session.head(target, timeout=4, allow_redirects=True)
                if resp.status_code < 400:
                    return resp.url or target
            except Exception:
                continue

        return norm_url

    def fetch_via_agent_reach_reader(self, url: str) -> Optional[str]:
        """Fetch using the Agent Reach Jina Reader endpoint to bypass Cloudflare/bot blocks."""
        try:
            reader_url = f"https://r.jina.ai/{url}"
            resp = self.session.get(reader_url, headers={"Accept": "text/plain"}, timeout=15)
            if resp.status_code == 200 and len(resp.text) > 100:
                return resp.text
        except Exception:
            pass
        return None

    def fetch_html_http(self, url: str) -> str:
        """Direct HTTP fetch."""
        resp = self.session.get(url, timeout=12)
        resp.raise_for_status()
        return resp.text

    async def fetch_html_playwright(self, url: str) -> str:
        """Fetch rendered HTML using Playwright for heavy JavaScript client-side SPAs."""
        try:
            from playwright.async_api import async_playwright
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                page = await browser.new_page(
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
                )
                await page.goto(url, wait_until="domcontentloaded", timeout=18000)
                await page.wait_for_timeout(2000)
                content = await page.content()
                await browser.close()
                return content
        except Exception:
            return self.fetch_html_http(url)

    def _enrich_thin_jobs(self, jobs: List[JobListing]) -> None:
        """Fetch the JD for rows the listing page itself could not describe.

        Client-rendered boards (remote.com/openings, jobs.deel.com) publish only
        titles on the listing page; the description lives on each role's own
        page or JSON endpoint.
        """
        urls = [j.job_url for j in jobs if j.job_url and len(j.description or "") < 400]
        if not urls:
            return
        try:
            from .enrich import JobEnricher
            enricher = JobEnricher(storage=self.storage, max_workers=6)
            enricher.enrich_jobs(only_thin=False, job_urls=urls, limit=len(urls))
        except Exception:
            pass

    def crawl_sync(
        self,
        company_url: str,
        max_jobs: int = 500,
        use_browser: bool = True,
        refresh: bool = False,
        enrich_thin: bool = True,
        async_enrich: bool = False,
    ) -> ScrapeResult:
        """Crawl one career page through the full engine cascade.

        Delegates to the mass crawler so a single URL pasted into the dashboard
        gets exactly the same treatment as a batch run: first-party ATS board
        first (exact titles + full description), page render second, reader /
        headless browser last.
        """
        from .mass_crawler import MassCrawler

        start_time = time.time()
        career_url = self.discover_career_page_url(company_url)
        company_name = CareerPageExtractor(base_company_url=company_url).company_name
        engine = None
        errored = False

        try:
            mass = MassCrawler(storage=self.storage, max_workers=1, use_browser=use_browser)
            result = mass.crawl_company(career_url, max_jobs=max_jobs)
            jobs: List[JobListing] = result.get("jobs") or []
            engine = result.get("engine")
            if result.get("company"):
                company_name = result["company"]
            career_url = result.get("career_url") or career_url
            error_message = None if jobs else (result.get("error") or "No open positions found on this company career page.")
        except Exception as e:
            jobs = []
            errored = True
            error_message = str(e)

        if jobs:
            if refresh:
                # Clean re-crawl: drop this employer's stale rows first so junk
                # titles from an older run cannot survive beside the fresh ones.
                try:
                    host = urlparse(career_url).netloc.lower().replace("www.", "")
                    self.storage.purge_company_rows(names=[company_name], hosts=[host] if host else None)
                except Exception:
                    pass
            try:
                self.storage.save_jobs(jobs)
            except Exception:
                pass
            if enrich_thin:
                if async_enrich:
                    # Keep the HTTP response snappy: JDs stream in afterwards.
                    threading.Thread(
                        target=self._enrich_thin_jobs, args=(jobs,), daemon=True
                    ).start()
                else:
                    self._enrich_thin_jobs(jobs)

        duration = round(time.time() - start_time, 2)
        return ScrapeResult(
            company_name=company_name,
            career_url=career_url,
            jobs_count=len(jobs),
            jobs=jobs,
            duration_seconds=duration,
            status="success" if jobs else ("error" if errored else "partial"),
            error_message=None if jobs else error_message,
        )

    async def crawl_company_career_page(
        self,
        company_url: str,
        max_jobs: int = 100,
        deep_scrape: bool = True,
        use_browser: bool = True,
        refresh: bool = False
    ) -> ScrapeResult:
        return self.crawl_sync(company_url, max_jobs=max_jobs, use_browser=use_browser, refresh=refresh)
