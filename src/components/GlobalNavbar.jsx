import React, { useState } from 'react';
import { 
  ArrowRight, 
  Menu, 
  X, 
  Briefcase, 
  Globe, 
  FileText, 
  Layers, 
  HelpCircle 
} from 'lucide-react';

export default function GlobalNavbar({
  onGoToLanding,
  onExploreJobs,
  totalJobsCount = 0,
  isLegalPage = false,
  currentUser = null,
  onOpenAuth = () => {},
  onSignOut = () => {}
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleBrandClick = () => {
    if (onGoToLanding) {
      onGoToLanding();
    } else if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const handleNavSection = (sectionId) => {
    if (isLegalPage) {
      if (onGoToLanding) {
        onGoToLanding();
        setTimeout(() => {
          const el = document.getElementById(sectionId);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else if (typeof window !== 'undefined') {
        window.location.href = `/#${sectionId}`;
      }
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="global-nav-header">
      <div className="global-nav-inner">
        {/* Logo */}
        <div 
          onClick={handleBrandClick}
          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          <img 
            src="/Careerhut.png" 
            alt="Careerhut" 
            className="global-nav-logo-img"
          />
        </div>

        {/* Center Navigation Links (Desktop Only) */}
        <nav className="landing-nav-desktop" style={{ gap: '6px' }}>
          {/* Blog Link */}
          <a 
            href="#blog" 
            onClick={(e) => {
              e.preventDefault();
              if (onExploreJobs) onExploreJobs();
            }}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.86rem',
              fontWeight: 600,
              color: '#334155',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Blog
          </a>

          {/* Features Link */}
          <a 
            href="#features-section" 
            onClick={(e) => {
              e.preventDefault();
              handleNavSection('features-section');
            }}
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

          {/* FAQ Link */}
          <a 
            href="#faq-section" 
            onClick={(e) => {
              e.preventDefault();
              handleNavSection('faq-section');
            }}
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
          {currentUser && currentUser.isAuthenticated ? (
            <>
              <span className="landing-nav-desktop" style={{
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#475569',
                padding: '4px 8px'
              }}>
                {currentUser.name || currentUser.email}
              </span>

              <button
                onClick={() => onExploreJobs && onExploreJobs()}
                className="global-nav-dashboard-btn"
              >
                <span>{currentUser.hasPaid ? 'Dashboard' : 'Continue Search'}</span>
                <ArrowRight size={14} />
              </button>

              <button
                onClick={onSignOut}
                className="landing-nav-desktop"
                style={{
                  padding: '6px 10px',
                  fontSize: '0.8rem',
                  color: '#ef4444',
                  backgroundColor: 'transparent',
                  border: '1px solid #fecaca',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onOpenAuth('signin')}
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
                Sign In
              </button>

              <button
                onClick={() => onExploreJobs && onExploreJobs()}
                className="global-nav-dashboard-btn"
              >
                <span>Start Searching</span>
                <ArrowRight size={14} />
              </button>
            </>
          )}

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
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img 
                  src="/Careerhut.png" 
                  alt="Careerhut" 
                  style={{ height: '20px', width: 'auto', maxWidth: '120px', objectFit: 'contain', display: 'block' }} 
                />
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '10px' }}>
              {currentUser?.hasPaid ? (
                <>
                  <button
                    onClick={() => { setMobileMenuOpen(false); onExploreJobs && onExploreJobs(); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: '#780115', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <Briefcase size={16} />
                    <span>Go to Dashboard</span>
                  </button>
                  <button
                    onClick={() => { setMobileMenuOpen(false); onSignOut && onSignOut(); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'transparent', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '8px', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <span>Sign Out ({currentUser.name || currentUser.email})</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { setMobileMenuOpen(false); onExploreJobs && onExploreJobs(); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: '#780115', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <Briefcase size={16} />
                    <span>Start Searching</span>
                  </button>
                  <button
                    onClick={() => { setMobileMenuOpen(false); onOpenAuth && onOpenAuth('signin'); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'transparent', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <span>Sign In</span>
                  </button>
                </>
              )}

              <button
                onClick={() => { setMobileMenuOpen(false); onExploreJobs && onExploreJobs('remote'); }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'transparent', color: '#334155', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer', textAlign: 'left' }}
              >
                <Globe size={16} />
                <span>Remote Opportunities</span>
              </button>

              <a
                href="#blog"
                onClick={(e) => {
                  e.preventDefault();
                  setMobileMenuOpen(false);
                  if (onExploreJobs) onExploreJobs();
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', color: '#334155', textDecoration: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.88rem' }}
              >
                <FileText size={16} color="#780115" />
                <span>Blog</span>
              </a>

              <a
                href="#features-section"
                onClick={(e) => {
                  e.preventDefault();
                  setMobileMenuOpen(false);
                  handleNavSection('features-section');
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', color: '#334155', textDecoration: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.88rem' }}
              >
                <Layers size={16} color="#780115" />
                <span>Features</span>
              </a>

              <a
                href="#faq-section"
                onClick={(e) => {
                  e.preventDefault();
                  setMobileMenuOpen(false);
                  handleNavSection('faq-section');
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', color: '#334155', textDecoration: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.88rem' }}
              >
                <HelpCircle size={16} color="#780115" />
                <span>FAQ</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
