import re
import json
import sqlite3
from pathlib import Path

# Read DIRECT_CAREER_JOBS from src/data/directJobs.js
with open("src/data/directJobs.js", "r", encoding="utf-8") as f:
    content = f.read()

match = re.search(r"export const DIRECT_CAREER_JOBS = (\[[\s\S]*\]);", content)
if not match:
    print("Could not find DIRECT_CAREER_JOBS in src/data/directJobs.js")
    exit(1)

jobs = json.loads(match.group(1))
print(f"Loaded {len(jobs)} jobs from src/data/directJobs.js")

db_path = Path("careerhut_jobs.db")
conn = sqlite3.connect(str(db_path))
cursor = conn.cursor()

# Ensure table exists
cursor.execute("""
    CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        company_url TEXT,
        career_page_url TEXT NOT NULL,
        job_url TEXT UNIQUE NOT NULL,
        department TEXT,
        location TEXT,
        workplace_type TEXT,
        employment_type TEXT,
        experience_level TEXT,
        salary_range TEXT,
        company_logo TEXT,
        contact_email TEXT,
        hiring_team_emails TEXT,
        description TEXT,
        responsibilities TEXT,
        requirements TEXT,
        benefits TEXT,
        apply_url TEXT,
        posted_date TEXT,
        app_status TEXT DEFAULT 'Discovered',
        notes TEXT DEFAULT '',
        is_bookmarked INTEGER DEFAULT 0,
        discovered_at TEXT,
        raw_metadata TEXT
    )
""")

posthog_count = 0
for j in jobs:
    jid = j.get("id")
    title = j.get("title") or j.get("role")
    comp = j.get("company")
    comp_url = j.get("companyPortalUrl") or "https://posthog.com" if comp == "PostHog" else "https://stripe.com"
    career_url = j.get("companyPortalUrl") or "https://posthog.com/careers" if comp == "PostHog" else "https://stripe.com/careers/search"
    job_url = j.get("job_url") or j.get("applyUrl")
    apply_url = j.get("applyUrl") or j.get("job_url")
    
    if comp == "PostHog":
        posthog_count += 1

    cursor.execute("""
        INSERT OR REPLACE INTO jobs (
            id, title, company, company_url, career_page_url, job_url,
            department, location, workplace_type, employment_type,
            experience_level, salary_range, company_logo, contact_email, hiring_team_emails,
            description, responsibilities, requirements, benefits, apply_url,
            posted_date, app_status, notes, is_bookmarked, discovered_at, raw_metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        jid,
        title,
        comp,
        comp_url,
        career_url,
        job_url,
        j.get("department") or "General",
        j.get("location") or "Remote",
        j.get("workplace_type") or j.get("workplace") or "Remote",
        j.get("employment_type") or j.get("jobType") or "Full-time",
        j.get("experience_level") or "Mid-Senior",
        j.get("salary_range") or j.get("salary"),
        j.get("logoUrl") or j.get("company_logo"),
        j.get("contact_email") or j.get("recruiterEmail"),
        json.dumps([j.get("contact_email")] if j.get("contact_email") else []),
        j.get("description") or j.get("about") or "",
        json.dumps(j.get("responsibilities") or []),
        json.dumps(j.get("requirements") or j.get("qualifications") or []),
        json.dumps(j.get("benefits") or []),
        apply_url,
        j.get("postedDate") or "Direct Portal",
        "Discovered",
        "",
        0,
        j.get("discovered_at") or "2026-10-08",
        json.dumps({"country": j.get("country")})
    ))

conn.commit()

# Recompute companies table
cursor.execute("CREATE TABLE IF NOT EXISTS companies (domain TEXT PRIMARY KEY, name TEXT, career_url TEXT, industry TEXT, headquarters TEXT, contact_email TEXT, total_jobs_found INTEGER, last_scraped_at TEXT)")
cursor.execute("DELETE FROM companies")
cursor.execute("""
    INSERT INTO companies (domain, name, career_url, industry, headquarters, contact_email, total_jobs_found, last_scraped_at)
    VALUES 
      ('stripe.com', 'Stripe', 'https://stripe.com/careers/search', 'Fintech & Developer Infrastructure', 'South San Francisco, CA', 'careers@stripe.com', 682, '2026-10-06T00:00:00Z'),
      ('posthog.com', 'PostHog', 'https://posthog.com/careers', 'Developer Analytics & Product OS', 'San Francisco, CA / Remote', 'careers@posthog.com', ?, '2026-10-08T00:00:00Z'),
      ('openai.com', 'OpenAI', 'https://openai.com/careers', 'Artificial Intelligence & Deep Learning', 'San Francisco, CA', 'careers@openai.com', 1, '2026-10-06T00:00:00Z'),
      ('anthropic.com', 'Anthropic', 'https://anthropic.com/careers', 'AI Safety & Foundation Models', 'San Francisco, CA', 'careers@anthropic.com', 1, '2026-10-06T00:00:00Z'),
      ('figma.com', 'Figma', 'https://figma.com/careers', 'Design Tools & Collaboration', 'San Francisco, CA', 'careers@figma.com', 1, '2026-10-06T00:00:00Z'),
      ('vercel.com', 'Vercel', 'https://vercel.com/careers', 'Frontend Cloud & Edge Infrastructure', 'San Francisco, CA', 'jobs@vercel.com', 1, '2026-10-06T00:00:00Z'),
      ('spotify.com', 'Spotify', 'https://spotify.com/jobs', 'Audio Streaming & Recommendation AI', 'Stockholm, Sweden', 'recruitment@spotify.com', 1, '2026-10-06T00:00:00Z')
""", (posthog_count,))
conn.commit()

cursor.execute("SELECT count(*) FROM jobs")
total = cursor.fetchone()[0]
print(f"Total jobs in SQLite db now: {total} (including {posthog_count} PostHog listings)")
conn.close()
