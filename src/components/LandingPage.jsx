import React, { useState } from 'react';
import {
  Search,
  Globe,
  ArrowRight,
  Sparkles,
  ChevronDown,
  Layers,
  CheckCircle2,
  Mail,
  Bookmark,
  Zap,
  Building2,
  SlidersHorizontal,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Briefcase,
  Terminal,
  Cpu,
  Flame,
  Compass,
  FileText,
  UserCheck,
  Check,
  HelpCircle,
  Github,
  Twitter,
  Linkedin,
  Menu,
  X
} from 'lucide-react';
import CompanyLogo from './CompanyLogo';

// Featured Companies with verified logos for the Marquee & Showcase
const FEATURED_COMPANIES = [
  { name: 'Palantir', roleCount: 420, category: 'Data & AI', logo: '/palantir-logo.png', tag: 'Enterprise AI' },
  { name: 'Supabase', roleCount: 48, category: 'DevTools', logo: '/supabase-logo.png', tag: 'Open source' },
  { name: 'Vercel', roleCount: 84, category: 'Cloud & Web', logo: '/vercel-logo.png', tag: 'Frontend cloud' },
  { name: 'Runway', roleCount: 36, category: 'Generative AI', logo: '/runway-logo.png', tag: 'GenAI video' },
  { name: 'Miro', roleCount: 112, category: 'Collaboration', logo: '/miro-logo.png', tag: 'Visual workspace' },
  { name: 'Intercom', roleCount: 65, category: 'AI Support', logo: '/intercom-logo.png', tag: 'Customer service' },
  { name: 'Duolingo', roleCount: 52, category: 'EdTech & AI', logo: '/duolingo-logo.png', tag: 'Consumer AI' },
  { name: 'Cohere', roleCount: 78, category: 'Foundation Models', logo: '/cohere-logo.png', tag: 'Enterprise LLMs' },
  { name: 'Notion', roleCount: 94, category: 'Productivity', logo: '/notion-logo.png', tag: 'Workspace' },
  { name: 'Docker', roleCount: 61, category: 'Infrastructure', logo: '/docker-logo.png', tag: 'Containers' },
  { name: 'Airtable', roleCount: 58, category: 'No-Code & DB', logo: '/airtable-logo.png', tag: 'App platform' },
  { name: 'Okta', roleCount: 180, category: 'Identity & Security', logo: '/okta-logo.png', tag: 'Identity cloud' },
  { name: 'Figma', roleCount: 74, category: 'Design Systems', logo: '/figma-logo.png', tag: 'Design cloud' },
  { name: 'Cursor', roleCount: 28, category: 'AI Editor', logo: '/cursor-logo.png', tag: 'Code intelligence' },
  { name: 'Temporal', roleCount: 42, category: 'Orchestration', logo: '/temporal-logo.png', tag: 'Workflows' },
  { name: 'Twilio', roleCount: 110, category: 'Communications', logo: '/twilio-logo.png', tag: 'Messaging' },
  { name: 'MongoDB', roleCount: 88, category: 'Database', logo: '/mongodb-logo.png', tag: 'Data platform' },
  { name: 'Brex', roleCount: 64, category: 'Fintech', logo: '/brex-logo.png', tag: 'Financial OS' }
];

// Interactive Feature tabs
const FEATURE_TABS = [
  {
    id: 'sync',
    title: 'Live portal discovery',
    subtitle: 'Direct URL ingestion',
    icon: Globe,
    badge: 'Core engine',
    headline: 'Discover any company career portal in seconds',
    description: 'Bypass laggy aggregate boards. Paste any career URL (e.g. stripe.com/jobs, openai.com/careers) to fetch live openings, deep descriptions, and recruiter contact points directly.',
    bullets: [
      'Zero recruiter middlemen or stale 30-day-old postings',
      'SPA deep browser rendering for dynamic JavaScript career pages',
      'Direct one-click sync into your centralized Careerhut dashboard'
    ],
    previewType: 'sync'
  },
  {
    id: 'splitpane',
    title: 'Split-pane reader',
    subtitle: 'Zero-lag job review',
    icon: Zap,
    badge: 'Fast experience',
    headline: 'Instant two-column reading without endless tab sprawl',
    description: 'Review hundreds of engineering roles in minutes with our high-density desktop reading pane. Inspect requirements, salary, benefits, and workplace modes at 60 FPS.',
    bullets: [
      'Dense sidebar list with instant keyboard navigation',
      'High-contrast rich formatting preserving original job details',
      'Direct application link always visible in top action bar'
    ],
    previewType: 'reader'
  },
  {
    id: 'email',
    title: 'Direct inboxes',
    subtitle: 'Verified recruiter emails',
    icon: Mail,
    badge: 'High response',
    headline: 'Cut through the noise with direct hiring contacts',
    description: 'Careerhut automatically extracts and surfaces verified hiring emails, team inboxes, and talent partner addresses so you can send high-impact outreach.',
    bullets: [
      'Automated mailto links with prefilled subject lines',
      'Direct team contacts for high-priority engineering openings',
      'Track emails sent and correspondence in your application pipeline'
    ],
    previewType: 'email'
  },
  {
    id: 'kanban',
    title: 'Pipeline tracker',
    subtitle: 'Kanban & bookmarks',
    icon: Bookmark,
    badge: 'Stay organized',
    headline: 'Track your entire job search pipeline in one place',
    description: 'Move roles through custom stages: Saved, Applied, Interviewing, and Offer. Keep notes, recruiter threads, and status updates organized without spreadsheets.',
    bullets: [
      'One-click bookmarking from the feed or detail view',
      'Persistent local and database state synchronization',
      'Quick filtering for bookmarked and applied positions'
    ],
    previewType: 'kanban'
  },
  {
    id: 'filters',
    title: 'Deep multi-filter',
    subtitle: 'Remote, stack & location',
    icon: SlidersHorizontal,
    badge: 'Precision',
    headline: 'Find exactly what fits your experience level',
    description: 'Filter across 10,000+ roles with instant composite filters: Workplace type (Remote / Hybrid / On-Site), country, specific tech stacks, and company tiers.',
    bullets: [
      'Instant client-side sub-millisecond query execution',
      'Workplace badges and geographic filtering across 30+ countries',
      'Company-level drilldown with live vacancy counts'
    ],
    previewType: 'filters'
  },
  {
    id: 'catalog',
    title: 'Verified tech catalog',
    subtitle: 'Handpicked top teams',
    icon: Building2,
    badge: 'Top tier',
    headline: 'Curated hub for high-growth startups & tech giants',
    description: 'Explore active job inventories from world-class engineering teams across AI, Developer Tools, Infrastructure, and YC-backed unicorns.',
    bullets: [
      'Over 10,000+ indexed roles from 50+ tier-1 engineering companies',
      'Real company brand logos, verified career pages, and domain checks',
      'Daily scheduled verification keeping data continuously fresh'
    ],
    previewType: 'catalog'
  }
];

// Micro-features
const MORE_FEATURES = [
  {
    icon: Compass,
    title: 'Remote-first precision',
    description: 'Easily isolate 100% remote roles from hybrid and on-site listings across global tech hubs.'
  },
  {
    icon: ShieldCheck,
    title: '100% verified positions',
    description: 'Every single listing is verified directly from authentic company career websites. Zero ghost jobs.'
  },
  {
    icon: Mail,
    title: 'Recruiter contact extraction',
    description: 'Intelligent parser unearths direct talent partner emails and engineering manager contacts.'
  },
  {
    icon: TrendingUp,
    title: 'Instant database sync',
    description: 'Seamless synchronization between client cache and SQLite/Postgres backend with auto-pagination.'
  },
  {
    icon: Terminal,
    title: 'Multi-portal batch sync',
    description: 'Queue multiple company domains at once with intelligent rate limiting and SPA JavaScript execution.'
  },
  {
    icon: FileText,
    title: 'Direct application routing',
    description: 'One click jumps directly to the official Greenhouse, Lever, Ashby, or Workday application form.'
  }
];

// Testimonials
const TESTIMONIALS = [
  {
    name: 'Alex Rivera',
    handle: '@alexrivera_dev',
    role: 'Staff Frontend Engineer',
    company: 'Supabase',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    quote: 'Careerhut completely changed how I discover roles. Discovering company career pages directly cut out weeks of recruiter spam. Landed my current role in 10 days.'
  },
  {
    name: 'David Zhang',
    handle: '@dzhang_ai',
    role: 'Senior ML Engineer',
    company: 'Palantir',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    quote: 'The split-pane UI and lightning-fast search make reviewing 500+ openings effortless. You get direct recruiter emails and pristine job descriptions with zero ads.'
  },
  {
    name: 'Elena Rostova',
    handle: '@elena_designs',
    role: 'Product Designer',
    company: 'Vercel',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    quote: 'The cleanest job discovery tool I have ever used. The light mode aesthetics, company catalog, and instant pipeline tracking are insanely well thought-out.'
  }
];

// FAQ items
const FAQS = [
  {
    question: 'What is Careerhut and how is it different from traditional job boards?',
    answer: 'Careerhut is a direct career portal engine. Unlike LinkedIn or Indeed which rely on sponsored job posts and third-party recruiter middleman listings, Careerhut directly indexes official company career domains (e.g. Greenhouse, Lever, Ashby, Workday, and custom career portals). This guarantees 100% active, verified positions with zero ghost listings.'
  },
  {
    question: 'How does the live portal discovery work?',
    answer: 'You can paste any company careers URL (e.g., openai.com/careers or stripe.com/jobs) into the portal input. Careerhut renders the page in a high-speed browser engine, extracts active job listings, departments, workplace types, and recruiter contact emails, and immediately indexes them into your personal dashboard.'
  },
  {
    question: 'Is Careerhut free to use?',
    answer: 'Yes! Careerhut is 100% free to explore, search, filter, and discover. You can browse 10,000+ jobs, bookmark positions, track your application pipeline, and use the direct portal discovery without any subscription fees.'
  },
  {
    question: 'Are the recruiter emails verified?',
    answer: 'Yes. Careerhut scans the official job posting pages and company domain headers to extract authentic talent inboxes and recruiter contacts. When available, you can click to launch your mail client with pre-filled application details.'
  },
  {
    question: 'Can I track my applications and bookmark roles?',
    answer: 'Absolutely. Careerhut includes built-in bookmarking and application status management (Saved, Applied, Interviewing, Offer). Everything is stored and synced in real-time so you never lose track of an opportunity.'
  },
  {
    question: 'How often are the job listings updated?',
    answer: 'Careerhut syncs with company career portals continuously. When you visit the board or run a sync, the engine fetches the freshest snapshot straight from the source.'
  }
];

// Corner Plus Accents Helper (Sharp frame corners with 0 radius for dashed frame)
function CornerPlusMarkers({ color = '#94a3b8', bg = '#ffffff', size = '14px' }) {
  return (
    <>
      <span aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, transform: 'translate(-50%, -50%)', fontSize: size, fontWeight: 300, color, lineHeight: 1, backgroundColor: bg, padding: '1px 2px', userSelect: 'none', zIndex: 10, pointerEvents: 'none' }}>+</span>
      <span aria-hidden="true" style={{ position: 'absolute', top: 0, right: 0, transform: 'translate(50%, -50%)', fontSize: size, fontWeight: 300, color, lineHeight: 1, backgroundColor: bg, padding: '1px 2px', userSelect: 'none', zIndex: 10, pointerEvents: 'none' }}>+</span>
      <span aria-hidden="true" style={{ position: 'absolute', bottom: 0, left: 0, transform: 'translate(-50%, 50%)', fontSize: size, fontWeight: 300, color, lineHeight: 1, backgroundColor: bg, padding: '1px 2px', userSelect: 'none', zIndex: 10, pointerEvents: 'none' }}>+</span>
      <span aria-hidden="true" style={{ position: 'absolute', bottom: 0, right: 0, transform: 'translate(50%, 50%)', fontSize: size, fontWeight: 300, color, lineHeight: 1, backgroundColor: bg, padding: '1px 2px', userSelect: 'none', zIndex: 10, pointerEvents: 'none' }}>+</span>
    </>
  );
}

export default function LandingPage({
  onExploreJobs,
  onCrawlUrl,
  totalJobsCount = 10420,
  onSelectCompany,
  onSelectTag
}) {
  const [heroInput, setHeroInput] = useState('');
  const [activeTab, setActiveTab] = useState('sync');
  const [openFaq, setOpenFaq] = useState(null);
  const [navDropdown, setNavDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleHeroSubmit = (e) => {
    e.preventDefault();
    if (!heroInput.trim()) {
      onExploreJobs();
      return;
    }
    const val = heroInput.trim();
    if (val.includes('.') && (val.includes('/') || val.includes('http') || val.includes('.com') || val.includes('.io') || val.includes('.ai'))) {
      onCrawlUrl(val);
    } else {
      onExploreJobs(val);
    }
  };

  const currentFeature = FEATURE_TABS.find((t) => t.id === activeTab) || FEATURE_TABS[0];

  // Marquee list duplicated for seamless infinite loop
  const marqueeCompanies = [...FEATURED_COMPANIES, ...FEATURED_COMPANIES];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      color: '#0f172a',
      fontFamily: 'var(--font-main, "Plus Jakarta Sans", sans-serif)',
      overflowX: 'hidden'
    }}>
      {/* ==================== 1. TOP NAVBAR ==================== */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid #e2e8f0',
        transition: 'all 0.2s ease'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Logo */}
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #780115 0%, #a30e2a 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(120, 1, 21, 0.2)'
            }}>
              <Flame size={18} />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a' }}>
                Career<span style={{ color: '#780115' }}>hut</span>
              </span>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 600,
                padding: '2px 7px',
                borderRadius: '999px',
                backgroundColor: '#fff1f2',
                color: '#780115',
                border: '1px solid #fecdd3'
              }}>
                Engine
              </span>
            </div>
          </div>

          {/* Center Navigation Links with Dropdowns (Desktop Only) */}
          <nav className="landing-nav-desktop" style={{ gap: '6px' }}>
            {/* Platform Dropdown */}
            <div 
              style={{ position: 'relative' }}
              onMouseEnter={() => setNavDropdown('platform')}
              onMouseLeave={() => setNavDropdown(null)}
            >
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.86rem',
                fontWeight: 600,
                color: '#334155',
                backgroundColor: navDropdown === 'platform' ? '#f1f5f9' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}>
                <span>Platform</span>
                <ChevronDown size={13} style={{ transform: navDropdown === 'platform' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {navDropdown === 'platform' && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '580px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.12)',
                  padding: '16px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '10px',
                  zIndex: 200
                }}>
                  <div 
                    onClick={() => onExploreJobs()}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                      display: 'flex',
                      gap: '12px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: '#fff1f2', color: '#780115', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Briefcase size={17} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>Direct job feed</div>
                      <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '1px' }}>Browse 10,000+ live verified roles from top companies</div>
                    </div>
                  </div>

                  <div 
                    onClick={() => onExploreJobs('remote')}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                      display: 'flex',
                      gap: '12px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Globe size={17} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>Remote opportunities</div>
                      <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '1px' }}>Verified work-from-anywhere positions</div>
                    </div>
                  </div>

                  <div 
                    onClick={() => {
                      const portalElem = document.getElementById('features-section');
                      if (portalElem) portalElem.scrollIntoView({ behavior: 'smooth' });
                      setActiveTab('sync');
                    }}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                      display: 'flex',
                      gap: '12px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: '#fffbeb', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Zap size={17} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>Direct portal search</div>
                      <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '1px' }}>Sync any company careers URL instantly</div>
                    </div>
                  </div>

                  <div 
                    onClick={() => onExploreJobs()}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                      display: 'flex',
                      gap: '12px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Bookmark size={17} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>Pipeline kanban</div>
                      <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '1px' }}>Track bookmarks and application stages</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Features Link */}
            <a 
              href="#features-section" 
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.86rem',
                fontWeight: 600,
                color: '#334155',
                textDecoration: 'none',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Features
            </a>

            {/* Testimonials Link */}
            <a 
              href="#testimonials-section" 
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.86rem',
                fontWeight: 600,
                color: '#334155',
                textDecoration: 'none',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Testimonials
            </a>

            {/* FAQ Link */}
            <a 
              href="#faq-section" 
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.86rem',
                fontWeight: 600,
                color: '#334155',
                textDecoration: 'none',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Faq
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => onExploreJobs()}
              className="landing-nav-desktop"
              style={{
                padding: '7px 14px',
                fontSize: '0.84rem',
                fontWeight: 600,
                color: '#334155',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.borderColor = '#94a3b8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = '#cbd5e1';
              }}
            >
              <span>Explore roles</span>
              <span style={{
                fontSize: '0.7rem',
                padding: '1px 6px',
                borderRadius: '999px',
                backgroundColor: '#f1f5f9',
                color: '#475569',
                fontWeight: 700
              }}>
                10k+
              </span>
            </button>

            <button
              onClick={() => onExploreJobs()}
              style={{
                padding: '7px 16px',
                fontSize: '0.84rem',
                fontWeight: 700,
                color: '#ffffff',
                backgroundColor: '#780115',
                border: '1px solid #780115',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(120, 1, 21, 0.22)',
                transition: 'all 0.15s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#5c0010';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#780115';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <span>Dashboard</span>
              <ArrowRight size={14} />
            </button>

            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="landing-nav-mobile-btn"
              aria-label="Open mobile navigation"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div 
            className="landing-mobile-menu-backdrop"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div 
              className="landing-mobile-menu-drawer"
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'linear-gradient(135deg, #780115 0%, #a30e2a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    <Flame size={16} />
                  </div>
                  <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>Careerhut</span>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '10px' }}>
                <button
                  onClick={() => { setMobileMenuOpen(false); onExploreJobs(); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: '#fff1f2', color: '#780115', border: '1px solid #fecdd3', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left' }}
                >
                  <Briefcase size={16} />
                  <span>Explore Direct Jobs ({totalJobsCount?.toLocaleString() || '10,000+'})</span>
                </button>

                <button
                  onClick={() => { setMobileMenuOpen(false); onExploreJobs('remote'); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'transparent', color: '#334155', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer', textAlign: 'left' }}
                >
                  <Globe size={16} />
                  <span>Remote Opportunities</span>
                </button>

                <a
                  href="#features-section"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', color: '#334155', textDecoration: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.88rem' }}
                >
                  <Zap size={16} color="#780115" />
                  <span>Platform Features</span>
                </a>

                <a
                  href="#testimonials-section"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', color: '#334155', textDecoration: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.88rem' }}
                >
                  <CheckCircle2 size={16} color="#059669" />
                  <span>Testimonials & Reviews</span>
                </a>

                <a
                  href="#faq-section"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', color: '#334155', textDecoration: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.88rem' }}
                >
                  <HelpCircle size={16} color="#64748b" />
                  <span>Frequently Asked Questions</span>
                </a>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                <button
                  onClick={() => { setMobileMenuOpen(false); onExploreJobs(); }}
                  style={{ width: '100%', padding: '10px', background: '#780115', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <span>Launch Live App</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ==================== 2. HERO SECTION ==================== */}
      <section style={{
        position: 'relative',
        padding: '64px 24px 72px',
        maxWidth: '1280px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        {/* A. HERO TEXTS (Clean on canvas - No outer frame) */}
        <div style={{ maxWidth: '960px', margin: '0 auto 40px' }}>
          {/* Top Announcement Pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '5px 14px',
            borderRadius: '999px',
            backgroundColor: '#ffffff',
            border: '1px dashed #cbd5e1',
            boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
            marginBottom: '20px'
          }}>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 6px #10b981'
            }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>
              Direct career discovery engine
            </span>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Zero recruiter middlemen, 100% verified positions
            </span>
            <ArrowRight size={12} color="#780115" />
          </div>

          {/* Hero Main Headline */}
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5.8vw, 4.4rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.04em',
            color: '#0f172a',
            margin: '0 auto 18px'
          }}>
            Skip the job boards.{' '}
            <span style={{
              background: 'linear-gradient(135deg, #780115 0%, #b45309 60%, #F7B638 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Apply directly to the source.
            </span>
          </h1>

          {/* Hero Subtitle */}
          <p style={{
            fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
            color: '#475569',
            maxWidth: '740px',
            margin: '0 auto 30px',
            lineHeight: 1.55
          }}>
            Search 10,000+ live tech roles indexed straight from official company career pages — complete with verified recruiter emails and direct hiring team contacts.
          </p>

          {/* Hero CTA Buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            marginBottom: '20px'
          }}>
            <button
              onClick={() => onExploreJobs()}
              style={{
                padding: '12px 26px',
                borderRadius: '8px',
                backgroundColor: '#780115',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.96rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(120, 1, 21, 0.28)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#5c0010';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#780115';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <span>Start searching (10k+ jobs)</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('hero-preview-frame');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                padding: '12px 22px',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                border: '1px solid #cbd5e1',
                fontWeight: 700,
                fontSize: '0.96rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.borderColor = '#94a3b8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = '#cbd5e1';
              }}
            >
              <Globe size={16} color="#780115" />
              <span>Direct portal discovery</span>
            </button>
          </div>

          {/* Social Proof Line */}
          <div style={{ fontSize: '0.86rem', color: '#64748b' }}>
            <strong style={{ color: '#0f172a' }}>5,000+ developers & builders</strong> use Careerhut — it's free & no login required.
          </div>
        </div>

        {/* B. HERO IMAGE / PROJECT PREVIEW FRAME (Dashed frame with sharp corner radius 0 & corner + markers) */}
        <div 
          id="hero-preview-frame"
          style={{
            position: 'relative',
            borderRadius: 0,
            border: '1px dashed #cbd5e1',
            backgroundColor: '#ffffff',
            padding: '16px',
            boxShadow: '0 20px 50px -12px rgba(15, 23, 42, 0.08)',
            marginBottom: '48px',
            textAlign: 'left'
          }}
        >
          {/* Sharp Corner Plus Markers (Radius 0) */}
          <CornerPlusMarkers color="#94a3b8" bg="#ffffff" />

          {/* Top Browser Bar within the frame */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderBottom: 'none'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              <span style={{ marginLeft: '12px', fontSize: '0.78rem', fontFamily: 'monospace', color: '#64748b' }}>
                https://careerhut.app/dashboard • <span style={{ color: '#059669', fontWeight: 600 }}>10,420 active direct roles</span>
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                color: '#780115',
                backgroundColor: '#fff1f2',
                padding: '2px 8px',
                borderRadius: '4px',
                border: '1px solid #fecdd3'
              }}>
                Live sync
              </span>
              <button
                onClick={() => onExploreJobs()}
                style={{
                  padding: '5px 12px',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  backgroundColor: '#780115',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>Launch interactive app</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>

          {/* Hero Project Preview Mockup Inside Frame */}
          <div 
            onClick={() => onExploreJobs()}
            className="hero-mockup-frame"
          >
            {/* Column 1: Sidebar Mockup */}
            <div className="hero-mockup-col1" style={{
              backgroundColor: '#f8fafc',
              borderRight: '1px solid #e2e8f0',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.02em' }}>
                Top engineering hubs
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {FEATURED_COMPANIES.slice(0, 7).map((c, i) => (
                  <div 
                    key={c.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      backgroundColor: i === 0 ? '#fff1f2' : 'transparent',
                      color: i === 0 ? '#780115' : '#334155',
                      fontWeight: i === 0 ? 700 : 500,
                      fontSize: '0.8rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CompanyLogo name={c.name} src={c.logo} size={20} radius={4} />
                      <span>{c.name}</span>
                    </div>
                    <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>{c.roleCount}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#059669' }} />
                  <span>Sync engine ready</span>
                </div>
              </div>
            </div>

            {/* Column 2: Job List Feed Mockup */}
            <div className="hero-mockup-col2" style={{
              borderRight: '1px solid #e2e8f0',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              backgroundColor: '#ffffff',
              overflowY: 'hidden'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', borderRadius: '6px', backgroundColor: '#f1f5f9', fontSize: '0.76rem', color: '#475569' }}>
                <Search size={13} />
                <span>Filter 10,420 positions...</span>
              </div>

              {/* Card 1 (Active) */}
              <div style={{
                padding: '10px',
                border: '1px dashed #780115',
                backgroundColor: '#fff1f2',
                borderRadius: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#780115' }}>AI Platform Engineer</span>
                  <span style={{ fontSize: '0.68rem', backgroundColor: '#ecfdf5', color: '#059669', padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>Verified</span>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#475569', fontWeight: 600 }}>Palantir Technologies</div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                  <span style={{ fontSize: '0.68rem', color: '#64748b' }}>Hybrid • New York, NY</span>
                  <span style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 700 }}>$210k - $285k</span>
                </div>
              </div>

              {/* Card 2 */}
              <div style={{
                padding: '10px',
                border: '1px dashed #cbd5e1',
                backgroundColor: '#ffffff',
                borderRadius: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>Staff Systems Architect</span>
                  <span style={{ fontSize: '0.68rem', color: '#64748b' }}>1d ago</span>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#475569' }}>Supabase</div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                  <span style={{ fontSize: '0.68rem', color: '#64748b' }}>Remote (Global)</span>
                  <span style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 700 }}>$195k - $260k</span>
                </div>
              </div>

              {/* Card 3 */}
              <div style={{
                padding: '10px',
                border: '1px dashed #cbd5e1',
                backgroundColor: '#ffffff',
                borderRadius: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>Frontend Infrastructure Lead</span>
                  <span style={{ fontSize: '0.68rem', color: '#64748b' }}>3h ago</span>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#475569' }}>Vercel</div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                  <span style={{ fontSize: '0.68rem', color: '#64748b' }}>Remote US</span>
                  <span style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 700 }}>$220k - $290k</span>
                </div>
              </div>
            </div>

            {/* Column 3: Detailed Job View Mockup */}
            <div className="hero-mockup-col3" style={{
              padding: '20px',
              backgroundColor: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              overflowY: 'hidden'
            }}>
              {/* Header Action Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <CompanyLogo name="Palantir" src="/palantir-logo.png" size={40} radius={0} />
                  <div>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      AI Platform Engineer (Foundry / AIP)
                    </h4>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                      Palantir Technologies • Enterprise AI Division • Full-time
                    </div>
                  </div>
                </div>

                <button style={{
                  padding: '8px 14px',
                  backgroundColor: '#780115',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 6px rgba(120, 1, 21, 0.2)'
                }}>
                  <span>Apply on Palantir careers</span>
                  <ExternalLink size={13} />
                </button>
              </div>

              {/* Verified Recruiter Box */}
              <div style={{
                padding: '10px 14px',
                backgroundColor: '#fafaf9',
                border: '1px dashed #cbd5e1',
                borderRadius: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={16} color="#780115" />
                  <span style={{ fontSize: '0.8rem', color: '#334155' }}>
                    Direct recruiter contact: <strong style={{ color: '#0f172a' }}>recruiting-aip@palantir.com</strong>
                  </span>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600, backgroundColor: '#ecfdf5', padding: '2px 6px', borderRadius: '4px' }}>
                  Verified inbox
                </span>
              </div>

              {/* Description Snippet */}
              <div style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.55 }}>
                <p style={{ marginBottom: '8px' }}>
                  We are seeking exceptional engineers to build foundational capabilities for Palantir Artificial Intelligence Platform (AIP). You will design distributed systems scaling to billions of daily model inference operations across mission-critical customer deployments.
                </p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                  <span style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#334155', fontSize: '0.72rem', fontWeight: 600 }}>Distributed systems</span>
                  <span style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#334155', fontSize: '0.72rem', fontWeight: 600 }}>Python / Go</span>
                  <span style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#334155', fontSize: '0.72rem', fontWeight: 600 }}>Kubernetes</span>
                  <span style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#334155', fontSize: '0.72rem', fontWeight: 600 }}>LLM orchestration</span>
                </div>
              </div>
            </div>

            {/* Hover Floating Overlay */}
            <div 
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.03)',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                paddingBottom: '20px',
                pointerEvents: 'none'
              }}
            >
              <div style={{
                backgroundColor: '#0f172a',
                color: '#ffffff',
                padding: '8px 18px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>Click to open live interactive app</span>
                <ArrowRight size={14} />
              </div>
            </div>
          </div>
        </div>

        {/* C. SUPPORTED / CRAWLED COMPANIES (Infinite Horizontal Scrolling Marquee with Real Logos) */}
        <div style={{
          position: 'relative',
          borderRadius: 0,
          border: '1px dashed #cbd5e1',
          backgroundColor: '#fafaf9',
          padding: '24px 16px',
          textAlign: 'center'
        }}>
          <CornerPlusMarkers color="#94a3b8" bg="#fafaf9" />

          <div style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#64748b',
            marginBottom: '18px'
          }}>
            Some of the top engineering teams on Careerhut
          </div>

          {/* Infinite Marquee Container */}
          <div className="marquee-container">
            <div className="marquee-track">
              {marqueeCompanies.map((comp, idx) => (
                <div
                  key={`${comp.name}-${idx}`}
                  onClick={() => {
                    if (onSelectCompany) onSelectCompany(comp.name);
                    onExploreJobs(comp.name);
                  }}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 16px',
                    backgroundColor: '#ffffff',
                    border: '1px dashed #cbd5e1',
                    borderRadius: 0,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'left',
                    flexShrink: 0,
                    minWidth: '220px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#780115';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(120, 1, 21, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <CornerPlusMarkers color="#94a3b8" bg="#ffffff" size="12px" />
                  <CompanyLogo name={comp.name} src={comp.logo} size={36} radius={0} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
                      {comp.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ color: '#780115', fontWeight: 600 }}>{comp.roleCount} live roles</span>
                      <span>•</span>
                      <span>{comp.tag}</span>
                    </div>
                  </div>
                  <ChevronRight size={13} color="#cbd5e1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 3. INTERACTIVE FEATURES SECTION ==================== */}
      <section id="features-section" style={{
        padding: '80px 24px',
        maxWidth: '1280px',
        margin: '0 auto'
      }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 48px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: '999px',
            backgroundColor: '#fff1f2',
            color: '#780115',
            fontSize: '0.78rem',
            fontWeight: 600,
            marginBottom: '12px'
          }}>
            <Sparkles size={13} />
            <span>Platform capabilities</span>
          </div>
          <h2 style={{
            fontSize: 'clamp(2rem, 3.8vw, 2.8rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#0f172a',
            marginBottom: '14px'
          }}>
            What you can do in Careerhut
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#64748b', lineHeight: 1.6 }}>
            Click through our core tools below to see how Careerhut replaces clunky job boards with pure direct discovery.
          </p>
        </div>

        {/* Top Interactive Feature Selector Tabs (Sharp frame with radius 0 & corner plus markers) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '10px',
          marginBottom: '24px'
        }}>
          {FEATURE_TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '14px',
                  borderRadius: 0,
                  backgroundColor: isSelected ? '#ffffff' : '#f8fafc',
                  border: isSelected ? '2px solid #780115' : '1px dashed #cbd5e1',
                  boxShadow: isSelected ? '0 4px 14px rgba(120, 1, 21, 0.1)' : 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.borderColor = '#780115';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                  }
                }}
              >
                <CornerPlusMarkers color={isSelected ? '#780115' : '#94a3b8'} bg={isSelected ? '#ffffff' : '#f8fafc'} size="12px" />
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: 0,
                  backgroundColor: isSelected ? '#fff1f2' : '#ffffff',
                  color: isSelected ? '#780115' : '#475569',
                  border: '1px dashed',
                  borderColor: isSelected ? '#fecdd3' : '#cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '8px'
                }}>
                  <Icon size={16} />
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: isSelected ? '#0f172a' : '#334155' }}>
                  {tab.title}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                  {tab.subtitle}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Feature Showcase Box (Dashed frame with sharp corner radius 0 & corner + markers) */}
        <div style={{
          position: 'relative',
          borderRadius: 0,
          backgroundColor: '#ffffff',
          border: '1px dashed #cbd5e1',
          padding: '36px',
          boxShadow: '0 12px 30px -8px rgba(0,0,0,0.04)',
          marginBottom: '56px'
        }}>
          <CornerPlusMarkers color="#94a3b8" bg="#ffffff" />

          <div className="landing-split-2col">
            {/* Left Description Column */}
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '3px 8px',
                borderRadius: '4px',
                backgroundColor: '#fff1f2',
                color: '#780115',
                fontSize: '0.74rem',
                fontWeight: 600,
                letterSpacing: '0.02em',
                marginBottom: '12px'
              }}>
                {currentFeature.badge}
              </div>

              <h3 style={{
                fontSize: '1.6rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#0f172a',
                lineHeight: 1.25,
                marginBottom: '14px'
              }}>
                {currentFeature.headline}
              </h3>

              <p style={{ fontSize: '0.96rem', color: '#475569', lineHeight: 1.6, marginBottom: '20px' }}>
                {currentFeature.description}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '26px' }}>
                {currentFeature.bullets.map((b, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#1e293b' }}>{b}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onExploreJobs()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  backgroundColor: '#780115',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(120, 1, 21, 0.22)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5c0010'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#780115'}
              >
                <span>Try in dashboard</span>
                <ArrowRight size={15} />
              </button>
            </div>

            {/* Right Interactive Mock Preview (Sharp frame with radius 0 & corner plus markers) */}
            <div style={{
              position: 'relative',
              backgroundColor: '#f8fafc',
              border: '1px dashed #cbd5e1',
              borderRadius: 0,
              padding: '18px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}>
              <CornerPlusMarkers color="#94a3b8" bg="#f8fafc" size="12px" />

              {/* Top Window Chrome */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px dashed #cbd5e1', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#f87171' }} />
                  <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#facc15' }} />
                  <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#4ade80' }} />
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', padding: '2px 6px', borderRadius: 0, backgroundColor: '#ffffff', border: '1px dashed #cbd5e1' }}>
                  careerhut.app/preview
                </div>
              </div>

              {/* Dynamic Preview UI based on active tab */}
              {activeTab === 'sync' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', backgroundColor: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: 0 }}>
                    <Globe size={15} color="#780115" />
                    <span style={{ fontSize: '0.82rem', color: '#0f172a', fontWeight: 600 }}>https://stripe.com/jobs</span>
                    <span style={{ marginLeft: 'auto', fontSize: '0.7rem', backgroundColor: '#ecfdf5', color: '#059669', padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>200 OK</span>
                  </div>
                  <div style={{ padding: '10px', backgroundColor: '#ffffff', borderRadius: 0, border: '1px dashed #cbd5e1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>Staff Infrastructure Engineer</span>
                      <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>$240k - $320k</span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Stripe • Remote, US • Contact: eng-recruiting@stripe.com</div>
                  </div>
                  <div style={{ padding: '10px', backgroundColor: '#ffffff', borderRadius: 0, border: '1px dashed #cbd5e1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>Frontend Systems Engineer</span>
                      <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>$190k - $260k</span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Stripe • Seattle / SF / Remote • Contact: talent@stripe.com</div>
                  </div>
                </div>
              )}

              {activeTab === 'splitpane' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '8px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ padding: '8px', backgroundColor: '#fff1f2', border: '1px dashed #fecdd3', borderRadius: 0 }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#780115' }}>AI Platform Engineer</div>
                      <div style={{ fontSize: '0.7rem', color: '#475569' }}>Palantir • Hybrid</div>
                    </div>
                    <div style={{ padding: '8px', backgroundColor: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: 0 }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>Cloud Architect</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Supabase • Remote</div>
                    </div>
                  </div>
                  <div style={{ padding: '10px', backgroundColor: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: 0 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', marginBottom: '3px' }}>AI Platform Engineer</div>
                    <div style={{ fontSize: '0.72rem', color: '#780115', fontWeight: 600, marginBottom: '6px' }}>Palantir Technologies</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.4 }}>
                      Build enterprise AI foundations. Requires distributed systems experience with Go / Rust.
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'email' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ padding: '12px', backgroundColor: '#ffffff', borderRadius: 0, border: '1px dashed #cbd5e1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <Mail size={15} color="#780115" />
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>Direct recruiter contact</span>
                    </div>
                    <div style={{ padding: '6px 10px', backgroundColor: '#f1f5f9', borderRadius: 0, fontSize: '0.78rem', fontFamily: 'monospace', color: '#334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px dashed #cbd5e1' }}>
                      <span>careers@supabase.com</span>
                      <span style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 600 }}>Verified</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button style={{ flex: 1, padding: '7px', borderRadius: '6px', backgroundColor: '#780115', color: '#fff', border: 'none', fontSize: '0.76rem', fontWeight: 700 }}>
                      Compose application email
                    </button>
                    <button style={{ padding: '7px 10px', borderRadius: '6px', backgroundColor: '#ffffff', color: '#334155', border: '1px dashed #cbd5e1', fontSize: '0.76rem', fontWeight: 600 }}>
                      Copy email
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'kanban' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                  <div style={{ padding: '8px', backgroundColor: '#f1f5f9', borderRadius: 0, border: '1px dashed #cbd5e1' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Saved (3)</div>
                    <div style={{ padding: '6px', backgroundColor: '#ffffff', borderRadius: 0, border: '1px dashed #cbd5e1', fontSize: '0.7rem', fontWeight: 600, color: '#0f172a' }}>
                      Staff ML @ Runway
                    </div>
                  </div>
                  <div style={{ padding: '8px', backgroundColor: '#fffbeb', borderRadius: 0, border: '1px dashed #fde68a' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#b45309', marginBottom: '4px' }}>Applied (2)</div>
                    <div style={{ padding: '6px', backgroundColor: '#ffffff', borderRadius: 0, border: '1px dashed #fde68a', fontSize: '0.7rem', fontWeight: 600, color: '#0f172a' }}>
                      Lead UX @ Figma
                    </div>
                  </div>
                  <div style={{ padding: '8px', backgroundColor: '#ecfdf5', borderRadius: 0, border: '1px dashed #a7f3d0' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#059669', marginBottom: '4px' }}>Interview (1)</div>
                    <div style={{ padding: '6px', backgroundColor: '#ffffff', borderRadius: 0, border: '1px dashed #a7f3d0', fontSize: '0.7rem', fontWeight: 600, color: '#0f172a' }}>
                      Systems Eng @ Vercel
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'filters' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '999px', backgroundColor: '#780115', color: '#fff', fontSize: '0.74rem', fontWeight: 600 }}>Remote</span>
                    <span style={{ padding: '4px 10px', borderRadius: '999px', backgroundColor: '#e2e8f0', color: '#334155', fontSize: '0.74rem', fontWeight: 600 }}>Hybrid</span>
                    <span style={{ padding: '4px 10px', borderRadius: '999px', backgroundColor: '#e2e8f0', color: '#334155', fontSize: '0.74rem', fontWeight: 600 }}>On-Site</span>
                  </div>
                  <div style={{ padding: '8px 12px', backgroundColor: '#ffffff', borderRadius: 0, border: '1px dashed #cbd5e1', fontSize: '0.78rem', color: '#0f172a', fontWeight: 600 }}>
                    Matching: 4,820 remote engineering openings
                  </div>
                </div>
              )}

              {activeTab === 'catalog' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                  {FEATURED_COMPANIES.slice(0, 4).map((c) => (
                    <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px', backgroundColor: '#ffffff', borderRadius: 0, border: '1px dashed #cbd5e1' }}>
                      <CompanyLogo name={c.name} src={c.logo} size={20} radius={0} />
                      <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0f172a' }}>{c.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* More Features Grid (6 Micro Cards with clean 8px radius) */}
        <div>
          <div style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            color: '#780115',
            marginBottom: '14px'
          }}>
            More built-in capabilities
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '14px'
          }}>
            {MORE_FEATURES.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  style={{
                    position: 'relative',
                    padding: '22px',
                    borderRadius: 0,
                    backgroundColor: '#ffffff',
                    border: '1px dashed #cbd5e1',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#780115';
                    e.currentTarget.style.boxShadow = '0 6px 18px -4px rgba(120, 1, 21, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <CornerPlusMarkers color="#94a3b8" bg="#ffffff" size="12px" />
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: 0,
                    backgroundColor: '#fff1f2',
                    color: '#780115',
                    border: '1px dashed #fecdd3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px'
                  }}>
                    <Icon size={18} />
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                    {item.title}
                  </h4>
                  <p style={{ fontSize: '0.86rem', color: '#64748b', lineHeight: 1.5 }}>
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================== 4. TESTIMONIALS SECTION ==================== */}
      <section id="testimonials-section" style={{
        padding: '80px 24px',
        backgroundColor: '#fafaf9',
        borderTop: '1px dashed #cbd5e1',
        borderBottom: '1px dashed #cbd5e1'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 48px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '999px',
              backgroundColor: '#ffffff',
              border: '1px dashed #cbd5e1',
              color: '#780115',
              fontSize: '0.78rem',
              fontWeight: 600,
              marginBottom: '12px'
            }}>
              <UserCheck size={13} />
              <span>Testimonials</span>
            </div>
            <h2 style={{
              fontSize: 'clamp(2rem, 3.8vw, 2.8rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: '#0f172a',
              marginBottom: '14px'
            }}>
              What builders & job seekers are saying
            </h2>
            <p style={{ fontSize: '1.05rem', color: '#64748b', lineHeight: 1.6 }}>
              Real feedback from engineers, designers, and tech leaders landing high-growth positions.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '16px'
          }}>
            {TESTIMONIALS.map((t, idx) => (
              <div
                key={idx}
                style={{
                  position: 'relative',
                  padding: '24px',
                  borderRadius: 0,
                  backgroundColor: '#ffffff',
                  border: '1px dashed #cbd5e1',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#780115';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(120, 1, 21, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <CornerPlusMarkers color="#94a3b8" bg="#ffffff" size="12px" />
                <p style={{ fontSize: '0.94rem', color: '#334155', lineHeight: 1.6, marginBottom: '20px', fontStyle: 'italic' }}>
                  "{t.quote}"
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img
                    src={t.avatar}
                    alt={t.name}
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>{t.name}</span>
                      <CheckCircle2 size={13} color="#059669" />
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                      {t.role} • <strong style={{ color: '#780115' }}>{t.company}</strong>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== 5. FREQUENTLY ASKED QUESTIONS ==================== */}
      <section id="faq-section" style={{
        padding: '80px 24px',
        maxWidth: '860px',
        margin: '0 auto'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: '999px',
            backgroundColor: '#fff1f2',
            color: '#780115',
            fontSize: '0.78rem',
            fontWeight: 600,
            marginBottom: '12px'
          }}>
            <HelpCircle size={13} />
            <span>Frequently asked questions</span>
          </div>
          <h2 style={{
            fontSize: 'clamp(2rem, 3.8vw, 2.8rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#0f172a',
            marginBottom: '14px'
          }}>
            Frequently asked questions
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#64748b' }}>
            Common questions about Careerhut. Need more help? Reach out anytime.
          </p>
        </div>

        {/* Accordions (Sharp frame with radius 0 & corner plus markers) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                style={{
                  position: 'relative',
                  border: '1px dashed #cbd5e1',
                  borderRadius: 0,
                  backgroundColor: '#ffffff',
                  overflow: 'visible',
                  transition: 'all 0.15s ease'
                }}
              >
                <CornerPlusMarkers color="#94a3b8" bg="#ffffff" size="12px" />
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  style={{
                    width: '100%',
                    padding: '18px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a' }}>
                    {faq.question}
                  </span>
                  <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: isOpen ? '#fff1f2' : '#f1f5f9',
                    color: isOpen ? '#780115' : '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginLeft: '12px'
                  }}>
                    <ChevronDown size={15} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </div>
                </button>

                {isOpen && (
                  <div style={{ padding: '0 20px 20px', fontSize: '0.92rem', color: '#475569', lineHeight: 1.65 }}>
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ==================== 6. HIGH-IMPACT CTA SECTION (Dashed frame with sharp corner radius 0 & corner + markers) ==================== */}
      <section style={{
        padding: '0 24px 80px',
        maxWidth: '1280px',
        margin: '0 auto'
      }}>
        <div style={{
          position: 'relative',
          padding: '56px 30px',
          borderRadius: 0,
          border: '1px dashed #cbd5e1',
          background: 'linear-gradient(135deg, #ffffff 0%, #fff1f2 100%)',
          textAlign: 'center',
          boxShadow: '0 16px 40px -12px rgba(120, 1, 21, 0.08)'
        }}>
          <CornerPlusMarkers color="#94a3b8" bg="#ffffff" />

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: '999px',
            backgroundColor: '#ffffff',
            border: '1px solid #fecdd3',
            color: '#780115',
            fontSize: '0.78rem',
            fontWeight: 600,
            marginBottom: '14px'
          }}>
            <Sparkles size={13} />
            <span>Get started free</span>
          </div>

          <h2 style={{
            fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)',
            fontWeight: 800,
            letterSpacing: '-0.035em',
            color: '#0f172a',
            maxWidth: '780px',
            margin: '0 auto 16px',
            lineHeight: 1.15
          }}>
            Stand out in a crowded job market.
          </h2>

          <p style={{
            fontSize: '1.05rem',
            color: '#475569',
            maxWidth: '620px',
            margin: '0 auto 30px',
            lineHeight: 1.6
          }}>
            Skip the recruiter black hole. Access verified direct listings, hiring contacts, and intelligent career tools built for ambitious builders.
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => onExploreJobs()}
              style={{
                padding: '12px 26px',
                borderRadius: '8px',
                backgroundColor: '#780115',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.96rem',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(120, 1, 21, 0.28)',
                transition: 'all 0.15s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#5c0010';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#780115';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <span>Explore all jobs</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{
                padding: '12px 22px',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                border: '1px solid #cbd5e1',
                fontWeight: 700,
                fontSize: '0.96rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
            >
              <span>Direct portal search</span>
              <Globe size={16} color="#780115" />
            </button>
          </div>
        </div>
      </section>

      {/* ==================== 7. FOOTER ==================== */}
      <footer style={{
        borderTop: '1px solid #e2e8f0',
        backgroundColor: '#fafaf9',
        padding: '56px 24px 36px'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '36px',
            marginBottom: '40px'
          }}>
            {/* Brand Column */}
            <div style={{ gridColumn: 'span 2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '6px',
                  backgroundColor: '#780115',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Flame size={17} />
                </div>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                  Career<span style={{ color: '#780115' }}>hut</span>
                </span>
              </div>
              <p style={{ fontSize: '0.86rem', color: '#64748b', lineHeight: 1.6, maxWidth: '340px', marginBottom: '16px' }}>
                The high-performance direct career discovery platform. Bypass intermediate job boards and connect with verified tech openings.
              </p>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 10px',
                borderRadius: '999px',
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                color: '#059669',
                fontSize: '0.74rem',
                fontWeight: 600
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#059669' }} />
                <span>All sync services online • 99.98% uptime</span>
              </div>
            </div>

            {/* Links Column: Discover */}
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>
                Discover
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '0.84rem' }}>
                <a 
                  onClick={() => onExploreJobs()} 
                  style={{ color: '#475569', textDecoration: 'none', cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#780115'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#475569'}
                >
                  All 10,000+ jobs
                </a>
                <a 
                  onClick={() => onExploreJobs('remote')} 
                  style={{ color: '#475569', textDecoration: 'none', cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#780115'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#475569'}
                >
                  Remote positions
                </a>
                <a 
                  onClick={() => onExploreJobs('Palantir')} 
                  style={{ color: '#475569', textDecoration: 'none', cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#780115'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#475569'}
                >
                  Palantir openings
                </a>
                <a 
                  onClick={() => onExploreJobs('Supabase')} 
                  style={{ color: '#475569', textDecoration: 'none', cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#780115'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#475569'}
                >
                  Supabase openings
                </a>
                <a 
                  onClick={() => onExploreJobs('Vercel')} 
                  style={{ color: '#475569', textDecoration: 'none', cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#780115'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#475569'}
                >
                  Vercel openings
                </a>
              </div>
            </div>

            {/* Links Column: Platform */}
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>
                Platform
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '0.84rem' }}>
                <a 
                  onClick={() => onExploreJobs()} 
                  style={{ color: '#475569', textDecoration: 'none', cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#780115'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#475569'}
                >
                  Live dashboard
                </a>
                <a 
                  href="#features-section" 
                  style={{ color: '#475569', textDecoration: 'none' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#780115'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#475569'}
                >
                  Live portal sync
                </a>
                <a 
                  onClick={() => onExploreJobs()} 
                  style={{ color: '#475569', textDecoration: 'none', cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#780115'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#475569'}
                >
                  Application kanban
                </a>
                <a 
                  onClick={() => onExploreJobs()} 
                  style={{ color: '#475569', textDecoration: 'none', cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#780115'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#475569'}
                >
                  Recruiter email intel
                </a>
              </div>
            </div>

            {/* Links Column: Resources */}
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>
                Resources
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '0.84rem' }}>
                <a 
                  href="#faq-section" 
                  style={{ color: '#475569', textDecoration: 'none' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#780115'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#475569'}
                >
                  Faq & guide
                </a>
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noreferrer" 
                  style={{ color: '#475569', textDecoration: 'none' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#780115'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#475569'}
                >
                  GitHub repository
                </a>
                <a 
                  onClick={() => onExploreJobs()} 
                  style={{ color: '#475569', textDecoration: 'none', cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#780115'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#475569'}
                >
                  Privacy & terms
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid #e2e8f0',
            paddingTop: '20px',
            fontSize: '0.8rem',
            color: '#64748b',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              © 2026 Careerhut. All rights reserved. Direct career indexing engine.
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <a href="https://github.com" target="_blank" rel="noreferrer" style={{ color: '#64748b' }}>
                <Github size={17} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" style={{ color: '#64748b' }}>
                <Twitter size={17} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" style={{ color: '#64748b' }}>
                <Linkedin size={17} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
