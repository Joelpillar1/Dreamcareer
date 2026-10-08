"""
Careerhut Extractor - Intelligent multi-format parsing for Company Career Pages
Extracts structured JobListing objects, Schema.org JSON-LD, and detects hiring/follow-up contact emails.
"""

import re
import json
import html as html_lib
from urllib.parse import urljoin, urlparse, unquote
from typing import List, Dict, Any, Optional, Set
from bs4 import BeautifulSoup
from .models import JobListing

EMAIL_REGEX = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+")

_BLOCK_TAGS = [
    "p", "div", "section", "article", "header", "footer", "main", "aside",
    "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "table", "tr", "blockquote", "pre", "figure",
]
_NON_CONTENT_TAGS = ["script", "style", "noscript", "svg", "form", "nav", "iframe"]

# Page chrome that must never be treated as a job posting.
_JUNK_LINK_TEXT = {
    "apply", "apply now", "apply for this job", "view job", "view jobs", "read more",
    "learn more", "details", "see more", "show more", "load more", "view all",
    "see all", "all jobs", "jobs", "job openings", "open roles", "open positions",
    "careers", "home", "about us", "contact", "sign in", "login", "search",
    "share this job", "back to jobs", "submit application", "next", "previous",
}
# Page-chrome phrases that must never become a job title. Deliberately
# phrased as whole expressions: words like "benefits" or "copyright" are
# perfectly normal inside real titles ("Director, Global Benefits").
_JUNK_TITLE_PATTERNS = [
    r"^learn more\b", r"^view all\b", r"^see all\b", r"^see how\b", r"^why work\b",
    r"^our (commitment|values|culture|story|team)\b",
    r"\bcode of conduct\b", r"\bculture and values\b", r"\bcompany values\b",
    r"\binterviewing at\b", r"\btotal rewards at\b", r"\bour dna\b", r"^top \d+\b",
    r"\bprivacy policy\b", r"\bterms of (use|service)\b",
    r"\bcookie (policy|preferences|settings)\b", r"\bcopyright (policy|notice)\b",
    r"\bfrequently asked\b", r"\binterview guide\b", r"\bequal opportunity employer\b",
    r"\baccommodations and\b", r"\bapply (now|for this job)\b", r"\bdiversity and inclus",
    r"\bdiversity, equity\b", r"\bapplicant (privacy|accommodations)\b",
]
_JUNK_TITLE_RE = re.compile("|".join(_JUNK_TITLE_PATTERNS), re.I)
# Synthetic placeholders a fallback path invents when the real title could not
# be read ("Deel role fc7cec85", "Remote ATS", a bare UUID). These must never
# reach the job list: the employer never advertised them.
_PLACEHOLDER_TITLE_RE = re.compile(
    r"^(?:remote\s+)?ats$|"
    r"^[a-z0-9 .&'()\-/]{1,40}\s+(?:role|job|posting|position)\s+[0-9a-f]{6,}$|"
    r"^(?:role|job|posting|position)\s+[0-9a-f]{6,}$|"
    r"^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$|"
    r"^https?://\S+$",
    re.I,
)
_LOCALE_TITLE_RE = re.compile(
    r"^(english|deutsch|fran[cç]ais|espa[nñ]ol|portugu[eê]s|italiano|nederlands|"
    r"日本語|中文|한국어|polski|русский|ti[eế]ng vi[eẹ]t)(\s|\(|$)", re.I,
)

# Titles that read like real postings (used only as a fallback signal).
_JOB_TITLE_KEYWORD_RE = re.compile(
    r"\b(engineer|engineering|developer|architect|software|backend|frontend|full[ -]?stack|"
    r"designer|manager|director|head of|lead|principal|staff|senior|junior|associate|"
    r"analyst|scientist|specialist|consultant|recruiter|talent|coordinator|officer|"
    r"executive|president|vice president|intern|apprentice|product|sales|marketing|"
    r"account executive|customer success|operations|finance|legal|data|security|"
    r"support|technician|writer|editor|researcher|strategist|partner|administrator|"
    r"technologist|sre|devops|sDET|counsel|clerk|general manager|chief)\b",
    re.I,
)

# href shapes that are unambiguously a single posting.
_STRONG_JOB_URL_RE = re.compile(
    r"gh_jid=|/job-details/|/job/[0-9a-z]|/jobs/[0-9]|/jobs/[0-9a-f]{8}-|"
    r"/positions?/[0-9]|/opportunit(y|ies)/[0-9]|/openings?/[0-9]|/vacanc(y|ies)/|"
    r"job-boards\.greenhouse\.io/|boards\.greenhouse\.io/|jobs\.lever\.co/|"
    r"jobs\.ashbyhq\.com/|myworkdayjobs\.com/.*/job/|/careers/(listing|role|opening|position|job)/|"
    r"posthog\.com/careers/[a-z0-9-]+|"
    r"/careers/[a-z0-9-]+(?:-engineer|-developer|-designer|-manager|-lead|-specialist|-marketer|-recruiter|-operations|-advocate|-educator)|"
    r"/job_[a-z0-9]+|jobId=|req_id=|requisition",
    re.I,
)

# Container class/id markers that mean "this is a list of postings".
_JOB_CONTAINER_RE = re.compile(
    r"job[ -]?list|joblist|job[ -]?card|jobcard|job[ -]?item|job[ -]?opening|"
    r"open[ -]?roles|role[ -]?list|position[ -]?list|career[ -]?job|job[ -]?board|"
    r"job[ -]?result|vacanc|requisition|posting[ -]?list|jobsearchresult|job[ -]?row",
    re.I,
)

_CHROME_ANCESTORS = {"nav", "header", "footer", "aside", "form", "button"}

# A link without a posting id (no ATS host, no numeric/uuid segment) can still be
# a real role, but never when it points at careers-site chrome: benefit pages,
# department/city filters, locale switchers or blog posts. These were the exact
# shapes that once reached the dashboard as "jobs" ("Benefits", "Tokyo",
# "1 open position", "Design team").
_CAREERS_SECTION_PATH_RE = re.compile(
    r"(?:^|/)(?:"
    r"benefits?|culture|values|awards?|resources?|diversity|inclusion|belonging|"
    r"interviewing|interview-prep|recruitment-fraud|life-at[a-z0-9-]*|"
    r"teams?|locations?|early-?careers|teamanywhere|team-everyone|"
    r"university-recruiting|internships?|go-to-market|engineering-at-[a-z0-9-]+|"
    r"open-positions|all-jobs|listings?|overview|applying|candidate-experience|"
    r"emerging-talent|flex-work|people-team|general-administration|hiring-[a-z0-9-]+|"
    r"sales|marketing|operations|product|engineering|legal|finance|recruiting|security|"
    r"customer-success|product-ux-engineering"
    r")(?:/|$)",
    re.I,
)
_CAREERS_SECTION_QUERY_RE = re.compile(
    r"[?&](?:department|office|location|team|category|filter|itm_[a-z]+|hubs_[a-z-]+)=",
    re.I,
)
_CAREERS_SECTION_ROOT_RE = re.compile(
    r"^https?://[^/]+/(?:[a-z]{2}(?:-[a-z]{2})?/)?(?:company/)?(?:careers?|jobs)/?(?:[?#].*)?$",
    re.I,
)
_BLOG_URL_RE = re.compile(r"^https?://blog\.|/blog/", re.I)
# Section labels come from site-taxonomy vocabulary only - never from role nouns
# ("manager", "engineer", "analyst") - so a genuine posting cannot be filtered out.
_CAREERS_SECTION_WORDS = {
    "sales", "marketing", "engineering", "product", "design", "finance", "legal",
    "operations", "recruiting", "talent", "people", "hr", "security", "customer",
    "success", "business", "development", "data", "research", "support", "services",
    "professional", "field", "go", "market", "partnerships", "admin", "administration",
    "communications", "content", "strategy", "analytics", "technical", "team", "teams",
    "careers", "career", "jobs", "job", "openings", "opening", "open", "positions",
    "position", "all", "view", "see", "more", "read", "learn", "our", "here", "life",
    "at", "explore", "check", "out", "get", "future", "ready", "work", "flex", "early",
    "emerging", "university", "internships", "internship", "programs", "program",
    "benefits", "benefit", "culture", "values", "awards", "employee", "resources",
    "diversity", "inclusion", "belonging", "interviewing", "candidate", "experience",
    "tips", "for", "applying", "overview", "locations", "location", "hub", "tips",
    "tokyo", "london", "paris", "berlin", "munich", "singapore", "sydney", "seoul",
    "spain", "japan", "france", "germany", "india", "canada", "australia", "amsterdam",
    "dublin", "warsaw", "vancouver", "reykjavik", "chicago", "york", "francisco", "san",
    "new", "bengaluru", "washington", "city", "hq", "uk", "us", "emea", "apac",
    "americas", "north", "south", "east", "west", "global", "remote",
}


def _is_careers_section_link(url: str, title: str) -> bool:
    """True when a link without a posting id points at careers-site chrome."""
    if _BLOG_URL_RE.search(url or ""):
        return True
    if _CAREERS_SECTION_ROOT_RE.match(url or ""):
        return True
    if _CAREERS_SECTION_QUERY_RE.search(url or ""):
        return True
    try:
        path = urlparse(url or "").path or ""
    except Exception:
        path = ""
    if _CAREERS_SECTION_PATH_RE.search(path):
        return True
    # "1 open position", "Tokyo", "Engineering & Data": taxonomy words only.
    words = re.findall(r"[a-z]+", (title or "").lower())
    return 0 < len(words) <= 5 and all(w in _CAREERS_SECTION_WORDS for w in words)


def _normalize_page_url(url: str) -> str:
    """Path-only form (no query/fragment, no trailing slash) for page identity."""
    try:
        parsed = urlparse(url or "")
    except Exception:
        return (url or "").strip().rstrip("/")
    path = (parsed.path or "").rstrip("/")
    return f"{parsed.netloc.lower()}{path.lower()}"


def _same_page(url_a: str, url_b: str) -> bool:
    return bool(url_a) and _normalize_page_url(url_a) == _normalize_page_url(url_b)


def _count_posting_links(el) -> int:
    """Number of unmistakable per-role links inside an element."""
    try:
        hrefs = [a.get("href", "") for a in el.find_all("a", href=True)]
    except Exception:
        return 0
    return sum(1 for h in hrefs if _STRONG_JOB_URL_RE.search((h or "").lower()))


def _in_page_chrome(el) -> bool:
    """True when the element sits in navigation/branding chrome."""
    node = el
    depth = 0
    while node is not None and depth < 8:
        if getattr(node, "name", None) in _CHROME_ANCESTORS:
            return True
        attrs = getattr(node, "attrs", None) or {}
        role = str(attrs.get("role", "")).lower()
        if role in {"navigation", "banner", "contentinfo", "menu"}:
            return True
        node = getattr(node, "parent", None)
        depth += 1
    return False


def _is_job_container(el) -> bool:
    """True when an ancestor advertises a job list (class/id like "jobList")."""
    node = el
    depth = 0
    while node is not None and depth < 6:
        attrs = getattr(node, "attrs", None) or {}
        marker = " ".join(
            [str(attrs.get("class", "")), str(attrs.get("id", "")), str(attrs.get("data-testid", ""))]
        )
        if marker.strip() and _JOB_CONTAINER_RE.search(marker):
            return True
        node = getattr(node, "parent", None)
        depth += 1
    return False


def is_placeholder_title(title: str) -> bool:
    """True for synthetic/placeholder titles that no employer ever advertised."""
    return bool(_PLACEHOLDER_TITLE_RE.match((title or "").strip()))


def is_plausible_job_title(title: str) -> bool:
    """Reject nav labels, locale switchers and prose links misread as titles."""
    title = (title or "").strip()
    if len(title) < 3 or len(title) > 110:
        return False
    if is_placeholder_title(title):
        return False
    lowered = title.lower().strip(" .!?:;-")
    if lowered in _JUNK_LINK_TEXT:
        return False
    if _JUNK_TITLE_RE.search(title) or _LOCALE_TITLE_RE.search(title):
        return False
    # Real postings are label-like phrases, not full sentences.
    if title.endswith(".") and title.split() and len(title.split()) > 5:
        return False
    return True


# Only treat input as HTML when it contains a real HTML tag. Plain text with a
# stray "<" (e.g. "based in India <Karnataka, Tamil Nadu>") must be preserved
# verbatim, otherwise the parser silently drops that segment.
_HTML_TAG_RE = re.compile(
    r"</?(?:p|div|br|ul|ol|li|h[1-6]|strong|b|em|i|u|a|span|table|thead|tbody|tr|td|th|"
    r"section|article|main|header|footer|blockquote|pre|code|figure|figcaption|hr|img|small|sub|sup|abbr|font)\b[^>]*>",
    re.I,
)


def normalize_whitespace(text: str) -> str:
    """Collapse runs of whitespace while keeping single newlines and blank-line blocks."""
    if not text:
        return ""
    text = text.replace("\xa0", " ").replace("\r\n", "\n").replace("\r", "\n")
    lines = [re.sub(r"[ \t]+", " ", ln).strip() for ln in text.split("\n")]
    out: List[str] = []
    blank = True
    for ln in lines:
        if ln:
            out.append(ln)
            blank = False
        elif not blank:
            out.append("")
            blank = True
    return "\n".join(out).strip()


def html_to_structured_text(html: Any) -> str:
    """Convert HTML to plain text, preserving paragraph breaks and bullet points."""
    if not html:
        return ""
    if not isinstance(html, str):
        html = str(html)
    # ATS payloads (e.g. Greenhouse `content`) deliver HTML-escaped markup, and
    # some sources escape it more than once ("&amp;lt;"). Decode until stable so
    # no entity or tag text ever leaks into the rendered description.
    for _ in range(4):
        decoded = html_lib.unescape(html)
        if decoded == html:
            break
        html = decoded
    if not _HTML_TAG_RE.search(html):
        return normalize_whitespace(html)
    try:
        soup = BeautifulSoup(html, "html.parser")
    except Exception:
        return normalize_whitespace(re.sub(r"<[^>]+>", " ", html))
    for tag in soup(_NON_CONTENT_TAGS):
        tag.decompose()
    for br in soup.find_all("br"):
        br.replace_with("\n")
    for li in soup.find_all("li"):
        li.insert_before("\n• ")
        li.append("\n")
    for tag in soup.find_all(_BLOCK_TAGS):
        tag.append("\n")
    return normalize_whitespace(soup.get_text("\n"))

RECRUITING_PREFIXES = [
    "careers", "jobs", "recruiting", "recruitment", "talent", "hiring",
    "people", "apply", "join", "work", "hr", "employment"
]

GENERAL_PREFIXES = [
    "contact", "hello", "hi", "info", "team", "inquiries", "reach", "office"
]

IGNORE_EMAIL_KEYWORDS = [
    "noreply", "no-reply", "donotreply", "privacy", "legal", "dpo", "gdpr",
    "security", "abuse", "sentry", "wixpress", "example.com", "yourdomain.com",
    "email.com", "domain.com", "github.com", "cloudflare", "test@"
]


class CareerPageExtractor:
    def __init__(self, base_company_url: str):
        self.base_url = base_company_url
        self.domain = urlparse(base_company_url).netloc.replace("www.", "")
        self.company_name = self._guess_company_name()
        self.company_career_emails: List[str] = []

    def _guess_company_name(self) -> str:
        domain_parts = self.domain.split(".")
        if len(domain_parts) >= 2:
            return domain_parts[0].capitalize()
        return self.domain.capitalize()

    def extract_emails_from_text(self, text: str) -> List[str]:
        """Find and rank all valid, non-blacklisted emails in text or HTML."""
        if not text:
            return []
        
        raw_matches = EMAIL_REGEX.findall(text)
        cleaned_emails: Set[str] = set()

        for em in raw_matches:
            em_clean = em.strip(".,;:()<>[]\"'").lower()
            if any(ign in em_clean for ign in IGNORE_EMAIL_KEYWORDS):
                continue
            if "@" in em_clean and "." in em_clean.split("@")[1]:
                # Validate length and basic structure
                if len(em_clean) > 5 and len(em_clean.split("@")[0]) >= 2:
                    cleaned_emails.add(em_clean)

        # Rank emails: Recruiting first, then general contact, then domain-matched
        def email_score(email: str) -> int:
            user, domain = email.split("@", 1)
            score = 0
            if any(p == user or user.startswith(p) for p in RECRUITING_PREFIXES):
                score += 100
            elif any(p == user or user.startswith(p) for p in GENERAL_PREFIXES):
                score += 50
            if self.domain and (domain == self.domain or self.domain in domain):
                score += 30
            return score

        return sorted(list(cleaned_emails), key=email_score, reverse=True)

    def extract_from_html(self, html_content: str, current_page_url: str) -> List[JobListing]:
        """Extract jobs from HTML using JSON-LD, Embedded State, DOM elements, and email resolution."""
        jobs: List[JobListing] = []
        soup = BeautifulSoup(html_content, "html.parser")

        # 1. Update company name
        page_title = soup.find("title")
        if page_title and page_title.text:
            text = page_title.text.strip()
            match = re.search(r"(?:Careers\s+(?:at|@)\s+|Jobs\s+(?:at|@)\s+|Join\s+)([A-Za-z0-9\.\s]+)", text, re.I)
            if match:
                self.company_name = match.group(1).strip()

        # 2. Extract company-wide contact/career emails from footer, mailto links, and body
        page_emails = self.extract_emails_from_text(soup.text)
        mailto_tags = soup.select("a[href^='mailto:']")
        for tag in mailto_tags:
            href = tag.get("href", "")
            raw_email = unquote(href.replace("mailto:", "").split("?")[0])
            for em in self.extract_emails_from_text(raw_email):
                if em not in page_emails:
                    page_emails.insert(0, em)

        self.company_career_emails = page_emails
        primary_company_email = page_emails[0] if page_emails else None

        # 3. Strategy 1: JSON-LD Schema.org JobPosting
        json_ld_jobs = self._extract_json_ld(soup, current_page_url, primary_company_email)
        json_ld_jobs = [j for j in json_ld_jobs if not is_placeholder_title(j.title)]
        if json_ld_jobs:
            jobs.extend(json_ld_jobs)

        # 4. Strategy 2: Embedded Next.js / Nuxt / React state
        embedded_state_jobs = self._extract_embedded_state(soup, current_page_url, primary_company_email)
        if embedded_state_jobs:
            jobs.extend(embedded_state_jobs)

        # 4b. Strategy 2b: job arrays serialized inside framework payloads
        #     (Deel embeds its whole board as a `"jobs": [...]` array).
        embedded_list_jobs = self._extract_embedded_job_arrays(soup, current_page_url, primary_company_email)
        if embedded_list_jobs:
            jobs.extend(embedded_list_jobs)

        # 5. Strategy 3: Structural Job Cards & DOM elements
        if not jobs:
            dom_jobs = self._extract_dom_job_cards(soup, current_page_url, primary_company_email)
            if dom_jobs:
                jobs.extend(dom_jobs)

        # Ensure all extracted jobs have contact emails attached
        for j in jobs:
            if not j.contact_email and primary_company_email:
                j.contact_email = primary_company_email
                j.hiring_team_emails = self.company_career_emails[:3]

        # Deduplicate
        unique_jobs: Dict[str, JobListing] = {}
        for job in jobs:
            if job.job_url not in unique_jobs:
                unique_jobs[job.job_url] = job

        return list(unique_jobs.values())

    def extract_from_markdown(self, md_content: str, current_page_url: str) -> List[JobListing]:
        """Extract jobs and contact emails from Markdown (Agent Reach / Jina reader output)."""
        jobs: List[JobListing] = []
        page_emails = self.extract_emails_from_text(md_content)
        self.company_career_emails = page_emails
        primary_company_email = page_emails[0] if page_emails else None

        pattern = r"\[([^\]]+)\]\((https?://[^\)\s]+|/[^\)\s]+)\)"
        matches = re.findall(pattern, md_content)

        for title, link in matches:
            title_clean = title.strip()
            link_clean = urljoin(current_page_url, link.strip())

            title_lower = title_clean.lower()
            if _same_page(link_clean, current_page_url):
                continue
            if any(skip in title_lower for skip in [
                "privacy policy", "terms of", "cookie", "copyright", "home", "about us",
                "apply now", "view job", "read more", "sign in", "login", "contact",
                "blog", "press", "twitter", "linkedin", "facebook", "instagram", "youtube", "github"
            ]):
                continue
            if not is_plausible_job_title(title_clean):
                continue

            is_job_link = any(kw in link_clean.lower() for kw in ["/job", "/career", "/position", "/opening", "/role", "/vacancy", "gh_jid", "jobid"])
            is_job_title = any(kw in title_lower for kw in [
                "engineer", "developer", "manager", "designer", "lead", "director", "specialist",
                "analyst", "scientist", "head of", "intern", "associate", "consultant", "architect",
                "recruiter", "coordinator", "officer", "executive", "product", "sales", "marketing"
            ])

            if (is_job_link or is_job_title) and 3 < len(title_clean) < 100:
                workplace_type = "Unspecified"
                if "remote" in title_lower:
                    workplace_type = "Remote"
                elif "hybrid" in title_lower:
                    workplace_type = "Hybrid"

                jobs.append(JobListing(
                    title=title_clean,
                    company=self.company_name,
                    company_url=self.base_url,
                    career_page_url=current_page_url,
                    job_url=link_clean,
                    department="General",
                    location="Not specified",
                    workplace_type=workplace_type,
                    employment_type="Full-time",
                    contact_email=primary_company_email,
                    hiring_team_emails=page_emails[:3],
                    description="",
                    apply_url=link_clean,
                    raw_metadata={"source": "agent_reach_markdown"}
                ))

        unique: Dict[str, JobListing] = {}
        for j in jobs:
            if j.job_url not in unique and j.title not in [x.title for x in unique.values()]:
                unique[j.job_url] = j

        return list(unique.values())

    def _extract_json_ld(self, soup: BeautifulSoup, current_page_url: str, fallback_email: Optional[str]) -> List[JobListing]:
        jobs: List[JobListing] = []
        scripts = soup.find_all("script", type="application/ld+json")
        for script in scripts:
            try:
                if not script.string:
                    continue
                data = json.loads(script.string)
                items = data if isinstance(data, list) else [data]
                for item in items:
                    if isinstance(item, dict):
                        if item.get("@type") == "JobPosting":
                            job = self._parse_schema_job(item, current_page_url, fallback_email)
                            if job:
                                jobs.append(job)
                        elif item.get("@type") == "ItemList" and "itemListElement" in item:
                            for elem in item["itemListElement"]:
                                if isinstance(elem, dict) and elem.get("@type") == "JobPosting":
                                    job = self._parse_schema_job(elem, current_page_url, fallback_email)
                                    if job:
                                        jobs.append(job)
                                elif isinstance(elem, dict) and "item" in elem and isinstance(elem["item"], dict):
                                    if elem["item"].get("@type") == "JobPosting":
                                        job = self._parse_schema_job(elem["item"], current_page_url, fallback_email)
                                        if job:
                                            jobs.append(job)
            except Exception:
                continue
        return jobs

    def _parse_schema_job(self, data: Dict[str, Any], current_page_url: str, fallback_email: Optional[str]) -> Optional[JobListing]:
        title = data.get("title")
        if not title or is_placeholder_title(title):
            return None

        location = "Not specified"
        workplace_type = "Unspecified"

        if data.get("jobLocationType") == "TELECOMMUTE":
            workplace_type = "Remote"
            location = "Remote"

        job_loc = data.get("jobLocation")
        if isinstance(job_loc, dict):
            address = job_loc.get("address", {})
            if isinstance(address, dict):
                loc_parts = [
                    address.get("addressLocality"),
                    address.get("addressRegion"),
                    address.get("addressCountry")
                ]
                loc_str = ", ".join([p for p in loc_parts if p])
                if loc_str:
                    location = loc_str
            elif isinstance(address, str):
                location = address
        elif isinstance(job_loc, list) and job_loc:
            location = str(job_loc[0])

        if "remote" in title.lower() or "remote" in location.lower():
            workplace_type = "Remote"
        elif "hybrid" in title.lower() or "hybrid" in location.lower():
            workplace_type = "Hybrid"
        elif workplace_type == "Unspecified" and location != "Not specified":
            workplace_type = "On-site"

        salary = None
        base_salary = data.get("baseSalary")
        if isinstance(base_salary, dict):
            value = base_salary.get("value", {})
            currency = base_salary.get("currency", "USD")
            if isinstance(value, dict):
                min_val = value.get("minValue")
                max_val = value.get("maxValue")
                unit = value.get("unitText", "YEAR")
                if min_val and max_val:
                    salary = f"{currency} {min_val:,.0f} - {max_val:,.0f} / {unit}"
                elif min_val:
                    salary = f"{currency} {min_val:,.0f}+ / {unit}"
            elif isinstance(value, (int, float, str)):
                salary = f"{currency} {value}"

        job_url = data.get("url") or current_page_url
        if not job_url.startswith("http"):
            job_url = urljoin(current_page_url, job_url)

        hiring_org = data.get("hiringOrganization", {})
        comp_name = self.company_name
        org_email = None
        if isinstance(hiring_org, dict):
            if hiring_org.get("name"):
                comp_name = hiring_org.get("name")
            if hiring_org.get("email"):
                org_email = hiring_org.get("email")

        # Extract emails from job description if present
        desc = html_to_structured_text(data.get("description", ""))
        job_emails = self.extract_emails_from_text(desc)
        chosen_email = org_email or (job_emails[0] if job_emails else fallback_email)

        department = data.get("occupationalCategory") or data.get("department") or "General"

        return JobListing(
            title=title.strip(),
            company=comp_name.strip(),
            company_url=self.base_url,
            career_page_url=current_page_url,
            job_url=job_url,
            department=str(department),
            location=location,
            workplace_type=workplace_type,
            employment_type=data.get("employmentType", "Full-time"),
            salary_range=salary,
            contact_email=chosen_email,
            hiring_team_emails=job_emails or ([chosen_email] if chosen_email else []),
            description=desc,
            apply_url=data.get("url") or job_url,
            posted_date=data.get("datePosted"),
            raw_metadata=data
        )

    def _extract_embedded_state(self, soup: BeautifulSoup, current_page_url: str, fallback_email: Optional[str]) -> List[JobListing]:
        jobs: List[JobListing] = []
        next_data_tag = soup.find("script", id="__NEXT_DATA__")
        if next_data_tag and next_data_tag.string:
            try:
                next_json = json.loads(next_data_tag.string)
                self._find_jobs_in_nested_dict(next_json, jobs, current_page_url, fallback_email)
            except Exception:
                pass
        return jobs

    @staticmethod
    def _match_bracket(text: str, start: int) -> Optional[int]:
        """Index of the `]` closing the `[` at `start` (string-aware)."""
        depth = 0
        in_str = False
        esc = False
        for i in range(start, len(text)):
            ch = text[i]
            if in_str:
                if esc:
                    esc = False
                elif ch == "\\":
                    esc = True
                elif ch == '"':
                    in_str = False
                continue
            if ch == '"':
                in_str = True
            elif ch in "[{":
                depth += 1
            elif ch in "]}":
                depth -= 1
                if depth == 0:
                    return i
        return None

    def _extract_embedded_job_arrays(
        self, soup: BeautifulSoup, current_page_url: str, fallback_email: Optional[str]
    ) -> List[JobListing]:
        """Read a whole job board out of a framework payload.

        Some career pages ship the full listing as a serialized `"jobs": [...]`
        array inside their JS payload (Deel, and similar Strapi/Next sites).
        Those entries carry the employer's exact title/location/department, so
        they are far more trustworthy than scraping whatever the DOM shows.
        """
        jobs: List[JobListing] = []
        marker_re = re.compile(r'\\?"jobs\\?"\s*:\s*\[')

        for script in soup.find_all("script"):
            blob = script.string or script.get_text() or ""
            if len(blob) < 40 or '"jobs"' not in blob.replace('\\"', '"'):
                continue
            # Framework payloads escape their quotes; normalize before parsing.
            norm = blob.replace('\\"', '"')
            for match in marker_re.finditer(norm):
                start = match.end() - 1
                end = self._match_bracket(norm, start)
                if end is None or end - start < 4:
                    continue
                try:
                    data = json.loads(norm[start:end + 1])
                except Exception:
                    continue
                if not isinstance(data, list):
                    continue
                for item in data:
                    job = self._job_from_payload_item(item, current_page_url, fallback_email)
                    if job:
                        jobs.append(job)
        return jobs

    def _job_from_payload_item(
        self, item: Any, current_page_url: str, fallback_email: Optional[str]
    ) -> Optional[JobListing]:
        if not isinstance(item, dict):
            return None
        # Some payloads nest the record under `attributes`.
        if isinstance(item.get("attributes"), dict) and "title" not in item:
            item = {**item["attributes"], **{k: v for k, v in item.items() if k != "attributes"}}
        if item.get("is_listed") is False:
            return None

        title = next(
            (str(item[k]) for k in ("title", "jobTitle", "job_title", "name", "position")
             if isinstance(item.get(k), str) and item[k].strip()),
            "",
        ).strip()
        if not is_plausible_job_title(title):
            return None

        raw_url = next(
            (item.get(k) for k in ("external_link", "url", "jobUrl", "job_url", "link", "applyUrl", "slug")
             if isinstance(item.get(k), str) and item[k].strip()),
            "",
        )
        if not raw_url:
            return None
        job_url = urljoin(current_page_url, raw_url)
        # A trailing "/application" variant is the same posting; keep the
        # canonical detail URL so re-crawls update rows instead of duplicating.
        if job_url.endswith("/application"):
            job_url = job_url[: -len("/application")]

        location = item.get("location_name") or item.get("location") or item.get("city") or "Not specified"
        if isinstance(location, list):
            location = ", ".join(
                [str(x.get("location") if isinstance(x, dict) else x) for x in location if x]
            ) or "Not specified"
        all_locations = item.get("all_locations")
        if isinstance(all_locations, list) and all_locations:
            location = ", ".join([str(x) for x in all_locations if x]) or location

        department = (
            item.get("department_name") or item.get("department") or item.get("team_name")
            or item.get("team") or item.get("category") or "General"
        )
        if isinstance(department, dict):
            department = department.get("name") or "General"

        workplace_type = "Unspecified"
        haystack = f"{title} {location}".lower()
        if "remote" in haystack or item.get("isRemote") or item.get("remote"):
            workplace_type = "Remote"
        elif "hybrid" in haystack:
            workplace_type = "Hybrid"
        elif location and str(location).lower() not in {"not specified", "", "anywhere"}:
            workplace_type = "On-site"

        desc_raw = (
            item.get("full_job_description") or item.get("descriptionHtml")
            or item.get("description") or item.get("summary") or ""
        )
        description = html_to_structured_text(desc_raw) if desc_raw else ""
        emails = self.extract_emails_from_text(description) if description else []
        contact_email = emails[0] if emails else fallback_email

        posted = (
            item.get("ashby_published_date") or item.get("published_at")
            or item.get("posted_on") or item.get("datePosted") or item.get("createdAt")
        )

        return JobListing(
            title=title,
            company=self.company_name,
            company_url=self.base_url,
            career_page_url=current_page_url,
            job_url=job_url,
            department=str(department),
            location=str(location) or "Not specified",
            workplace_type=workplace_type,
            employment_type=str(item.get("employment_type") or item.get("employmentType") or "Full-time"),
            salary_range=(item.get("compensation_tier_summary") or None),
            description=description,
            contact_email=contact_email,
            hiring_team_emails=emails[:3] or ([contact_email] if contact_email else []),
            apply_url=job_url,
            posted_date=posted,
            raw_metadata={"source": "embedded_job_list"},
        )

    def _find_jobs_in_nested_dict(self, data: Any, accumulator: List[JobListing], current_page_url: str, fallback_email: Optional[str]):
        if isinstance(data, dict):
            title_keys = ["title", "jobTitle", "roleTitle", "positionTitle", "job_title", "name"]
            has_title = any(k in data and isinstance(data[k], str) and len(data[k]) > 3 for k in title_keys)
            url_keys = ["url", "jobUrl", "link", "slug", "applyUrl", "id", "job_id"]
            has_url_or_id = any(k in data for k in url_keys)

            is_job_object = (
                has_title and has_url_or_id and
                any(k in data for k in ["department", "location", "team", "req_id", "requisitionId", "categories", "workplaceType"])
            )

            if is_job_object:
                title = next(data[k] for k in title_keys if k in data and isinstance(data[k], str))
                if not any(excluded in title.lower() for excluded in ["privacy policy", "terms of", "cookie", "copyright"]):
                    location = data.get("location") or data.get("city") or data.get("workplace") or "Not specified"
                    if isinstance(location, dict):
                        location = location.get("name") or location.get("city") or "Not specified"
                    elif isinstance(location, list):
                        location = ", ".join([str(l) for l in location if l])

                    dept = data.get("department") or data.get("team") or data.get("category") or "General"
                    if isinstance(dept, dict):
                        dept = dept.get("name") or "General"

                    job_link = data.get("url") or data.get("link") or data.get("applyUrl") or ""
                    if not job_link and ("slug" in data or "id" in data):
                        slug = data.get("slug") or str(data.get("id"))
                        job_link = urljoin(current_page_url, f"/jobs/{slug}")
                    elif job_link:
                        job_link = urljoin(current_page_url, job_link)
                    else:
                        job_link = current_page_url

                    workplace_type = "Unspecified"
                    loc_lower = f"{title} {location}".lower()
                    if "remote" in loc_lower:
                        workplace_type = "Remote"
                    elif "hybrid" in loc_lower:
                        workplace_type = "Hybrid"
                    elif location != "Not specified":
                        workplace_type = "On-site"

                    contact_email = data.get("contactEmail") or data.get("email") or fallback_email

                    accumulator.append(JobListing(
                        title=title.strip(),
                        company=self.company_name,
                        company_url=self.base_url,
                        career_page_url=current_page_url,
                        job_url=job_link,
                        department=str(dept),
                        location=str(location),
                        workplace_type=workplace_type,
                        employment_type=str(data.get("type") or data.get("employmentType") or "Full-time"),
                        salary_range=str(data.get("salary") or data.get("compensation") or "") or None,
                        contact_email=contact_email,
                        hiring_team_emails=[contact_email] if contact_email else [],
                        description=str(data.get("description") or ""),
                        raw_metadata={"source": "embedded_state"}
                    ))
                    return

            for key, val in data.items():
                self._find_jobs_in_nested_dict(val, accumulator, current_page_url, fallback_email)

        elif isinstance(data, list):
            for item in data:
                self._find_jobs_in_nested_dict(item, accumulator, current_page_url, fallback_email)

    def _extract_dom_job_cards(self, soup: BeautifulSoup, current_page_url: str, fallback_email: Optional[str]) -> List[JobListing]:
        jobs: List[JobListing] = []
        job_elements = soup.select(
            "a[href*='/job'], a[href*='/careers/'], a[href*='/position'], a[href*='/opening'], a[href*='/role'], a[href*='gh_jid'], "
            "[class*='job-item'], [class*='jobItem'], [class*='job-card'], [class*='jobCard'], [class*='job-listing'], "
            "[class*='career-item'], [class*='position-card'], [class*='open-role'], li[data-job-id]"
        )

        for el in job_elements:
            try:
                link_tag = el if el.name == "a" else el.find("a")
                if not link_tag or not link_tag.get("href"):
                    continue

                href = link_tag.get("href")
                job_url = urljoin(current_page_url, href)
                href_l = href.lower()

                if any(skip in href_l for skip in ["javascript:", "mailto:", "/login", "/press"]):
                    continue
                if href_l.startswith("#") or href_l.rstrip("/") in {"", "#"}:
                    continue
                # A link back to the listing page itself is page furniture, not a
                # posting (Zapier's "Jobs" anchor, CrowdStrike's "Careers" anchor).
                if _same_page(job_url, current_page_url):
                    continue
                # Language switchers and site sections are not postings.
                if re.search(r"/(?:[a-z]{2}(?:-[a-z]{2})?)/(?:careers|jobs)/?$", href_l):
                    continue

                # Page chrome (nav / footer / locale menus) never holds jobs.
                if _in_page_chrome(link_tag) or _in_page_chrome(el):
                    continue

                title = self._best_title(el, link_tag)
                if not title or not is_plausible_job_title(title):
                    continue

                # An element that embeds several other posting links is the whole
                # list, not one role; its children are harvested separately.
                if _count_posting_links(el) >= 3:
                    continue

                # A link only counts as a posting when it is unmistakably one:
                # a per-role URL, a job-list container, or a title that reads
                # like a real role. This is what stops "code of conduct", "Careers"
                # or "English (AU)" from entering the job list.
                looks_like_url = bool(_STRONG_JOB_URL_RE.search(href_l))
                in_job_list = _is_job_container(el) or _is_job_container(link_tag)
                title_suggests_job = bool(_JOB_TITLE_KEYWORD_RE.search(title))
                if not (looks_like_url or in_job_list or title_suggests_job):
                    continue

                # Sitting inside a job-list container (or reading like a department)
                # is not enough when the URL carries no posting id: that is how
                # filter links ("Sales", "Tokyo") slipped in as postings.
                if not looks_like_url and _is_careers_section_link(job_url, title):
                    continue

                full_text = el.text.strip()
                card_emails = self.extract_emails_from_text(full_text)
                contact_email = card_emails[0] if card_emails else fallback_email

                lines = [l.strip() for l in full_text.split("\n") if l.strip() and l.strip() != title]
                location = "Not specified"
                department = "General"

                for line in lines:
                    line_lower = line.lower()
                    if any(w in line_lower for w in ["remote", "hybrid", "on-site", "san francisco", "new york", "london", "berlin", "tokyo", "singapore", "toronto", "austin", "seattle", "us", "uk", "remote - "]):
                        location = line
                    elif any(d in line_lower for d in ["engineering", "product", "design", "marketing", "sales", "operations", "finance", "legal", "hr", "people", "customer"]):
                        department = line

                workplace_type = "Unspecified"
                full_lower = full_text.lower()
                if "remote" in full_lower:
                    workplace_type = "Remote"
                elif "hybrid" in full_lower:
                    workplace_type = "Hybrid"
                elif location != "Not specified":
                    workplace_type = "On-site"

                jobs.append(JobListing(
                    title=title,
                    company=self.company_name,
                    company_url=self.base_url,
                    career_page_url=current_page_url,
                    job_url=job_url,
                    department=department,
                    location=location,
                    workplace_type=workplace_type,
                    employment_type="Full-time",
                    contact_email=contact_email,
                    hiring_team_emails=card_emails or ([contact_email] if contact_email else []),
                    description=html_to_structured_text(str(el)) or full_text,
                    apply_url=job_url,
                    raw_metadata={"source": "dom_element"}
                ))
            except Exception:
                continue

        return jobs

    @staticmethod
    def _best_title(el, link_tag) -> str:
        """Pull the posting's title out of a card, preferring role-specific nodes."""
        selectors = [
            "[class*='jobTitle']", "[class*='job-title']", "[class*='positionTitle']",
            "[class*='position-title']", "[class*='roleTitle']", "[class*='role-title']",
            "[class*='title']", "h2", "h3", "h4", "h5", "strong",
        ]
        candidates = []
        for selector in selectors:
            try:
                nodes = el.select(selector)
            except Exception:
                nodes = []
            for node in nodes:
                text = node.get_text(" ", strip=True)
                if text:
                    candidates.append(text)
        # The link text is the title whenever the matched element is the anchor
        # itself (a bare `<a href=...>Role Title</a>`), so it must always be a
        # candidate - gating it on `link_tag is not el` dropped every such posting.
        text = link_tag.get_text(" ", strip=True)
        if text:
            candidates.append(text)

        seen = set()
        for text in candidates:
            if text in seen:
                continue
            seen.add(text)
            if 3 < len(text) < 110 and is_plausible_job_title(text):
                return text
        return ""
