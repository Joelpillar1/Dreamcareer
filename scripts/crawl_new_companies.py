"""
One-off batch: fetch jobs from 38 new company career pages (all 10 categories)
using each employer's first-party ATS board, then store to careerhut_jobs.db.

Runs the same cascade as the dashboard's mass fetch (careerhut.mass_crawler),
with the ATS board pinned so we skip token guessing:
  1. ATS board API (Greenhouse / Lever / Ashby) - exact titles + posted dates
  2. Direct HTML render of the official career page
  3. Agent Reach Jina reader + headless browser fallbacks
"""
import sys

sys.path.insert(0, ".")

from careerhut.mass_crawler import MassCrawler
from careerhut.storage import JobStorage

# (display name, official career page, ATS provider, ATS board token)
COMPANIES = [
    # --- 1. Software Engineering & Development ---
    ("Modal",           "https://modal.com/careers",             "ashby",      "modal"),
    ("Railway",         "https://railway.com/careers",           "ashby",      "railway"),
    ("Together AI",     "https://www.together.ai/careers",       "greenhouse", "togetherai"),
    ("Anyscale",        "https://www.anyscale.com/careers",      "ashby",      "anyscale"),
    ("Baseten",         "https://www.baseten.co/careers",        "ashby",      "baseten"),
    ("CoreWeave",       "https://www.coreweave.com/careers",     "greenhouse", "coreweave"),
    ("Neo4j",           "https://neo4j.com/careers",             "greenhouse", "neo4j"),
    ("n8n",             "https://n8n.io/careers",                "ashby",      "n8n"),
    ("ClickUp",         "https://clickup.com/careers",           "ashby",      "clickup"),
    # --- 2. Product, UI/UX & Design ---
    ("tldraw",          "https://tldraw.com/careers",            "ashby",      "tldraw"),
    ("Atlan",           "https://atlan.com/careers",             "ashby",      "atlan"),
    # --- 3. Data, AI & Machine Learning ---
    ("Pinecone",        "https://www.pinecone.io/careers",       "ashby",      "pinecone"),
    ("Weaviate",        "https://weaviate.io/company/careers",   "ashby",      "weaviate"),
    # --- 4. Cybersecurity & IT ---
    ("1Password",       "https://1password.com/company/careers", "ashby",      "1password"),
    ("Huntress",        "https://www.huntress.com/careers",      "greenhouse", "huntress"),
    ("Dragos",          "https://www.dragos.com/careers",        "greenhouse", "dragos"),
    ("Axonius",         "https://www.axonius.com/careers",       "greenhouse", "axonius"),
    ("Expel",           "https://expel.com/careers",             "greenhouse", "expel"),
    # --- 5. Product Management & Operations ---
    ("Orchard",         "https://www.orchard.com/careers",       "greenhouse", "orchard"),
    # --- 6. Sales, Marketing & Customer Support ---
    ("Salesloft",       "https://salesloft.com/careers",         "greenhouse", "salesloft"),
    ("Attentive",       "https://attentive.com/careers",         "greenhouse", "attentive"),
    ("Brandwatch",      "https://www.brandwatch.com/careers/",   "greenhouse", "brandwatch"),
    # --- 7. Healthcare & Allied Health ---
    ("Oscar Health",    "https://www.hioscar.com/careers",       "greenhouse", "oscar"),
    ("One Medical",     "https://www.onemedical.com/careers",    "greenhouse", "onemedical"),
    ("Commure",         "https://commure.com/careers",           "ashby",      "commure"),
    ("Included Health", "https://includedhealth.com/careers",    "lever",      "includedhealth"),
    # --- 8. Engineering, Energy & Skilled Trades ---
    ("Formlabs",        "https://formlabs.com/careers",          "greenhouse", "formlabs"),
    ("Fictiv",          "https://www.fictiv.com/careers",        "greenhouse", "fictiv"),
    ("Span",            "https://www.span.io/careers",           "ashby",      "span"),
    # --- 9. Finance, Accounting & Compliance ---
    ("Melio",           "https://melio.com/careers",             "greenhouse", "melio"),
    ("Candid",          "https://www.candidapp.com/careers",     "greenhouse", "candid"),
    ("Mosaic",          "https://www.mosaicapp.com/careers",     "ashby",      "mosaic"),
    ("Sequence",        "https://www.sequencehq.com/careers",    "ashby",      "sequence"),
    ("Baselayer",       "https://www.baselayer.com/careers",     "greenhouse", "baselayer"),
    ("Compound",        "https://compound.finance/careers",      "ashby",      "compound"),
    ("Complete",        "https://getcomplete.com/careers",       "ashby",      "complete"),
    # --- 10. HR, Recruitment & People Operations ---
    ("Culture Amp",     "https://www.cultureamp.com/careers",    "greenhouse", "cultureamp"),
    ("Gusto",           "https://gusto.com/about/careers",       "greenhouse", "gusto"),
]


def main() -> None:
    storage = JobStorage()
    crawler = MassCrawler(storage=storage, max_workers=8, use_browser=False)

    entries = [
        {"name": name, "url": url, "ats": (provider, token)}
        for name, url, provider, token in COMPANIES
    ]

    def on_progress(p):
        line = (
            f"  [{p['completed']:>3}/{p['total']}] "
            f"{str(p['company'])[:28]:<28} "
            f"{str(p['engine'] or '-'):<22} {p['jobs_count']:>4} jobs"
        )
        print(line, flush=True)

    summary = crawler.run(
        companies=entries,
        max_jobs_per_company=400,
        on_progress=on_progress,
    )

    print()
    print("=" * 70)
    print(f"[+] Companies processed : {summary['companies_processed']}/{summary['companies_total']}")
    print(f"[+] Jobs found (deduped): {summary['jobs_found']}")
    print(f"[+] Jobs saved to DB    : {summary['jobs_saved']}")
    print(f"[+] Duration            : {summary['duration_seconds']}s")
    for engine, count in sorted(summary["engine_breakdown"].items(), key=lambda x: -x[1]):
        print(f"      - {engine:<24} {count} jobs")
    if summary["errors"]:
        print("[-] Failures:")
        for err in summary["errors"]:
            print(f"      - {err['company']}: {err['error']}")
    print("=" * 70)


if __name__ == "__main__":
    main()
