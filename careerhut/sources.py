"""
Careerhut Sources - Company career/job page seeds + ATS backend detection.

Only official company career pages are ever used as a source. Many companies
render their career page from a first-party Applicant Tracking System (ATS)
backend (Greenhouse, Lever, Ashby, Workable, Recruitee). Those JSON endpoints
*are* the company's own career page data -- not a third-party job board -- so we
detect and read them directly for speed and completeness, then fall back to
rendering the public career page itself.
"""

import re
from typing import List, Dict, Any, Optional, Tuple

# ---------------------------------------------------------------------------
# Seed companies: (display name, official career/job page URL)
# Users can add their own via a plain-text list (one URL per line) at run time.
# ---------------------------------------------------------------------------
SEED_COMPANIES: List[Dict[str, Any]] = [
    {"name": "Stripe", "url": "https://stripe.com/jobs"},
    {"name": "OpenAI", "url": "https://openai.com/careers"},
    {"name": "Anthropic", "url": "https://www.anthropic.com/careers"},
    {"name": "Figma", "url": "https://www.figma.com/careers"},
    {"name": "Vercel", "url": "https://vercel.com/careers"},
    {"name": "Linear", "url": "https://linear.app/careers"},
    {"name": "Notion", "url": "https://www.notion.so/careers"},
    {"name": "Ramp", "url": "https://ramp.com/careers"},
    {"name": "Retool", "url": "https://retool.com/careers"},
    {"name": "Databricks", "url": "https://www.databricks.com/company/careers"},
    {"name": "Snowflake", "url": "https://www.snowflake.com/en/careers/"},
    {"name": "Datadog", "url": "https://careers.datadoghq.com"},
    {"name": "MongoDB", "url": "https://www.mongodb.com/company/careers/see-jobs"},
    {"name": "Elastic", "url": "https://www.elastic.co/careers"},
    {"name": "Cloudflare", "url": "https://www.cloudflare.com/careers/"},
    {"name": "HashiCorp", "url": "https://www.hashicorp.com/careers"},
    {"name": "GitLab", "url": "https://about.gitlab.com/jobs/all-jobs/"},
    {"name": "Reddit", "url": "https://www.redditinc.com/careers"},
    {"name": "Discord", "url": "https://discord.com/careers"},
    {"name": "Duolingo", "url": "https://careers.duolingo.com"},
    {"name": "Robinhood", "url": "https://careers.robinhood.com"},
    {"name": "Coinbase", "url": "https://www.coinbase.com/careers/positions"},
    {"name": "Plaid", "url": "https://plaid.com/careers/"},
    {"name": "Brex", "url": "https://www.brex.com/careers"},
    {"name": "Mercury", "url": "https://mercury.com/jobs"},
    {"name": "Gusto", "url": "https://gusto.com/about/careers", "ats": ("greenhouse", "gusto")},
    {"name": "Affirm", "url": "https://www.affirm.com/careers"},
    {"name": "Chime", "url": "https://careers.chime.com"},
    {"name": "Instacart", "url": "https://instacart.careers"},
    {"name": "DoorDash", "url": "https://careers.doordash.com"},
    {"name": "Airbnb", "url": "https://careers.airbnb.com"},
    {"name": "Dropbox", "url": "https://jobs.dropbox.com"},
    {"name": "Pinterest", "url": "https://www.pinterestcareers.com/jobs/"},
    {"name": "Snap", "url": "https://careers.snap.com"},
    {"name": "Spotify", "url": "https://www.lifeatspotify.com/jobs"},
    {"name": "Shopify", "url": "https://www.shopify.com/careers"},
    {"name": "Atlassian", "url": "https://www.atlassian.com/company/careers"},
    {"name": "Canva", "url": "https://www.lifeatcanva.com"},
    {"name": "Zoom", "url": "https://careers.zoom.us"},
    {"name": "Twilio", "url": "https://www.twilio.com/en-us/company/jobs"},
    {"name": "HubSpot", "url": "https://www.hubspot.com/careers"},
    {"name": "Asana", "url": "https://asana.com/jobs"},
    {"name": "Airtable", "url": "https://airtable.com/careers"},
    {"name": "Webflow", "url": "https://webflow.com/careers"},
    {"name": "Sentry", "url": "https://sentry.io/careers/"},
    {"name": "Postman", "url": "https://www.postman.com/company/careers/open-positions/"},
    {"name": "Sourcegraph", "url": "https://sourcegraph.com/careers"},
    {"name": "Benchling", "url": "https://www.benchling.com/careers"},
    {"name": "Vanta", "url": "https://www.vanta.com/careers"},
    {"name": "Rippling", "url": "https://www.rippling.com/careers"},
    {"name": "Deel", "url": "https://www.deel.com/careers/"},
    {"name": "Remote", "url": "https://remote.com/openings"},
    {"name": "Grammarly", "url": "https://www.grammarly.com/careers"},
    {"name": "Hugging Face", "url": "https://huggingface.co/careers"},
    {"name": "Scale AI", "url": "https://scale.com/careers"},
    {"name": "Cohere", "url": "https://cohere.com/careers"},
    {"name": "Snyk", "url": "https://snyk.io/careers/"},
    {"name": "JetBrains", "url": "https://www.jetbrains.com/careers/"},
    {"name": "Automattic", "url": "https://automattic.com/work-with-us/"},
    {"name": "Mozilla", "url": "https://www.mozilla.org/en-US/careers/"},
    {"name": "Wikimedia", "url": "https://wikimediafoundation.org/jobs/#section-1"},
    {"name": "Grafana Labs", "url": "https://grafana.com/about/careers/"},
    {"name": "Supabase", "url": "https://supabase.com/careers"},
    {"name": "PlanetScale", "url": "https://planetscale.com/careers"},
    {"name": "Neon", "url": "https://neon.com/careers"},
    {"name": "Render", "url": "https://render.com/careers"},
    {"name": "Fly.io", "url": "https://fly.io/jobs/"},
    {"name": "Temporal", "url": "https://temporal.io/careers"},
    {"name": "Docker", "url": "https://www.docker.com/career-openings/"},
    {"name": "PostHog", "url": "https://posthog.com/careers"},
    {"name": "Mixpanel", "url": "https://mixpanel.com/careers/"},
    {"name": "Amplitude", "url": "https://amplitude.com/careers"},
    {"name": "Segment", "url": "https://segment.com/careers/"},
    {"name": "Intercom", "url": "https://www.intercom.com/careers"},
    {"name": "Zapier", "url": "https://zapier.com/jobs#job-openings"},
    {"name": "Framer", "url": "https://www.framer.com/careers/"},
    {"name": "Miro", "url": "https://miro.com/careers/"},
    {"name": "Calendly", "url": "https://calendly.com/careers"},
    {"name": "Loom", "url": "https://www.loom.com/careers"},
    {"name": "Descript", "url": "https://www.descript.com/careers"},
    {"name": "Cursor (Anysphere)", "url": "https://cursor.com/careers"},
    {"name": "Perplexity", "url": "https://www.perplexity.ai/careers"},
    {"name": "ElevenLabs", "url": "https://elevenlabs.io/careers"},
    {"name": "Runway", "url": "https://runwayml.com/careers/"},
    {"name": "Replicate", "url": "https://replicate.com/about"},
    {"name": "Wiz", "url": "https://www.wiz.io/careers"},
    {"name": "CrowdStrike", "url": "https://crowdstrike.wd5.myworkdayjobs.com/crowdstrikecareers"},
    {"name": "Palantir", "url": "https://www.palantir.com/careers/"},
    {"name": "Docusign", "url": "https://careers.docusign.com"},
    {"name": "Okta", "url": "https://www.okta.com/company/careers/job-listing/"},
    # --- Category 1: Software Engineering & Development ---
    {"name": "Modal", "url": "https://modal.com/careers", "ats": ("ashby", "modal")},
    {"name": "Railway", "url": "https://railway.com/careers", "ats": ("ashby", "railway")},
    {"name": "Together AI", "url": "https://www.together.ai/careers", "ats": ("greenhouse", "togetherai")},
    {"name": "Anyscale", "url": "https://www.anyscale.com/careers", "ats": ("ashby", "anyscale")},
    {"name": "Baseten", "url": "https://www.baseten.co/careers", "ats": ("ashby", "baseten")},
    {"name": "CoreWeave", "url": "https://www.coreweave.com/careers", "ats": ("greenhouse", "coreweave")},
    {"name": "Neo4j", "url": "https://neo4j.com/careers", "ats": ("greenhouse", "neo4j")},
    {"name": "n8n", "url": "https://n8n.io/careers", "ats": ("ashby", "n8n")},
    {"name": "ClickUp", "url": "https://clickup.com/careers", "ats": ("ashby", "clickup")},
    # --- Category 2: Product, UI/UX & Design ---
    {"name": "tldraw", "url": "https://tldraw.com/careers", "ats": ("ashby", "tldraw")},
    {"name": "Atlan", "url": "https://atlan.com/careers", "ats": ("ashby", "atlan")},
    # --- Category 3: Data, AI & Machine Learning ---
    {"name": "Pinecone", "url": "https://www.pinecone.io/careers", "ats": ("ashby", "pinecone")},
    {"name": "Weaviate", "url": "https://weaviate.io/company/careers", "ats": ("ashby", "weaviate")},
    # --- Category 4: Cybersecurity & IT ---
    {"name": "1Password", "url": "https://1password.com/company/careers", "ats": ("ashby", "1password")},
    {"name": "Huntress", "url": "https://www.huntress.com/careers", "ats": ("greenhouse", "huntress")},
    {"name": "Dragos", "url": "https://www.dragos.com/careers", "ats": ("greenhouse", "dragos")},
    {"name": "Axonius", "url": "https://www.axonius.com/careers", "ats": ("greenhouse", "axonius")},
    {"name": "Expel", "url": "https://expel.com/careers", "ats": ("greenhouse", "expel")},
    # --- Category 5: Product Management & Operations ---
    {"name": "Orchard", "url": "https://www.orchard.com/careers", "ats": ("greenhouse", "orchard")},
    # --- Category 6: Sales, Marketing & Customer Support ---
    {"name": "Salesloft", "url": "https://salesloft.com/careers", "ats": ("greenhouse", "salesloft")},
    {"name": "Attentive", "url": "https://attentive.com/careers", "ats": ("greenhouse", "attentive")},
    {"name": "Brandwatch", "url": "https://www.brandwatch.com/careers/", "ats": ("greenhouse", "brandwatch")},
    # --- Category 7: Healthcare & Allied Health ---
    {"name": "Oscar Health", "url": "https://www.hioscar.com/careers", "ats": ("greenhouse", "oscar")},
    {"name": "One Medical", "url": "https://www.onemedical.com/careers", "ats": ("greenhouse", "onemedical")},
    {"name": "Commure", "url": "https://commure.com/careers", "ats": ("ashby", "commure")},
    {"name": "Included Health", "url": "https://includedhealth.com/careers", "ats": ("lever", "includedhealth")},
    # --- Category 8: Engineering, Energy & Skilled Trades ---
    {"name": "Formlabs", "url": "https://formlabs.com/careers", "ats": ("greenhouse", "formlabs")},
    {"name": "Fictiv", "url": "https://www.fictiv.com/careers", "ats": ("greenhouse", "fictiv")},
    {"name": "Span", "url": "https://www.span.io/careers", "ats": ("ashby", "span")},
    # --- Category 9: Finance, Accounting & Compliance ---
    {"name": "Melio", "url": "https://melio.com/careers", "ats": ("greenhouse", "melio")},
    {"name": "Candid", "url": "https://www.candidapp.com/careers", "ats": ("greenhouse", "candid")},
    {"name": "Mosaic", "url": "https://www.mosaicapp.com/careers", "ats": ("ashby", "mosaic")},
    {"name": "Sequence", "url": "https://www.sequencehq.com/careers", "ats": ("ashby", "sequence")},
    {"name": "Baselayer", "url": "https://www.baselayer.com/careers", "ats": ("greenhouse", "baselayer")},
    {"name": "Compound", "url": "https://compound.finance/careers", "ats": ("ashby", "compound")},
    {"name": "Complete", "url": "https://getcomplete.com/careers", "ats": ("ashby", "complete")},
    # --- Category 10: HR, Recruitment & People Operations ---
    {"name": "Culture Amp", "url": "https://www.cultureamp.com/careers", "ats": ("greenhouse", "cultureamp")},
]

# ---------------------------------------------------------------------------
# ATS detection: map an official career page (URL + rendered content) to the
# company's first-party ATS board, when one is used.
# ---------------------------------------------------------------------------
_ATS_PATTERNS: List[Tuple[str, re.Pattern]] = [
    # Greenhouse
    ("greenhouse", re.compile(r"(?:job-)?boards\.greenhouse\.io/(?:embed/job_board\?for=)?([A-Za-z0-9_\-]+)", re.I)),
    ("greenhouse", re.compile(r"greenhouse\.io/embed/job_board\?for=([A-Za-z0-9_\-]+)", re.I)),
    ("greenhouse", re.compile(r"boards-api\.greenhouse\.io/v1/boards/([A-Za-z0-9_\-]+)", re.I)),
    # Lever
    ("lever", re.compile(r"jobs\.lever\.co/([A-Za-z0-9_\-]+)", re.I)),
    ("lever", re.compile(r"api\.lever\.co/v0/postings/([A-Za-z0-9_\-]+)", re.I)),
    # Ashby
    ("ashby", re.compile(r"jobs\.ashbyhq\.com/([A-Za-z0-9_\-]+)", re.I)),
    ("ashby", re.compile(r"api\.ashbyhq\.com/posting-api/job-board/([A-Za-z0-9_\-]+)", re.I)),
    # Workable
    ("workable", re.compile(r"apply\.workable\.com/(?:api/v1/widget/accounts/)?([A-Za-z0-9_\-]+)", re.I)),
    # Recruitee
    ("recruitee", re.compile(r"([A-Za-z0-9_\-]+)\.recruitee\.com", re.I)),
    # Workday (self-hosted career sites: <company>.wdN.myworkdayjobs.com/<site>)
    ("workday", re.compile(
        r"https?://([a-z0-9][a-z0-9\-]*\.wd\d+\.myworkdayjobs\.com(?:/[A-Za-z0-9_\-]+)?)",
        re.I,
    )),
]

# Substrings that indicate an ATS is present even if the token can't be parsed
# from the fetched text, so we know to keep looking (e.g. via Jina).
_ATS_HOST_MARKERS = [
    "greenhouse.io",
    "lever.co",
    "ashbyhq.com",
    "workable.com",
    "recruitee.com",
    "myworkdayjobs.com",
]

# Strong, non-host markers that a page is powered by a specific ATS. Used to
# decide whether a *guessed* board token is worth probing at all.
_PROVIDER_HINTS = {
    "greenhouse": ("boards.greenhouse.io", "job-boards.greenhouse.io", "gh_jid="),
    "lever": ("jobs.lever.co", "api.lever.co"),
    "ashby": ("jobs.ashbyhq.com", "api.ashbyhq.com", "useashbydata"),
    "workable": ("apply.workable.com",),
    "recruitee": (".recruitee.com",),
    "workday": ("myworkdayjobs.com",),
}


def hinted_providers(text: str) -> set:
    """ATS providers the page itself clearly references (any hint, any token)."""
    lowered = (text or "").lower()
    return {p for p, needles in _PROVIDER_HINTS.items() if any(n in lowered for n in needles)}


def detect_ats(text: str, extra_url: Optional[str] = None) -> Optional[Tuple[str, str]]:
    """Return (provider, token) if a first-party ATS board is referenced in text/URL."""
    haystack = text or ""
    if extra_url:
        haystack = extra_url + "\n" + haystack

    for provider, pattern in _ATS_PATTERNS:
        match = pattern.search(haystack)
        if match:
            token = match.group(1).strip().strip("/")
            # Guard against capturing generic path segments.
            if token and token.lower() not in {"jobs", "job", "careers", "embed", "job_board", "postings"}:
                # Workday needs the whole host[:site] to build its CXS API base.
                if provider == "workday":
                    token = "https://" + token
                return provider, token
    return None


def references_ats(text: str) -> bool:
    """True if an ATS host appears in the text, even without a parseable token."""
    lowered = (text or "").lower()
    return any(marker in lowered for marker in _ATS_HOST_MARKERS)


def _domain_labels(url: str) -> List[str]:
    """Derive candidate ATS board tokens from a company's domain."""
    try:
        host = url.split("://", 1)[-1].split("/", 1)[0].split(":")[0].lower()
    except Exception:
        return []
    host = host.replace("www.", "")
    for prefix in ("careers.", "jobs.", "about.", "boards.", "apply.", "job-boards.", "career."):
        if host.startswith(prefix):
            host = host[len(prefix):]
    parts = host.split(".")
    if not parts:
        return []
    base = parts[0]
    labels = [base]
    if base.endswith("hq"):
        labels.append(base[:-2])
    if base.endswith("inc"):
        labels.append(base[:-3])
    if base.endswith("global"):
        labels.append(base[:-6])
    if "-" in base:
        labels.append(base.replace("-", ""))

    # Career-site vanity domains keep the employer's real board token hidden:
    # pinterestcareers.com -> pinterest, lifeatspotify.com -> spotify,
    # wikimediafoundation.org -> wikimedia.
    _SUFFIXES = ("careers", "career", "jobs", "job", "hiring", "work", "workswith", "foundation", "team")
    for suffix in _SUFFIXES:
        for label in list(labels):
            if label.endswith(suffix) and len(label) - len(suffix) >= 3:
                stripped = label[: -len(suffix)]
                if stripped not in labels:
                    labels.append(stripped)
    _PREFIXES = ("lifeat", "workat", "weare", "peopleat", "join", "jobsat", "careersat", "the")
    for prefix in _PREFIXES:
        for label in list(labels):
            if label.startswith(prefix) and len(label) - len(prefix) >= 3:
                stripped = label[len(prefix):]
                if stripped not in labels:
                    labels.append(stripped)
    # De-duplicate while preserving order, dropping empties / too-short tokens.
    out: List[str] = []
    for label in labels:
        label = label.strip().strip("-")
        if len(label) >= 3 and label not in out:
            out.append(label)
    return out


# Providers worth probing by guessed token (the most widely used career backends).
GUESS_PROVIDERS = ["greenhouse", "ashby", "lever"]


def guess_ats_candidates(url: str) -> List[Tuple[str, str]]:
    """Candidate (provider, token) pairs to probe when no ATS is detected."""
    candidates: List[Tuple[str, str]] = []
    for label in _domain_labels(url):
        for provider in GUESS_PROVIDERS:
            candidates.append((provider, label))
    return candidates


def _host_of(url: str) -> str:
    try:
        host = (url or "").split("://", 1)[-1].split("/", 1)[0].split(":")[0].lower()
    except Exception:
        return ""
    return host[4:] if host.startswith("www.") else host


def seed_name_for_url(url: str) -> Optional[str]:
    """Display name for a career URL, resolved against the seed registry.

    A pasted URL yields a bare domain ("about.gitlab.com" -> "About",
    "lifeatspotify.com" -> "Lifeatspotify"), so the employer's own display
    name is looked up here before any domain guessing happens.
    """
    host = _host_of(url)
    if not host:
        return None
    for seed in SEED_COMPANIES:
        name = seed.get("name")
        if not name:
            continue
        seed_host = _host_of(seed.get("url") or "")
        if not seed_host:
            continue
        if host == seed_host or host.endswith("." + seed_host) or seed_host.endswith("." + host):
            return name
    return None


def parse_url_list(raw: str) -> List[Dict[str, Any]]:
    """Parse a plain-text list of company URLs into seed dicts."""
    out: List[Dict[str, Any]] = []
    seen = set()
    for line in (raw or "").splitlines():
        url = line.strip()
        if not url or url.startswith("#"):
            continue
        if not url.startswith("http"):
            url = "https://" + url
        if url in seen:
            continue
        seen.add(url)
        out.append({"name": None, "url": url})
    return out
