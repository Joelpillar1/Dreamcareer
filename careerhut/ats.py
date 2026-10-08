"""
Careerhut ATS Adapters - first-party Applicant Tracking System backends.

These endpoints are the JSON services that *power* the company's own career
page (Greenhouse, Lever, Ashby, Workable, Recruitee). Reading them is reading
the employer's official career page data -- no third-party job board involved.
"""

import re
import time
from concurrent.futures import ThreadPoolExecutor
from typing import List, Dict, Any, Optional
from bs4 import BeautifulSoup

from .models import JobListing
from .extractor import CareerPageExtractor, html_to_structured_text, is_plausible_job_title

_HTML_TAG = re.compile(r"<[^>]+>")


def _clean_html(value: Any) -> str:
    """Strip HTML down to readable plain text."""
    if not value:
        return ""
    if not isinstance(value, str):
        value = str(value)
    if "<" in value and ">" in value:
        try:
            return BeautifulSoup(value, "html.parser").get_text(" ", strip=True)
        except Exception:
            return _HTML_TAG.sub(" ", value).strip()
    return value.strip()


def _workplace_type(location: str, title: str, remote_flag: Optional[bool] = None) -> str:
    text = f"{location or ''} {title or ''}".lower()
    if remote_flag is True or "remote" in text or "anywhere" in text:
        return "Remote"
    if "hybrid" in text:
        return "Hybrid"
    if location and location.lower() not in ("not specified", ""):
        return "On-site"
    return "Unspecified"


def _normalize_employment(value: Any) -> str:
    text = str(value or "").lower()
    if "intern" in text:
        return "Internship"
    if "part" in text:
        return "Part-time"
    if "contract" in text or "temporary" in text or "freelance" in text:
        return "Contract"
    if "full" in text or "regular" in text or "permanent" in text:
        return "Full-time"
    return "Full-time"


def _build_job(
    *,
    title: str,
    company: str,
    company_url: Optional[str],
    career_page_url: str,
    job_url: str,
    department: str = "General",
    location: str = "Not specified",
    workplace_type: str = "Unspecified",
    employment_type: str = "Full-time",
    salary_range: Optional[str] = None,
    description: str = "",
    apply_url: Optional[str] = None,
    posted_date: Optional[str] = None,
    contact_email: Optional[str] = None,
    hiring_team_emails: Optional[List[str]] = None,
    provider: str = "ats",
    raw: Optional[Dict[str, Any]] = None,
) -> Optional[JobListing]:
    title = (title or "").strip()
    if len(title) > 110:
        title = title[:110].rstrip(" ,;:-")
    # Never publish a placeholder or page-chrome label as a job title: a row is
    # dropped instead of showing something the employer never advertised.
    if not is_plausible_job_title(title):
        return None
    return JobListing(
        title=title,
        company=company,
        company_url=company_url,
        career_page_url=career_page_url,
        job_url=job_url,
        department=department or "General",
        location=location or "Not specified",
        workplace_type=workplace_type,
        employment_type=employment_type,
        salary_range=salary_range,
        description=description or "",
        apply_url=apply_url or job_url,
        posted_date=posted_date,
        contact_email=contact_email,
        hiring_team_emails=hiring_team_emails or [],
        raw_metadata={"source": f"{provider}_api", **(raw or {})},
    )


def _format_salary(comp: Any) -> Optional[str]:
    """Best-effort salary formatting from an ATS compensation payload."""
    if not comp or not isinstance(comp, dict):
        return None
    summary = comp.get("compensationTierSummary") or comp.get("summary")
    if summary and isinstance(summary, str):
        return summary.strip() or None
    tiers = comp.get("compensationTiers") or []
    for tier in tiers:
        if not isinstance(tier, dict):
            continue
        components = tier.get("components") or []
        for component in components:
            if not isinstance(component, dict):
                continue
            interval = component.get("interval") or ""
            currency = component.get("currencyCode") or ""
            min_v = component.get("minValue")
            max_v = component.get("maxValue")
            if min_v is None:
                continue
            if max_v:
                return f"{currency} {min_v:,.0f} - {max_v:,.0f} / {interval}".strip()
            return f"{currency} {min_v:,.0f}+ / {interval}".strip()
    return None


# ---------------------------------------------------------------------------
# Provider adapters. Each returns a list of JobListing (never raises upstream).
# ---------------------------------------------------------------------------

def fetch_greenhouse(session, token: str, company: str, company_url: str, career_url: str) -> List[JobListing]:
    url = f"https://boards-api.greenhouse.io/v1/boards/{token}/jobs?content=true"
    resp = session.get(url, timeout=25)
    resp.raise_for_status()
    payload = resp.json()
    jobs: List[JobListing] = []
    for item in payload.get("jobs", []):
        title = item.get("title", "")
        job_url = item.get("absolute_url") or career_url
        location = ((item.get("location") or {}).get("name")) or "Not specified"
        depts = item.get("departments") or []
        department = depts[0].get("name") if depts and isinstance(depts[0], dict) else "General"
        desc = html_to_structured_text(item.get("content"))
        job = _build_job(
            title=title,
            company=company,
            company_url=company_url,
            career_page_url=career_url,
            job_url=job_url,
            department=department or "General",
            location=location,
            workplace_type=_workplace_type(location, title),
            description=desc,
            apply_url=job_url,
            posted_date=item.get("updated_at") or item.get("first_published"),
            provider="greenhouse",
            raw={"internal_job_id": item.get("internal_job_id")},
        )
        if job:
            jobs.append(job)
    return jobs


def fetch_lever(session, token: str, company: str, company_url: str, career_url: str) -> List[JobListing]:
    url = f"https://api.lever.co/v0/postings/{token}?mode=json"
    resp = session.get(url, timeout=25)
    resp.raise_for_status()
    payload = resp.json()
    if not isinstance(payload, list):
        return []
    jobs: List[JobListing] = []
    for item in payload:
        title = item.get("text", "")
        cats = item.get("categories") or {}
        location = cats.get("location") or "Not specified"
        department = cats.get("team") or "General"
        desc = html_to_structured_text(item.get("description") or "")
        lists = item.get("lists") or []
        for block in lists:
            if isinstance(block, dict):
                desc += "\n\n" + html_to_structured_text(block.get("text", "")) + "\n" + html_to_structured_text(block.get("content", ""))
        job_url = item.get("hostedUrl") or item.get("applyUrl") or career_url
        job = _build_job(
            title=title,
            company=company,
            company_url=company_url,
            career_page_url=career_url,
            job_url=job_url,
            department=department,
            location=location,
            workplace_type=_workplace_type(location, title),
            employment_type=_normalize_employment(cats.get("commitment")),
            description=desc.strip(),
            apply_url=item.get("applyUrl") or job_url,
            posted_date=item.get("createdAt"),
            provider="lever",
        )
        if job:
            jobs.append(job)
    return jobs


def fetch_ashby(session, token: str, company: str, company_url: str, career_url: str) -> List[JobListing]:
    url = f"https://api.ashbyhq.com/posting-api/job-board/{token}?includeCompensation=true"
    resp = session.get(url, timeout=25)
    resp.raise_for_status()
    payload = resp.json()
    jobs: List[JobListing] = []
    for item in payload.get("jobs", []):
        if item.get("isListed") is False:
            continue
        title = item.get("title", "")
        location = item.get("location") or "Not specified"
        secondary = item.get("secondaryLocations") or []
        if isinstance(secondary, list):
            extra = [s.get("location") if isinstance(s, dict) else str(s) for s in secondary if s]
            extra = [e for e in extra if e]
            if extra:
                location = location + " / " + " / ".join(extra[:3])
        department = item.get("department") or item.get("team") or "General"
        desc = html_to_structured_text(item.get("descriptionHtml") or item.get("descriptionPlain") or "")
        job_url = item.get("jobUrl") or item.get("applyUrl") or career_url
        job = _build_job(
            title=title,
            company=company,
            company_url=company_url,
            career_page_url=career_url,
            job_url=job_url,
            department=department,
            location=location,
            workplace_type=_workplace_type(location, title, item.get("isRemote")),
            employment_type=_normalize_employment(item.get("employmentType")),
            salary_range=_format_salary(item.get("compensation")),
            description=desc,
            apply_url=item.get("applyUrl") or job_url,
            posted_date=item.get("publishedAt"),
            provider="ashby",
        )
        if job:
            jobs.append(job)
    return jobs


def fetch_workable(session, token: str, company: str, company_url: str, career_url: str) -> List[JobListing]:
    url = f"https://apply.workable.com/api/v1/widget/accounts/{token}?details=true"
    resp = session.get(url, timeout=25)
    resp.raise_for_status()
    payload = resp.json()
    company = payload.get("name") or company
    jobs: List[JobListing] = []
    for item in payload.get("jobs", []):
        title = item.get("title", "")
        loc = item.get("location") or {}
        if isinstance(loc, dict):
            parts = [loc.get("city"), loc.get("region"), loc.get("country")]
            location = ", ".join([p for p in parts if p]) or "Not specified"
        else:
            location = str(loc) or "Not specified"
        desc = html_to_structured_text(item.get("description") or "")
        reqs = html_to_structured_text(item.get("requirements") or "")
        if reqs:
            desc += "\n\nRequirements\n" + reqs
        job_url = item.get("url") or item.get("application_url") or career_url
        job = _build_job(
            title=title,
            company=company,
            company_url=company_url,
            career_page_url=career_url,
            job_url=job_url,
            department=item.get("department") or "General",
            location=location,
            workplace_type=_workplace_type(location, title, item.get("telecommuting")),
            employment_type=_normalize_employment(item.get("employment_type")),
            description=desc.strip(),
            apply_url=item.get("application_url") or job_url,
            posted_date=item.get("published_on"),
            provider="workable",
        )
        if job:
            jobs.append(job)
    return jobs


def fetch_recruitee(session, token: str, company: str, company_url: str, career_url: str) -> List[JobListing]:
    url = f"https://{token}.recruitee.com/api/offers/"
    resp = session.get(url, timeout=25)
    resp.raise_for_status()
    payload = resp.json()
    jobs: List[JobListing] = []
    for item in payload.get("offers", []):
        title = item.get("title", "")
        location = item.get("location") or item.get("city") or "Not specified"
        desc = html_to_structured_text(item.get("description") or "")
        job_url = item.get("careers_url") or item.get("url") or career_url
        job = _build_job(
            title=title,
            company=company,
            company_url=company_url,
            career_page_url=career_url,
            job_url=job_url,
            department=item.get("department") or "General",
            location=location,
            workplace_type=_workplace_type(location, title, item.get("remote")),
            employment_type=_normalize_employment(item.get("employment_type_code")),
            description=desc,
            apply_url=item.get("careers_apply_url") or job_url,
            posted_date=item.get("published_at"),
            provider="recruitee",
        )
        if job:
            jobs.append(job)
    return jobs


# ---------------------------------------------------------------------------
# Workday (*.<wdN>.myworkdayjobs.com) - used by e.g. CrowdStrike & Postman.
# The board is a two-step CXS API: a paginated /jobs list (the complete board)
# and one /job<externalPath> detail call per role, which is where the real job
# description lives. The list endpoint alone carries no description at all.
# ---------------------------------------------------------------------------

_WORKDAY_HOST_RE = re.compile(
    r"^(?P<org>[a-z0-9][a-z0-9\-]*)\.wd\d+\.myworkdayjobs\.com$", re.I,
)


def parse_workday_board(token: str) -> Optional[Dict[str, str]]:
    """Turn a Workday career URL (or host/site pair) into its CXS base."""
    if not token:
        return None
    raw = token.strip()
    if not raw.startswith("http"):
        raw = "https://" + raw.lstrip("/")
    try:
        from urllib.parse import urlparse
        parsed = urlparse(raw)
    except Exception:
        return None
    host = (parsed.hostname or "").lower()
    match = _WORKDAY_HOST_RE.match(host)
    if not match:
        return None
    org = match.group("org")
    segments = [s for s in parsed.path.split("/") if s]
    site = segments[0] if segments else org
    origin = f"{parsed.scheme or 'https'}://{host}"
    return {
        "origin": origin,
        "org": org,
        "site": site,
        "api": f"{origin}/wday/cxs/{org}/{site}",
        "public": f"{origin}/{site}",
    }


def _workday_time_type(value: Any) -> str:
    text = str(value or "").lower()
    if "intern" in text:
        return "Internship"
    if "part" in text:
        return "Part-time"
    if "contract" in text or "temp" in text:
        return "Contract"
    if "full" in text:
        return "Full-time"
    return "Full-time"


def fetch_workday(session, token: str, company: str, company_url: str, career_url: str) -> List[JobListing]:
    board = parse_workday_board(token) or parse_workday_board(career_url)
    if not board:
        return []
    # A URL without a site path only gives us the org; probe the usual site
    # names so a bare host still resolves to the real board.
    candidates = [board["api"]]
    if board["site"] == board["org"]:
        candidates += [f"{board['origin']}/wday/cxs/{board['org']}/{s}" for s in ("careers", "jobs")]

    api = None
    payload: Dict[str, Any] = {}
    for candidate in candidates:
        for attempt in range(4):
            try:
                resp = session.post(
                    candidate + "/jobs",
                    json={"limit": 20, "offset": 0, "appliedFacets": {}, "searchText": ""},
                    timeout=30,
                )
                if resp.status_code < 400:
                    api = candidate
                    payload = resp.json() or {}
                    break
                break  # 4xx means this site name is wrong; don't retry it
            except Exception:
                time.sleep(0.8 * (attempt + 1))
        if api:
            break
    if not api:
        return []
    site = api.rsplit("/", 1)[-1]
    public = f"{board['origin']}/{site}"

    # 1. Page through the full board (the first page is only ~20 of them).
    postings: List[Dict[str, Any]] = list(payload.get("jobPostings") or [])
    total = payload.get("total") or 0
    offset = len(postings)
    while postings and offset < 4000 and offset < (total or 0):
        page: List[Dict[str, Any]] = []
        for attempt in range(4):
            try:
                resp = session.post(
                    api + "/jobs",
                    json={"limit": 20, "offset": offset, "appliedFacets": {}, "searchText": ""},
                    timeout=30,
                )
                resp.raise_for_status()
                page = (resp.json() or {}).get("jobPostings") or []
                break
            except Exception:
                time.sleep(0.8 * (attempt + 1))
        if not page:
            break
        postings.extend(page)
        offset += len(page)
        if len(postings) >= (total or 0):
            break

    # 2. One detail call per role for the authoritative description.
    #    `requests.Session` is not thread-safe, so each worker gets its own
    #    session that inherits the caller's headers/cookies.
    import threading

    local = threading.local()

    def _worker_session():
        sess = getattr(local, "session", None)
        if sess is None:
            import requests as _requests
            sess = _requests.Session()
            sess.headers.update(getattr(session, "headers", {}) or {})
            local.session = sess
        return sess

    def _detail(posting: Dict[str, Any]) -> Dict[str, Any]:
        path = posting.get("externalPath") or ""
        for _ in range(3):
            try:
                resp = _worker_session().get(api + path, timeout=30)
                if resp.status_code >= 400:
                    continue
                info = (resp.json() or {}).get("jobPostingInfo") or {}
                return info if isinstance(info, dict) else {}
            except Exception:
                continue
        return {}

    with ThreadPoolExecutor(max_workers=8) as pool:
        details = list(pool.map(_detail, postings))

    jobs: List[JobListing] = []
    for posting, info in zip(postings, details):
        title = (info.get("title") or posting.get("title") or "").strip()
        if not title:
            continue

        path = posting.get("externalPath") or ""
        job_url = info.get("externalUrl") or (public + path) or career_url
        if not job_url.startswith("http"):
            job_url = board["origin"] + job_url
        # Keep the canonical detail URL stable (drop stray trailing slash).
        job_url = job_url.rstrip("/")

        location = info.get("location") or info.get("jobRequisitionLocation") or posting.get("locationsText") or "Not specified"
        if isinstance(location, list):
            location = ", ".join([str(x) for x in location if x]) or "Not specified"
        extra = info.get("additionalLocations") or []
        if isinstance(extra, list) and extra:
            extra_str = ", ".join([str(x) for x in extra if x])
            if extra_str and extra_str not in str(location):
                location = f"{location} (+{len(extra)} more locations)"

        desc = html_to_structured_text(info.get("jobDescription") or "")
        req_id = info.get("jobReqId") or (posting.get("bulletFields") or [None])[0]

        job = _build_job(
            title=title,
            company=company,
            company_url=company_url,
            career_page_url=career_url,
            job_url=job_url,
            department="General",
            location=str(location) or "Not specified",
            workplace_type=_workplace_type(str(location), title),
            employment_type=_workday_time_type(info.get("timeType")),
            description=desc,
            apply_url=job_url,
            posted_date=info.get("postedOn") or posting.get("postedOn"),
            provider="workday",
            raw={"req_id": req_id, "board": f"{board['org']}/{board['site']}"},
        )
        if job:
            jobs.append(job)
    return jobs


ADAPTERS = {
    "greenhouse": fetch_greenhouse,
    "workday": fetch_workday,
    "lever": fetch_lever,
    "ashby": fetch_ashby,
    "workable": fetch_workable,
    "recruitee": fetch_recruitee,
}


def fetch_from_ats(session, provider: str, token: str, company: str, company_url: str, career_url: str) -> List[JobListing]:
    """Dispatch to the right adapter. Returns [] on any failure."""
    adapter = ADAPTERS.get(provider)
    if not adapter:
        return []
    try:
        jobs = adapter(session, token, company, company_url, career_url)
    except Exception:
        return []
    # Attach any hiring contact emails found in the job descriptions.
    for job in jobs:
        if not job.contact_email and job.description:
            emails = CareerPageExtractor(base_company_url=company_url or career_url).extract_emails_from_text(job.description)
            if emails:
                job.contact_email = emails[0]
                job.hiring_team_emails = emails[:3]
    return jobs
