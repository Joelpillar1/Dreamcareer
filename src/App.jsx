import React, { useState, useEffect, useMemo } from 'react';
import DashboardSidebar from './components/DashboardSidebar';
import SearchControlBar from './components/SearchControlBar';
import JobFeedList from './components/JobFeedList';
import JobDetailView from './components/JobDetailView';
import FilterModal from './components/FilterModal';
import LandingPage from './components/LandingPage';
import JobCardGrid from './components/JobCardGrid';
import { DIRECT_CAREER_JOBS } from './data/directJobs';
import { buildLocationLists, jobGeo } from './utils/locations';
import { resolveLogoUrl } from './components/CompanyLogo';

function normalizeCompanyName(name) {
  if (!name) return name;
  const trimmed = String(name).trim();
  if (trimmed.toLowerCase() === 'our team') {
    return 'Okta';
  }
  return trimmed;
}

function computeCompanyLogos(jobList) {
  const map = {};
  for (const j of jobList) {
    const comp = normalizeCompanyName(j.company);
    if (comp && !map[comp]) {
      const logo = resolveLogoUrl(j) || resolveLogoUrl(comp);
      if (logo) {
        map[comp] = logo;
      }
    }
  }
  return map;
}

function computeCompaniesList(jobList) {
  const counts = {};
  for (const j of jobList) {
    const comp = normalizeCompanyName(j.company);
    if (comp) {
      counts[comp] = (counts[comp] || 0) + 1;
    }
  }
  return Object.entries(counts).map(([company, job_count]) => ({
    company,
    job_count
  })).sort((a, b) => b.job_count - a.job_count);
}

export function getJobTimestamp(job) {
  if (!job) return 0;
  const raw = job.discovered_at || job.posted_date || job.postedDate || job.created_at || '';
  if (!raw) return 0;
  const parsed = Date.parse(raw);
  if (!isNaN(parsed)) return parsed;
  return 0;
}

export function mixCompanies(jobList) {
  if (!jobList || jobList.length <= 1) return jobList || [];

  // Group jobs by normalized company name
  const companyMap = new Map();
  for (const job of jobList) {
    if (!job) continue;
    const compName = normalizeCompanyName(job.company) || 'Other';
    const compKey = compName.toLowerCase().trim();
    if (!companyMap.has(compKey)) {
      companyMap.set(compKey, { name: compKey, jobs: [] });
    }
    companyMap.get(compKey).jobs.push(job);
  }

  // Sort each company queue by date (newest first)
  for (const group of companyMap.values()) {
    group.jobs.sort((a, b) => getJobTimestamp(b) - getJobTimestamp(a));
  }

  const activeQueues = Array.from(companyMap.values()).filter(g => g.jobs.length > 0);
  const mixed = [];
  const recentCompanies = [];
  const RECENT_HISTORY_LEN = 3;

  while (activeQueues.length > 0) {
    // Avoid repeating any company selected in the recent sliding window
    const maxRecent = Math.min(RECENT_HISTORY_LEN, activeQueues.length - 1);
    const bannedKeys = new Set(recentCompanies.slice(-maxRecent));

    let bestQueueIndex = -1;
    let bestTime = -Infinity;

    // 1. Pick the company with the latest posted/discovered job that isn't recently picked
    for (let i = 0; i < activeQueues.length; i++) {
      const q = activeQueues[i];
      if (!bannedKeys.has(q.name)) {
        const t = getJobTimestamp(q.jobs[0]);
        if (t > bestTime) {
          bestTime = t;
          bestQueueIndex = i;
        }
      }
    }

    // 2. If all remaining queues were recently picked, relax to exclude only the immediately preceding company
    if (bestQueueIndex === -1) {
      const lastKey = recentCompanies[recentCompanies.length - 1];
      for (let i = 0; i < activeQueues.length; i++) {
        const q = activeQueues[i];
        if (activeQueues.length === 1 || q.name !== lastKey) {
          const t = getJobTimestamp(q.jobs[0]);
          if (t > bestTime) {
            bestTime = t;
            bestQueueIndex = i;
          }
        }
      }
    }

    // 3. Fallback
    if (bestQueueIndex === -1) {
      bestQueueIndex = 0;
    }

    const chosenQueue = activeQueues[bestQueueIndex];
    const chosenJob = chosenQueue.jobs.shift();
    mixed.push(chosenJob);

    recentCompanies.push(chosenQueue.name);
    if (recentCompanies.length > 10) {
      recentCompanies.shift();
    }

    if (chosenQueue.jobs.length === 0) {
      activeQueues.splice(bestQueueIndex, 1);
    }
  }

  return mixed;
}

export default function App() {
  const [currentView, setCurrentView] = useState(() => {
    if (typeof window !== 'undefined' && (window.location.hash === '#dashboard' || window.location.hash === '#jobs')) {
      return 'dashboard';
    }
    return 'landing';
  });

  const [jobs, setJobs] = useState(() => mixCompanies(DIRECT_CAREER_JOBS));
  const [companies, setCompanies] = useState(() => computeCompaniesList(DIRECT_CAREER_JOBS));
  const [companyLogos, setCompanyLogos] = useState(() => computeCompanyLogos(DIRECT_CAREER_JOBS));
  const [selectedJob, setSelectedJob] = useState(DIRECT_CAREER_JOBS[0]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Modals
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  // Filters
  const [keyword, setKeyword] = useState('');
  const [workplace, setWorkplace] = useState('');
  const [location, setLocation] = useState('');
  const [company, setCompany] = useState('');
  const [hasEmail, setHasEmail] = useState(false);
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);
  const [activeTag, setActiveTag] = useState('');
  const [loadError, setLoadError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState({ loaded: 0, total: 0 });

  useEffect(() => {
    loadAllData();
  }, []);

  // Page through the entire dataset. The sidebar lists every company from
  // /api/companies, so the client must hold every job or company filters
  // resolve to zero rows (the older fixed 5,000 cap caused exactly that).
  const JOBS_PAGE_SIZE = 2000;
  const MAX_PARALLEL_PAGES = 4;

  const fetchJobsPage = async (offset, limit) => {
    const res = await fetch(`/api/jobs?limit=${limit}&offset=${offset}`);
    if (!res.ok) throw new Error(`jobs API HTTP ${res.status}`);
    const page = await res.json();
    return Array.isArray(page) ? page : [];
  };

  const fetchAllJobs = async (onProgress) => {
    // /api/stats tells us the row count up front, so every page can be
    // requested concurrently. Blind sequential paging (one round trip at a
    // time) is what made the initial load take minutes on big datasets.
    let total = 0;
    try {
      const statsRes = await fetch('/api/stats');
      if (statsRes.ok) {
        const stats = await statsRes.json();
        total = Number(stats && stats.total_jobs) || 0;
      }
    } catch (e) {
      // stats is only an optimisation; fall back to sequential discovery.
    }

    const seen = new Set();
    const collect = (pages) => {
      const all = [];
      for (const page of pages) {
        for (const j of page) {
          // If a server ignores `offset`, dedupe rather than loop/duplicate.
          if (j && j.id && !seen.has(j.id)) {
            seen.add(j.id);
            if (j.company && j.company.toLowerCase().trim() === 'our team') {
              j.company = 'Okta';
            }
            all.push(j);
          }
        }
      }
      return all;
    };

    if (total > 0) {
      const offsets = [];
      for (let o = 0; o < total; o += JOBS_PAGE_SIZE) offsets.push(o);

      const pages = new Array(offsets.length);
      let nextPage = 0;
      let pagesLoaded = 0;
      const worker = async () => {
        while (nextPage < offsets.length) {
          const i = nextPage;
          nextPage += 1;
          pages[i] = await fetchJobsPage(offsets[i], JOBS_PAGE_SIZE);
          pagesLoaded += 1;
          onProgress({
            loaded: Math.min(pagesLoaded * JOBS_PAGE_SIZE, total),
            total
          });
        }
      };
      await Promise.all(
        Array.from({ length: Math.min(MAX_PARALLEL_PAGES, offsets.length) }, () => worker())
      );
      return collect(pages);
    }

    // Size unknown: page sequentially until a short page comes back.
    const pages = [];
    for (let guard = 0, offset = 0; guard < 1000; guard += 1, offset += JOBS_PAGE_SIZE) {
      const page = await fetchJobsPage(offset, JOBS_PAGE_SIZE);
      pages.push(page);
      if (page.length < JOBS_PAGE_SIZE) break;
      onProgress({ loaded: offset + page.length, total: 0 });
    }
    return collect(pages);
  };

  const loadAllData = async () => {
    setIsLoading(true);
    setLoadProgress({ loaded: 0, total: 0 });
    try {
      let rawJobs = [];
      let compsData = null;

      // 1. Try local/live backend API first (if available)
      try {
        const [apiJobs, compsRes] = await Promise.all([
          fetchAllJobs(setLoadProgress),
          fetch('/api/companies')
        ]);
        if (apiJobs && apiJobs.length > 0) {
          rawJobs = apiJobs;
        }
        if (compsRes && compsRes.ok) {
          compsData = await compsRes.json();
        }
      } catch (apiErr) {
        // Backend API offline (e.g. static hosting on Vercel)
      }

      // 2. If API was unavailable or empty, load full 11,209+ jobs from static JSON /data/jobs.json
      if (!rawJobs || rawJobs.length === 0) {
        try {
          const [staticJobsRes, staticCompsRes] = await Promise.all([
            fetch('/data/jobs.json'),
            fetch('/data/companies.json')
          ]);
          if (staticJobsRes.ok) {
            const staticJobs = await staticJobsRes.json();
            if (Array.isArray(staticJobs) && staticJobs.length > 0) {
              rawJobs = staticJobs;
            }
          }
          if (staticCompsRes && staticCompsRes.ok) {
            compsData = await staticCompsRes.json();
          }
        } catch (staticErr) {
          console.warn('Could not load /data/jobs.json, falling back to direct dataset', staticErr);
        }
      }

      // 3. Fallback to DIRECT_CAREER_JOBS if still empty
      if (!rawJobs || rawJobs.length === 0) {
        rawJobs = DIRECT_CAREER_JOBS;
      }

      // 4. Mix companies and compute indexes
      const mixed = mixCompanies(rawJobs);
      setJobs(mixed);
      setCompanyLogos(computeCompanyLogos(rawJobs));

      if (compsData && compsData.length > 0) {
        const mergedComps = {};
        for (const c of compsData) {
          const normalized = normalizeCompanyName(c.company);
          if (!mergedComps[normalized]) {
            mergedComps[normalized] = { ...c, company: normalized };
          } else {
            mergedComps[normalized].job_count = (mergedComps[normalized].job_count || 0) + (c.job_count || 0);
          }
        }
        setCompanies(Object.values(mergedComps).sort((a, b) => (b.job_count || 0) - (a.job_count || 0)));
      } else {
        setCompanies(computeCompaniesList(rawJobs));
      }

      setLoadError(null);
      if (!selectedJob && mixed.length > 0) {
        setSelectedJob(mixed[0]);
      }
    } catch (err) {
      console.warn('Careerhut data load fallback:', err);
      const directMixed = mixCompanies(DIRECT_CAREER_JOBS);
      setJobs(directMixed);
      setCompanies(computeCompaniesList(DIRECT_CAREER_JOBS));
      setCompanyLogos(computeCompanyLogos(DIRECT_CAREER_JOBS));
      if (!selectedJob) setSelectedJob(directMixed[0]);
      setLoadError(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchOrCrawl = async () => {
    // If the keyword looks like a URL (e.g., stripe.com/jobs, openai.com/careers)
    if (keyword.includes('.') && (keyword.includes('/') || keyword.includes('http') || keyword.includes('.com') || keyword.includes('.io') || keyword.includes('.ai'))) {
      setIsSearching(true);
      try {
        const res = await fetch('/api/fetch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company_url: keyword.trim(),
            max_jobs: 500,
            use_browser: true
          })
        });
        const data = await res.json();
        if (res.ok && data.status !== 'error') {
          await loadAllData();
          if (data.jobs && data.jobs.length > 0) {
            setSelectedJob(data.jobs[0]);
          }
        } else {
          alert(`Portal note: ${data.error_message || 'Could not extract positions from this URL.'}`);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearching(false);
      }
    }
  };

  const handleToggleBookmark = async (jobId) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;

    const updated = !job.is_bookmarked;
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, is_bookmarked: updated } : j))
    );
    if (selectedJob && selectedJob.id === jobId) {
      setSelectedJob((prev) => ({ ...prev, is_bookmarked: updated }));
    }

    try {
      await fetch(`/api/jobs/${jobId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_bookmarked: updated })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleChangeStatus = async (jobId, newStatus) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, app_status: newStatus } : j))
    );
    if (selectedJob && selectedJob.id === jobId) {
      setSelectedJob((prev) => ({ ...prev, app_status: newStatus }));
    }

    try {
      await fetch(`/api/jobs/${jobId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetFilters = () => {
    setKeyword('');
    setWorkplace('');
    setLocation('');
    setCompany('');
    setHasEmail(false);
    setOnlyBookmarked(false);
    setActiveTag('');
    setFilterModalOpen(false);
  };

  const handleExploreJobs = (searchQuery = '') => {
    if (searchQuery) {
      if (searchQuery.toLowerCase() === 'remote') {
        setWorkplace('Remote');
        setKeyword('');
      } else {
        setKeyword(searchQuery);
      }
    }
    setCurrentView('dashboard');
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', '#jobs');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCrawlFromLanding = async (url) => {
    setCurrentView('dashboard');
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', '#jobs');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setKeyword(url);
    setIsSearching(true);
    try {
      const res = await fetch('/api/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_url: url.trim(),
          max_jobs: 500,
          use_browser: true
        })
      });
      const data = await res.json();
      if (res.ok && data.status !== 'error') {
        await loadAllData();
        if (data.jobs && data.jobs.length > 0) {
          setSelectedJob(data.jobs[0]);
        }
      } else {
        alert(`Portal note: ${data.error_message || 'Could not extract positions from this URL.'}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleGoToLanding = () => {
    setCurrentView('landing');
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', '#');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Filtered Jobs
  // Free-form location strings ("San Francisco, CA | New York City, NY",
  // "Remote - India") are resolved to canonical countries/regions once per
  // job, so the sidebar can list every country that actually has roles and
  // the location filter can match on them (a plain substring test on
  // job.location misses "San Francisco, CA" when the filter says "United States").
  const locationIndex = useMemo(() => {
    const index = new Map();
    for (const job of jobs) {
      const { countries, regions } = jobGeo(job.location, job.country);
      index.set(job, { countries: countries.map((c) => c.toLowerCase()), regions });
    }
    return index;
  }, [jobs]);

  const locationLists = useMemo(() => buildLocationLists(jobs), [jobs]);

  const filteredJobs = useMemo(() => {
    const searchTarget = (keyword || activeTag).toLowerCase().trim();
    const locationTarget = (location || '').toLowerCase().trim();

    return jobs.filter((job) => {
      const titleStr = (job.title || job.role || '').toLowerCase();
      const descStr = (job.description || job.about || '').toLowerCase();
      const deptStr = (job.department || '').toLowerCase();
      const countryStr = (job.country || '').toLowerCase();
      const locStr = (job.location || '').toLowerCase();
      const compStr = (job.company || '').toLowerCase();
      const geo = locationIndex.get(job);

      const matchSearch = !searchTarget ||
        titleStr.includes(searchTarget) ||
        descStr.includes(searchTarget) ||
        deptStr.includes(searchTarget) ||
        countryStr.includes(searchTarget) ||
        (geo && geo.countries.includes(searchTarget)) ||
        locStr.includes(searchTarget) ||
        compStr.includes(searchTarget);

      const wp = (job.workplace_type || job.workplace || '').toLowerCase();
      const matchWorkplace = !workplace || wp.includes(workplace.toLowerCase());
      const matchLocation = !locationTarget ||
        (geo && (geo.countries.includes(locationTarget) || geo.regions.includes(locationTarget))) ||
        locStr.includes(locationTarget) ||
        countryStr.includes(locationTarget);
      const matchCompany = !company || job.company === company;
      const email = job.contact_email || job.recruiterEmail;
      const matchEmail = !hasEmail || (email && email.length > 0);
      const matchBookmark = !onlyBookmarked || job.is_bookmarked;

      return matchSearch && matchWorkplace && matchLocation && matchCompany && matchEmail && matchBookmark;
    });

    if (company) {
      return [...filtered].sort((a, b) => getJobTimestamp(b) - getJobTimestamp(a));
    }

    return mixCompanies(filtered);
  }, [jobs, keyword, activeTag, workplace, location, locationIndex, company, hasEmail, onlyBookmarked]);

  const bookmarkedCount = jobs.filter((j) => j.is_bookmarked).length;

  if (currentView === 'landing') {
    return (
      <LandingPage 
        onExploreJobs={handleExploreJobs}
        onCrawlUrl={handleCrawlFromLanding}
        totalJobsCount={jobs.length}
        onSelectCompany={(comp) => {
          setCompany(comp);
          handleExploreJobs();
        }}
        onSelectTag={(tag) => {
          setActiveTag(tag);
          handleExploreJobs();
        }}
      />
    );
  }

  return (
    <div style={{
      display: 'flex',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      background: 'var(--bg-app)'
    }}>
      {/* Left Docked Sidebar */}
      <DashboardSidebar 
        totalJobsCount={jobs.length}
        bookmarkedCount={bookmarkedCount}
        companies={companies}
        companyLogos={companyLogos}
        selectedCompany={company}
        onSelectCompany={setCompany}
        selectedWorkplace={workplace}
        onSelectWorkplace={setWorkplace}
        selectedLocation={location}
        onSelectLocation={setLocation}
        countries={locationLists.countries}
        regions={locationLists.regions}
        hasEmailOnly={hasEmail}
        onToggleHasEmail={setHasEmail}
        onlyBookmarked={onlyBookmarked}
        onToggleBookmarked={setOnlyBookmarked}
        onResetFilters={handleResetFilters}
        onGoToLanding={handleGoToLanding}
      />

      {/* Main Content Pane */}
      <main style={{
        flex: 1,
        minWidth: 0,
        height: '100vh',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 28px 40px',
        gap: '16px'
      }}      >
        {/* Top-of-page loading state while the jobs dataset streams in */}
        {isLoading && (
          <div
            role="status"
            aria-live="polite"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'var(--primary-light)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              flexShrink: 0
            }}
          >
            <span className="spinner-loading" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--primary-text)',
                marginBottom: loadProgress.total ? '6px' : 0
              }}>
                Loading jobs…
                {loadProgress.total > 0 && (
                  <span style={{ fontWeight: 600, opacity: 0.8 }}>
                    {' '}({Math.min(loadProgress.loaded, loadProgress.total).toLocaleString()} of {loadProgress.total.toLocaleString()})
                  </span>
                )}
              </div>
              {loadProgress.total > 0 && (
                <div style={{
                  height: '5px',
                  background: 'rgba(120, 1, 21, 0.12)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(100, Math.round((loadProgress.loaded / loadProgress.total) * 100))}%`,
                    background: 'linear-gradient(90deg, #780115, #F7B638)',
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 0.2s ease'
                  }} />
                </div>
              )}
            </div>
          </div>
        )}

        {loadError && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            fontSize: '0.84rem',
            fontWeight: 600
          }}>
            Could not load jobs from the API ({loadError}). Showing built-in sample data. Start the backend with `python main.py` and reload.
          </div>
        )}

        {/* Main Search & Control Bar */}
        <SearchControlBar 
          keyword={keyword}
          onKeywordChange={setKeyword}
          workplace={workplace}
          onWorkplaceChange={setWorkplace}
          location={location}
          onLocationChange={setLocation}
          onSearchOrCrawl={handleSearchOrCrawl}
          isSearching={isSearching}
          activeTag={activeTag}
          onSelectTag={setActiveTag}
        />

        {/* Main Job Cards Grid */}
        <JobCardGrid 
          jobs={filteredJobs}
          onToggleBookmark={handleToggleBookmark}
          onSelectJob={setSelectedJob}
          onOpenFilterModal={() => setFilterModalOpen(true)}
        />
      </main>

      {/* Filter Modal */}
      <FilterModal 
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        companies={companies}
        selectedCompany={company}
        onSelectCompany={setCompany}
        selectedWorkplace={workplace}
        onSelectWorkplace={setWorkplace}
        hasEmailOnly={hasEmail}
        onToggleHasEmail={setHasEmail}
        onReset={handleResetFilters}
      />
    </div>
  );
}
