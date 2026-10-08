"""
Careerhut CLI - Command-line interface for fetching jobs directly from company career pages.
Safe for all terminal encodings (Windows CP1252 / UTF-8).
"""

import sys
import argparse
import json

# Ensure UTF-8 output where possible on Windows
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from .crawler import CareerCrawler
from .storage import JobStorage
from .mass_crawler import MassCrawler
from .enrich import JobEnricher
from .sources import SEED_COMPANIES, parse_url_list


def cmd_enrich(args):
    storage = JobStorage()
    enricher = JobEnricher(storage=storage, max_workers=args.workers)

    print("\n[*] Repairing any stale escaped HTML in stored job text...")
    repaired = enricher.repair_escaped_text()
    print(f"[+] Text rows repaired : {repaired}")

    if not args.logos_only:
        print("\n[*] Enriching individual job pages (full description, recruiter email, apply link)...")
        if args.all:
            print("[*] Scope: ALL jobs (re-fetch every role page)")
        else:
            print("[*] Scope: jobs that are thin, listing-linked, or missing a contact")

        def on_progress(p):
            print(f"  [{p['completed']:>5}/{p['total']}] {'updated' if p['updated'] else '      '} "
                  f"{str(p.get('title'))[:52]}", flush=True)

        summary = enricher.enrich_jobs(
            only_thin=not args.all,
            limit=args.limit,
            company=args.company,
            on_progress=on_progress if args.verbose else None,
        )
        print("\n" + "=" * 70)
        print(f"[+] Jobs targeted : {summary['jobs_targeted']}")
        print(f"[+] Rows updated  : {summary['jobs_updated']}")
        print(f"[+] Duration       : {summary['duration_seconds']}s")
        if summary["errors"] and args.verbose:
            print(f"[-] Fetch failures : {len(summary['errors'])}")
            for err in summary["errors"][:20]:
                print(f"      - {err['job_url']}: {err['error']}")
        print("=" * 70)

    if not args.skip_logos:
        print("\n[*] Resolving company logos...")
        logo_summary = enricher.enrich_logos()
        print(f"[+] Logos resolved : {logo_summary['logos_resolved']}/{logo_summary['companies']} companies")

    print("\n[*] Filling derived recruiting inboxes for employers with no published address...")
    derived = enricher.fill_derived_emails()
    print(f"[+] Emails filled  : {derived} (derived as careers@<company-domain>)")


def cmd_crawl_all(args):
    storage = JobStorage()

    if args.urls_file:
        with open(args.urls_file, "r", encoding="utf-8") as f:
            companies = parse_url_list(f.read())
    else:
        companies = SEED_COMPANIES

    if args.limit:
        companies = companies[: args.limit]

    print(f"\n[*] Mass-fetching jobs from {len(companies)} company career pages")
    print(f"[*] Workers: {args.workers} | Max jobs/company: {args.max_jobs}\n")

    crawler = MassCrawler(storage=storage, max_workers=args.workers, use_browser=args.browser)

    def on_progress(p):
        line = f"  [{p['completed']:>3}/{p['total']}] {str(p['company'])[:28]:<28} " \
               f"{str(p['engine'] or '-'):<16} {p['jobs_count']:>4} jobs"
        print(line, flush=True)

    summary = crawler.run(
        companies=companies,
        max_jobs_per_company=args.max_jobs,
        on_progress=on_progress,
    )

    print("\n" + "=" * 70)
    print(f"[+] Companies processed : {summary['companies_processed']}/{summary['companies_total']}")
    print(f"[+] Jobs found (deduped) : {summary['jobs_found']}")
    print(f"[+] Jobs saved to DB     : {summary['jobs_saved']}")
    print(f"[+] Duration             : {summary['duration_seconds']}s")
    if summary["engine_breakdown"]:
        print("[+] Engine breakdown     :")
        for engine, count in sorted(summary["engine_breakdown"].items(), key=lambda x: -x[1]):
            print(f"      - {engine:<18} {count} jobs")
    if summary["errors"] and args.verbose:
        print("[-] Failures:")
        for err in summary["errors"][:40]:
            print(f"      - {err['company']}: {err['error']}")
    print("=" * 70)

    try:
        print(f"\nTotal jobs now in database: {storage.get_stats()['total_jobs']}")
    except Exception:
        pass


def cmd_fetch(args):
    crawler = CareerCrawler()
    print(f"\n[*] Discovering & Fetching Career Page for: {args.url}")
    print("[*] Crawling and extracting jobs from official career page...")

    result = crawler.crawl_sync(
        company_url=args.url,
        max_jobs=args.limit,
        use_browser=not args.no_browser,
        refresh=args.refresh,
    )

    if result.status == "error":
        print(f"[!] Error scraping {args.url}: {result.error_message}")
        sys.exit(1)

    print(f"\n[+] Success! Fetched {result.jobs_count} jobs from {result.company_name} in {result.duration_seconds}s")
    print(f"[-] Career Page URL: {result.career_url}\n")

    if result.jobs:
        print("-" * 90)
        print(f"{'TITLE':<38} | {'DEPARTMENT':<18} | {'LOCATION':<18} | {'TYPE':<10}")
        print("-" * 90)

        for job in result.jobs[:25]:
            title = (job.title[:35] + "..") if len(job.title) > 37 else job.title
            dept = ((job.department or "General")[:16] + "..") if len(job.department or "General") > 17 else (job.department or "General")
            loc = (job.location[:16] + "..") if len(job.location) > 17 else job.location
            w_type = job.workplace_type[:10]
            print(f"{title:<38} | {dept:<18} | {loc:<18} | {w_type:<10}")

        print("-" * 90)
        if len(result.jobs) > 25:
            print(f"...and {len(result.jobs) - 25} more positions saved to database.")
    else:
        print("[i] No open jobs found on this specific page or page requires dynamic JavaScript interaction.")


def cmd_list(args):
    storage = JobStorage()
    jobs = storage.get_jobs(
        company=args.company,
        search_query=args.query,
        location=args.location,
        workplace_type=args.type,
        limit=args.limit
    )

    if not jobs:
        print("[!] No jobs found matching your criteria.")
        return

    print(f"\n=== Saved Jobs in Careerhut ({len(jobs)}) ===")
    print("-" * 90)
    print(f"{'COMPANY':<18} | {'TITLE':<35} | {'LOCATION':<18} | {'TYPE':<10}")
    print("-" * 90)

    for job in jobs:
        comp = (job.company[:16] + "..") if len(job.company) > 17 else job.company
        title = (job.title[:33] + "..") if len(job.title) > 34 else job.title
        loc = (job.location[:16] + "..") if len(job.location) > 17 else job.location
        w_type = job.workplace_type[:10]
        print(f"{comp:<18} | {title:<35} | {loc:<18} | {w_type:<10}")

    print("-" * 90)


def cmd_export(args):
    storage = JobStorage()
    if args.format == "csv":
        csv_data = storage.export_csv()
        if args.output:
            with open(args.output, "w", encoding="utf-8") as f:
                f.write(csv_data)
            print(f"[+] Exported jobs to {args.output}")
        else:
            print(csv_data)
    else:
        jobs = [j.dict() for j in storage.get_jobs(limit=10000)]
        json_data = json.dumps(jobs, indent=2, ensure_ascii=False)
        if args.output:
            with open(args.output, "w", encoding="utf-8") as f:
                f.write(json_data)
            print(f"[+] Exported {len(jobs)} jobs to {args.output}")
        else:
            print(json_data)


def main():
    parser = argparse.ArgumentParser(description="Careerhut - Fetch jobs directly from company career pages")
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # fetch command
    p_fetch = subparsers.add_parser("fetch", help="Fetch jobs directly from a company career page")
    p_fetch.add_argument("url", help="Company website or career page URL (e.g. stripe.com, openai.com/careers)")
    p_fetch.add_argument("--limit", type=int, default=500, help="Max jobs to fetch")
    p_fetch.add_argument("--no-browser", action="store_true", help="Skip headless browser, use raw HTTP only")
    p_fetch.add_argument("--refresh", action="store_true", help="Purge this employer's stored rows before saving the fresh crawl")
    p_fetch.set_defaults(func=cmd_fetch)

    # list command
    p_list = subparsers.add_parser("list", help="List and filter fetched jobs from database")
    p_list.add_argument("--company", help="Filter by company name")
    p_list.add_argument("--query", "-q", help="Search in title/description")
    p_list.add_argument("--location", "-l", help="Filter by location")
    p_list.add_argument("--type", help="Workplace type (Remote, Hybrid, On-site)")
    p_list.add_argument("--limit", type=int, default=50, help="Number of records to display")
    p_list.set_defaults(func=cmd_list)

    # export command
    p_export = subparsers.add_parser("export", help="Export jobs to CSV or JSON")
    p_export.add_argument("--format", choices=["csv", "json"], default="json", help="Output format")
    p_export.add_argument("--output", "-o", help="Output file path")
    p_export.set_defaults(func=cmd_export)

    # enrich command
    p_enrich = subparsers.add_parser("enrich", help="Visit each job's own page to fill full description, recruiter email, apply link, logo")
    p_enrich.add_argument("--workers", type=int, default=12, help="Concurrent workers")
    p_enrich.add_argument("--limit", type=int, default=100000, help="Max jobs to enrich")
    p_enrich.add_argument("--company", help="Only enrich rows for one employer (exact company name)")
    p_enrich.add_argument("--all", action="store_true", help="Re-fetch every job page, not just thin/incomplete rows")
    p_enrich.add_argument("--logos-only", action="store_true", help="Only resolve company logos")
    p_enrich.add_argument("--skip-logos", action="store_true", help="Skip the company logo pass")
    p_enrich.add_argument("--verbose", "-v", action="store_true", help="Live progress + failures")
    p_enrich.set_defaults(func=cmd_enrich)

    # crawl-all command
    p_all = subparsers.add_parser("crawl-all", help="Mass-fetch jobs from many company career pages at once")
    p_all.add_argument("--limit", type=int, default=0, help="Max number of companies to crawl (0 = all seeds)")
    p_all.add_argument("--workers", type=int, default=10, help="Concurrent workers")
    p_all.add_argument("--max-jobs", type=int, default=500, help="Max jobs to keep per company")
    p_all.add_argument("--urls-file", help="Optional text file with one company career URL per line")
    p_all.add_argument("--browser", action="store_true", help="Enable headless browser fallback (slower)")
    p_all.add_argument("--verbose", "-v", action="store_true", help="Print per-company failures")
    p_all.set_defaults(func=cmd_crawl_all)

    args = parser.parse_args()
    if hasattr(args, "func"):
        args.func(args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
