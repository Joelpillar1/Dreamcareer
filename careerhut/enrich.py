"""
Careerhut Enrichment - visit each job's own posting page to complete the record.

For every job that is thin, points at a listing page, or lacks a recruiter
contact, this fetches the individual role page (direct HTTP, then Agent Reach
Jina fallback), extracts the full description *exactly as written* (paragraph
structured), the recruiter/application email, and the direct apply URL.

It also resolves a company logo for each employer.
"""

import time
import threading
import asyncio
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Dict, Any, Optional, Callable

import requests

from .storage import JobStorage
from .content import extract_job_detail, extract_logo_url, fallback_logo_url, derive_application_email
from .extractor import html_to_structured_text as _structured
from .extractor import html_to_structured_text

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
)

# Prefer these style of inboxes for "reach the recruiter directly".
_RECRUITING_HINTS = ("career", "job", "recruit", "talent", "hiring", "people", "hr", "apply", "team")

# Remote's own ATS publishes every advert as JSON (this *is* the job page's
# data source), so descriptions come straight from the employer's API.
_REMOTE_JOB_RE = re.compile(
    r"^https?://apply\.remote\.com/jobs/([0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12})/?$", re.I
)

# Workday boards (CrowdStrike, Postman, ...) expose the same jobDescription
# the career page renders, one GET away from the public job URL.
_WORKDAY_JOB_RE = re.compile(
    r"^(https?://(?P<org>[a-z0-9\-]+)\.wd\d+\.myworkdayjobs\.com)/(?P<site>[^/]+)/(?P<rest>job/.+)$",
    re.I,
)

# Headless renders are expensive; only this many run at once.
_RENDER_SLOTS = threading.Semaphore(3)


class JobEnricher:
    def __init__(
        self,
        storage: Optional[JobStorage] = None,
        max_workers: int = 12,
        jina_enabled: bool = True,
        use_browser: bool = True,
    ):
        self.storage = storage or JobStorage()
        self.max_workers = max(1, int(max_workers))
        self.jina_enabled = jina_enabled
        self.use_browser = use_browser
        self._local = threading.local()
        self._stop = threading.Event()

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

    # -- fetching ------------------------------------------------------------
    def _fetch(self, url: str) -> Optional[str]:
        try:
            resp = self.session.get(url, timeout=15, allow_redirects=True)
            if resp.status_code < 400 and len(resp.text) > 500:
                return resp.text
        except Exception:
            pass
        if self.jina_enabled:
            try:
                resp = self.session.get(f"https://r.jina.ai/{url}", timeout=25)
                if resp.status_code == 200 and len(resp.text) > 200:
                    return resp.text
            except Exception:
                pass
        # Last resort: some employers (Deel) reset plain HTTP clients and the
        # reader alike, but serve the page to a real browser.
        if self.use_browser:
            return self._render(url)
        return None

    def _render(self, url: str) -> Optional[str]:
        """Headless render of a job page that refused every text fetch."""
        if not _RENDER_SLOTS.acquire(timeout=120):
            return None
        try:
            async def _run() -> str:
                from playwright.async_api import async_playwright
                async with async_playwright() as p:
                    browser = await p.chromium.launch(headless=True)
                    page = await browser.new_page(user_agent=USER_AGENT)
                    await page.goto(url, wait_until="domcontentloaded", timeout=45000)
                    await page.wait_for_timeout(3500)
                    html = await page.content()
                    await browser.close()
                    return html

            return asyncio.run(_run())
        except Exception:
            return None
        finally:
            _RENDER_SLOTS.release()

    # -- employer-published JSON detail -------------------------------------
    @staticmethod
    def _remote_api_job(job_url: str) -> Optional[Dict[str, Any]]:
        """Remote's public advert API: exact title, location and full JD."""
        match = _REMOTE_JOB_RE.match(job_url or "")
        if not match:
            return None
        for _ in range(2):
            try:
                resp = requests.get(
                    f"https://apply.remote.com/api/public/jobs/{match.group(1)}",
                    headers={"User-Agent": USER_AGENT},
                    timeout=20,
                )
                if resp.status_code < 400:
                    job = (resp.json() or {}).get("job")
                    if isinstance(job, dict):
                        return job
            except Exception:
                pass
        return None

    @staticmethod
    def _workday_api_job(job_url: str) -> Optional[Dict[str, Any]]:
        """Workday CXS detail payload for a single role URL."""
        match = _WORKDAY_JOB_RE.match(job_url or "")
        if not match:
            return None
        origin, org, site, rest = (
            match.group(1), match.group("org"), match.group("site"), match.group("rest")
        )
        api = f"{origin}/wday/cxs/{org}/{site}/{rest}"
        for attempt in range(3):
            try:
                resp = requests.get(api, headers={"User-Agent": USER_AGENT}, timeout=30)
                if resp.status_code < 400:
                    info = (resp.json() or {}).get("jobPostingInfo")
                    if isinstance(info, dict):
                        return info
                return None  # 4xx: this role/page shape is wrong, don't spin
            except Exception:
                time.sleep(0.8 * (attempt + 1))
        return None

    @staticmethod
    def _advert_text(advert: Dict[str, Any]) -> str:
        """Render one advert section (ProseMirror doc) as plain structured text."""
        def leaf_texts(node: Any) -> str:
            parts: List[str] = []

            def walk(n: Any) -> None:
                if isinstance(n, dict):
                    text = n.get("text")
                    if isinstance(text, str) and text.strip():
                        parts.append(text)
                    for value in n.values():
                        if isinstance(value, (dict, list)):
                            walk(value)
                elif isinstance(n, list):
                    for value in n:
                        walk(value)

            walk(node)
            return " ".join("".join(parts).split())

        def render(node: Any) -> List[str]:
            if isinstance(node, list):
                blocks: List[str] = []
                for item in node:
                    blocks.extend(render(item))
                return blocks
            if not isinstance(node, dict):
                return []
            node_type = str(node.get("type") or "").lower()
            content = node.get("content")
            if node_type in ("bulleted", "numbered") and isinstance(content, list):
                items = []
                for entry in content:
                    text = leaf_texts(entry)
                    if text:
                        items.append(f"\u2022 {text}")
                return items
            if isinstance(content, list):
                if node_type in ("paragraph", "heading"):
                    text = leaf_texts(node)
                    return [text] if text else []
                blocks = []
                for child in content:
                    blocks.extend(render(child))
                return blocks
            text = str(node.get("text") or "").strip()
            return [text] if text else []

        heading = str(advert.get("heading") or "").strip()
        blocks = render(advert.get("doc"))
        if heading:
            blocks.insert(0, heading)
        return "\n\n".join(blocks)

    @classmethod
    def _remote_description(cls, job: Dict[str, Any]) -> str:
        parts = [cls._advert_text(a) for a in (job.get("advert_sections") or []) if isinstance(a, dict)]
        parts = [p for p in parts if p]
        requirements = job.get("requirements")
        if isinstance(requirements, str) and requirements.strip():
            parts.append("Requirements\n" + requirements.strip())
        return "\n\n".join(parts).strip()

    @staticmethod
    def _looks_like_description(text: str) -> bool:
        """Reject nav/menu noise: real descriptions carry substantial prose.

        Most JDs arrive as several paragraphs, but some employers (Deel) publish
        the whole description as one unbroken block of text - that still counts.
        """
        if not text or len(text) < 300:
            return False
        lines = [ln for ln in text.split("\n") if ln.strip()]
        long_lines = [ln for ln in lines if len(ln) > 60]
        if len(long_lines) >= 2:
            return True
        return len(text) >= 600 and len(long_lines) == 1 and len(lines) <= 3

    @staticmethod
    def _pick_email(emails: List[str]) -> Optional[str]:
        if not emails:
            return None
        for em in emails:
            user = em.split("@", 1)[0].lower()
            if any(h in user for h in _RECRUITING_HINTS):
                return em
        return emails[0]

    # -- one job -------------------------------------------------------------
    def enrich_job(self, job: Dict[str, Any]) -> Dict[str, Any]:
        job_url = job.get("job_url")
        outcome = {"job_url": job_url, "title": job.get("title"), "updated": False, "error": None}
        if not job_url:
            outcome["error"] = "no url"
            return outcome

        # 1. Employer's own JSON endpoint (exact title/location/JD, no parsing).
        api_job = self._remote_api_job(job_url)
        if api_job is not None:
            description = self._remote_description(api_job)
            api_title = str(api_job.get("title") or "").strip()
            api_location = str(api_job.get("location") or "").strip()
            api_department = str(api_job.get("department") or "").strip()
            api_employment = str(api_job.get("employment_type") or "").strip()
            update = bool(description and len(description) > max(len(job.get("description") or ""), 300))
            if update:
                self.storage.update_job_enrichment(
                    job_url=job_url,
                    description=description,
                    title=api_title or None,
                    location=api_location or None,
                    department=api_department or None,
                    employment_type=api_employment or None,
                )
                outcome["updated"] = True
            return outcome

        # 2. Employer's Workday detail endpoint (the render is a JS shell).
        workday_job = self._workday_api_job(job_url)
        if workday_job is not None:
            description = html_to_structured_text(workday_job.get("jobDescription") or "")
            if len(description) > max(len(job.get("description") or ""), 300):
                self.storage.update_job_enrichment(job_url=job_url, description=description)
                outcome["updated"] = True
            return outcome

        html = self._fetch(job_url)
        if not html:
            outcome["error"] = "fetch failed"
            return outcome

        detail = extract_job_detail(html, job_url, job.get("title"))
        description = detail.get("description") or ""

        # A client-rendered job page answers plain HTTP with an empty shell
        # (Workday, apply.remote.com). Re-read it in a real browser before
        # giving up, so the row is never left without the JD proper.
        if len(description) < 300 and self.use_browser:
            rendered = self._render(job_url)
            if rendered:
                rendered_detail = extract_job_detail(rendered, job_url, job.get("title"))
                if len(rendered_detail.get("description") or "") > len(description):
                    detail = rendered_detail
                    description = rendered_detail.get("description") or ""
        existing = job.get("description") or ""
        # Only ever replace genuinely thin text, and only with prose-like content,
        # so authoritative ATS descriptions are never clobbered with page chrome.
        new_description = None
        if (
            len(existing) < 400
            and len(description) > max(len(existing), 300)
            and self._looks_like_description(description)
        ):
            new_description = description

        email = self._pick_email(detail.get("emails") or [])
        new_email = email if (email and not job.get("contact_email")) else None

        apply_url = detail.get("apply_url")
        new_apply = apply_url if (apply_url and apply_url != job.get("apply_url")) else None

        extracted_title = (detail.get("title") or "").strip()
        existing_title = (job.get("title") or "").strip()
        new_title = None
        if extracted_title and (
            not existing_title
            or len(existing_title) < 5
            or any(junk in existing_title.lower() for junk in ["open position", "view job", "job detail", "careers", "apply now", "404"])
            or (len(extracted_title) > len(existing_title) and existing_title.lower() in extracted_title.lower())
        ):
            new_title = extracted_title

        if any([new_description, new_email, new_apply, new_job_url, new_title]):
            self.storage.update_job_enrichment(
                job_url=job_url,
                title=new_title,
                description=new_description,
                contact_email=new_email,
                hiring_team_emails=detail.get("emails")[:3] if new_email else None,
                apply_url=new_apply,
                job_url_new=new_job_url,
            )
            outcome["updated"] = True
        return outcome

    # -- batch ---------------------------------------------------------------
    def enrich_jobs(
        self,
        only_thin: bool = True,
        limit: int = 100000,
        on_progress: Optional[Callable[[Dict[str, Any]], None]] = None,
        save: bool = True,
        company: Optional[str] = None,
        job_urls: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        jobs = self.storage.get_job_urls_for_enrichment(
            only_thin=only_thin, limit=limit, company=company, job_urls=job_urls
        )
        total = len(jobs)
        updated_count = 0
        errors: List[Dict[str, str]] = []
        start = time.time()
        completed = 0

        with ThreadPoolExecutor(max_workers=self.max_workers) as pool:
            futures = {pool.submit(self.enrich_job, j): j for j in jobs}
            for future in as_completed(futures):
                completed += 1
                try:
                    res = future.result()
                except Exception as exc:  # pragma: no cover
                    res = {"updated": False, "error": str(exc)}
                if res.get("updated"):
                    updated_count += 1
                if res.get("error"):
                    errors.append({"job_url": res.get("job_url"), "error": res["error"]})
                if on_progress:
                    try:
                        on_progress({
                            "completed": completed,
                            "total": total,
                            "title": res.get("title"),
                            "updated": res.get("updated", False),
                        })
                    except Exception:
                        pass

        return {
            "jobs_targeted": total,
            "jobs_updated": updated_count,
            "errors": errors,
            "duration_seconds": round(time.time() - start, 2),
        }

    # -- derived emails ------------------------------------------------------
    def fill_derived_emails(self) -> int:
        """For employers that publish no address, derive careers@<real-domain>."""
        rows = self.storage.get_jobs_missing_email()
        count = 0
        for row in rows:
            email = derive_application_email(
                row.get("career_page_url") or row.get("company_url") or row.get("job_url")
            )
            if email and self.storage.update_job_enrichment(job_url=row["job_url"], contact_email=email):
                count += 1
        return count

    # -- repair stale escaped text -----------------------------------------
    def repair_escaped_text(self) -> int:
        """Rewrite rows whose description/title still contain raw HTML entities.

        The stored value *is* escaped markup, so re-running the converter on it
        recovers the employer's real paragraph text with no network access.
        """
        rows = self.storage.get_jobs_with_escaped_html()
        fixed = 0
        for row in rows:
            new_desc = _structured(row.get("description") or "") if row.get("description") else None
            raw_title = row.get("title") or ""
            new_title = _structured(raw_title) if ("&lt;" in raw_title or "&amp;" in raw_title or "&#" in raw_title) else None
            changed = (new_desc and new_desc != row.get("description")) or (new_title and new_title != raw_title)
            if changed:
                self.storage.update_job_text(
                    job_url=row["job_url"],
                    title=new_title if new_title != raw_title else None,
                    description=new_desc if new_desc != row.get("description") else None,
                )
                fixed += 1
        return fixed

    # -- logos ---------------------------------------------------------------
    def enrich_logos(self, companies: Optional[List[Dict[str, Any]]] = None, overwrite: bool = False) -> Dict[str, Any]:
        """Resolve a logo per company from its career page, with a favicon fallback."""
        if companies is None:
            companies = self.storage.get_companies()

        resolved = 0
        for comp in companies:
            if self._stop.is_set():
                break
            name = comp.get("company")
            career_url = comp.get("career_page_url")
            if not name or not career_url:
                continue
            logo = None
            html = None
            try:
                resp = self.session.get(career_url, timeout=15, allow_redirects=True)
                if resp.status_code < 400:
                    html = resp.text
            except Exception:
                html = None
            if html:
                logo = extract_logo_url(html, career_url)
            if not logo:
                logo = fallback_logo_url(career_url)
            if logo:
                self.storage.update_company_logo(name, logo, overwrite=overwrite)
                resolved += 1
        return {"companies": len(companies), "logos_resolved": resolved}
