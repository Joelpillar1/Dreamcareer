"""
Careerhut Repair - re-fetch individual roles with detailed JDs for companies whose
stored rows are junk (career-page nav links instead of role pages, tiny/missing JDs).

Per-company strategies, all reading the employer's own first-party sources:

  A. First-party ATS boards (Greenhouse / Ashby / Lever JSON APIs that power the
     company's own career page) - individual role URLs with full descriptions.
  B. Company-specific first-party JSON APIs (Wiz fetch-jobs-data, DocuSign
     careers-home /api/jobs, Deel's jobs.deel.com board) - individual roles.
  C. Rendered career pages (Playwright headless Chromium, then Agent Reach
     r.jina.ai as fallback) - harvest individual role URLs out of the live DOM
     / RSC flight payloads / markdown, then fetch each role's own page for the
     full description.

Usage:
    python -m careerhut.repair_small purge            # delete junk rows only
    python -m careerhut.repair_small repair           # purge + re-fetch everything
    python -m careerhut.repair_small repair --companies Spotify Docker
    python -m careerhut.repair_small enrich           # widen thin JDs from role pages
"""

import argparse
import concurrent.futures as cf
import html as html_mod
import json
import re
import sys
import time
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import urljoin, urlparse

import requests

from .content import extract_job_detail, fallback_logo_url
from .extractor import html_to_structured_text
from .models import JobListing
from .storage import JobStorage

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
)

session = requests.Session()
session.headers.update({
    "User-Agent": USER_AGENT,
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
})


def _http_get(url: str, timeout: int = 20, retries: int = 2) -> Optional[requests.Response]:
    for attempt in range(retries + 1):
        try:
            resp = session.get(url, timeout=timeout, allow_redirects=True)
            if resp.status_code < 400:
                return resp
        except Exception:
            pass
        time.sleep(0.7 * (attempt + 1))
    return None


def _jina(url: str, timeout: int = 35, retries: int = 1) -> str:
    """Agent Reach reader (r.jina.ai) - renders JS pages server-side."""
    for attempt in range(retries + 1):
        try:
            resp = session.get(f"https://r.jina.ai/{url}", timeout=timeout)
            if resp.status_code == 200 and len(resp.text) > 200:
                return resp.text
        except Exception:
            pass
        time.sleep(1.0)
    return ""


# ---------------------------------------------------------------------------
# Sources: db company key -> spec
#   mode "ats"       : (provider, token) via careerhut.ats adapters
#   mode "wizapi"    : Wiz first-party fetch-jobs-data JSON
#   mode "docusign"  : DocuSign careers-home JSON API
#   mode "deel"      : jobs.deel.com SPA board (Playwright DOM harvest)
#   mode "render"    : Playwright-render the page, harvest ROLE_LINK_RE URLs,
#                      fetch each one for the full description
# ---------------------------------------------------------------------------

SOURCES: Dict[str, Dict[str, Any]] = {
    # --- ATS-backed ---------------------------------------------------------
    "Airbnb":           {"display": "Airbnb",       "mode": "ats", "ats": ("greenhouse", "airbnb"),     "careers": "https://careers.airbnb.com"},
    "Scale AI":         {"display": "Scale AI",     "mode": "ats", "ats": ("greenhouse", "scaleai"),    "careers": "https://scale.com/careers"},
    "Coinbase":         {"display": "Coinbase",     "mode": "ats", "ats": ("greenhouse", "coinbase"),   "careers": "https://www.coinbase.com/careers"},
    "GitLab":           {"display": "GitLab",       "mode": "ats", "ats": ("greenhouse", "gitlab"),     "careers": "https://about.gitlab.com/jobs/"},
    "Mongodb":          {"display": "MongoDB",      "mode": "ats", "ats": ("greenhouse", "mongodb"),    "careers": "https://www.mongodb.com/careers"},
    "Our Team":         {"display": "Okta",         "mode": "ats", "ats": ("greenhouse", "okta"),       "careers": "https://www.okta.com/company/careers/"},
    "Instacart":        {"display": "Instacart",    "mode": "ats", "ats": ("greenhouse", "instacart"),  "careers": "https://instacart.careers"},
    "Pinterestcareers": {"display": "Pinterest",    "mode": "ats", "ats": ("greenhouse", "pinterest"),  "careers": "https://www.pinterestcareers.com"},
    "Jobs":             {"display": "Dropbox",      "mode": "ats", "ats": ("greenhouse", "dropbox"),    "careers": "https://jobs.dropbox.com"},
    "Elastic":          {"display": "Elastic",      "mode": "ats", "ats": ("greenhouse", "elastic"),    "careers": "https://www.elastic.co/careers"},
    "Wikimediafoundation": {"display": "Wikimedia", "mode": "ats", "ats": ("greenhouse", "wikimedia"),  "careers": "https://wikimediafoundation.org/jobs/"},
    "Elevenlabs":       {"display": "ElevenLabs",   "mode": "ats", "ats": ("ashby", "elevenlabs"),      "careers": "https://elevenlabs.io/careers"},
    "Miro":             {"display": "Miro",         "mode": "ats", "ats": ("ashby", "miro"),            "careers": "https://miro.com/careers/"},
    "Snyk":             {"display": "Snyk",         "mode": "ats", "ats": ("ashby", "snyk"),            "careers": "https://snyk.io/careers/"},
    "Docker":           {"display": "Docker",       "mode": "ats", "ats": ("ashby", "docker"),          "careers": "https://www.docker.com/careers/"},
    "Grammarly":        {"display": "Grammarly",    "mode": "ats", "ats": ("ashby", "Superhuman Platform Inc"), "careers": "https://superhuman.com/company/careers/jobs"},
    "Spotify":          {"display": "Spotify",      "mode": "ats", "ats": ("lever", "spotify"),         "careers": "https://www.lifeatspotify.com"},
    "Fly":              {"display": "Fly.io",       "mode": "ats", "ats": ("lever", "fly"),             "careers": "https://fly.io/jobs/"},
    # --- first-party JSON APIs ---------------------------------------------
    "Wiz":              {"display": "Wiz",          "mode": "wizapi",                                  "careers": "https://www.wiz.io/careers"},
    "Remote":           {"display": "Remote",       "mode": "render", "page": "https://remote.com/openings", "careers": "https://remote.com/openings"},
    "Docusign":         {"display": "Docusign",     "mode": "docusign", "db_name": "Careers",          "careers": "https://careers.docusign.com/careers-home/jobs"},
    "the Team":         {"display": "Atlassian",    "mode": "render", "page": "https://www.atlassian.com/company/careers/all-jobs", "careers": "https://www.atlassian.com/company/careers"},
    # --- rendered pages ------------------------------------------------------
    "Shopify":          {"display": "Shopify",      "mode": "render", "page": "https://www.shopify.com/careers", "careers": "https://www.shopify.com/careers"},
    "Canva":            {"display": "Canva",        "mode": "render", "page": "https://www.lifeatcanva.com/en/jobs", "db_name": "our mission to empower the world to design.", "careers": "https://www.lifeatcanva.com/en/jobs"},
    "Automattic":       {"display": "Automattic",   "mode": "render", "page": "https://automattic.com/jobs/", "careers": "https://automattic.com/work-with-us/"},
    "Deel":             {"display": "Deel",         "mode": "deel",   "page": "https://jobs.deel.com/deel", "careers": "https://www.deel.com/careers/"},
    "Rippling":         {"display": "Rippling",     "mode": "render", "page": "https://ats.rippling.com/rippling/jobs", "careers": "https://www.rippling.com/careers/open-roles"},    "Postman":       {"display": "Postman",      "mode": "workday", "tenant": "postman", "sub": "wd108", "site": "careers", "careers": "https://www.postman.com/company/careers/"},
    "Replicate":      {"display": "Replicate",    "mode": "purge_only", "careers": "https://replicate.com/about"},
    "Hashicorp":      {"display": "HashiCorp",    "mode": "purge_only", "careers": "https://www.hashicorp.com/en/careers"},
}

# Individual role URL shapes per company (applied to rendered HTML + Jina md).
ROLE_LINK_RE: Dict[str, re.Pattern] = {
    "Shopify":     re.compile(r"(?:https://www\.shopify\.com)?(/careers/[a-z0-9\-]+_[0-9a-f\-]{20,})", re.I),
    "Automattic":  re.compile(r"(https://automattic\.com/work-with-us/job/[a-z0-9\-]+/?)", re.I),
    "Deel":        re.compile(r"(https://jobs\.deel\.com/deel/job-details/[0-9a-f\-]{20,})", re.I),
    "Rippling":    re.compile(r"(https://ats\.rippling\.com/rippling/jobs/[0-9a-f\-]{20,})", re.I),
    "Wiz":         re.compile(r"(?:https://www\.wiz\.io)?(/careers/job/\d+/[a-z0-9\-]+)", re.I),
    "Canva":       re.compile(r"(?:https://www\.lifeatcanva\.com)?(/en/jobs/\d+/[a-z0-9\-]+/?)", re.I),
    "Postman":     re.compile(r"(https://www\.postman\.com/company/careers/open-positions/[a-z0-9\-]{8,}/?)", re.I),
    "Replicate":   re.compile(r"(https://replicate\.com/careers/[a-z0-9\-]{4,}/?)", re.I),
    "Hashicorp":   re.compile(r"(https://www\.hashicorp\.com/(?:en/)?careers/[a-z0-9\-]{6,}/?(?:\?[\w=&%\-]+)?)", re.I),
    "the Team":    re.compile(r"(?:https://www\.atlassian\.com)?(/company/careers/\d+/[\w\-]+)", re.I),
    "Postman":     re.compile(r"(https://job-boards\.greenhouse\.io/(?:postman|postmanlabs)/jobs/\d+|https://www\.postman\.com/company/careers/open-positions/[a-z0-9\-]{8,}/?)", re.I),
    "Remote":      re.compile(r"(https://apply\.remote\.com/jobs/[0-9a-f\-]{20,})", re.I),
}

# Careers-site nav/menu URLs that must never be treated as roles.
NAV_DENY_RE = re.compile(
    r"(saved-jobs|privacy|how-we-hire|benefits|intern|/teams?/?$|departments|feed\.xml|"
    r"template|university|accessibility|trial|accommodat|/disciplines/|/life-at|"
    r"job-description|extraordinary|#|/events|/news|/press)",
    re.I,
)

# Row titles that are clearly nav/menu artifacts, never roles.
JUNK_TITLE_RE = re.compile(
    r"^(jobs?|careers?|view open|see open|open positions?|all jobs|categories|english|"
    r"our team|the band|for jobseekers|read our blog|insights?|tech$|people$|locations?|"
    r"how we hire|working at|benefits|proddev|inclusion|hiring & onboarding|alertbeware|"
    r"start your career|why inclusion|get started|get your free|our story|equity scheme|"
    r"blog post|extraordinary|board of|executive team|staff$|privacy|linkedin|skip the line|"
    r"job description|how to avoid|0|saved|rss feed)\b",
    re.I,
)


# ---------------------------------------------------------------------------
# Junk purge
# ---------------------------------------------------------------------------

def _is_junk_row(title: str, job_url: str, desc_len: int) -> Optional[str]:
    path = urlparse(job_url or "").path
    reasons = []
    if NAV_DENY_RE.search(path) and not re.search(r"/(jobs?|careers)/[\w\-]{6,}", path):
        reasons.append("nav-url")
    if desc_len < 600:
        reasons.append(f"thin-jd({desc_len})")
    if JUNK_TITLE_RE.match((title or "").strip()):
        reasons.append("nav-title")
    return ",".join(reasons) if reasons else None


def purge_junk_rows(display_names: Optional[List[str]] = None) -> List[Dict[str, Any]]:
    """Delete nav/listing rows for the target companies. Returns removed rows."""
    storage = JobStorage()
    by_display = {}
    for key, spec in SOURCES.items():
        by_display[spec.get("db_name") or key] = spec["display"]
    targets = display_names or list(by_display.values())

    removed: List[Dict[str, Any]] = []
    conn = storage._get_connection()
    try:
        for db_name, display in by_display.items():
            if db_name not in targets and display not in targets:
                continue
            rows = conn.execute(
                "SELECT id, title, job_url, length(COALESCE(description,'')) AS dl FROM jobs WHERE company=?",
                (db_name,),
            ).fetchall()
            for row in rows:
                reason = _is_junk_row(row["title"], row["job_url"], row["dl"])
                if reason:
                    removed.append({"id": row["id"], "company": db_name, "title": row["title"],
                                    "job_url": row["job_url"], "reason": reason})
    finally:
        conn.close()

    for item in removed:
        conn = storage._get_connection()
        try:
            conn.execute("DELETE FROM jobs WHERE id=?", (item["id"],))
            conn.commit()
        finally:
            conn.close()
    return removed


# ---------------------------------------------------------------------------
# Fetchers
# ---------------------------------------------------------------------------

def _logo(careers_url: str) -> Optional[str]:
    return fallback_logo_url(careers_url)


def _mk_job(*, display: str, careers_url: str, title: str, job_url: str,
            description: str, location: str = "Not specified",
            department: str = "General", apply_url: Optional[str] = None,
            emails: Optional[List[str]] = None, source: str = "repair") -> JobListing:
    return JobListing(
        title=(title or "").strip()[:200],
        company=display,
        company_url=careers_url,
        career_page_url=careers_url,
        job_url=job_url,
        department=department or "General",
        location=location or "Not specified",
        workplace_type="Remote" if re.search(r"remote", f"{location} {title}", re.I) else
                       ("Hybrid" if re.search(r"hybrid", f"{location} {title}", re.I) else "Unspecified"),
        description=description or "",
        apply_url=apply_url or job_url,
        contact_email=(emails or [None])[0],
        hiring_team_emails=(emails or [])[:3],
        company_logo=_logo(careers_url),
        raw_metadata={"source": source},
    )


def fetch_ats(display: str, careers_url: str, board: Tuple[str, str]) -> List[JobListing]:
    from .ats import fetch_from_ats
    provider, token = board
    jobs: List[JobListing] = []
    # ATS payloads are large and the endpoints intermittently drop connections;
    # retry a few times before concluding the board is unreachable.
    for attempt in range(4):
        jobs = fetch_from_ats(session, provider, token, display, careers_url, careers_url)
        if jobs:
            break
        time.sleep(1.5 * (attempt + 1))
    if not jobs:
        return []
    logo = _logo(careers_url)
    for job in jobs:
        if not job.company_logo:
            job.company_logo = logo
        if job.career_page_url == job.job_url:
            job.career_page_url = careers_url
    return jobs


def fetch_wiz() -> List[JobListing]:
    """Wiz's own career-page API (the JSON service powering wiz.io/careers)."""
    resp = _http_get("https://www.wiz.io/api/fetch-jobs-data", timeout=30)
    if resp is None:
        return []
    try:
        data = resp.json()
    except Exception:
        return []
    jobs: List[JobListing] = []
    careers = "https://www.wiz.io/careers"
    for item in data.get("allJobPostings", []):
        title = item.get("title") or ""
        jid = item.get("id") or ""
        slug = re.sub(r"[^a-z0-9\-]+", "-", (title or "role").lower()).strip("-")
        job_url = f"https://www.wiz.io/careers/job/{jid}/{slug}?gh_jid={jid}"
        desc = html_to_structured_text(html_mod.unescape(item.get("content") or ""))
        jobs.append(_mk_job(
            display="Wiz", careers_url=careers, title=title, job_url=job_url,
            description=desc, location=item.get("location") or "Not specified",
            department=item.get("department") or "General", source="wiz_api",
        ))
    return jobs


def fetch_docusign() -> List[JobListing]:
    """DocuSign careers-home JSON API (first-party, powers careers.docusign.com)."""
    careers = "https://careers.docusign.com/careers-home/jobs"
    jobs: List[JobListing] = []
    page = 1
    while page <= 20:
        resp = _http_get(
            f"https://careers.docusign.com/api/jobs?page={page}&sortBy=relevance&descending=false&internal=false",
            timeout=25,
        )
        if resp is None:
            break
        try:
            data = resp.json()
        except Exception:
            break
        batch = data.get("jobs") or []
        if not batch:
            break
        for entry in batch:
            # API shape: {"jobs": [{"data": {"slug", "title", "description", ...}}]}
            item = entry.get("data") if isinstance(entry, dict) else None
            if not isinstance(item, dict):
                item = entry if isinstance(entry, dict) else {}
            jid = str(item.get("slug") or item.get("req_id") or item.get("id") or "")
            if not jid:
                continue
            job_url = f"https://careers.docusign.com/careers-home/jobs/{jid}?lang=en-us"
            desc = html_to_structured_text(item.get("description") or item.get("descriptionText") or "")
            loc = item.get("location") or item.get("city") or "Not specified"
            if isinstance(loc, (list, tuple)):
                loc = ", ".join(str(v) for v in loc if v)
            elif isinstance(loc, dict):
                loc = ", ".join(str(v) for v in loc.values() if v)
            dept = item.get("category") or item.get("department") or "General"
            if isinstance(dept, (list, tuple)):
                dept = ", ".join(str(v) for v in dept if v) or "General"
            elif isinstance(dept, dict):
                dept = ", ".join(str(v) for v in dept.values() if v) or "General"
            jobs.append(_mk_job(
                display="Docusign", careers_url=careers, title=item.get("title") or "", job_url=job_url,
                description=desc, location=loc, department=dept,
                source="docusign_api",
            ))
        if len(batch) < 10:
            break
        page += 1
    return jobs


# ---------------------------------------------------------------------------
# Playwright rendering + role-link harvesting
# ---------------------------------------------------------------------------

def _render(url: str, wait_ms: int = 6000) -> str:
    """Render a page headlessly; returns live DOM HTML ('' on failure)."""
    try:
        import asyncio
        from playwright.async_api import async_playwright
    except Exception:
        return ""

    async def _run() -> str:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            ctx = await browser.new_context(user_agent=USER_AGENT, viewport={"width": 1440, "height": 2000})
            page = await ctx.new_page()
            try:
                await page.goto(url, wait_until="domcontentloaded", timeout=40000)
                try:
                    await page.wait_for_load_state("networkidle", timeout=20000)
                except Exception:
                    pass
            except Exception:
                pass
            await page.wait_for_timeout(wait_ms)
            # scroll to bottom to trigger lazy lists
            for _ in range(6):
                await page.mouse.wheel(0, 2500)
                await page.wait_for_timeout(700)
            html = await page.content()
            await browser.close()
            return html

    try:
        return asyncio.run(_run())
    except Exception:
        return ""


def harvest_render(display: str, page_url: str) -> List[Tuple[str, Optional[str]]]:
    """Return [(role_url, title|None)] harvested from the rendered page."""
    pattern = ROLE_LINK_RE.get(display)
    if not pattern:
        return []
    html = _render(page_url)
    found: Dict[str, Optional[str]] = {}

    def _scan(text: str) -> None:
        for m in pattern.finditer(text):
            url = urljoin(page_url, m.group(1))
            if NAV_DENY_RE.search(urlparse(url).path):
                continue
            found.setdefault(url, None)

    _scan(html)
    # anchor-text titles around each link
    for m in re.finditer(r'href="([^"]+)"[^>]*>(.{0,200}?)</a>', html, re.S):
        href = urljoin(page_url, m.group(1))
        if href in found and found[href] is None:
            label = re.sub(r"<[^>]+>", " ", m.group(2))
            label = html_mod.unescape(re.sub(r"\s+", " ", label)).strip()
            label = re.split(r"\s{2,}|\bSales\b|\bEngineering\b|\bMarketing\b", label)[0].strip()
            if 3 <= len(label) <= 120 and not re.match(r"^(apply|view|see|learn|read|open)", label, re.I):
                found[href] = label

    # Jina fallback when the DOM had nothing
    if not found:
        md = _jina(page_url)
        if md:
            _scan(md)
    return list(found.items())


def _title_from_html(page: str) -> Optional[str]:
    """Best title: <h1>, then <title>/<h2>, from any HTML/markdown page.
    Tags may carry attributes (e.g. <title data-next-head="">)."""
    if not page:
        return None
    for tag in ("h1", "title", "h2"):
        m = re.search(r"<" + tag + r"[^>]*>(.{3,180}?)</" + tag + ">", page, re.S | re.I)
        if m:
            t = html_mod.unescape(re.sub(r"<[^>]+>", " ", m.group(1))).strip()
            t = re.sub(r"\s+", " ", t)
            # drop common suffixes from <title> combinations
            t = re.split(r" [\|\u2013\u2014] ", t)[0].strip()
            if len(t) >= 3:
                return t[:150]
    return None


def _desc_from_next_data(page: str) -> str:
    """Pull the longest description-like string out of Next.js __NEXT_DATA__."""
    m = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', page, re.S)
    if not m:
        return ""
    best = ""
    def _walk(node):
        nonlocal best
        if isinstance(node, dict):
            for k, v in node.items():
                if (isinstance(v, str) and re.search(r"description|content|body", k, re.I)
                        and len(v) >= 400 and "{{" not in v and len(v) > len(best)):
                    best = v
                else:
                    _walk(v)
        elif isinstance(node, list):
            for v in node:
                _walk(v)
    try:
        _walk(json.loads(m.group(1)))
    except Exception:
        pass
    if best and "<" in best:
        best = html_to_structured_text(best)
    return best[:20000]


def _desc_from_dom(page: str) -> str:
    """Slice the JD out of a rendered page: text between the role heading and
    the company boilerplate / footer."""
    try:
        from bs4 import BeautifulSoup
    except Exception:
        return ""
    try:
        soup = BeautifulSoup(page, "html.parser")
    except Exception:
        return ""
    for tag in soup(["script", "style", "nav", "header", "footer", "aside", "form", "button"]):
        tag.decompose()
    text = soup.get_text("\n")
    lines = [ln.strip() for ln in text.splitlines()]
    lines = [ln for ln in lines if ln]
    # start after the heading that repeats the role title (h2/h1 rendered)
    start = 0
    for i, ln in enumerate(lines):
        if re.match(r"^(about (the|this)|what you|your role|responsibilities|in this role)", ln, re.I):
            start = i
            break
    # stop at company boilerplate / apply / footer markers
    end = len(lines)
    for i in range(start, len(lines)):
        if re.match(r"^(about rippling|apply (now|for this)|equal opportunity|benefits at|why you)", lines[i], re.I):
            end = i
            break
    chunk = "\n".join(lines[start:end])
    return chunk[:20000]


def fetch_role_page(job_url: str, title_hint: Optional[str] = None) -> Dict[str, Any]:
    """Fetch an individual role page: direct HTTP, then Jina, then Playwright."""
    out: Dict[str, Any] = {"description": "", "emails": [], "apply_url": None, "title": None}
    page = ""
    resp = _http_get(job_url, timeout=20, retries=1)
    if resp is not None and len(resp.text) > 800:
        page = resp.text
    if not page:
        page = _jina(job_url)
    if not page:
        page = _render(job_url, wait_ms=2500)
    if not page:
        return out
    if "<" not in page[:2000]:  # markdown from Jina
        lines = [ln.strip() for ln in page.splitlines() if ln.strip()]
        title = None
        for ln in lines[:8]:
            m = re.match(r"^#+\s*(.{4,120})$", ln)
            if m:
                title = m.group(1).strip()
                break
        out["title"] = title
        body = [ln for ln in lines if len(ln) > 80]
        out["description"] = "\n\n".join(body[:120])[:20000]
        return out
    detail = extract_job_detail(page, job_url, title_hint)
    out.update({k: detail.get(k) for k in ("description", "emails", "apply_url")})
    if not out["description"]:
        out["description"] = _desc_from_next_data(page)
    if not out["description"]:
        out["description"] = _desc_from_dom(page)
    if not out["title"]:
        out["title"] = _title_from_html(page)
    return out


def fetch_render_company(display: str, page_url: str, careers_url: str) -> List[JobListing]:
    links = harvest_render(display, page_url)
    if not links:
        return []

    def _work(item: Tuple[str, Optional[str]]) -> Optional[JobListing]:
        role_url, link_title = item
        detail = fetch_role_page(role_url, link_title)
        title = link_title or detail.get("title") or ""
        if not title:
            return None
        return _mk_job(
            display=display, careers_url=careers_url, title=title, job_url=role_url,
            description=detail.get("description") or "",
            apply_url=detail.get("apply_url") or role_url,
            emails=detail.get("emails") or [],
            source="render",
        )

    jobs: List[JobListing] = []
    with cf.ThreadPoolExecutor(max_workers=6) as pool:
        for job in pool.map(_work, links):
            if job and len(job.description or "") >= 200:
                jobs.append(job)
            elif job:
                # keep the role even with a thin JD (better than nothing), flagged
                job.raw_metadata["thin"] = True
                jobs.append(job)
    return jobs


def _render_workday(name: str, tenant: str, sub: str, site: str) -> List[str]:
    """Harvest individual job links off a Workday careers site (SPA, JS-only)."""
    base = f"https://{tenant}.{sub}.myworkdayjobs.com/{site}"
    try:
        import asyncio
        from playwright.async_api import async_playwright
    except Exception:
        return []

    async def _run() -> List[str]:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            ctx = await browser.new_context(user_agent=USER_AGENT, viewport={"width": 1440, "height": 2000})
            page = await ctx.new_page()
            try:
                await page.goto(base, wait_until="domcontentloaded", timeout=40000)
            except Exception:
                return []
            await page.wait_for_timeout(9000)
            for _ in range(6):
                try:
                    btn = page.locator("[data-automation-id='loadMorePostsList']").first
                    if await btn.count():
                        await btn.click(timeout=3000)
                        await page.wait_for_timeout(2500)
                    else:
                        break
                except Exception:
                    break
            links = await page.eval_on_selector_all(
                "a[href]", "els => els.map(e => e.getAttribute('href')).filter(h => h)")
            await browser.close()
            jobs = set()
            for h in links:
                if h and "/job/" in h:
                    jobs.add(h if h.startswith("http") else f"{base}{h}")
            return sorted(jobs)

    try:
        return asyncio.run(_run())
    except Exception:
        return []


def fetch_workday(tenant: str, sub: str, site: str, display: str, careers_url: str) -> List[JobListing]:
    links = _render_workday(display, tenant, sub, site)
    if not links:
        return []
    def _work(link: str) -> Optional[JobListing]:
        detail = fetch_role_page(link)
        title = detail.get("title") or ""
        if not title:
            m = re.search(r"_JR\d+", link)
            title = re.split("/job/", link)[-1].split("_")[0].replace("-", " ")
        if not title:
            return None
        return _mk_job(display=display, careers_url=careers_url, title=title, job_url=link,
                       description=detail.get("description") or "", apply_url=link,
                       emails=detail.get("emails") or [], source="workday")
    jobs: List[JobListing] = []
    with cf.ThreadPoolExecutor(max_workers=5) as pool:
        for j in pool.map(_work, links):
            if j:
                jobs.append(j)
    return jobs


def fetch_deel() -> List[JobListing]:
    """Deel's SPA board jobs.deel.com - harvest role URLs from the live DOM."""
    links = harvest_render("Deel", "https://jobs.deel.com/deel")
    if not links:
        return []
    careers = "https://www.deel.com/careers/"

    def _work(item: Tuple[str, Optional[str]]) -> Optional[JobListing]:
        role_url, _ = item
        detail = fetch_role_page(role_url)
        title = detail.get("title") or ""
        if not title:
            m = re.search(r"job-details/([0-9a-f\-]{10,})/?", role_url)
            title = "Deel role " + (m.group(1)[:8] if m else "")
        return _mk_job(
            display="Deel", careers_url=careers, title=title, job_url=role_url,
            description=detail.get("description") or "",
            apply_url=role_url, emails=detail.get("emails") or [], source="deel_board",
        )

    jobs: List[JobListing] = []
    with cf.ThreadPoolExecutor(max_workers=6) as pool:
        for job in pool.map(_work, links):
            if job:
                jobs.append(job)
    return jobs


# ---------------------------------------------------------------------------
# Orchestration
# ---------------------------------------------------------------------------

def repair_company(key: str, spec: Dict[str, Any]) -> Tuple[str, int, str]:
    display = spec["display"]
    careers = spec["careers"]
    mode = spec["mode"]
    try:
        if mode == "ats":
            jobs = fetch_ats(display, careers, tuple(spec["ats"]))
        elif mode == "wizapi":
            jobs = fetch_wiz()
        elif mode == "docusign":
            jobs = fetch_docusign()
        elif mode == "deel":
            jobs = fetch_deel()
        elif mode == "render":
            jobs = fetch_render_company(display, spec.get("page") or careers, careers)
        elif mode == "workday":
            jobs = fetch_workday(spec["tenant"], spec["sub"], spec["site"], display, careers)
        elif mode == "purge_only":
            return display, 0, "purged only (no first-party board reachable)"
        else:
            jobs = []
    except Exception as exc:
        return display, 0, f"error: {exc}"

    if not jobs:
        return display, 0, "no roles found"

    storage = JobStorage()
    saved = storage.save_jobs(jobs)
    thin = sum(1 for j in jobs if j.raw_metadata.get("thin"))
    return display, saved, f"{len(jobs)} roles ({mode}), thin={thin}"


def run_repair(companies: Optional[List[str]] = None, purge_only: bool = False) -> None:
    display_to_key = {(spec.get("db_name") or spec["display"]): key for key, spec in SOURCES.items()}
    chosen = []
    if companies:
        for name in companies:
            key = display_to_key.get(name) or (name if name in SOURCES else None)
            if key is None:
                matches = [k for k, s in SOURCES.items() if s["display"].lower() == name.lower()]
                key = matches[0] if matches else None
            if key:
                chosen.append(key)
    keys = chosen or list(SOURCES.keys())

    print(f"[*] Purging junk rows for {len(keys)} companies...")
    removed = purge_junk_rows([SOURCES[k]["display"] for k in keys])
    for item in removed[:40]:
        print(f"    - [{item['reason']}] {item['company']}: {item['title'][:60]}")
    print(f"[*] Removed {len(removed)} junk rows")
    if purge_only:
        return

    print(f"\n[*] Re-fetching individual roles for {len(keys)} companies...")
    for key in keys:
        display, saved, info = repair_company(key, SOURCES[key])
        print(f"    {display:<12} saved={saved:<4} {info}", flush=True)


def run_enrich(min_len: int = 900) -> None:
    """Widen still-thin JDs by re-reading each role's own page (Jina fallback)."""
    storage = JobStorage()
    conn = storage._get_connection()
    try:
        rows = conn.execute(
            "SELECT job_url, title FROM jobs "
            "WHERE length(COALESCE(description,'')) < ? AND job_url != career_page_url "
            "ORDER BY length(COALESCE(description,'')) ASC",
            (min_len,),
        ).fetchall()
    finally:
        conn.close()
    print(f"[*] {len(rows)} rows thinner than {min_len} chars")

    def _work(row) -> Tuple[str, str]:
        detail = fetch_role_page(row["job_url"], row["title"])
        return row["job_url"], detail.get("description") or ""

    updated = 0
    with cf.ThreadPoolExecutor(max_workers=8) as pool:
        for job_url, desc in pool.map(_work, rows):
            if desc and len(desc) > min_len:
                conn = storage._get_connection()
                try:
                    conn.execute("UPDATE jobs SET description=? WHERE job_url=?", (desc, job_url))
                    conn.commit()
                    updated += 1
                finally:
                    conn.close()
    print(f"[*] Widened {updated} descriptions")


def main():
    if hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except Exception:
            pass
    ap = argparse.ArgumentParser(description="Repair small-company job rows")
    sub = ap.add_subparsers(dest="cmd", required=True)
    p1 = sub.add_parser("purge")
    p1.add_argument("--companies", nargs="*", default=None)
    p2 = sub.add_parser("repair")
    p2.add_argument("--companies", nargs="*", default=None)
    p3 = sub.add_parser("enrich")
    args = ap.parse_args()

    if args.cmd == "purge":
        run_repair(args.companies, purge_only=True)
    elif args.cmd == "repair":
        run_repair(args.companies)
    elif args.cmd == "enrich":
        run_enrich()


if __name__ == "__main__":
    main()
