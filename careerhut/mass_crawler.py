"""
Careerhut Mass Crawler - concurrent multi-company career page job harvesting.

For every company it runs a fetch cascade, taking the first engine that yields
jobs (all restricted to the employer's own career page / career-page backend):

  1. First-party ATS career-page API  (Greenhouse / Lever / Ashby / Workable / Recruitee)
  2. Direct HTTP render of the career page + DOM/JSON-LD extraction
  3. Agent Reach Jina Reader (r.jina.ai) render -> markdown extraction
  4. Headless browser (Playwright) render, optional

Companies are crawled in parallel; jobs are deduplicated and written to SQLite
by the calling thread to avoid write contention.
"""

import time
import re
import threading
import asyncio
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Dict, Any, Optional, Callable, Union

import requests

from .models import JobListing
from .extractor import CareerPageExtractor, _STRONG_JOB_URL_RE, _JUNK_LINK_TEXT, is_placeholder_title
from .storage import JobStorage
from .ats import fetch_from_ats
from .content import extract_logo_url, fallback_logo_url, derive_application_email
from .sources import detect_ats, references_ats, guess_ats_candidates, hinted_providers, seed_name_for_url, SEED_COMPANIES

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
)

# Lightweight probe endpoints for guessed ATS tokens.
_GUESS_URLS = {
    "greenhouse": lambda t: f"https://boards-api.greenhouse.io/v1/boards/{t}/jobs",
    "ashby": lambda t: f"https://api.ashbyhq.com/posting-api/job-board/{t}",
    "lever": lambda t: f"https://api.lever.co/v0/postings/{t}?mode=json",
}

# Strong per-posting link shapes (same regex the DOM extractor uses), used to
# decide whether a page visibly lists its own openings.
_POSTING_LINK_RE = re.compile(
    r"href=\"[^\"]*(?:" + _STRONG_JOB_URL_RE.pattern + r")[^\"]*\"|"
    r"\]\((?:" + _STRONG_JOB_URL_RE.pattern + r")\)",
    re.I,
)

# Identifiers we can cross-check between a guessed board and the real page.
_BOARD_ID_RE = re.compile(
    r"(?:gh_jid=|/jobs/|/positions/|/opportunity/)([0-9]{5,})|"
    r"([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})",
    re.I,
)


class MassCrawler:
    def __init__(
        self,
        storage: Optional[JobStorage] = None,
        max_workers: int = 10,
        use_browser: bool = False,
        jina_enabled: bool = True,
    ):
        self.storage = storage or JobStorage()
        self.max_workers = max(1, int(max_workers))
        self.use_browser = use_browser
        self.jina_enabled = jina_enabled
        self._local = threading.local()
        self._stop = threading.Event()

    # -- infra ---------------------------------------------------------------
    @property
    def session(self) -> requests.Session:
        s = getattr(self._local, "session", None)
        if s is None:
            s = requests.Session()
            s.headers.update({
                "User-Agent": USER_AGENT,
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
            })
            self._local.session = s
        return s

    def stop(self):
        self._stop.set()

    @staticmethod
    def _normalize_company(entry: Union[str, Dict[str, Any]]) -> Dict[str, Any]:
        if isinstance(entry, str):
            url = entry.strip()
            if not url.startswith("http"):
                url = "https://" + url
            return {"name": None, "url": url, "ats": None}
        url = (entry.get("url") or "").strip()
        if url and not url.startswith("http"):
            url = "https://" + url
        return {"name": entry.get("name"), "url": url, "ats": entry.get("ats")}

    @staticmethod
    def _domain_name(url: str) -> Optional[str]:
        try:
            netloc = url.split("://", 1)[-1].split("/", 1)[0]
            host = netloc.split(":")[0].replace("www.", "")
            return host.split(".")[0].capitalize() or None
        except Exception:
            return None

    @classmethod
    def _display_name(cls, company: Dict[str, Any]) -> str:
        """Employer name: explicit -> seed registry -> domain guess.

        The seed registry matters for vanity career hosts, which otherwise
        produce names like "About", "Lifeatspotify" or "Pinterestcareers".
        """
        if company.get("name"):
            return company["name"]
        return (
            seed_name_for_url(company.get("url") or "")
            or cls._domain_name(company.get("url") or "")
            or company.get("url")
        )

    def _http_get(self, url: str, timeout: int = 15) -> Optional[Any]:
        """GET with retries: large ATS payloads intermittently reset the
        connection (SSLError / WinError 10054), which must not be mistaken for
        "this company has no ATS board"."""
        for attempt in range(5):
            try:
                return self.session.get(url, timeout=timeout, allow_redirects=True)
            except Exception:
                if attempt < 4:
                    time.sleep(0.5 * (attempt + 1))
        return None

    def _fetch_ats(self, provider: str, token: str, name: str, career_url: str, page_url: str) -> List[JobListing]:
        """Adapter fetch with the same retry resilience as the probe."""
        for attempt in range(3):
            jobs = fetch_from_ats(self.session, provider, token, name, career_url, page_url)
            if jobs:
                return jobs
            if attempt < 2:
                time.sleep(0.4 * (attempt + 1))
        return []

    def _jina_markdown(self, url: str, timeout: int = 25) -> Optional[str]:
        resp = self._http_get(f"https://r.jina.ai/{url}", timeout=timeout)
        if resp is not None and resp.status_code == 200 and len(resp.text) > 200:
            return resp.text
        return None

    def _count_ats_jobs(self, provider: str, token: str) -> int:
        """Probe: return the number of postings for a guessed token.

        Some boards are multi-megabyte payloads, so allow a generous timeout and
        retry: a transient failure here used to make the crawler fall through to
        DOM scraping and emit plausible-but-broken per-role URLs.
        """
        builder = _GUESS_URLS.get(provider)
        if not builder:
            return 0
        url = builder(token)
        for _ in range(5):
            resp = self._http_get(url, timeout=25)
            if resp is None or resp.status_code >= 400:
                continue
            try:
                data = resp.json()
            except Exception:
                continue
            if isinstance(data, list):
                return len(data)
            if isinstance(data, dict):
                return len(data.get("jobs", []) or [])
        return 0

    @staticmethod
    def _corroborates(jobs: List[JobListing], page_text: Optional[str]) -> Optional[bool]:
        """Does a *guessed* board actually belong to this employer?

        Token guessing can land on an unrelated company's board ("remote" is a
        real Greenhouse board that has nothing to do with remote.com). The page
        itself settles it: if the board's job ids never appear in the page while
        the page clearly lists its own openings, the board is someone else's.
        Returns None when the page can't answer (no text / no ids to check).
        """
        if not page_text:
            return None
        ids = set()
        for job in jobs[:400]:
            for match in _BOARD_ID_RE.finditer(job.job_url or ""):
                ids.add((match.group(1) or match.group(2) or "").lower())
        ids.discard("")
        if not ids:
            return None
        lowered = page_text.lower()
        if any(i in lowered for i in ids):
            return True
        # No overlap: only reject when the page demonstrably lists its own
        # postings (a nav full of /jobs/ prose links is not evidence).
        page_hits = len(_POSTING_LINK_RE.findall(page_text))
        return False if page_hits >= 3 else None

    def _probe_guessed_ats(
        self, name: str, career_url: str, page_text: Optional[str] = None
    ) -> Optional[List[JobListing]]:
        """Try common career backends using tokens derived from the domain."""
        candidates = guess_ats_candidates(career_url)
        # Providers the page itself references go first (e.g. Zapier embeds an
        # Ashby job board even though no ashbyhq.com URL is in the HTML).
        hints = hinted_providers(page_text or "") | hinted_providers(career_url)
        candidates.sort(key=lambda c: 0 if c[0] in hints else 1)

        for provider, token in candidates:
            if self._stop.is_set():
                break
            if self._count_ats_jobs(provider, token) <= 0:
                continue
            jobs = self._fetch_ats(provider, token, name, career_url, career_url)
            if not jobs:
                continue
            verdict = self._corroborates(jobs, page_text)
            if verdict is False:
                continue
            return jobs
        return None

    def _playwright_html(self, url: str) -> Optional[str]:
        try:
            from playwright.async_api import async_playwright
        except Exception:
            return None

        board_selector = (
            'a[href*="myworkdayjobs"], a[href*="greenhouse"], a[href*="lever.co"], '
            'a[href*="ashbyhq"], a[href*="workable"], '
            '[class*="job-card"], [class*="jobCard"], [class*="job-listing"], '
            '[class*="jobOpening"], [class*="job-opening"]'
        )

        async def _run():
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                page = await browser.new_page(user_agent=USER_AGENT)
                await page.goto(url, wait_until="domcontentloaded", timeout=45000)
                # Boards render late; wait for postings (or a job card) to appear
                # so ATS links buried in the payload are in the DOM we capture.
                try:
                    await page.wait_for_selector(board_selector, timeout=15000, state="attached")
                    await page.wait_for_timeout(2500)
                except Exception:
                    await page.wait_for_timeout(5000)
                content = await page.content()
                await browser.close()
                return content

        try:
            return asyncio.run(_run())
        except Exception:
            return None

    # -- per-company cascade -------------------------------------------------
    def crawl_company(self, entry: Union[str, Dict[str, Any]], max_jobs: int = 500) -> Dict[str, Any]:
        """Crawl one employer, retrying once if every engine came up empty.

        Transient network failures (DNS resets, TLS hiccups, a reader 403) are
        common enough that a single empty pass must not be reported as "this
        company has no open positions".
        """
        result = self._crawl_once(entry, max_jobs=max_jobs)
        if not result.get("jobs") and not self._stop.is_set():
            time.sleep(1.5)
            retry = self._crawl_once(entry, max_jobs=max_jobs)
            if retry.get("jobs"):
                retry["duration"] = round(result.get("duration", 0) + retry.get("duration", 0), 2)
                return retry
        return result

    def _crawl_once(self, entry: Union[str, Dict[str, Any]], max_jobs: int = 500) -> Dict[str, Any]:
        company = self._normalize_company(entry)
        career_url = company["url"]
        name = self._display_name(company)
        start = time.time()
        result: Dict[str, Any] = {
            "company": name,
            "career_url": career_url,
            "engine": None,
            "jobs": [],
            "jobs_count": 0,
            "status": "partial",
            "error": None,
        }

        if not career_url:
            result["status"] = "error"
            result["error"] = "missing url"
            result["duration"] = 0.0
            return result

        jobs: List[JobListing] = []
        page_html: Optional[str] = None
        page_url = career_url
        company_emails: List[str] = []
        company_logo: Optional[str] = None
        # A handful of raw-DOM hits on a JS shell is not proof the page is the
        # real source; keep them only if every better engine comes up empty.
        weak_jobs: List[JobListing] = []
        weak_engine: Optional[str] = None

        # --- Engine 1: known/explicit ATS hint -----------------------------
        if company.get("ats"):
            provider, token = company["ats"]
            jobs = self._fetch_ats(provider, token, name, career_url, career_url)
            if jobs:
                result["engine"] = f"ats:{provider}"

        # --- Engine 1a: the career URL itself is hosted on an ATS ----------
        # (e.g. crowdstrike.wd5.myworkdayjobs.com/crowdstrikecareers). Works
        # even when the page itself cannot be fetched at all.
        if not jobs and not self._stop.is_set():
            detected = detect_ats("", career_url)
            if detected:
                provider, token = detected
                jobs = self._fetch_ats(provider, token, name, career_url, career_url)
                if jobs:
                    result["engine"] = f"ats:{provider}"

        # --- Fetch the career page once (also feeds ATS detection) ---------
        if not jobs and not self._stop.is_set():
            resp = self._http_get(career_url)
            if resp is not None and resp.status_code < 400:
                page_html = resp.text
                page_url = resp.url or career_url
                extractor = CareerPageExtractor(base_company_url=career_url)
                company_emails = extractor.extract_emails_from_text(page_html)
                company_logo = extract_logo_url(page_html, page_url)

        # --- Engine 1b: detect ATS from the career page / its redirect ------
        if not jobs and page_html:
            detected = detect_ats(page_html, page_url)
            if detected:
                provider, token = detected
                jobs = self._fetch_ats(provider, token, name, career_url, page_url)
                if jobs:
                    result["engine"] = f"ats:{provider}"

        # --- Engine 2: guessed first-party ATS board (domain-derived token) -
        # Deliberately runs BEFORE DOM scraping: an ATS-backed employer must be
        # read from its authoritative board, otherwise client-side state scraping
        # yields plausible-looking but 404 per-role URLs (seen with Brex, Plaid).
        # The guess is only trusted when the career page corroborates it, so an
        # unrelated employer's board with a colliding token is never adopted.
        if not jobs and not self._stop.is_set():
            jobs = self._probe_guessed_ats(name, career_url, page_text=page_html) or []
            if jobs:
                result["engine"] = "ats:guess"

        # --- Engine 3: direct HTML extraction ------------------------------
        if not jobs and page_html and not self._stop.is_set():
            extractor = CareerPageExtractor(base_company_url=career_url)
            jobs = extractor.extract_from_html(page_html, current_page_url=page_url)
            if jobs:
                if len(jobs) < 3:
                    weak_jobs, jobs = jobs, []
                else:
                    result["engine"] = "http"

        # --- Engine 4: Agent Reach Jina Reader -----------------------------
        if not jobs and self.jina_enabled and not self._stop.is_set():
            markdown = self._jina_markdown(career_url)
            if markdown:
                # ATS detection may succeed where HTML parsing did not (the
                # reader renders client-side boards into plain links).
                detected = detect_ats(markdown, career_url)
                if detected:
                    provider, token = detected
                    jobs = self._fetch_ats(provider, token, name, career_url, career_url)
                    if jobs:
                        result["engine"] = f"ats:{provider}"
                if not jobs:
                    jobs = self._probe_guessed_ats(name, career_url, page_text=markdown) or []
                    if jobs:
                        result["engine"] = "ats:guess"
                if not jobs:
                    extractor = CareerPageExtractor(base_company_url=career_url)
                    jobs = extractor.extract_from_markdown(markdown, current_page_url=career_url)
                    if jobs:
                        result["engine"] = "jina"

        # --- Engine 5: headless browser (last resort) ----------------------
        # Runs whenever nothing else worked, even if the browser wasn't the
        # preferred engine: a client-rendered board (Postman's Workday page,
        # Zapier's Ashby embed) only reveals its ATS *after* rendering, and the
        # ATS is where the exact titles + full descriptions come from.
        if not jobs and not self._stop.is_set():
            html = self._playwright_html(career_url)
            if html:
                detected = detect_ats(html, career_url)
                if detected:
                    provider, token = detected
                    jobs = self._fetch_ats(provider, token, name, career_url, career_url)
                    if jobs:
                        result["engine"] = f"ats:{provider}+browser"
                if not jobs:
                    jobs = self._probe_guessed_ats(name, career_url, page_text=html) or []
                    if jobs:
                        result["engine"] = "ats:guess+browser"
                if not jobs:
                    extractor = CareerPageExtractor(base_company_url=career_url)
                    jobs = extractor.extract_from_html(html, current_page_url=career_url)
                    if jobs:
                        if len(jobs) < 3 and not weak_jobs:
                            weak_jobs, jobs = jobs, []
                        else:
                            result["engine"] = "playwright"

        # Nothing better materialised: fall back to whatever the raw page gave.
        if not jobs and weak_jobs:
            jobs = weak_jobs
            result["engine"] = weak_engine or "http"

        # --- Post-process ---------------------------------------------------
        # Drop placeholder / page-chrome titles so a fallback engine can never
        # put "Remote ATS", "Careers" or "Deel role fc7cec85" in the job list.
        jobs = [
            j for j in jobs
            if not is_placeholder_title(j.title)
            and (j.title or "").strip().lower().rstrip(" .!?:;-") not in _JUNK_LINK_TEXT
        ]

        if jobs:
            primary_email = company_emails[0] if company_emails else derive_application_email(career_url)
            if not company_logo:
                company_logo = fallback_logo_url(career_url)
            for job in jobs:
                if not job.company or job.company == "General":
                    job.company = name
                if not job.company:
                    job.company = name
                if not job.company_logo:
                    job.company_logo = company_logo
                if not job.contact_email and primary_email:
                    job.contact_email = primary_email
                    job.hiring_team_emails = company_emails[:3]

            if len(jobs) > max_jobs:
                jobs = jobs[:max_jobs]

            result["status"] = "success"
        else:
            result["error"] = "no positions found via any engine"

        result["jobs"] = jobs
        result["jobs_count"] = len(jobs)
        result["duration"] = round(time.time() - start, 2)
        return result

    # -- batch ---------------------------------------------------------------
    def run(
        self,
        companies: Optional[List[Union[str, Dict[str, Any]]]] = None,
        max_jobs_per_company: int = 500,
        on_progress: Optional[Callable[[Dict[str, Any]], None]] = None,
        save: bool = True,
    ) -> Dict[str, Any]:
        companies = companies or SEED_COMPANIES
        companies = [c for c in companies if self._normalize_company(c)["url"]]
        total = len(companies)

        aggregated: List[JobListing] = []
        per_company: List[Dict[str, Any]] = []
        engine_breakdown: Dict[str, int] = {}
        errors: List[Dict[str, str]] = []
        start = time.time()
        completed = 0

        def _report(company_result: Dict[str, Any]):
            nonlocal completed
            completed += 1
            if on_progress:
                try:
                    on_progress({
                        "completed": completed,
                        "total": total,
                        "company": company_result.get("company"),
                        "engine": company_result.get("engine"),
                        "jobs_count": company_result.get("jobs_count", 0),
                        "status": company_result.get("status"),
                    })
                except Exception:
                    pass

        with ThreadPoolExecutor(max_workers=self.max_workers) as pool:
            futures = {
                pool.submit(self.crawl_company, c, max_jobs_per_company): self._normalize_company(c)
                for c in companies
            }
            for future in as_completed(futures):
                try:
                    res = future.result()
                except Exception as exc:  # pragma: no cover - defensive
                    meta = futures[future]
                    res = {
                        "company": meta.get("name") or meta.get("url"),
                        "career_url": meta.get("url"),
                        "engine": None,
                        "jobs": [],
                        "jobs_count": 0,
                        "status": "error",
                        "error": str(exc),
                        "duration": 0.0,
                    }
                aggregated.extend(res.get("jobs", []))
                if res.get("jobs_count"):
                    engine_breakdown[res.get("engine") or "unknown"] = (
                        engine_breakdown.get(res.get("engine") or "unknown", 0) + res["jobs_count"]
                    )
                if res.get("error"):
                    errors.append({"company": res.get("company"), "error": res.get("error")})
                per_company.append({k: v for k, v in res.items() if k != "jobs"})
                _report(res)

        # Deduplicate on job_url across all companies.
        unique: Dict[str, JobListing] = {}
        for job in aggregated:
            if job.job_url and job.job_url not in unique:
                unique[job.job_url] = job
        final_jobs = list(unique.values())

        saved = 0
        if save and final_jobs:
            saved = self.storage.save_jobs(final_jobs)

        return {
            "companies_total": total,
            "companies_processed": len(per_company),
            "jobs_found": len(final_jobs),
            "jobs_saved": saved,
            "engine_breakdown": engine_breakdown,
            "errors": errors,
            "per_company": per_company,
            "duration_seconds": round(time.time() - start, 2),
        }
