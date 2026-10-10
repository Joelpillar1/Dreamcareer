import socket
import requests
import re
import json
import time
import datetime
from datetime import timezone
from typing import List, Dict, Any, Optional

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from careerhut.storage import JobStorage
from careerhut.models import JobListing, CompanyProfile


# Monkey patch DNS for jobs.twilio.com to CloudFront IP
orig_getaddrinfo = socket.getaddrinfo
def custom_getaddrinfo(host, port, *args, **kwargs):
    if host == 'jobs.twilio.com':
        host = '108.139.200.37'
    return orig_getaddrinfo(host, port, *args, **kwargs)
socket.getaddrinfo = custom_getaddrinfo

def fetch_twilio_roles():
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
    })

    print("[Twilio] Starting fetch from jobs.twilio.com/careers...")
    all_positions: List[Dict[str, Any]] = []
    start = 0

    while True:
        url = f'https://jobs.twilio.com/api/pcsx/search?domain=twilio.com&query=&location=&start={start}'
        try:
            resp = session.get(url, timeout=20)
            if resp.status_code != 200:
                print(f"[Twilio] Failed status {resp.status_code} at start={start}")
                break
            data = resp.json().get('data', {})
            batch = data.get('positions', [])
            total = data.get('count', 0)
            if not batch:
                break
            all_positions.extend(batch)
            start += len(batch)
            print(f"[Twilio] Fetched {len(all_positions)} / {total} positions...")
            if start >= total or len(batch) < 10:
                break
            time.sleep(0.1)
        except Exception as e:
            print(f"[Twilio] Error fetching at start={start}: {e}")
            break

    print(f"[Twilio] Total positions retrieved: {len(all_positions)}")
    if not all_positions:
        print("[Twilio] No positions found, aborting.")
        return

    storage = JobStorage()

    # Make sure Twilio company profile exists in companies table
    try:
        with storage._get_connection() as conn:
            conn.execute("""
                INSERT INTO companies (domain, name, career_url, industry, headquarters, contact_email, total_jobs_found, last_scraped_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(domain) DO UPDATE SET
                    total_jobs_found = excluded.total_jobs_found,
                    last_scraped_at = excluded.last_scraped_at
            """, (
                "twilio.com",
                "Twilio",
                "https://jobs.twilio.com/careers",
                "Cloud Communications / Developer APIs",
                "San Francisco, CA (Remote-First)",
                "recruiting@twilio.com",
                len(all_positions),
                datetime.datetime.now(timezone.utc).isoformat()
            ))
            conn.commit()
    except Exception as e:
        print(f"[Twilio] Note on company profile upsert: {e}")

    saved_count = 0
    updated_count = 0

    # Fetch details for the first 30 positions (most recent ones) to get description & salary
    detail_cache: Dict[int, Dict[str, Any]] = {}
    print(f"[Twilio] Fetching full details & descriptions for top {min(35, len(all_positions))} positions...")
    for p in all_positions[:35]:
        pid = p.get('id')
        try:
            det_url = f'https://jobs.twilio.com/api/pcsx/position_details?domain=twilio.com&position_id={pid}'
            det_res = session.get(det_url, timeout=15)
            if det_res.status_code == 200:
                det_json = det_res.json()
                detail_cache[pid] = det_json.get('data', {})
            time.sleep(0.05)
        except Exception as e:
            pass

    for p in all_positions:
        pid = p.get('id')
        title = p.get('name', 'Role at Twilio')
        locations = p.get('locations', [])
        loc_str = ", ".join(locations) if locations else "Worldwide"
        
        # Workplace type
        work_option = (p.get('workLocationOption') or '').lower()
        if 'remote' in work_option or any('remote' in str(l).lower() for l in locations):
            workplace_type = "Remote"
        elif 'hybrid' in work_option or any('hybrid' in str(l).lower() for l in locations):
            workplace_type = "Hybrid"
        else:
            workplace_type = "On-site"

        # Department
        dept = p.get('department') or "General"

        # Posted date:
        # Twilio Eightfold API provides `creationTs` in seconds timestamp
        cts = p.get('creationTs')
        posted_date_iso = None
        if cts and int(cts) > 0:
            dt = datetime.datetime.fromtimestamp(int(cts), tz=timezone.utc)
            posted_date_iso = dt.strftime('%Y-%m-%dT%H:%M:%SZ')
        else:
            posted_date_iso = datetime.datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')

        job_url = f"https://jobs.twilio.com/careers/job/{pid}"
        apply_url = f"https://jobs.twilio.com/careers/job/{pid}?mode=apply"

        details = detail_cache.get(pid, {})
        description = details.get('jobDescription') or ""

        # Extract salary if present
        salary_range = None
        if description:
            salaries = re.findall(r'\$[\d,]+(?:\s*-\s*\$[\d,]+)?', description)
            if salaries:
                if len(salaries) >= 2:
                    salary_range = f"{salaries[0]} - {salaries[1]}"
                else:
                    salary_range = salaries[0]

        job = JobListing(
            title=title,
            company="Twilio",
            company_url="https://www.twilio.com",
            career_page_url="https://jobs.twilio.com/careers",
            job_url=job_url,
            apply_url=apply_url,
            department=dept,
            location=loc_str,
            workplace_type=workplace_type,
            employment_type="Full-time",
            experience_level="Not specified",
            salary_range=salary_range,
            company_logo="https://logo.clearbit.com/twilio.com",
            contact_email="recruiting@twilio.com",
            hiring_team_emails=["careers@twilio.com", "kshipchandler@twilio.com"],
            description=description,
            posted_date=posted_date_iso,
            discovered_at=datetime.datetime.now(timezone.utc).isoformat(),
            raw_metadata=p
        )

        success = storage.save_job(job)
        if success:
            saved_count += 1

    print(f"\n[Twilio] Successfully saved {saved_count} Twilio positions into database!")
    
    # Print the top 5 most recent roles saved
    print("\n[Twilio] Recent roles with posting timestamps:")
    with storage._get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, title, location, workplace_type, posted_date, job_url 
            FROM jobs 
            WHERE company = 'Twilio' 
            ORDER BY posted_date DESC 
            LIMIT 5
        """)
        for row in cursor.fetchall():
            print(f"- {row['title']} | Loc: {row['location']} | Posted: {row['posted_date']}")

if __name__ == '__main__':
    fetch_twilio_roles()
