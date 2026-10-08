"""
Careerhut - Direct Company Career Page Job Fetcher & Engine
Standard Library Dataclasses Data Models (100% compatible across all Python versions)
"""

from dataclasses import dataclass, field, asdict
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid


@dataclass
class JobListing:
    title: str
    company: str
    career_page_url: str
    job_url: str
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    company_url: Optional[str] = None
    department: Optional[str] = "General"
    location: str = "Not specified"
    workplace_type: str = "Unspecified"  # Remote, Hybrid, On-site
    employment_type: str = "Full-time"  # Full-time, Part-time, Contract, Internship
    experience_level: Optional[str] = "Not specified"
    salary_range: Optional[str] = None
    company_logo: Optional[str] = None
    description: Optional[str] = ""
    responsibilities: List[str] = field(default_factory=list)
    requirements: List[str] = field(default_factory=list)
    benefits: List[str] = field(default_factory=list)
    contact_email: Optional[str] = None
    hiring_team_emails: List[str] = field(default_factory=list)
    apply_url: Optional[str] = None
    posted_date: Optional[str] = None
    app_status: str = "Discovered"  # Discovered, Saved, Applied, Interviewing, Offered, Archived
    notes: str = ""
    is_bookmarked: bool = False
    discovered_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    raw_metadata: Dict[str, Any] = field(default_factory=dict)

    def dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class CompanyProfile:
    name: str
    domain: str
    career_url: str
    industry: Optional[str] = None
    headquarters: Optional[str] = None
    total_jobs_found: int = 0
    last_scraped_at: Optional[str] = None

    def dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class ScrapeRequest:
    company_url: str
    max_jobs: int = 50
    deep_scrape: bool = True
    use_browser: bool = True

    def dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class ScrapeResult:
    company_name: str
    career_url: str
    jobs_count: int
    jobs: List[JobListing]
    duration_seconds: float
    status: str = "success"  # success, partial, error
    error_message: Optional[str] = None

    def dict(self) -> Dict[str, Any]:
        return asdict(self)
