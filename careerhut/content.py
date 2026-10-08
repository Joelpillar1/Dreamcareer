"""
Careerhut Content Helpers - preserve job text exactly as written, resolve logos,
and pull structured detail from an individual job page.

Descriptions are kept in the employer's own wording and paragraph structure
(blank-line separated blocks, bullet lines prefixed with "•") instead of being
flattened into one run-on blob.
"""

import re
from urllib.parse import urljoin, urlparse, unquote
from typing import List, Dict, Any, Optional
from bs4 import BeautifulSoup

from .extractor import CareerPageExtractor, html_to_structured_text, _NON_CONTENT_TAGS


# ---------------------------------------------------------------------------
# Company logo
# ---------------------------------------------------------------------------

_LOGO_CLASS_RE = re.compile(r"logo|brand|wordmark|site-icon", re.I)

# Images that are badges / banners rather than the company's own mark, e.g. a
# Y Combinator badge or a generic OpenGraph social card.
_SUSPECT_LOGO_RE = re.compile(
    r"y[-_]?combinator|yc[-_]?logo|/yc/|accelerator|backed[-_]?by|partner[-_]?logo|badge|"
    r"opengraph|og[-_]?image|og_|/og/|social[-_]?card|share[-_]?(image|card)|"
    r"preview|hero[-_]?image|banner|cover[-_]?image",
    re.I,
)


def _is_suspect_logo(url: Optional[str]) -> bool:
    return bool(url and _SUSPECT_LOGO_RE.search(url))


def extract_logo_url(html: Any, page_url: str) -> Optional[str]:
    """Best-effort square-ish company logo from a career page."""
    if not html or not isinstance(html, str):
        return None
    try:
        soup = BeautifulSoup(html, "html.parser")
    except Exception:
        return None

    # The employer's own domain label, used to recognise third-party badges: an
    # asset whose name says "logo" but does not name the company is very likely
    # an investor/partner mark (Brex's page serves "YC-logo", then "IVP_Logo").
    host = page_url.split("://", 1)[-1].split("/", 1)[0].split(":")[0].lower().replace("www.", "")
    for prefix in ("careers.", "jobs.", "about.", "apply.", "boards.", "job-boards."):
        if host.startswith(prefix):
            host = host[len(prefix):]
    slug = host.split(".")[0] if host else ""

    def acceptable(candidate: Optional[str]) -> Optional[str]:
        """Return the absolute URL unless it looks like a badge/banner asset."""
        if not candidate:
            return None
        absolute = urljoin(page_url, candidate)
        if _is_suspect_logo(absolute):
            return None
        # Inspect individual path segments (and any nested ?url= target), not the
        # whole URL: an asset named "...logo..." that does not name this company
        # is almost certainly an investor/partner badge.
        decoded = unquote(absolute).lower()
        for segment in re.split(r"[/?&=]", decoded):
            if ("logo" in segment or "-mark" in segment) and slug and slug not in segment:
                return None
        return absolute

    # 1. apple-touch-icon is usually a clean square logo.
    for rel in ("apple-touch-icon", "apple-touch-icon-precomposed", "icon", "shortcut icon"):
        link = soup.find("link", rel=lambda v, r=rel: v and r in " ".join(v).lower())
        if link and link.get("href"):
            found = acceptable(link["href"])
            if found:
                return found

    # 2. An <img> whose class/id/alt mentions logo/brand.
    for img in soup.find_all("img"):
        marker = " ".join(filter(None, [img.get("class") and " ".join(img.get("class")), img.get("id"), img.get("alt")]))
        src = img.get("src") or img.get("data-src")
        if src and marker and _LOGO_CLASS_RE.search(marker):
            found = acceptable(src)
            if found:
                return found

    # 3. Open Graph / Twitter image as a last resort, subject to the filters
    # above (social cards and investor badges are rejected).
    for prop in ("og:image", "twitter:image"):
        meta = soup.find("meta", attrs={"property": prop}) or soup.find("meta", attrs={"name": prop})
        if meta and meta.get("content"):
            found = acceptable(meta["content"])
            if found:
                return found

    return None


def derive_application_email(url: str) -> Optional[str]:
    """Derive a plausible recruiting inbox from the employer's real domain.

    Used only when the company publishes no contact address anywhere. Unlike the
    UI's slug guess, this uses the actual domain, so it is far less likely wrong.
    """
    if not url:
        return None
    try:
        host = url.split("://", 1)[-1].split("/", 1)[0].split(":")[0].lower()
    except Exception:
        return None
    host = host.replace("www.", "")
    for prefix in ("careers.", "jobs.", "about.", "boards.", "apply.", "job-boards.", "career."):
        if host.startswith(prefix):
            host = host[len(prefix):]
    if not host or "." not in host:
        return None
    return f"careers@{host}"


def fallback_logo_url(domain_or_url: str) -> Optional[str]:
    """Reliable low-resolution fallback (site favicon) when no logo is found."""
    if not domain_or_url:
        return None
    try:
        host = domain_or_url.split("://", 1)[-1].split("/", 1)[0].split(":")[0]
    except Exception:
        return None
    host = host.replace("www.", "")
    if not host or "." not in host:
        return None
    return f"https://www.google.com/s2/favicons?domain={host}&sz=128"


# ---------------------------------------------------------------------------
# Individual job page detail
# ---------------------------------------------------------------------------

_DESCRIPTION_SELECTORS = [
    "[class*='job-description']", "[class*='jobDescription']", "[id*='job-description']",
    "[class*='job-details']", "[class*='jobDetails']", "[class*='job-detail']",
    "[class*='posting']", "[class*='description']", "[class*='content']",
    "main", "article", "section",
]

# Priority tiers: the most job-specific container wins, so a whole-page node
# (nav lists, footers, 'similar jobs', apply widgets) is never mistaken for the
# description just because it is longer.
_PRIMARY_SELECTORS = [
    "[class*='job-description']", "[class*='jobDescription']", "[id*='job-description']",
    "[id*='jobDescription']", "[class*='job-details']", "[class*='jobDetails']",
    "[class*='job-detail']", "[data-testid*='description']", "[class*='posting-content']",
    "[class*='jobPosting']", "[class*='jd-']", "[class*='description-block']",
]
_SECONDARY_SELECTORS = [
    "[class*='posting']", "[class*='description']", "article",
]
_TERTIARY_SELECTORS = ["[class*='content']", "main", "section"]

# Sections that wrap *other* roles or page furniture rather than this JD.
_CHROME_CONTAINER_RE = re.compile(
    r"similar[- _]?(jobs|roles|openings|positions)|other[- _]?(jobs|roles|openings)|"
    r"related[- _]?(jobs|roles|openings)|recommended[- _]?(jobs|roles)|"
    r"job[- _]?(list|grid|board)|more[- _]?(jobs|roles|openings)|"
    r"share[- _]?(job|this)|breadcrumb|apply[- _]?(now|button|cta|widget|modal)|"
    r"newsletter|cookie[- _]?banner|social[- _]?share|sidebar|footer|navigation|"
    r"other[- _]?positions|open[- _]?(roles|positions)@",
    re.I,
)

# Sentences that mark the end of the JD and the start of page chrome.
_TRAILING_CHROME_RE = re.compile(
    r"^\s*(similar (jobs|roles|openings|positions)|other (jobs|openings|roles|positions)|"
    r"recommended (jobs|roles)|more (jobs|openings|roles)|related (jobs|roles)|"
    r"share this job|apply now|apply for this job|back to (all )?jobs|"
    r"next (job|role|opening)|previous (job|role|opening)|\d+ (other|more) (jobs|openings))\s*[.!]*\s*$",
    re.I,
)

_APPLY_TEXT_RE = re.compile(r"^\s*(apply( now)?|apply for this job|submit application)\s*$", re.I)


def _is_markdown_payload(text: str) -> bool:
    if not text or not isinstance(text, str):
        return False
    if "Markdown Content:" in text or text.startswith("Source: https://r.jina.ai/") or text.startswith("Title:"):
        return True
    if not re.search(r"<(html|body|div|p|span|header|section)[^>]*>", text, re.I):
        return True
    return False


def _extract_markdown_job_detail(md: str, page_url: str, title: Optional[str] = None) -> Dict[str, Any]:
    """Extract job description, clean title, apply URL, and emails from Agent Reach / Jina Markdown."""
    result: Dict[str, Any] = {"description": "", "emails": [], "apply_url": None, "title": None}
    if not md:
        return result

    extractor = CareerPageExtractor(base_company_url=page_url)
    emails = extractor.extract_emails_from_text(md)
    result["emails"] = emails

    lines = md.split("\n")
    clean_title = None
    apply_url = None

    # 1. Extract clean title from Title: header
    for line in lines[:25]:
        m = re.match(r"^Title:\s*(.+)$", line.strip(), re.I)
        if m:
            raw = m.group(1).strip()
            raw = re.sub(r"\s*(\||\-|\—|\–|\•)\s*(Miro|Shopify|Careers|Jobs|Open Positions|Job Board|Greenhouse|Ashby).*$", "", raw, flags=re.I).strip()
            if len(raw) > 3 and not any(junk in raw.lower() for junk in ["404", "error", "page not found", "open positions", "all jobs", "careers"]):
                clean_title = raw
            break

    # 2. If no title from Title: header, look for first # or ## Heading
    if not clean_title:
        for line in lines[:50]:
            trimmed = line.strip()
            if trimmed.startswith("# ") or trimmed.startswith("## "):
                raw = trimmed.lstrip("#").strip()
                raw = re.sub(r"\s*(\||\-|\—|\–|\•)\s*(Miro|Shopify|Careers|Jobs|Open Positions).*$", "", raw, flags=re.I).strip()
                if len(raw) > 3 and not any(junk in raw.lower() for junk in ["404", "error", "home", "search", "careers", "open positions", "life at", "how we hire", "our story"]):
                    clean_title = raw
                    break

    # 3. Look for apply link in markdown [Apply...](url)
    for line in lines:
        m = re.search(r"\[([^\]]*(?:apply|submit|interested)[^\]]*)\]\((https?://[^\)\s]+|/[^\)\s]+)\)", line, re.I)
        if m:
            apply_url = urljoin(page_url, m.group(2))
            break

    # 4. Extract clean description body
    content_start_idx = 0
    for idx, line in enumerate(lines):
        if "Markdown Content:" in line:
            content_start_idx = idx + 1
            break

    body_lines = lines[content_start_idx:]
    filtered_lines = []
    found_real_heading = False

    for line in body_lines:
        trimmed = line.strip()

        # Skip top navigation list items, breadcrumbs and header tags before real content starts
        if not found_real_heading:
            if re.match(r"^(\*|\-)\s*\[(Our Story|People|How we hire|Teams|Locations|Life at|Home|Open positions|About|Jobs|Engineering team|Design team|Product team)\]", trimmed, re.I):
                continue
            if trimmed.startswith("[](https://") or (trimmed.startswith("![Image") and any(w in trimmed.lower() for w in ["header", "logo", "banner"])):
                continue
            if re.match(r"^(#+|###|##|\*\*|#)?\s*(About the role|About this role|About the job|The role|Role overview|Position overview|Why you’ll love|Why you'll love|About [A-Z][a-zA-Z0-9_\s]+|Who you are|What you'll do|Responsibilities|Requirements|Qualifications|Key Duties|Designers at Shopify)", trimmed, re.I):
                found_real_heading = True
            elif len(trimmed) > 50 and not re.match(r"^(\[.*\]\(.*\)|\(https?://.*|\b(Apply Now|Remote|Americas|Design|Engineering|Back)\b)", trimmed, re.I):
                found_real_heading = True

        if not found_real_heading:
            continue

        # Stop ONLY at true footer / early career / legal chrome (do NOT stop on About Shopify or About Miro!)
        if re.match(r"^(##|###|\*\*|#)?\s*(Work with us in your early career|Dev Degree Program|Internship Program|APM Program|Design Apprentice Program|Prepare yourself to go beyond|How we hire|Similar jobs|Other positions|Related jobs|Subscribe|Share this job|Even more ways to work|Terms of Service|Privacy Policy|\[Learn more about our Dev Degree|\[Learn more about our Internship)", trimmed, re.I):
            break

        # Handle inline run-on lists like 'consider if you can:Care deeply...'
        if ":Care deeply" in line:
            line = line.replace(":Care deeply", ":\n• Care deeply")

        filtered_lines.append(line)

    description = "\n".join(filtered_lines).strip()
    result["description"] = description
    result["apply_url"] = apply_url
    if clean_title:
        result["title"] = clean_title

    return result


def extract_job_detail(html: Any, page_url: str, title: Optional[str] = None) -> Dict[str, Any]:
    """Extract the full description text, recruiter emails and apply URL from an
    individual job posting page. Falls back gracefully when structure is unknown."""
    result: Dict[str, Any] = {"description": "", "emails": [], "apply_url": None, "title": None}
    if not html or not isinstance(html, str):
        return result

    # Check for Agent Reach / Jina Markdown content first
    if _is_markdown_payload(html):
        return _extract_markdown_job_detail(html, page_url, title)

    try:
        soup = BeautifulSoup(html, "html.parser")
    except Exception:
        return result

    extractor = CareerPageExtractor(base_company_url=page_url)

    # 1. Recruiter / application emails from the full page (incl. footer).
    emails = extractor.extract_emails_from_text(soup.get_text(" "))
    for a in soup.select("a[href^='mailto:']"):
        raw = a.get("href", "").replace("mailto:", "").split("?")[0]
        for em in extractor.extract_emails_from_text(raw):
            if em not in emails:
                emails.insert(0, em)

    # 2. Schema.org JobPosting payload (authoritative; captured before stripping scripts).
    description_html = None
    extracted_title = None
    for script in soup.find_all("script", type="application/ld+json"):
        try:
            import json
            if not script.string:
                continue
            data = json.loads(script.string)
        except Exception:
            continue
        items = data if isinstance(data, list) else [data]
        for item in items:
            if isinstance(item, dict) and item.get("@type") == "JobPosting":
                description_html = item.get("description") or ""
                if item.get("title"):
                    extracted_title = item.get("title")
                if item.get("url"):
                    result["apply_url"] = urljoin(page_url, item["url"])
                org = item.get("hiringOrganization")
                if isinstance(org, dict) and org.get("email"):
                    emails.insert(0, org["email"])
                break
        if description_html:
            break

    # 3. Explicit "Apply" link (before stripping chrome).
    if not result["apply_url"]:
        for a in soup.find_all("a", href=True):
            if _APPLY_TEXT_RE.match(a.get_text(" ", strip=True) or ""):
                result["apply_url"] = urljoin(page_url, a["href"])
                break

    # 4. Strip page chrome so nav/footer text can't masquerade as the description.
    for tag in soup(_NON_CONTENT_TAGS + ["nav", "header", "footer", "aside", "form", "button"]):
        tag.decompose()

    # 4b. Drop containers that hold other roles / page furniture, then take the
    #     most job-specific node that actually contains prose.
    if not description_html:
        for node in list(soup.select("[class], [id], [data-testid]")):
            marker = " ".join(
                filter(None, [
                    " ".join(node.get("class", []) or []),
                    str(node.get("id") or ""),
                    str(node.get("data-testid") or ""),
                ])
            )
            if marker and _CHROME_CONTAINER_RE.search(marker):
                node.decompose()

    # 5. Fall back to the most job-specific description container in the DOM.
    if not description_html:
        description_html = _pick_description_html(soup)

    result["description"] = trim_description(html_to_structured_text(description_html))
    result["emails"] = emails
    if extracted_title:
        result["title"] = extracted_title
    return result


def _pick_description_html(soup: BeautifulSoup) -> str:
    """Best description container: specific beats large."""
    for tier in (_PRIMARY_SELECTORS, _SECONDARY_SELECTORS, _TERTIARY_SELECTORS):
        best_text = ""
        best_html = ""
        for selector in tier:
            try:
                nodes = soup.select(selector)
            except Exception:
                continue
            for node in nodes:
                text = node.get_text(" ", strip=True)
                if len(text) > len(best_text):
                    best_text = text
                    best_html = str(node)
        if len(best_text) >= 300:
            return best_html
    return ""


def trim_description(text: str) -> str:
    """Cut anything after the JD proper (similar-role blocks, apply widgets)."""
    if not text:
        return ""
    lines = text.split("\n")
    for i, line in enumerate(lines):
        if i > 2 and _TRAILING_CHROME_RE.match(line):
            lines = lines[:i]
            break
    return "\n".join(lines).strip()


# ---------------------------------------------------------------------------
# Frontend-ready paragraph model
# ---------------------------------------------------------------------------

def description_to_blocks(description: str) -> List[Dict[str, Any]]:
    """Split a structured description into typed blocks (paragraph | bullets).

    Kept server-side so any client can render identical, well-aligned output.
    """
    if not description:
        return []
    blocks: List[Dict[str, Any]] = []
    current_para: List[str] = []
    current_bullets: List[str] = []

    def flush_para():
        if current_para:
            blocks.append({"type": "paragraph", "text": " ".join(current_para)})
            current_para.clear()

    def flush_bullets():
        if current_bullets:
            blocks.append({"type": "bullets", "items": list(current_bullets)})
            current_bullets.clear()

    for raw_line in description.split("\n"):
        line = raw_line.strip()
        if not line:
            flush_para()
            flush_bullets()
            continue
        if line.startswith("•") or line.startswith("- ") or line.startswith("* "):
            flush_para()
            current_bullets.append(line.lstrip("•-* ").strip())
        else:
            flush_bullets()
            current_para.append(line)

    flush_para()
    flush_bullets()
    return blocks
