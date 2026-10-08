"""Verification: compare stored rows against each employer's live career board.

Checks, per URL the user listed:
  * row count vs the board's own count
  * exact job-title match against the board's titles
  * placeholder / page-chrome titles present in the DB
  * missing or suspiciously thin job descriptions

Temporary tool (removed after the repair run).
"""
import json
import re
import sys
import time
from collections import Counter

import requests

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

import sqlite3
from careerhut.extractor import is_placeholder_title, _JUNK_LINK_TEXT

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"}


def norm(title: str) -> str:
    """Boards ship trailing whitespace/tabs; the DB stores the trimmed title."""
    return " ".join((title or "").split())


def get(url, tries=4, timeout=30):
    for i in range(tries):
        try:
            r = requests.get(url, headers=UA, timeout=timeout)
            return r
        except Exception:
            time.sleep(1)
    return None


def post(url, payload, tries=4):
    for i in range(tries):
        try:
            return requests.post(url, headers={**UA, "Content-Type": "application/json"}, json=payload, timeout=30)
        except Exception:
            time.sleep(1)
    return None


def greenhouse(token):
    r = get(f"https://boards-api.greenhouse.io/v1/boards/{token}/jobs")
    return [j.get("title", "") for j in r.json().get("jobs", [])] if r and r.status_code == 200 else []


def ashby(token):
    r = get(f"https://api.ashbyhq.com/posting-api/job-board/{token}")
    return [j.get("title", "") for j in r.json().get("jobs", [])] if r and r.status_code == 200 else []


def lever(token):
    r = get(f"https://api.lever.co/v0/postings/{token}?mode=json")
    return [j.get("text", "") for j in r.json()] if r and r.status_code == 200 else []


def workday(org, site):
    api = f"https://{org}.wd5.myworkdayjobs.com/wday/cxs/{org}/{site}"
    out = []
    offset = 0
    total = 1
    fails = 0
    while offset < total and offset < 4000 and fails < 6:
        page = post(api + "/jobs", {"limit": 20, "offset": offset, "appliedFacets": {}, "searchText": ""}, tries=5)
        if page is None or page.status_code >= 400:
            fails += 1
            time.sleep(1)
            continue
        data = page.json() or {}
        batch = data.get("jobPostings") or []
        total = data.get("total") or 0
        if not batch:
            break
        out += [j.get("title", "") for j in batch]
        offset += len(batch)
    return out


def workday_host(host, org, site):
    api = f"https://{host}/wday/cxs/{org}/{site}"
    out = []
    offset = 0
    total = 1
    fails = 0
    while offset < total and offset < 4000 and fails < 6:
        page = post(api + "/jobs", {"limit": 20, "offset": offset, "appliedFacets": {}, "searchText": ""}, tries=5)
        if page is None or page.status_code >= 400:
            fails += 1
            time.sleep(1)
            continue
        data = page.json() or {}
        batch = data.get("jobPostings") or []
        total = data.get("total") or 0
        if not batch:
            break
        out += [j.get("title", "") for j in batch]
        offset += len(batch)
    return out


def remote_titles():
    r = get("https://remote.com/openings")
    if not r:
        return []
    ids = sorted(set(re.findall(r"https://apply\.remote\.com/jobs/([0-9a-f\-]{36})", r.text)))
    titles = []
    for jid in ids:
        resp = get(f"https://apply.remote.com/api/public/jobs/{jid}", tries=2, timeout=20)
        if resp and resp.status_code == 200:
            job = (resp.json() or {}).get("job") or {}
            titles.append(job.get("title") or "")
    return titles


def deel_titles():
    r = get("https://www.deel.com/careers/")
    if not r:
        return []
    # Titles as embedded next to each role link in the career page payload.
    return sorted(set(re.findall(r"job-details/[0-9a-f\-]{36}", r.text)))


TARGETS = [
    ("Zapier", "Zapier", lambda: ashby("zapier")),
    ("Pinterest", "Pinterest", lambda: greenhouse("pinterest")),
    ("CrowdStrike", "CrowdStrike", lambda: workday("crowdstrike", "crowdstrikecareers")),
    ("MongoDB", "MongoDB", lambda: greenhouse("mongodb")),
    ("GitLab", "GitLab", lambda: greenhouse("gitlab")),
    ("Docker", "Docker", lambda: ashby("docker")),
    ("Wikimedia", "Wikimedia", lambda: greenhouse("wikimedia")),
    ("Okta", "Okta", lambda: greenhouse("okta")),
    ("Postman", "Postman", lambda: workday_host("postman.wd108.myworkdayjobs.com", "postman", "careers")),
    ("Remote", "Remote", remote_titles),
    ("Spotify", "Spotify", lambda: lever("spotify")),
    ("Coinbase", "Coinbase", lambda: greenhouse("coinbase")),
    ("Deel", "Deel", deel_titles),
]

con = sqlite3.connect("careerhut_jobs.db")
con.row_factory = sqlite3.Row
cur = con.cursor()

failures = 0
print(f"{'COMPANY':<14}{'DB':>6}{'LIVE':>6}  {'JUNK':>5} {'THIN':>5}  VERDICT")
print("-" * 88)

for company, label, fetch in TARGETS:
    live = fetch()
    rows = cur.execute(
        "SELECT title, description, job_url FROM jobs WHERE company = ? COLLATE NOCASE", (company,)
    ).fetchall()
    db_titles = [r["title"] for r in rows]
    junk = [
        t for t in db_titles
        if is_placeholder_title(t) or t.strip().lower().rstrip(" .!?:;-") in _JUNK_LINK_TEXT
    ]
    thin = [r for r in rows if len(r["description"] or "") < 300]

    # deel's page gives URLs, not titles; only placeholder checks apply there.
    if company == "Deel":
        missing, extra = [], []
    elif not live:
        missing, extra = [], []
        problems_live = "live board unreachable"
    else:
        live_counter = Counter(norm(t) for t in live)
        db_counter = Counter(norm(t) for t in db_titles)
        missing = list((live_counter - db_counter).elements())
        extra = list((db_counter - live_counter).elements())

    problems = []
    if live and len(rows) < len(live):
        problems.append(f"missing {len(live) - len(rows)} rows")
    if junk:
        problems.append(f"{len(junk)} junk titles")
    if thin and company in ("CrowdStrike", "Postman", "Spotify", "Docker", "Wikimedia", "Okta",
                            "Coinbase", "GitLab", "MongoDB", "Pinterest", "Zapier"):
        problems.append(f"{len(thin)} thin JDs")
    if missing:
        problems.append(f"{len(missing)} titles not on the board")
    if extra:
        problems.append(f"{len(extra)} titles not published by employer")
    if not live and company != "Deel":
        problems.append("live board unreachable")
    verdict = "OK" if not problems else "; ".join(problems)
    if problems:
        failures += 1
    print(f"{label:<14}{len(rows):>6}{len(live):>6}  {len(junk):>5} {len(thin):>5}  {verdict}")
    if missing[:3]:
        print(f"    missing e.g.: {missing[:3]}")
    if extra[:3]:
        print(f"    extra   e.g.: {extra[:3]}")
    if junk[:3]:
        print(f"    junk    e.g.: {junk[:3]}")
    if thin[:3]:
        print(f"    thin    e.g.: {[t['title'] for t in thin[:3]]}")

print("-" * 88)
print("FAILING TARGETS:", failures)
