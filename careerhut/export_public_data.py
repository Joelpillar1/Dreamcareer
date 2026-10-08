"""
Export SQLite jobs database to static JSON files in public/data/
for zero-latency CDN hosting on Vercel/Netlify/production.
"""

import sqlite3
import json
import os
import sys

def export_data(db_path='careerhut_jobs.db', output_dir='public/data'):
    if not os.path.exists(db_path):
        print(f"Database {db_path} not found.")
        return

    os.makedirs(output_dir, exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # 1. Total Jobs and Stats
    cursor.execute('SELECT COUNT(*) as total_jobs, COUNT(DISTINCT company) as total_companies FROM jobs')
    stats_row = dict(cursor.fetchone())
    with open(os.path.join(output_dir, 'stats.json'), 'w', encoding='utf-8') as f:
        json.dump(stats_row, f)

    # 2. Companies list with counts
    cursor.execute('SELECT company, COUNT(*) as job_count FROM jobs GROUP BY company ORDER BY job_count DESC')
    companies = [dict(r) for r in cursor.fetchall()]
    with open(os.path.join(output_dir, 'companies.json'), 'w', encoding='utf-8') as f:
        json.dump(companies, f)

    # 3. All Jobs
    cursor.execute('''
        SELECT id, title, company, company_url, career_page_url, job_url, 
               department, location, workplace_type, employment_type, 
               experience_level, salary_range, apply_url, posted_date, 
               discovered_at, contact_email, is_bookmarked, company_logo, 
               responsibilities, requirements, benefits, 
               SUBSTR(description, 1, 1200) as description 
        FROM jobs 
        ORDER BY discovered_at DESC
    ''')
    rows = cursor.fetchall()
    jobs = []
    for r in rows:
        j = dict(r)
        for field in ['responsibilities', 'requirements', 'benefits']:
            val = j.get(field)
            if isinstance(val, str) and val.strip().startswith('['):
                try:
                    j[field] = json.loads(val)
                except Exception:
                    pass
        jobs.append(j)

    jobs_path = os.path.join(output_dir, 'jobs.json')
    with open(jobs_path, 'w', encoding='utf-8') as f:
        json.dump(jobs, f, separators=(',', ':'))

    size_mb = os.path.getsize(jobs_path) / (1024 * 1024)
    print(f"Successfully exported {len(jobs)} jobs across {len(companies)} companies to {output_dir}/")
    print(f"File size: {size_mb:.2f} MB")

if __name__ == '__main__':
    export_data()
