const fs = require('fs');

// Read directJobs.js by extracting the JSON
const directJobsContent = fs.readFileSync('src/data/directJobs.js', 'utf8');
const jsonMatch = directJobsContent.match(/export const DIRECT_CAREER_JOBS = (\[[\s\S]*\]);/);
if (!jsonMatch) {
  console.error('Could not find DIRECT_CAREER_JOBS in src/data/directJobs.js');
  process.exit(1);
}

const jobs = JSON.parse(jsonMatch[1]);
console.log(`Loaded ${jobs.length} jobs from directJobs.js`);

const pythonScript = `
import json
import sqlite3
from pathlib import Path

db_path = Path("careerhut_jobs.db")
conn = sqlite3.connect(str(db_path))
cursor = conn.cursor()

with open("careerhut/all_jobs_temp.json", "r", encoding="utf-8") as f:
    jobs = json.load(f)

print(f"Syncing {len(jobs)} jobs to sqlite database {db_path}...")

# Clear old jobs to replace with full official index
cursor.execute("DELETE FROM jobs")

for j in jobs:
    cursor.execute("""
        INSERT OR REPLACE INTO jobs (
            id, title, company, company_url, career_page_url, job_url,
            department, location, workplace_type, employment_type,
            experience_level, salary_range, contact_email, hiring_team_emails,
            description, responsibilities, requirements, benefits, apply_url,
            posted_date, app_status, notes, is_bookmarked, discovered_at, raw_metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        j.get("id"),
        j.get("title") or j.get("role"),
        j.get("company"),
        j.get("companyPortalUrl") or "https://stripe.com",
        j.get("companyPortalUrl") or "https://stripe.com/careers/search",
        j.get("job_url") or j.get("applyUrl"),
        j.get("department"),
        j.get("location"),
        j.get("workplace_type") or j.get("workplace"),
        j.get("employment_type") or "Full-time",
        j.get("experience_level") or "Mid-Senior",
        j.get("salary_range") or j.get("salary"),
        j.get("contact_email") or j.get("recruiterEmail"),
        json.dumps([j.get("contact_email")] if j.get("contact_email") else []),
        j.get("description") or j.get("about"),
        json.dumps(j.get("responsibilities") or []),
        json.dumps(j.get("requirements") or j.get("qualifications") or []),
        json.dumps(j.get("benefits") or []),
        j.get("applyUrl") or j.get("job_url"),
        j.get("postedDate") or "Direct Portal",
        "Discovered",
        "",
        0,
        "2026-10-06T00:00:00Z",
        json.dumps({"country": j.get("country")})
    ))

conn.commit()

# Recompute companies table
cursor.execute("DELETE FROM companies")
cursor.execute("""
    INSERT INTO companies (domain, name, career_url, industry, headquarters, contact_email, total_jobs_found, last_scraped_at)
    VALUES 
      ('stripe.com', 'Stripe', 'https://stripe.com/careers/search', 'Fintech & Developer Infrastructure', 'South San Francisco, CA', 'careers@stripe.com', 682, '2026-10-06T00:00:00Z'),
      ('openai.com', 'OpenAI', 'https://openai.com/careers', 'Artificial Intelligence & Deep Learning', 'San Francisco, CA', 'recruiting@openai.com', 1, '2026-10-06T00:00:00Z'),
      ('anthropic.com', 'Anthropic', 'https://anthropic.com/careers', 'AI Safety & Foundation Models', 'San Francisco, CA', 'careers@anthropic.com', 1, '2026-10-06T00:00:00Z'),
      ('figma.com', 'Figma', 'https://figma.com/careers', 'Design Tools & Collaboration', 'San Francisco, CA', 'talent@figma.com', 1, '2026-10-06T00:00:00Z'),
      ('vercel.com', 'Vercel', 'https://vercel.com/careers', 'Frontend Cloud & Edge Infrastructure', 'San Francisco, CA', 'jobs@vercel.com', 1, '2026-10-06T00:00:00Z'),
      ('spotify.com', 'Spotify', 'https://spotify.com/jobs', 'Audio Streaming & Recommendation AI', 'Stockholm, Sweden', 'recruitment@spotify.com', 1, '2026-10-06T00:00:00Z')
""")
conn.commit()

cursor.execute("SELECT count(*) FROM jobs")
total = cursor.fetchone()[0]
print(f"Total jobs in SQLite db now: {total}")
conn.close()
`;

fs.writeFileSync('careerhut/all_jobs_temp.json', JSON.stringify(jobs, null, 2));
fs.writeFileSync('careerhut/sync_to_db.py', pythonScript, 'utf8');
console.log('Prepared sync_to_db.py and all_jobs_temp.json');
