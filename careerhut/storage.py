"""
Careerhut Storage - Persistent SQLite database and JSON/CSV export for company job postings.
Includes application lifecycle tracking (Discovered, Saved, Applied, Interviewing, Offered),
bookmarks, recruiter contact emails, and personal notes.
"""

import sqlite3
import json
import csv
import io
from pathlib import Path
from typing import List, Optional, Dict, Any
from .models import JobListing, CompanyProfile


class JobStorage:
    def __init__(self, db_path: Optional[str] = None):
        if db_path is None:
            base_dir = Path(__file__).resolve().parent.parent
            self.db_path = str(base_dir / "careerhut_jobs.db")
        else:
            self.db_path = db_path
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        # Generous busy timeout so concurrent/batch writers wait instead of
        # failing with "database is locked" and silently dropping jobs.
        conn = sqlite3.connect(self.db_path, timeout=30.0)
        conn.row_factory = sqlite3.Row
        try:
            conn.execute("PRAGMA busy_timeout = 30000")
            conn.execute("PRAGMA journal_mode = WAL")
        except Exception:
            pass
        return conn

    def _init_db(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()
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
                    discovered_at TEXT NOT NULL,
                    raw_metadata TEXT
                )
            """)

            # Migration: ensure all columns exist
            cursor.execute("PRAGMA table_info(jobs)")
            cols = [info["name"] for info in cursor.fetchall()]
            if "contact_email" not in cols:
                cursor.execute("ALTER TABLE jobs ADD COLUMN contact_email TEXT")
            if "hiring_team_emails" not in cols:
                cursor.execute("ALTER TABLE jobs ADD COLUMN hiring_team_emails TEXT")
            if "app_status" not in cols:
                cursor.execute("ALTER TABLE jobs ADD COLUMN app_status TEXT DEFAULT 'Discovered'")
            if "notes" not in cols:
                cursor.execute("ALTER TABLE jobs ADD COLUMN notes TEXT DEFAULT ''")
            if "is_bookmarked" not in cols:
                cursor.execute("ALTER TABLE jobs ADD COLUMN is_bookmarked INTEGER DEFAULT 0")
            if "company_logo" not in cols:
                cursor.execute("ALTER TABLE jobs ADD COLUMN company_logo TEXT")

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS companies (
                    domain TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    career_url TEXT NOT NULL,
                    industry TEXT,
                    headquarters TEXT,
                    contact_email TEXT,
                    total_jobs_found INTEGER DEFAULT 0,
                    last_scraped_at TEXT
                )
            """)
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs (company)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs (location)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_jobs_title ON jobs (title)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_jobs_email ON jobs (contact_email)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs (app_status)")
            conn.commit()

    def save_job(self, job: JobListing) -> bool:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            try:
                cursor.execute("""
                    INSERT INTO jobs (
                        id, title, company, company_url, career_page_url, job_url,
                        department, location, workplace_type, employment_type,
                        experience_level, salary_range, company_logo, contact_email, hiring_team_emails,
                        description, responsibilities, requirements, benefits, apply_url,
                        posted_date, app_status, notes, is_bookmarked, discovered_at, raw_metadata
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(job_url) DO UPDATE SET
                        title = excluded.title,
                        company = excluded.company,
                        department = excluded.department,
                        location = excluded.location,
                        workplace_type = excluded.workplace_type,
                        employment_type = excluded.employment_type,
                        experience_level = excluded.experience_level,
                        salary_range = excluded.salary_range,
                        company_logo = COALESCE(excluded.company_logo, jobs.company_logo),
                        contact_email = COALESCE(excluded.contact_email, jobs.contact_email),
                        hiring_team_emails = COALESCE(excluded.hiring_team_emails, jobs.hiring_team_emails),
                        description = excluded.description,
                        responsibilities = excluded.responsibilities,
                        requirements = excluded.requirements,
                        benefits = excluded.benefits,
                        apply_url = excluded.apply_url,
                        posted_date = excluded.posted_date,
                        discovered_at = excluded.discovered_at,
                        raw_metadata = excluded.raw_metadata
                """, (
                    job.id, job.title, job.company, job.company_url, job.career_page_url, job.job_url,
                    job.department, job.location, job.workplace_type, job.employment_type,
                    job.experience_level, job.salary_range, job.company_logo, job.contact_email,
                    json.dumps(job.hiring_team_emails), job.description,
                    json.dumps(job.responsibilities), json.dumps(job.requirements),
                    json.dumps(job.benefits), job.apply_url, job.posted_date,
                    job.app_status, job.notes, 1 if job.is_bookmarked else 0,
                    job.discovered_at, json.dumps(job.raw_metadata)
                ))
                conn.commit()
                return True
            except Exception as e:
                print(f"Error saving job {job.job_url}: {e}")
                return False

    def save_jobs(self, jobs: List[JobListing]) -> int:
        saved_count = 0
        for job in jobs:
            if self.save_job(job):
                saved_count += 1
        return saved_count

    def update_job_enrichment(
        self,
        job_url: str,
        description: Optional[str] = None,
        contact_email: Optional[str] = None,
        hiring_team_emails: Optional[List[str]] = None,
        apply_url: Optional[str] = None,
        company_logo: Optional[str] = None,
        job_url_new: Optional[str] = None,
        title: Optional[str] = None,
        location: Optional[str] = None,
        department: Optional[str] = None,
        employment_type: Optional[str] = None,
    ) -> bool:
        """Update enriched detail fields on an existing job row (matched by job_url)."""
        sets = []
        params: List[Any] = []
        if description:
            sets.append("description = ?")
            params.append(description)
        if contact_email:
            sets.append("contact_email = ?")
            params.append(contact_email)
        if hiring_team_emails:
            sets.append("hiring_team_emails = ?")
            params.append(json.dumps(hiring_team_emails))
        if apply_url:
            sets.append("apply_url = ?")
            params.append(apply_url)
        if company_logo:
            sets.append("company_logo = ?")
            params.append(company_logo)
        if job_url_new:
            sets.append("job_url = ?")
            params.append(job_url_new)
        if title:
            sets.append("title = ?")
            params.append(title)
        if location:
            sets.append("location = ?")
            params.append(location)
        if department:
            sets.append("department = ?")
            params.append(department)
        if employment_type:
            sets.append("employment_type = ?")
            params.append(employment_type)
        if not sets:
            return False
        params.append(job_url)
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(f"UPDATE jobs SET {', '.join(sets)} WHERE job_url = ?", params)
            conn.commit()
            return cursor.rowcount > 0

    def update_company_logo(self, company: str, logo_url: str, overwrite: bool = False) -> int:
        condition = "" if overwrite else " AND (company_logo IS NULL OR company_logo = '')"
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                f"UPDATE jobs SET company_logo = ? WHERE company = ?{condition}",
                (logo_url, company),
            )
            conn.commit()
            return cursor.rowcount

    def clear_company_logos(self) -> int:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE jobs SET company_logo = NULL")
            conn.commit()
            return cursor.rowcount

    def get_job_urls_for_enrichment(
        self,
        only_thin: bool = True,
        limit: int = 100000,
        company: Optional[str] = None,
        job_urls: Optional[List[str]] = None,
    ) -> List[Dict[str, Any]]:
        """Return jobs that most need an individual-page pass."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            query = (
                "SELECT id, title, company, company_url, career_page_url, job_url, "
                "description, contact_email, apply_url FROM jobs WHERE 1=1"
            )
            params: List[Any] = []
            if only_thin:
                query += " AND (length(COALESCE(description,'')) < 600 OR job_url = career_page_url OR contact_email IS NULL OR contact_email = '')"
            if company:
                query += " AND company = ?"
                params.append(company)
            if job_urls is not None:
                if not job_urls:
                    return []
                query += f" AND job_url IN ({','.join('?' for _ in job_urls)})"
                params.extend(job_urls)
            query += " ORDER BY length(COALESCE(description,'')) ASC LIMIT ?"
            params.append(limit)
            cursor.execute(query, params)
            return [dict(row) for row in cursor.fetchall()]

    def purge_company_rows(self, names: Optional[List[str]] = None, hosts: Optional[List[str]] = None) -> int:
        """Delete a company's rows before a clean re-crawl.

        Matches on the employer display name *and* on the career-page host, so
        stale rows filed under a bad name ("Mongodb", "Crowdstrike") are cleared
        together with the current ones.
        """
        names = [n for n in (names or []) if n]
        hosts = [h for h in (hosts or []) if h]
        if not names and not hosts:
            return 0
        deleted = 0
        with self._get_connection() as conn:
            cursor = conn.cursor()
            for name in names:
                # Case-insensitive: "Crowdstrike" (older run) and "CrowdStrike"
                # are the same employer and must both go.
                cursor.execute("DELETE FROM jobs WHERE company COLLATE NOCASE = ?", (name,))
                deleted += cursor.rowcount
            for host in hosts:
                cursor.execute(
                    "DELETE FROM jobs WHERE career_page_url LIKE ? OR job_url LIKE ? OR company_url LIKE ?",
                    (f"%{host}%", f"%{host}%", f"%{host}%"),
                )
                deleted += cursor.rowcount
            conn.commit()
        return deleted

    def get_jobs_with_escaped_html(self, limit: int = 100000) -> List[Dict[str, Any]]:
        """Rows whose text still carries HTML entities (stale pre-unescape writes)."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT job_url, title, description FROM jobs "
                "WHERE description LIKE '%&lt;%' OR description LIKE '%&amp;%' OR description LIKE '%&#%' "
                "OR title LIKE '%&lt;%' OR title LIKE '%&amp;%' OR title LIKE '%&#%' LIMIT ?",
                (limit,),
            )
            return [dict(row) for row in cursor.fetchall()]

    def update_job_text(self, job_url: str, title: Optional[str] = None, description: Optional[str] = None) -> bool:
        sets = []
        params: List[Any] = []
        if title is not None:
            sets.append("title = ?")
            params.append(title)
        if description is not None:
            sets.append("description = ?")
            params.append(description)
        if not sets:
            return False
        params.append(job_url)
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(f"UPDATE jobs SET {', '.join(sets)} WHERE job_url = ?", params)
            conn.commit()
            return cursor.rowcount > 0

    def delete_jobs_by_company(self, company: str) -> int:
        """Remove all rows for a company (used to purge bad-URL rows before a re-crawl)."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM jobs WHERE company = ?", (company,))
            conn.commit()
            return cursor.rowcount

    def get_companies_by_source(self, source: str) -> List[str]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT DISTINCT company FROM jobs WHERE raw_metadata LIKE ?", (f'%"source": "{source}"%',)
            )
            return [row[0] for row in cursor.fetchall()]

    def get_jobs_missing_email(self, limit: int = 100000) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT job_url, company, company_url, career_page_url FROM jobs "
                "WHERE contact_email IS NULL OR contact_email = '' LIMIT ?",
                (limit,),
            )
            return [dict(row) for row in cursor.fetchall()]

    def update_job_status(self, job_id: str, status: str, notes: Optional[str] = None, is_bookmarked: Optional[bool] = None) -> bool:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            updates = []
            params = []
            if status is not None:
                updates.append("app_status = ?")
                params.append(status)
            if notes is not None:
                updates.append("notes = ?")
                params.append(notes)
            if is_bookmarked is not None:
                updates.append("is_bookmarked = ?")
                params.append(1 if is_bookmarked else 0)
            
            if not updates:
                return True
            
            params.append(job_id)
            query = f"UPDATE jobs SET {', '.join(updates)} WHERE id = ?"
            cursor.execute(query, params)
            conn.commit()
            return cursor.rowcount > 0

    def get_jobs(
        self,
        company: Optional[str] = None,
        search_query: Optional[str] = None,
        location: Optional[str] = None,
        workplace_type: Optional[str] = None,
        app_status: Optional[str] = None,
        only_bookmarked: bool = False,
        limit: int = 200,
        offset: int = 0
    ) -> List[JobListing]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            query = "SELECT * FROM jobs WHERE 1=1"
            params: List[Any] = []

            if company:
                query += " AND company LIKE ?"
                params.append(f"%{company}%")
            if location:
                query += " AND location LIKE ?"
                params.append(f"%{location}%")
            if workplace_type and workplace_type.lower() != "all":
                query += " AND workplace_type = ?"
                params.append(workplace_type)
            if app_status and app_status.lower() != "all":
                query += " AND app_status = ?"
                params.append(app_status)
            if only_bookmarked:
                query += " AND is_bookmarked = 1"
            if search_query:
                query += " AND (title LIKE ? OR description LIKE ? OR department LIKE ? OR contact_email LIKE ?)"
                search_param = f"%{search_query}%"
                params.extend([search_param, search_param, search_param, search_param])

            # Prioritize genuine ISO posted_date over fallback discovered_at, filtering out non-date labels
            query += """ ORDER BY 
                CASE 
                    WHEN posted_date GLOB '[0-9][0-9][0-9][0-9]*' THEN posted_date 
                    ELSE '1970-01-01' 
                END DESC,
                discovered_at DESC, id ASC LIMIT ? OFFSET ?"""
            params.extend([limit, offset])



            cursor.execute(query, params)
            rows = cursor.fetchall()
            results = []
            for row in rows:
                results.append(JobListing(
                    id=row["id"],
                    title=row["title"],
                    company=row["company"],
                    company_url=row["company_url"],
                    career_page_url=row["career_page_url"],
                    job_url=row["job_url"],
                    department=row["department"],
                    location=row["location"],
                    workplace_type=row["workplace_type"],
                    employment_type=row["employment_type"],
                    experience_level=row["experience_level"],
                    salary_range=row["salary_range"],
                    company_logo=row["company_logo"],
                    contact_email=row["contact_email"],
                    hiring_team_emails=json.loads(row["hiring_team_emails"]) if row["hiring_team_emails"] else [],
                    description=row["description"],
                    responsibilities=json.loads(row["responsibilities"]) if row["responsibilities"] else [],
                    requirements=json.loads(row["requirements"]) if row["requirements"] else [],
                    benefits=json.loads(row["benefits"]) if row["benefits"] else [],
                    apply_url=row["apply_url"],
                    posted_date=row["posted_date"],
                    app_status=row["app_status"] or "Discovered",
                    notes=row["notes"] or "",
                    is_bookmarked=bool(row["is_bookmarked"]),
                    discovered_at=row["discovered_at"],
                    raw_metadata=json.loads(row["raw_metadata"]) if row["raw_metadata"] else {}
                ))
            return results

    def get_companies(self) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT company, COUNT(*) as job_count, MAX(discovered_at) as last_seen, 
                       MAX(career_page_url) as career_page_url, MAX(contact_email) as contact_email
                FROM jobs
                GROUP BY company
                ORDER BY job_count DESC
            """)
            return [dict(row) for row in cursor.fetchall()]

    def get_stats(self) -> Dict[str, Any]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) as total_jobs FROM jobs")
            total_jobs = cursor.fetchone()["total_jobs"]

            cursor.execute("SELECT COUNT(DISTINCT company) as total_companies FROM jobs")
            total_companies = cursor.fetchone()["total_companies"]

            cursor.execute("SELECT COUNT(*) as total_with_emails FROM jobs WHERE contact_email IS NOT NULL AND contact_email != ''")
            total_with_emails = cursor.fetchone()["total_with_emails"]

            cursor.execute("SELECT COUNT(*) as bookmarked_count FROM jobs WHERE is_bookmarked = 1")
            bookmarked_count = cursor.fetchone()["bookmarked_count"]

            cursor.execute("SELECT workplace_type, COUNT(*) as count FROM jobs GROUP BY workplace_type")
            workplace_counts = {row["workplace_type"]: row["count"] for row in cursor.fetchall()}

            cursor.execute("SELECT app_status, COUNT(*) as count FROM jobs GROUP BY app_status")
            status_counts = {row["app_status"]: row["count"] for row in cursor.fetchall()}

            return {
                "total_jobs": total_jobs,
                "total_companies": total_companies,
                "total_with_emails": total_with_emails,
                "bookmarked_count": bookmarked_count,
                "workplace_breakdown": workplace_counts,
                "status_breakdown": status_counts
            }

    def export_csv(self) -> str:
        jobs = self.get_jobs(limit=10000)
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "Title", "Company", "Department", "Location", "Workplace Type",
            "Employment Type", "Contact Email", "Salary Range", "Status", "Bookmarked",
            "Job URL", "Apply URL", "Career Page URL", "Discovered At"
        ])
        for job in jobs:
            writer.writerow([
                job.title, job.company, job.department, job.location,
                job.workplace_type, job.employment_type, job.contact_email or "N/A",
                job.salary_range or "N/A", job.app_status, "Yes" if job.is_bookmarked else "No",
                job.job_url, job.apply_url or job.job_url,
                job.career_page_url, job.discovered_at
            ])
        return output.getvalue()
