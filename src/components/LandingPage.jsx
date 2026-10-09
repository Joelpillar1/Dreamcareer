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
  HelpCircle
} from 'lucide-react';
import CompanyLogo from './CompanyLogo';
import CornerPlusMarkers from './CornerPlusMarkers';
import GlobalNavbar from './GlobalNavbar';
import GlobalFooter from './GlobalFooter';

// Featured Companies with verified logos for the Marquee & Showcase
const FEATURED_COMPANIES = [
  { name: 'Stripe', roleCount: 685, category: 'Fintech & Payments', logo: '/logos/stripe.svg', tag: 'Global payments' },
  { name: 'Anthropic', roleCount: 502, category: 'Foundation AI', logo: '/logos/anthropic.svg', tag: 'Claude & Safety' },
  { name: 'OpenAI', roleCount: 501, category: 'Artificial Intelligence', logo: '/logos/openai.svg', tag: 'ChatGPT & Frontier' },
  { name: 'Figma', roleCount: 156, category: 'Design Systems', logo: '/logos/figma.svg', tag: 'Design cloud' },
  { name: 'Miro', roleCount: 112, category: 'Visual Collaboration', logo: '/logos/miro.svg', tag: 'Visual workspace' },
  { name: 'Supabase', roleCount: 51, category: 'DevTools & DB', logo: '/logos/supabase.png', tag: 'Open source' },
  { name: 'Vercel', roleCount: 85, category: 'Cloud & Frontend', logo: '/logos/vercel.png', tag: 'Frontend cloud' },
  { name: 'Linear', roleCount: 31, category: 'Issue Tracking', logo: '/logos/linear.svg', tag: 'Project tracking' },
  { name: 'Shopify', roleCount: 33, category: 'Commerce Engine', logo: '/logos/shopify.svg', tag: 'Global commerce' },
  { name: 'Notion', roleCount: 133, category: 'Productivity', logo: '/logos/notion.png', tag: 'Workspace OS' },
  { name: 'Palantir', roleCount: 314, category: 'Enterprise AI', logo: '/logos/palantir.png', tag: 'AIP & Foundry' },
  { name: 'Datadog', roleCount: 434, category: 'Observability', logo: '/logos/datadog.svg', tag: 'Cloud monitoring' },
  { name: 'Snowflake', roleCount: 356, category: 'Data Cloud', logo: '/logos/snowflake.svg', tag: 'Cloud data warehouse' },
  { name: 'Coinbase', roleCount: 223, category: 'Crypto & Web3', logo: '/logos/coinbase.svg', tag: 'Digital assets' },
  { name: 'Docker', roleCount: 62, category: 'Infrastructure', logo: '/logos/docker.png', tag: 'Containers & Dev' },
  { name: 'Duolingo', roleCount: 60, category: 'EdTech & AI', logo: '/logos/duolingo.png', tag: 'Consumer AI' },
  { name: 'Intercom', roleCount: 105, category: 'AI Support', logo: '/logos/intercom.png', tag: 'Fin AI support' },
  { name: 'Brex', roleCount: 284, category: 'Fintech', logo: '/logos/brex.svg', tag: 'Financial OS' }
];

// Interactive Feature tabs
const FEATURE_TABS = [
  {
    id: 'sync',
    title: 'Live discovery',
    subtitle: 'Direct URL ingestion',
    icon: Globe,
    badge: 'Discover',
    headline: 'Index company career portals in seconds',
    description: 'Bypass laggy aggregate job boards. Ingest official career domains (Miro, Supabase, Stripe, Figma) with verified job details and hiring team contacts.',
    bullets: [
      'Zero recruiter middlemen, 100% authentic listings',
      'Deep browser execution for dynamic JavaScript portals',
      'Instant synchronization with your personal dashboard'
    ],
    buttonText: 'Explore live roles'
  },
  {
    id: 'email',
    title: 'Direct inboxes',
    subtitle: 'Recruiter contacts',
    icon: Mail,
    badge: 'Outreach',
    headline: 'Connect directly with hiring managers',
    description: 'Automated parser surfaces verified hiring emails, team inboxes, and talent partner addresses so you can send high-impact outreach.',
    bullets: [
      'Verified hiring team emails & talent contacts',
      '1-click mailto templates with prefilled subject lines',
      'Direct team contacts for high-priority openings'
    ],
    buttonText: 'Find recruiter contacts'
  },
  {
    id: 'filters',
    title: 'Deep multi-filter',
    subtitle: 'Remote & tech stack',
    icon: SlidersHorizontal,
    badge: 'Precision',
    headline: 'Pinpoint exact remote and stack matches',
    description: 'Filter across live verified roles with instant composite filters: Workplace type (Remote / Hybrid / On-Site), country, specific tech stacks, and company tiers.',
    bullets: [
      'Instant client-side sub-millisecond query execution',
      'Workplace badges and geographic filtering across 30+ countries',
      'Company-level drilldown with live vacancy counts'
    ],
    buttonText: 'Filter live openings'
  },
  {
    id: 'catalog',
    title: 'Tech catalog',
    subtitle: 'Verified companies',
    icon: Building2,
    badge: 'Directory',
    headline: 'Curated catalog of tier-1 engineering teams',
    description: 'Explore active job inventories from world-class engineering teams across AI, Developer Tools, Infrastructure, and YC-backed unicorns.',
    bullets: [
      'Indexed live roles from top engineering companies',
      'Real company brand logos, verified career pages, and domain checks',
      'Daily scheduled verification keeping data continuously fresh'
    ],
    buttonText: 'Browse companies'
  }
];

// FAQ items
const FAQS = [
  {
    question: 'What is Careerhut and how is it different from traditional job boards?',
    answer: 'Careerhut is a direct career portal engine. Unlike LinkedIn or Indeed which rely on sponsored job posts and third-party recruiter middleman listings, Careerhut directly indexes official company career domains (e.g. Miro, Supabase, Stripe, Figma, and tier-1 tech teams). This guarantees 100% active, verified positions with zero ghost listings.'
  },
  {
    question: 'Is Careerhut free to use?',
    answer: 'Yes! Careerhut is 100% free to explore, search, filter, and discover. You can browse live verified jobs, bookmark positions, and use direct portal discovery without any subscription fees.'
  },
  {
    question: 'Are the recruiter emails verified?',
    answer: 'Yes. Careerhut scans the official job posting pages and company domain headers to extract authentic talent inboxes and recruiter contacts. When available, you can click to launch your mail client with pre-filled application details.'
  },
  {
    question: 'How often are the job listings updated?',
    answer: 'Our curated list of job listings is continuously updated and verified directly from official company career portals. You can search, filter, and explore all the latest openings across top engineering teams without needing to run manual syncs.'
  }
];

// App-Themed Section Tag with Horizontal Connectors & Terminal Circles
function SectionTag({ label }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      maxWidth: '480px',
      margin: '0 auto 16px',
      position: 'relative'
    }}>
      {/* Left Line with Circle Ring Terminal */}
      <div style={{
        flex: 1,
        height: '1px',
        background: 'linear-gradient(to right, transparent, #cbd5e1 75%, #94a3b8 100%)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end'
      }}>
        <div style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          border: '1.5px solid #780115',
          backgroundColor: '#ffffff',
          position: 'absolute',
          right: '-4px',
          zIndex: 2
        }} />
      </div>

      {/* Center Tag Badge */}
      <div style={{
        margin: '0 14px',
        padding: '5px 16px',
        borderRadius: '6px',
        backgroundColor: '#fff1f2',
        border: '1px solid #780115',
        boxShadow: '0 1px 4px rgba(120, 1, 21, 0.08)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2
      }}>
        <span style={{
          fontSize: '0.76rem',
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#780115'
        }}>
          {label}
        </span>
      </div>

      {/* Right Line with Circle Ring Terminal */}
      <div style={{
        flex: 1,
        height: '1px',
        background: 'linear-gradient(to left, transparent, #cbd5e1 75%, #94a3b8 100%)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start'
      }}>
        <div style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          border: '1.5px solid #780115',
          backgroundColor: '#ffffff',
          position: 'absolute',
          left: '-4px',
          zIndex: 2
        }} />
      </div>
    </div>
  );
}

export default function LandingPage({
  onExploreJobs,
  onCrawlUrl,
  totalJobsCount = 10420,
  onSelectCompany,
  onSelectTag,
  onNavigateLegal
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
      position: 'relative',
      width: '100%'
    }}>
      {/* ==================== 1. GLOBAL TOP NAVBAR (Sticky) ==================== */}
      <GlobalNavbar 
        onGoToLanding={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onExploreJobs={onExploreJobs}
        totalJobsCount={totalJobsCount}
      />

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
              Direct career discovery
            </span>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              100% verified roles
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
            Search live roles indexed straight from official company career pages, complete with verified recruiter emails and direct hiring team contacts.
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
              <span>Start searching {totalJobsCount ? `(${totalJobsCount.toLocaleString()} roles)` : ''}</span>
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
        </div>

        {/* B. HERO IMAGE / PROJECT PREVIEW FRAME (Dashed frame with sharp corner radius 0 & corner + markers) */}
        <div 
          id="hero-preview-frame"
          onClick={() => onExploreJobs()}
          style={{
            position: 'relative',
            borderRadius: 0,
            border: '1px dashed #cbd5e1',
            backgroundColor: '#ffffff',
            padding: '12px',
            boxShadow: '0 20px 50px -12px rgba(15, 23, 42, 0.08)',
            marginBottom: '48px',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#780115';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 24px 60px -12px rgba(120, 1, 21, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#cbd5e1';
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 20px 50px -12px rgba(15, 23, 42, 0.08)';
          }}
        >
          {/* Sharp Corner Plus Markers (Radius 0) */}
          <CornerPlusMarkers color="#94a3b8" bg="#ffffff" />

          {/* Hero Preview Image */}
          <div style={{
            position: 'relative',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            backgroundColor: '#ffffff'
          }}>
            <img 
              src="/careerhub.png" 
              alt="Careerhut Live Direct Job Dashboard Preview"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
            />
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
          <SectionTag label="Capabilities" />
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

        {/* Unified Architectural Features Showcase Box matching screenshot */}
        <div className="features-segmented-box">
          <CornerPlusMarkers color="#94a3b8" bg="#ffffff" />

          {/* Top Tabs Bar (6 Segmented Cells) */}
          <div className="features-tabs-row">
            {FEATURE_TABS.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`features-tab-cell ${isSelected ? 'active' : ''}`}
                >
                  <div className="features-tab-icon-box">
                    <Icon size={16} />
                  </div>
                  <div className="features-tab-title">
                    {tab.title}
                  </div>
                  <div className="features-tab-subtitle">
                    {tab.subtitle}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Main Body (2 Columns on Desktop, Stacked on Mobile) */}
          <div className="features-body-grid">
            {/* Left Column */}
            <div className="features-body-left">
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '4px',
                backgroundColor: '#fff1f2',
                color: '#780115',
                border: '1px dashed #fecdd3',
                fontSize: '0.78rem',
                fontWeight: 700,
                marginBottom: '18px',
                width: 'fit-content'
              }}>
                <currentFeature.icon size={13} />
                <span>{currentFeature.badge}</span>
              </div>

              <h3 style={{
                fontSize: 'clamp(1.75rem, 3.2vw, 2.3rem)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: '#0f172a',
                lineHeight: 1.2,
                marginBottom: '16px'
              }}>
                {currentFeature.headline}
              </h3>

              <p style={{
                fontSize: '0.98rem',
                color: '#475569',
                lineHeight: 1.6,
                marginBottom: '26px',
                maxWidth: '520px'
              }}>
                {currentFeature.description}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                {currentFeature.bullets.map((bullet, idx) => (
                  <div key={idx} className="features-bullet-row">
                    <div className="features-bullet-checkbox">
                      <Check size={13} strokeWidth={2.8} color="#780115" />
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>
                      {bullet}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onExploreJobs()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  backgroundColor: '#780115',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(120, 1, 21, 0.22)',
                  transition: 'all 0.15s ease',
                  width: 'fit-content'
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
                <span>{currentFeature.buttonText || 'Explore roles'}</span>
                <ArrowRight size={15} />
              </button>
            </div>

            {/* Right Column: Visual Showcase Card with subtle grid background */}
            <div className="features-body-right">
              {/* Dynamic visual preview based on active tab */}
              {activeTab === 'sync' && (
                <div style={{
                  width: '100%',
                  maxWidth: '440px',
                  backgroundColor: '#ffffff',
                  border: '1px dashed #cbd5e1',
                  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>Live Crawler Stream</span>
                    </div>
                    <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#059669', backgroundColor: '#ecfdf5', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>200 OK • 38ms</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                    <Globe size={15} color="#780115" />
                    <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#0f172a', fontWeight: 600 }}>https://stripe.com/jobs</span>
                  </div>
                  <div style={{ padding: '12px', backgroundColor: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>Staff Infrastructure Engineer</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669' }}>$240k - $320k</span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Stripe • Remote, US • Contact: eng-talent@stripe.com</div>
                  </div>
                  <div style={{ padding: '12px', backgroundColor: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>Frontend Systems Engineer</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669' }}>$190k - $260k</span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Stripe • Seattle / SF / Remote • Contact: recruiting@stripe.com</div>
                  </div>
                </div>
              )}

              {activeTab === 'email' && (
                <div style={{
                  width: '100%',
                  maxWidth: '440px',
                  backgroundColor: '#ffffff',
                  border: '1px dashed #cbd5e1',
                  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={15} color="#780115" />
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>Direct Recruiter Contact</span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#059669', backgroundColor: '#ecfdf5', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>Verified Contact</span>
                  </div>
                  <div style={{ padding: '10px 12px', backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Talent Partner</div>
                      <div style={{ fontSize: '0.82rem', fontFamily: 'monospace', color: '#0f172a', fontWeight: 600 }}>careers@supabase.com</div>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#780115', fontWeight: 600 }}>1-Click Mailto</span>
                  </div>
                  <div style={{ padding: '12px', backgroundColor: '#fff1f2', border: '1px dashed #fecdd3', borderRadius: '6px', fontSize: '0.76rem', color: '#475569' }}>
                    <strong style={{ color: '#780115' }}>Subject:</strong> Application for Staff Backend Engineer — Portfolio & Resume
                  </div>
                </div>
              )}

              {activeTab === 'filters' && (
                <div style={{
                  width: '100%',
                  maxWidth: '440px',
                  backgroundColor: '#ffffff',
                  border: '1px dashed #cbd5e1',
                  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '999px', backgroundColor: '#780115', color: '#fff', fontSize: '0.74rem', fontWeight: 600 }}>100% Remote</span>
                    <span style={{ padding: '4px 10px', borderRadius: '999px', backgroundColor: '#f1f5f9', color: '#334155', fontSize: '0.74rem', fontWeight: 600 }}>United States</span>
                    <span style={{ padding: '4px 10px', borderRadius: '999px', backgroundColor: '#f1f5f9', color: '#334155', fontSize: '0.74rem', fontWeight: 600 }}>Senior / Staff</span>
                    <span style={{ padding: '4px 10px', borderRadius: '999px', backgroundColor: '#ecfdf5', color: '#059669', fontSize: '0.74rem', fontWeight: 600 }}>With Recruiter Email</span>
                  </div>
                  <div style={{ padding: '12px', backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>
                      {totalJobsCount ? `${totalJobsCount.toLocaleString()} Verified Roles Indexed` : 'All Verified Roles Indexed'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Filtered across official company portals with sub-millisecond precision</div>
                  </div>
                </div>
              )}

              {activeTab === 'catalog' && (
                <div style={{
                  width: '100%',
                  maxWidth: '440px',
                  backgroundColor: '#ffffff',
                  border: '1px dashed #cbd5e1',
                  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
                  padding: '16px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '8px'
                }}>
                  {FEATURED_COMPANIES.slice(0, 6).map((c) => (
                    <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                      <CompanyLogo name={c.name} src={c.logo} size={24} radius={0} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>{c.name}</div>
                        <div style={{ fontSize: '0.68rem', color: '#780115', fontWeight: 600 }}>{c.roleCount} live roles</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 4. FREQUENTLY ASKED QUESTIONS ==================== */}
      <section id="faq-section" style={{
        padding: '80px 24px',
        maxWidth: '860px',
        margin: '0 auto'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <SectionTag label="FAQ" />
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

      {/* ==================== 5. HIGH-IMPACT CTA SECTION (Dashed frame with sharp corner radius 0 & corner + markers) ==================== */}
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

          <SectionTag label="Get Started" />

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

      {/* ==================== 7. GLOBAL SEGMENTED ARCHITECTURAL FOOTER ==================== */}
      <GlobalFooter 
        onExploreJobs={onExploreJobs}
        onNavigateLegal={onNavigateLegal}
      />
    </div>
  );
}
