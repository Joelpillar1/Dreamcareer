import React, { useState, useEffect, useMemo } from 'react';
import DashboardSidebar from './components/DashboardSidebar';
import SearchControlBar from './components/SearchControlBar';
import JobFeedList from './components/JobFeedList';
import JobDetailView from './components/JobDetailView';
import FilterModal from './components/FilterModal';
import LandingPage from './components/LandingPage';
import JobCardGrid from './components/JobCardGrid';
import LegalPage from './components/LegalPage';
import AuthModal from './components/AuthModal';
import OnboardingFlow from './components/OnboardingFlow';
import { getStoredUser, signOutUser, isUserSubscribed, formatSupabaseUser, saveUser } from './utils/auth';
import { supabase } from './config/supabase';
import { DIRECT_CAREER_JOBS } from './data/directJobs';
import { buildLocationLists, jobGeo } from './utils/locations';
import { resolveLogoUrl } from './components/CompanyLogo';
import { Menu, Bookmark } from 'lucide-react';

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
  const raw = job.posted_date || job.postedDate || job.date_posted || job.created_at || job.discovered_at || '';
  if (!raw) return 0;
  const parsed = Date.parse(raw);
  if (!isNaN(parsed)) return parsed;
  return 0;
}

export function mixCompanies(jobList) {
  if (!jobList || jobList.length <= 1) return jobList || [];

  // Group jobs by normalized company name and cache timestamp once per job
  const companyMap = new Map();
  for (let i = 0; i < jobList.length; i++) {
    const job = jobList[i];
    if (!job) continue;
    const compName = normalizeCompanyName(job.company) || 'Other';
    const compKey = compName.toLowerCase().trim();
    let group = companyMap.get(compKey);
    if (!group) {
      group = { name: compKey, jobs: [], head: 0 };
      companyMap.set(compKey, group);
    }
    if (job._ts === undefined) {
      job._ts = getJobTimestamp(job);
    }
    group.jobs.push(job);
  }

  // Sort each company queue by date (newest first)
  for (const group of companyMap.values()) {
    group.jobs.sort((a, b) => b._ts - a._ts);
  }

  const activeQueues = Array.from(companyMap.values());
  // Sort company queues so companies with the most recent postings come first
  activeQueues.sort((a, b) => (b.jobs[0]?._ts || 0) - (a.jobs[0]?._ts || 0));

  let maxQueueLen = 0;
  for (let i = 0; i < activeQueues.length; i++) {
    if (activeQueues[i].jobs.length > maxQueueLen) {
      maxQueueLen = activeQueues[i].jobs.length;
    }
  }

  const mixed = [];
  // High-performance O(N) round-robin interleaving
  for (let step = 0; step < maxQueueLen; step++) {
    for (let q = 0; q < activeQueues.length; q++) {
      const group = activeQueues[q];
      if (group.head < group.jobs.length) {
        mixed.push(group.jobs[group.head++]);
      }
    }
  }

  return mixed;
}

function resolveViewFromUrl() {
  if (typeof window === 'undefined') return 'landing';
  const hash = (window.location.hash || '').toLowerCase();
  const pathname = (window.location.pathname || '').toLowerCase();

  if (pathname === '/privacy' || pathname === '/privacy.html' || hash === '#privacy') return 'privacy';
  if (pathname === '/terms' || pathname === '/terms.html' || hash === '#terms') return 'terms';
  if (pathname === '/refund' || pathname === '/refund.html' || hash === '#refund') return 'refund';
  if (pathname === '/onboarding' || pathname === '/onboarding.html' || hash === '#onboarding') return 'onboarding';
  if (pathname === '/dashboard' || pathname === '/jobs' || hash === '#dashboard' || hash === '#jobs') {
    return 'dashboard';
  }
  return 'landing';
}

export default function App() {
  const [currentView, setCurrentView] = useState(() => resolveViewFromUrl());

  const [jobs, setJobs] = useState(() => mixCompanies(DIRECT_CAREER_JOBS));
  const [companies, setCompanies] = useState(() => computeCompaniesList(DIRECT_CAREER_JOBS));
  const [companyLogos, setCompanyLogos] = useState(() => computeCompanyLogos(DIRECT_CAREER_JOBS));
  const [selectedJob, setSelectedJob] = useState(DIRECT_CAREER_JOBS[0]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Modals
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('signup');

  // Filters
  const [keyword, setKeyword] = useState('');
  const [workplace, setWorkplace] = useState('');
  const [location, setLocation] = useState('');
  const [region, setRegion] = useState('');
  const [company, setCompany] = useState('');
  const [hasEmail, setHasEmail] = useState(false);
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);
  const [activeTag, setActiveTag] = useState('');
  const [loadError, setLoadError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState({ loaded: 0, total: 0 });

  // Route protection: Gated dashboard requires active subscription
  useEffect(() => {
    if (currentView === 'dashboard' && !isUserSubscribed(currentUser)) {
      setCurrentView('landing');
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', '/');
      }
    }
  }, [currentView, currentUser]);

  useEffect(() => {
    // Run data fetch in background after the page is painted and interactive
    const loadTimer = setTimeout(() => {
      loadAllData();
    }, 150);

    // Check active Supabase session on startup
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u = formatSupabaseUser(session.user);
        saveUser(u);
        setCurrentUser(u);
      }
    }).catch((err) => {
      console.warn('Supabase session initialization warning:', err);
    });

    // Listen to real-time Supabase auth state changes (sign in, sign out, token refresh, OAuth callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const u = formatSupabaseUser(session.user);
        saveUser(u);
        setCurrentUser(u);
      } else if (event === 'SIGNED_OUT') {
        saveUser(null);
        setCurrentUser(null);
      }
    });

    const handleUrlChange = () => {
      setCurrentView(resolveViewFromUrl());
    };

    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    return () => {
      clearTimeout(loadTimer);
      subscription?.unsubscribe();
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
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

      // 3. Always merge curated DIRECT_CAREER_JOBS (Shopify, PostHog, Miro, etc.) with loaded dataset
      const allJobsMap = new Map();
      for (const j of DIRECT_CAREER_JOBS) {
        if (j && (j.id || j.title)) {
          const key = j.id || `${j.company}-${j.title}-${j.location}`;
          allJobsMap.set(key, j);
        }
      }
      if (Array.isArray(rawJobs)) {
        for (const j of rawJobs) {
          if (j && (j.id || j.title)) {
            const key = j.id || `${j.company}-${j.title}-${j.location}`;
            if (!allJobsMap.has(key)) {
              allJobsMap.set(key, j);
            }
          }
        }
      }
      const mergedJobsList = Array.from(allJobsMap.values());

      // 4. Mix companies and compute indexes
      const mixed = mixCompanies(mergedJobsList);
      setJobs(mixed);
      setCompanyLogos(computeCompanyLogos(mergedJobsList));

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
        // Ensure companies from DIRECT_CAREER_JOBS (like Shopify) have their full count in the list
        for (const j of DIRECT_CAREER_JOBS) {
          const norm = normalizeCompanyName(j.company);
          if (norm && (!mergedComps[norm] || mergedComps[norm].job_count === 0)) {
            const count = DIRECT_CAREER_JOBS.filter(x => normalizeCompanyName(x.company) === norm).length;
            mergedComps[norm] = { company: norm, job_count: count };
          }
        }
        setCompanies(Object.values(mergedComps).sort((a, b) => (b.job_count || 0) - (a.job_count || 0)));
      } else {
        setCompanies(computeCompaniesList(mergedJobsList));
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
    setRegion('');
    setCompany('');
    setHasEmail(false);
    setOnlyBookmarked(false);
    setActiveTag('');
    setFilterModalOpen(false);
  };

  const handleOpenAuth = (mode = 'signin') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (user, isNewUser) => {
    setCurrentUser(user);
    setAuthModalOpen(false);

    if (user && user.hasPaid) {
      setCurrentView('dashboard');
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', '/dashboard');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      setCurrentView('onboarding');
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', '/onboarding');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleOnboardingComplete = (onboardingData, plan) => {
    const updatedUser = getStoredUser();
    setCurrentUser(updatedUser);

    // Apply onboarding preferences to live dashboard filters
    if (onboardingData) {
      if (onboardingData.workplace) {
        setWorkplace(onboardingData.workplace);
      }
      if (onboardingData.region && onboardingData.region !== 'Worldwide / Anywhere') {
        setRegion(onboardingData.region);
      }
      if (onboardingData.selectedRoles && onboardingData.selectedRoles.length > 0) {
        const roleMap = {
          fullstack: 'Fullstack',
          backend: 'Backend',
          ai_ml: 'AI',
          devops: 'DevOps',
          mobile: 'Mobile',
          product: 'Product',
          design: 'Design',
          data: 'Data',
          'Software Engineer': 'Fullstack',
          'Frontend Developer': 'Frontend',
          'Backend Engineer': 'Backend',
          'Full-Stack Developer': 'Fullstack',
          'AI / Machine Learning Engineer': 'AI',
          'DevOps & Cloud Infrastructure': 'DevOps',
          'Mobile Developer (iOS & Android)': 'Mobile',
          'Product Manager': 'Product',
          'UI/UX & Product Design': 'Design',
          'Data Scientist & Analytics': 'Data',
        };
        const firstRole = onboardingData.selectedRoles[0];
        if (roleMap[firstRole]) {
          setActiveTag(roleMap[firstRole]);
        } else if (typeof firstRole === 'string' && firstRole.trim()) {
          setKeyword(firstRole.trim());
        }
      }
    }

    setCurrentView('dashboard');
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleExitOnboarding = () => {
    setCurrentView('landing');
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSignOut = () => {
    signOutUser();
    setCurrentUser(null);
    setCurrentView('landing');
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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

    // 1. If user is authenticated and has an active paid subscription -> grant dashboard access
    if (isUserSubscribed(currentUser)) {
      setCurrentView('dashboard');
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', '/dashboard');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    // 2. If authenticated but has not paid -> open onboarding with slug /onboarding
    if (currentUser && currentUser.isAuthenticated && !currentUser.hasPaid) {
      setCurrentView('onboarding');
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', '/onboarding');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    // 3. New user -> open Sign Up modal
    setAuthModalMode('signup');
    setAuthModalOpen(true);
  };

  const handleCrawlFromLanding = async (url) => {
    if (!isUserSubscribed(currentUser)) {
      handleExploreJobs(url);
      return;
    }

    setCurrentView('dashboard');
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/dashboard');
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
      if (window.location.hash) {
        window.location.hash = '';
      }
      window.history.pushState(null, '', '/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNavigateLegal = (type) => {
    setCurrentView(type);
    if (typeof window !== 'undefined') {
      window.location.hash = `#${type}`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Filtered Jobs
  // Free-form location strings are resolved to canonical countries/regions.
  // We only run this when the dashboard is active to keep initial landing and onboarding instantaneous.
  const locationIndex = useMemo(() => {
    if (currentView !== 'dashboard') return new Map();
    const index = new Map();
    for (const job of jobs) {
      const { countries, regions } = jobGeo(job.location, job.country);
      index.set(job, { countries: countries.map((c) => c.toLowerCase()), regions });
    }
    return index;
  }, [jobs, currentView]);

  const locationLists = useMemo(() => {
    if (currentView !== 'dashboard') return { countries: [], regions: [] };
    return buildLocationLists(jobs);
  }, [jobs, currentView]);

  const filteredJobs = useMemo(() => {
    if (currentView !== 'dashboard') return [];
    const searchTarget = (keyword || activeTag).toLowerCase().trim();
    const locationTarget = (location || '').toLowerCase().trim();
    const regionTarget = (region || '').toLowerCase().trim();

    const filtered = jobs.filter((job) => {
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
      const matchRegion = !regionTarget ||
        (geo && geo.regions.some((r) => r.toLowerCase() === regionTarget || r.toLowerCase().includes(regionTarget))) ||
        locStr.includes(regionTarget) ||
        countryStr.includes(regionTarget);
      const matchCompany = !company || job.company === company;
      const email = job.contact_email || job.recruiterEmail;
      const matchEmail = !hasEmail || (email && email.length > 0);
      const matchBookmark = !onlyBookmarked || job.is_bookmarked;

      return matchSearch && matchWorkplace && matchLocation && matchRegion && matchCompany && matchEmail && matchBookmark;
    });

    if (company) {
      return [...filtered].sort((a, b) => getJobTimestamp(b) - getJobTimestamp(a));
    }

    return mixCompanies(filtered);
  }, [jobs, currentView, keyword, activeTag, workplace, location, region, locationIndex, company, hasEmail, onlyBookmarked]);

  const bookmarkedCount = jobs.filter((j) => j.is_bookmarked).length;

  if (currentView === 'onboarding') {
    return (
      <OnboardingFlow 
        currentUser={currentUser}
        onComplete={handleOnboardingComplete}
        onExit={handleExitOnboarding}
      />
    );
  }

  if (currentView === 'privacy' || currentView === 'terms' || currentView === 'refund') {
    return (
      <LegalPage 
        type={currentView}
        onNavigate={handleNavigateLegal}
        onGoToLanding={handleGoToLanding}
        onExploreJobs={handleExploreJobs}
        totalJobsCount={jobs.length}
      />
    );
  }

  if (currentView === 'landing') {
    return (
      <>
        <LandingPage 
          onExploreJobs={handleExploreJobs}
          onCrawlUrl={handleCrawlFromLanding}
          onNavigateLegal={handleNavigateLegal}
          totalJobsCount={jobs.length}
          currentUser={currentUser}
          onOpenAuth={handleOpenAuth}
          onSignOut={handleSignOut}
          onSelectCompany={(comp) => {
            setCompany(comp);
            handleExploreJobs();
          }}
          onSelectTag={(tag) => {
            setActiveTag(tag);
            handleExploreJobs();
          }}
        />

        <AuthModal 
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialMode={authModalMode}
          onSuccess={handleAuthSuccess}
        />
      </>
    );
  }

  return (
    <div className="dashboard-app-wrapper">
      {/* Desktop Left Docked Sidebar */}
      <div className="desktop-sidebar-container">
        <DashboardSidebar 
          totalJobsCount={jobs.length}
          bookmarkedCount={bookmarkedCount}
          companies={companies}
          companyLogos={companyLogos}
          selectedCompany={company}
          onSelectCompany={setCompany}
          selectedRegion={region}
          onSelectRegion={setRegion}
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
          currentUser={currentUser}
          onSignOut={handleSignOut}
        />
      </div>

      {/* Mobile Off-Canvas Drawer Backdrop */}
      {mobileSidebarOpen && (
        <div 
          className="mobile-drawer-backdrop"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Off-Canvas Drawer Pane */}
      {mobileSidebarOpen && (
        <div className="mobile-drawer-pane">
          <DashboardSidebar 
            totalJobsCount={jobs.length}
            bookmarkedCount={bookmarkedCount}
            companies={companies}
            companyLogos={companyLogos}
            selectedCompany={company}
            onSelectCompany={setCompany}
            selectedRegion={region}
            onSelectRegion={setRegion}
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
            isMobileDrawer={true}
            onCloseMobile={() => setMobileSidebarOpen(false)}
            currentUser={currentUser}
            onSignOut={handleSignOut}
          />
        </div>
      )}

      {/* Right Column / Main Pane */}
      <div style={{ flex: 1, minWidth: 0, width: '100%', maxWidth: '100%', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        {/* Mobile Header Bar (Visible on <= 900px) */}
        <header className="mobile-header-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button 
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open filter menu"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                color: 'var(--text-main)',
                fontSize: '0.82rem',
                fontWeight: 600
              }}
            >
              <Menu size={17} />
              <span>Filters & Menu</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => setOnlyBookmarked(!onlyBookmarked)}
              style={{
                background: onlyBookmarked ? 'var(--primary-light)' : 'var(--bg-surface)',
                border: `1px solid ${onlyBookmarked ? 'var(--primary)' : 'var(--border-color)'}`,
                color: onlyBookmarked ? 'var(--primary)' : 'var(--text-muted)',
                borderRadius: 'var(--radius-sm)',
                padding: '5px 9px',
                fontSize: '0.76rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
            >
              <Bookmark size={13} color={onlyBookmarked ? 'var(--primary)' : 'currentColor'} />
              <span>Saved{bookmarkedCount > 0 ? ` (${bookmarkedCount})` : ''}</span>
            </button>
          </div>
        </header>

        {/* Main Content Pane */}
        <main className="main-content-pane">
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
            companies={companies}
            selectedCompany={company}
            onCompanyChange={setCompany}
            regions={locationLists.regions}
            selectedRegion={region}
            onRegionChange={setRegion}
            workplace={workplace}
            onWorkplaceChange={setWorkplace}
            location={location}
            onLocationChange={setLocation}
            onSearchOrCrawl={handleSearchOrCrawl}
            isSearching={isSearching}
            activeTag={activeTag}
            onSelectTag={setActiveTag}
            onResetFilters={handleResetFilters}
            hasActiveFilters={Boolean(keyword || workplace || location || region || activeTag || company || hasEmail || onlyBookmarked)}
          />

          {/* Main Job Cards Grid */}
          <JobCardGrid 
            jobs={filteredJobs}
            onToggleBookmark={handleToggleBookmark}
            onSelectJob={setSelectedJob}
            onOpenFilterModal={() => setFilterModalOpen(true)}
            onResetFilters={handleResetFilters}
          />
        </main>
      </div>

      {/* Filter Modal */}
      <FilterModal 
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        companies={companies}
        selectedCompany={company}
        onSelectCompany={setCompany}
        regions={locationLists.regions}
        selectedRegion={region}
        onSelectRegion={setRegion}
        selectedWorkplace={workplace}
        onSelectWorkplace={setWorkplace}
        hasEmailOnly={hasEmail}
        onToggleHasEmail={setHasEmail}
        onReset={handleResetFilters}
      />
    </div>
  );
}
