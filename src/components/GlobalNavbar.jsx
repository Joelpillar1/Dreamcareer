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
  isLegalPage = false
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
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      backgroundColor: 'rgba(255, 255, 255, 0.94)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid #e2e8f0',
      boxShadow: '0 2px 12px rgba(15, 23, 42, 0.05)',
      width: '100%',
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
          onClick={handleBrandClick}
          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          <img 
            src="/Careerhut.png" 
            alt="Careerhut" 
            style={{
              height: '34px',
              width: 'auto',
              maxWidth: '180px',
              objectFit: 'contain',
              display: 'block'
            }}
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
          <button
            onClick={() => onExploreJobs && onExploreJobs()}
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
            {totalJobsCount > 0 && (
              <span style={{
                fontSize: '0.7rem',
                padding: '1px 6px',
                borderRadius: '999px',
                backgroundColor: '#f1f5f9',
                color: '#475569',
                fontWeight: 700
              }}>
                {totalJobsCount >= 1000 ? `${(totalJobsCount / 1000).toFixed(totalJobsCount % 1000 >= 100 ? 1 : 0)}k+` : `${totalJobsCount}`}
              </span>
            )}
          </button>

          <button
            onClick={() => onExploreJobs && onExploreJobs()}
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
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img 
                  src="/Careerhut.png" 
                  alt="Careerhut" 
                  style={{ height: '28px', width: 'auto', maxWidth: '150px', objectFit: 'contain', display: 'block' }} 
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
              <button
                onClick={() => { setMobileMenuOpen(false); onExploreJobs && onExploreJobs(); }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: '#fff1f2', color: '#780115', border: '1px solid #fecdd3', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left' }}
              >
                <Briefcase size={16} />
                <span>Explore Direct Jobs ({totalJobsCount ? totalJobsCount.toLocaleString() : 'Live'})</span>
              </button>

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
