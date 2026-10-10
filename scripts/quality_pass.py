"""
Post-crawl quality pass for the newly fetched companies:

1. posted-date verification: report share of new rows with a real posted_date,
   fill blanks from ATS-side JSON stored in raw_metadata when possible.
2. unique-title enforcement: within each company, duplicate titles (same role
   posted for multiple locations) are collapsed to a single row - the one with
   the newest posted_date (URLs differing only in location join that way).
"""
import json
import re
import sqlite3
from pathlib import Path

DB = Path("careerhut_jobs.db")

NEW_COMPANIES = [
    "Modal", "Railway", "Together AI", "Anyscale", "Baseten", "CoreWeave",
    "Neo4j", "n8n", "ClickUp", "tldraw", "Atlan", "Pinecone", "Weaviate",
    "1Password", "Huntress", "Dragos", "Axonius", "Expel", "Orchard",
    "Salesloft", "Attentive", "Brandwatch", "Oscar Health", "One Medical",
    "Commure", "Included Health", "Formlabs", "Fictiv", "Span", "Melio",
    "Candid", "Mosaic", "Sequence", "Baselayer", "Compound", "Complete",
    "Culture Amp", "Gusto",
]

DATE_KEYS = ["first_published", "publishedAt", "createdAt", "published_on",
             "published_at", "updated_at", "postedOn", "datePosted"]


def norm_ts(value: str) -> str:
    """Normalize an ATS timestamp to a readable ISO-ish stamp."""
    if not value:
        return ""
    v = str(value).strip()
    # epoch millis (Lever / some Ashby)
    if re.fullmatch(r"\d{13}", v):
        import datetime
        return datetime.datetime.fromtimestamp(int(v) / 1000).strftime("%Y-%m-%d %H:%M UTC")
    # epoch seconds
    if re.fullmatch(r"\d{10}", v):
        import datetime
        return datetime.datetime.fromtimestamp(int(v)).strftime("%Y-%m-%d %H:%M UTC")
    return v


def main() -> None:
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    q = ",".join("?" * len(NEW_COMPANIES))

    rows = cur.execute(
        f"SELECT id, title, company, job_url, posted_date, raw_metadata FROM jobs "
        f"WHERE company COLLATE NOCASE IN ({q})",
        NEW_COMPANIES,
    ).fetchall()
    print(f"[i] New rows in DB: {len(rows)}")

    # ----- 1. posted-date verification / repair ---------------------------
    fixed_dates = 0
    missing = []
    for r in rows:
        posted = (r["posted_date"] or "").strip()
        if posted:
            if re.fullmatch(r"\d{10,13}", posted):
                norm = norm_ts(posted)
                cur.execute("UPDATE jobs SET posted_date = ? WHERE id = ?", (norm, r["id"]))
                fixed_dates += 1
            continue
        # try raw_metadata (per-ATS JSON captured at crawl time)
        try:
            meta = json.loads(r["raw_metadata"] or "{}")
        except Exception:
            meta = {}
        found = ""
        for key in DATE_KEYS:
            v = meta.get(key)
            if v:
                found = norm_ts(v)
                break
        if found:
            cur.execute("UPDATE jobs SET posted_date = ? WHERE id = ?", (found, r["id"]))
            fixed_dates += 1
        else:
            missing.append((r["company"], r["title"]))

    conn.commit()
    with_date = sum(1 for r in rows if (r["posted_date"] or "").strip()) + fixed_dates
    pct = 100.0 * with_date / max(1, len(rows))
    print(f"[+] Posted dates present/added: {with_date}/{len(rows)} ({pct:.1f}%)")
    print(f"[+] Epoch timestamps normalized: {fixed_dates}")
    print(f"[-] Still missing posted_date: {len(missing)}")
    from collections import Counter
    by_company = Counter(c for c, _ in missing)
    for comp, n in by_company.most_common(10):
        print(f"      - {comp}: {n}")

    # ----- 2. unique-title enforcement per company -------------------------
    seen = {}
    dupes_removed = 0
    for r in rows:
        key = (r["company"].lower(), re.sub(r"\s+", " ", r["title"].strip().lower()))
        prev = seen.get(key)
        if prev is None:
            seen[key] = r
            continue
        # duplicate title within the same company: keep the richer/newer row
        keep, drop = prev, r
        prev_d, cur_d = (keep["posted_date"] or ""), (drop["posted_date"] or "")
        if cur_d > prev_d:  # ISO strings compare lexicographically
            keep, drop = drop, prev
            seen[key] = keep
        # merge posting date if the surviving row lacked one
        if not (keep["posted_date"] or "") and cur_d:
            cur.execute("UPDATE jobs SET posted_date = ? WHERE id = ?", (cur_d, keep["id"]))
        cur.execute("DELETE FROM jobs WHERE id = ?", (drop["id"],))
        dupes_removed += 1

    conn.commit()

    remaining_dupes = cur.execute(
        f"SELECT company, title, COUNT(*) c FROM jobs WHERE company COLLATE NOCASE IN ({q}) "
        f"GROUP BY LOWER(company), LOWER(TRIM(REPLACE(title, '  ', ' '))) HAVING c > 1 LIMIT 5",
        NEW_COMPANIES,
    ).fetchall()
    print(f"[+] Duplicate-title rows removed: {dupes_removed}")
    print(f"[+] Remaining duplicate titles  : {len(remaining_dupes)}")

    # ----- final per-company summary --------------------------------------
    summary = cur.execute(
        f"SELECT company, COUNT(*) jobs, "
        f"SUM(CASE WHEN posted_date IS NOT NULL AND posted_date != '' THEN 1 ELSE 0 END) dated "
        f"FROM jobs WHERE company COLLATE NOCASE IN ({q}) GROUP BY company COLLATE NOCASE ORDER BY company",
        NEW_COMPANIES,
    ).fetchall()
    print(f"\n{'COMPANY':<18} {'JOBS':>6} {'WITH DATE':>10}")
    print("-" * 38)
    tj = td = 0
    for s in summary:
        tj += s["jobs"]
        td += s["dated"] or 0
        print(f"{s['company'][:17]:<18} {s['jobs']:>6} {s['dated'] or 0:>10}")
    print("-" * 38)
    print(f"{'TOTAL':<18} {tj:>6} {td:>10}")

    conn.close()


if __name__ == "__main__":
    main()
