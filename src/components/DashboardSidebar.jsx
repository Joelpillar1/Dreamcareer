import React, { useState, useEffect, useRef } from 'react';
import { 
  Compass, 
  Bookmark, 
  Mail, 
  Layers, 
  Sparkles, 
  Building2, 
  Globe, 
  Laptop, 
  Briefcase, 
  PlusCircle, 
  ChevronRight,
  ChevronUp,
  ChevronDown,
  SlidersHorizontal,
  CheckCircle2,
  Settings,
  User,
  LogOut,
  Sun,
  Moon,
  Bell,
  FileText,
  Check
} from 'lucide-react';
import CompanyLogo from './CompanyLogo';

const COMPANY_COLORS = {
  amazon: { bg: '#fff7ed', text: '#ea580c', letter: 'a' },
  airbnb: { bg: '#fef2f2', text: '#ef4444', letter: 'a' },
  google: { bg: '#eff6ff', text: '#2563eb', letter: 'G' },
  netflix: { bg: '#fef2f2', text: '#dc2626', letter: 'N' },
  microsoft: { bg: '#f0fdf4', text: '#16a34a', letter: 'M' },
  apple: { bg: '#f8fafc', text: '#0f172a', letter: '🍎' },
  stripe: { bg: '#eef2ff', text: '#4f46e5', letter: 'S' },
  openai: { bg: '#ecfdf5', text: '#059669', letter: 'O' },
  anthropic: { bg: '#fdf2f8', text: '#db2777', letter: 'A' },
  figma: { bg: '#ffffff', text: '#000000', letter: 'F', logo: '/figma-logo.png' },
  vercel: { bg: '#000000', text: '#ffffff', letter: 'V' },
  spotify: { bg: '#ecfdf5', text: '#10b981', letter: 'S' },
  databricks: { bg: '#fef2f2', text: '#ef4444', letter: 'D' },
  cursor: { bg: '#000000', text: '#ffffff', letter: 'C', logo: '/cursor-logo.png' },
  bret: { bg: '#000000', text: '#ffffff', letter: 'B' },
  brex: { bg: '#000000', text: '#ffffff', letter: 'B' },
  palantir: { bg: '#000000', text: '#ffffff', letter: 'P' },
  miro: { bg: '#ffd02f', text: '#050038', letter: 'M' },
  runway: { bg: '#000000', text: '#ffffff', letter: 'R' },
  supabase: { bg: '#3ecf8e', text: '#121212', letter: 'S' },
  duolingo: { bg: '#58cc02', text: '#ffffff', letter: 'D' },
  temporal: { bg: '#000000', text: '#ffffff', letter: 'T' },
  intercom: { bg: '#000000', text: '#ffffff', letter: 'I' },
  cohere: { bg: '#39594c', text: '#ffffff', letter: 'C' },
  twilio: { bg: '#f22f46', text: '#ffffff', letter: 'T' },
  notion: { bg: '#000000', text: '#ffffff', letter: 'N', logo: '/notion-logo.png' },
  airtable: { bg: '#ffffff', text: '#18bfff', letter: 'A', logo: '/airtable-logo.png' },
  mongodb: { bg: '#001e2b', text: '#00ed64', letter: 'M', logo: '/mongodb-logo.png' },
  docker: { bg: '#0b132b', text: '#2496ed', letter: 'D', logo: '/docker-logo.png' },
  okta: { bg: '#000000', text: '#ffffff', letter: 'O', logo: '/okta-logo.png' },
  'our team': { bg: '#000000', text: '#ffffff', letter: 'O', logo: '/okta-logo.png' }
};

const SECTION_LABEL_STYLE = {
  fontSize: '0.7rem',
  fontWeight: 700,
  color: 'var(--text-subtle)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  paddingLeft: '8px',
  marginBottom: '6px'
};

function getLogo(name) {
  const lower = (name || '').toLowerCase();
  for (const [k, v] of Object.entries(COMPANY_COLORS)) {
    if (lower.includes(k)) return v;
  }
  return { bg: '#f1f5f9', text: '#475569', letter: (name || 'C').charAt(0).toUpperCase() };
}

export default function DashboardSidebar({
  totalJobsCount,
  bookmarkedCount,
  companies = [],
  companyLogos = {},
  selectedCompany,
  onSelectCompany,
  selectedWorkplace,
  onSelectWorkplace,
  selectedLocation,
  onSelectLocation,
  countries = [],
  regions = [],
  hasEmailOnly,
  onToggleHasEmail,
  onlyBookmarked,
  onToggleBookmarked,
  onResetFilters,
  onGoToLanding
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('careerhut_theme') || 'light');
  const profileContainerRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('careerhut_theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileContainerRef.current && !profileContainerRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileOpen]);

  // Every country that has at least one loaded role, resolved from the job
  // data itself (see src/utils/locations.js) and sorted by role count.
  const locationItems = [
    { label: 'All Countries', value: '', icon: '🌐', count: null },
    ...countries,
  ];

  const sectionLabelStyle = SECTION_LABEL_STYLE;

  const locationButtonStyle = (isSelected) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 10px',
    borderRadius: 'var(--radius-sm)',
    background: isSelected ? 'var(--primary-light)' : 'transparent',
    color: isSelected ? 'var(--primary-text)' : 'var(--text-main)',
    fontWeight: isSelected ? 700 : 500,
    fontSize: '0.82rem',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'var(--transition)'
  });

  const renderLocationButton = (item, showCount) => {
    const isSelected = selectedLocation === item.value;
    return (
      <button
        key={item.value || item.label}
        title={showCount && item.count != null ? `${item.count} roles in ${item.label}` : item.label}
        onClick={() => onSelectLocation(isSelected ? '' : item.value)}
        style={locationButtonStyle(isSelected)}
        onMouseEnter={(e) => {
          if (!isSelected) e.currentTarget.style.background = 'var(--bg-secondary)';
        }}
        onMouseLeave={(e) => {
          if (!isSelected) e.currentTarget.style.background = 'transparent';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <span>{item.icon}</span>
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {item.label}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {showCount && item.count != null && (
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              color: isSelected ? 'var(--primary-text)' : 'var(--text-subtle)'
            }}>
              {item.count}
            </span>
          )}
          {isSelected && <CheckCircle2 size={13} color="var(--primary)" />}
        </div>
      </button>
    );
  };

  return (
    <aside style={{
      width: '260px',
      flexShrink: 0,
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden',
      zIndex: 10
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '18px 20px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div 
          onClick={onGoToLanding}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: onGoToLanding ? 'pointer' : 'default' }}
          title={onGoToLanding ? "Back to Landing Page" : undefined}
        >
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #780115 0%, #9c0e24 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1rem',
            boxShadow: '0 2px 6px rgba(120, 1, 21, 0.25)'
          }}>
            C
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Careerhut
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', fontWeight: 600 }}>
              Direct Jobs Engine
            </div>
          </div>
        </div>

        <button
          onClick={onResetFilters}
          title="Reset all filters"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-subtle)',
            fontSize: '0.72rem',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '4px 6px',
            borderRadius: 'var(--radius-sm)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-subtle)'}
        >
          Reset
        </button>
      </div>

      {/* Scrollable Navigation & Filter Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {/* Section 1: Main Views */}
        <div>
          <div style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: 'var(--text-subtle)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            paddingLeft: '8px',
            marginBottom: '6px'
          }}>
            <span>Navigation</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {onGoToLanding && (
              <button
                onClick={onGoToLanding}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '9px',
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'var(--transition)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Layers size={14} color="var(--text-subtle)" />
                <span>Landing Overview</span>
              </button>
            )}

            {/* All Jobs */}
            <button
              onClick={() => {
                if (onlyBookmarked) onToggleBookmarked(false);
                if (hasEmailOnly) onToggleHasEmail(false);
                if (selectedCompany) onSelectCompany('');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                background: (!onlyBookmarked && !hasEmailOnly && !selectedCompany) ? 'var(--primary-light)' : 'transparent',
                color: (!onlyBookmarked && !hasEmailOnly && !selectedCompany) ? 'var(--primary-text)' : 'var(--text-main)',
                fontWeight: (!onlyBookmarked && !hasEmailOnly && !selectedCompany) ? 700 : 500,
                fontSize: '0.84rem',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'var(--transition)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <Compass size={15} color={(!onlyBookmarked && !hasEmailOnly && !selectedCompany) ? 'var(--primary)' : 'var(--text-subtle)'} />
                <span>All Direct Jobs</span>
              </div>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                background: (!onlyBookmarked && !hasEmailOnly && !selectedCompany) ? 'rgba(120, 1, 21, 0.12)' : 'var(--bg-secondary)',
                color: (!onlyBookmarked && !hasEmailOnly && !selectedCompany) ? 'var(--primary-text)' : 'var(--text-muted)',
                padding: '2px 7px',
                borderRadius: 'var(--radius-full)'
              }}>
                {totalJobsCount?.toLocaleString() || '680+'}
              </span>
            </button>

            {/* Saved Jobs */}
            <button
              onClick={() => onToggleBookmarked(!onlyBookmarked)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                background: onlyBookmarked ? 'var(--primary-light)' : 'transparent',
                color: onlyBookmarked ? 'var(--primary-text)' : 'var(--text-main)',
                fontWeight: onlyBookmarked ? 700 : 500,
                fontSize: '0.84rem',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'var(--transition)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <Bookmark size={15} color={onlyBookmarked ? 'var(--primary)' : 'var(--text-subtle)'} />
                <span>Saved Roles</span>
              </div>
              {bookmarkedCount > 0 && (
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  background: 'var(--primary)',
                  color: '#ffffff',
                  padding: '2px 7px',
                  borderRadius: 'var(--radius-full)'
                }}>
                  {bookmarkedCount}
                </span>
              )}
            </button>

            {/* Direct Recruiter Contacts */}
            <button
              onClick={() => onToggleHasEmail(!hasEmailOnly)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                background: hasEmailOnly ? 'var(--primary-light)' : 'transparent',
                color: hasEmailOnly ? 'var(--primary-text)' : 'var(--text-main)',
                fontWeight: hasEmailOnly ? 700 : 500,
                fontSize: '0.84rem',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'var(--transition)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <Mail size={15} color={hasEmailOnly ? 'var(--primary)' : 'var(--text-subtle)'} />
                <span>Recruiter Contacts</span>
              </div>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 600,
                color: 'var(--primary)',
                background: 'var(--primary-light)',
                padding: '2px 6px',
                borderRadius: '4px'
              }}>
                Verified
              </span>
            </button>
          </div>
        </div>

        {/* Section 2: Direct Company Portals */}
        <div>
          <div style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: 'var(--text-subtle)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            paddingLeft: '8px',
            marginBottom: '6px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>Company Portals</span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-subtle)' }}>({companies.length})</span>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            // Every company is rendered; this box scrolls so the sections
            // below (Workplace, Locations) stay reachable in the sidebar.
            maxHeight: '320px',
            overflowY: 'auto',
            paddingRight: '2px'
          }}>
            {companies.map((c) => {
              const isSelected = selectedCompany === c.company;
              const logoUrl = companyLogos[c.company] || c.company_logo || null;

              return (
                <button
                  key={c.company}
                  onClick={() => onSelectCompany(isSelected ? '' : c.company)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: isSelected ? 'var(--primary-light)' : 'transparent',
                    color: isSelected ? 'var(--primary-text)' : 'var(--text-main)',
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: '0.82rem',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'var(--transition)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'var(--bg-secondary)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <CompanyLogo src={logoUrl} name={c.company} size={20} radius={4} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.company}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: isSelected ? 'var(--primary-text)' : 'var(--text-subtle)'
                  }}>
                    {c.job_count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>


        {/* Section 4: Locations -- every country with roles, from the data */}
        <div>
          <div style={sectionLabelStyle}>
            Countries
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            maxHeight: '320px',
            overflowY: 'auto',
            paddingRight: '2px'
          }}>
            {locationItems.map((item) => renderLocationButton(item, true))}
          </div>

          {regions.length > 0 && (
            <div style={{ marginTop: '14px' }}>
              <div style={sectionLabelStyle}>Regions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {regions.map((item) => renderLocationButton(item, true))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom User Profile Section with Popover Menu */}
      <div 
        ref={profileContainerRef}
        style={{ position: 'relative' }}
      >
        {/* Popover Dropup Menu */}
        {profileOpen && (
          <div style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            left: '10px',
            right: '10px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-modal)',
            padding: '8px',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            {/* Popover Header User Card */}
            <div style={{
              padding: '10px 10px 8px',
              borderBottom: '1px solid var(--border-color)',
              marginBottom: '4px'
            }}>
              <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-main)' }}>
                Joel Morgan
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>
                joel.morgan@careerhut.io
              </div>
              <div style={{
                marginTop: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.68rem',
                fontWeight: 600,
                color: 'var(--primary)',
                background: 'var(--primary-light)',
                padding: '2px 6px',
                borderRadius: '4px'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                <span>Job Seeker • Pro Plan</span>
              </div>
            </div>

            {/* Appearance / Theme Mode Toggle */}
            <div style={{
              padding: '6px 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-secondary)',
              margin: '2px 0 6px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)' }}>
                {theme === 'dark' ? <Moon size={14} color="var(--primary)" /> : <Sun size={14} color="var(--primary)" />}
                <span>Theme Mode</span>
              </div>
              <div style={{ display: 'flex', gap: '3px' }}>
                <button
                  onClick={() => setTheme('light')}
                  style={{
                    border: 'none',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: theme === 'light' ? 'var(--primary)' : 'transparent',
                    color: theme === 'light' ? '#ffffff' : 'var(--text-subtle)',
                    transition: 'var(--transition)'
                  }}
                >
                  Light
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  style={{
                    border: 'none',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: theme === 'dark' ? 'var(--primary)' : 'transparent',
                    color: theme === 'dark' ? '#ffffff' : 'var(--text-subtle)',
                    transition: 'var(--transition)'
                  }}
                >
                  Dark
                </button>
              </div>
            </div>

            {/* Profile Settings */}
            <button
              onClick={() => setProfileOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 8px',
                fontSize: '0.8rem',
                color: 'var(--text-main)',
                border: 'none',
                background: 'transparent',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'var(--transition)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <User size={14} color="var(--text-subtle)" />
              <span>Profile & Resume</span>
            </button>

            {/* Account Settings */}
            <button
              onClick={() => setProfileOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 8px',
                fontSize: '0.8rem',
                color: 'var(--text-main)',
                border: 'none',
                background: 'transparent',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'var(--transition)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Settings size={14} color="var(--text-subtle)" />
              <span>Preferences & Settings</span>
            </button>

            {/* Notification Alerts */}
            <button
              onClick={() => setProfileOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 8px',
                fontSize: '0.8rem',
                color: 'var(--text-main)',
                border: 'none',
                background: 'transparent',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'var(--transition)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Bell size={14} color="var(--text-subtle)" />
              <span>Job Alerts & Notifications</span>
            </button>

            <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }} />

            {/* Sign Out */}
            <button
              onClick={() => {
                setProfileOpen(false);
                alert('Signed out successfully.');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 8px',
                fontSize: '0.8rem',
                color: '#ef4444',
                border: 'none',
                background: 'transparent',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                fontWeight: 600,
                transition: 'var(--transition)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <LogOut size={14} color="#ef4444" />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* Profile Card Trigger Button */}
        <div 
          onClick={() => setProfileOpen(!profileOpen)}
          style={{
            padding: '12px 14px',
            borderTop: '1px solid var(--border-color)',
            background: profileOpen ? 'var(--bg-tag)' : 'var(--bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'var(--transition)',
            userSelect: 'none'
          }}
          onMouseEnter={(e) => {
            if (!profileOpen) e.currentTarget.style.background = 'var(--bg-tag)';
          }}
          onMouseLeave={(e) => {
            if (!profileOpen) e.currentTarget.style.background = 'var(--bg-secondary)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            {/* Avatar with Status Badge */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80" 
                alt="User Profile"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '1.5px solid var(--border-color)',
                  display: 'block'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <span style={{
                position: 'absolute',
                bottom: '0px',
                right: '0px',
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                background: '#10b981',
                border: '1.5px solid #ffffff'
              }} />
            </div>

            {/* User Meta */}
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontWeight: 700,
                fontSize: '0.84rem',
                color: 'var(--text-main)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                Joel Morgan
              </div>
              <div style={{
                fontSize: '0.7rem',
                color: 'var(--text-subtle)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                Senior Candidate • Pro
              </div>
            </div>
          </div>

          {/* Arrow / Chevron Toggle indicator */}
          <div style={{
            color: profileOpen ? 'var(--primary)' : 'var(--text-subtle)',
            padding: '4px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'var(--transition)'
          }}>
            {profileOpen ? <ChevronDown size={17} /> : <ChevronUp size={17} />}
          </div>
        </div>
      </div>
    </aside>
  );
}
