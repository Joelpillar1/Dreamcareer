import React from 'react';
import { Twitter, Linkedin, Mail } from 'lucide-react';
import CornerPlusMarkers from './CornerPlusMarkers';

export default function GlobalFooter({
  onExploreJobs,
  onNavigateLegal
}) {
  const handleLegalClick = (type) => {
    if (onNavigateLegal) {
      onNavigateLegal(type);
    } else if (typeof window !== 'undefined') {
      window.location.hash = `#${type}`;
    }
  };

  const handleJobsClick = (filter = '') => {
    if (onExploreJobs) {
      onExploreJobs(filter);
    } else if (typeof window !== 'undefined') {
      window.location.href = '/dashboard';
    }
  };

  return (
    <footer style={{
      backgroundColor: '#ffffff',
      padding: '56px 24px 72px',
      width: '100%'
    }}>
      <div className="segmented-footer-wrapper">
        {/* Corner Plus Accents */}
        <CornerPlusMarkers color="#94a3b8" bg="#ffffff" size="13px" />

        {/* Top Brand Segment */}
        <div className="segmented-footer-top">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <img 
                src="/Careerhut.png" 
                alt="Careerhut" 
                style={{ height: '24px', width: 'auto', maxWidth: '140px', objectFit: 'contain', display: 'block' }} 
              />
            </div>
            <p style={{ fontSize: '0.86rem', color: '#64748b', maxWidth: '520px', margin: 0, lineHeight: 1.55 }}>
              Discover direct tech jobs, company career portals, and verified recruiter contacts from across the ecosystem.
            </p>
          </div>
        </div>

        {/* Middle 4-Column Segmented Grid */}
        <div className="segmented-footer-grid">
          {/* Col 1: Platform & Features */}
          <div className="segmented-footer-col">
            <div className="segmented-footer-col-title">Platform</div>
            <div className="segmented-footer-links">
              <a className="segmented-footer-link" onClick={() => handleJobsClick()}>Direct Job Feed</a>
              <a className="segmented-footer-link" onClick={() => handleJobsClick('remote')}>Remote Opportunities</a>
              <a className="segmented-footer-link" onClick={() => handleJobsClick('email')}>Verified Recruiter Inboxes</a>
              <a className="segmented-footer-link" href="#features-section">Direct ATS & Portal Sync</a>
              <a className="segmented-footer-link" onClick={() => handleJobsClick('saved')}>Saved Bookmarks</a>
              <a className="segmented-footer-link" href="#features-section">Platform Architecture</a>
            </div>
          </div>

          {/* Col 2: Discover Roles */}
          <div className="segmented-footer-col">
            <div className="segmented-footer-col-title">Discover Roles</div>
            <div className="segmented-footer-links">
              <a className="segmented-footer-link" onClick={() => handleJobsClick('AI')}>AI & Machine Learning</a>
              <a className="segmented-footer-link" onClick={() => handleJobsClick('Frontend')}>Frontend Engineering</a>
              <a className="segmented-footer-link" onClick={() => handleJobsClick('Backend')}>Backend & Systems</a>
              <a className="segmented-footer-link" onClick={() => handleJobsClick('Full Stack')}>Full Stack Development</a>
              <a className="segmented-footer-link" onClick={() => handleJobsClick('Engineering Manager')}>Engineering Leadership</a>
              <a className="segmented-footer-link" onClick={() => handleJobsClick('Mobile')}>Mobile Engineering</a>
            </div>
          </div>

          {/* Col 3: Company & Legal */}
          <div className="segmented-footer-col">
            <div className="segmented-footer-col-title">Company & Legal</div>
            <div className="segmented-footer-links">
              <a className="segmented-footer-link" href="#features-section">About Careerhut</a>
              <a className="segmented-footer-link" onClick={() => handleJobsClick()}>Engineering Blog</a>
              <a className="segmented-footer-link" href="#faq-section">Frequently Asked Questions</a>
              <a className="segmented-footer-link" onClick={() => handleLegalClick('privacy')} style={{ cursor: 'pointer' }}>Privacy Policy</a>
              <a className="segmented-footer-link" onClick={() => handleLegalClick('terms')} style={{ cursor: 'pointer' }}>Terms of Service</a>
              <a className="segmented-footer-link" onClick={() => handleLegalClick('refund')} style={{ cursor: 'pointer' }}>Refund Policy</a>
              <a className="segmented-footer-link" href="mailto:team@careerhut.org">Contact Support</a>
            </div>
          </div>

          {/* Col 4: Developers & AI */}
          <div className="segmented-footer-col">
            <div className="segmented-footer-col-title">Developers & AI</div>
            <div className="segmented-footer-links">
              <a className="segmented-footer-link" href="/llms.txt" target="_blank" rel="noreferrer">llms.txt (AI Brief)</a>
              <a className="segmented-footer-link" href="/llms-full.txt" target="_blank" rel="noreferrer">llms-full.txt (Full Context)</a>
              <a className="segmented-footer-link" href="/robots.txt" target="_blank" rel="noreferrer">robots.txt (Crawler Directives)</a>
              <a className="segmented-footer-link" href="/sitemap.xml" target="_blank" rel="noreferrer">sitemap.xml (SEO Sitemap)</a>
              <a className="segmented-footer-link" href="/openapi.json" target="_blank" rel="noreferrer">openapi.json (API Spec)</a>
            </div>
          </div>
        </div>

        {/* Bottom Social & Copyright Segment */}
        <div className="segmented-footer-bottom">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>Connect</span>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none', fontSize: '0.78rem' }}>
              <Twitter size={14} />
              <span>Twitter</span>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none', fontSize: '0.78rem' }}>
              <Linkedin size={14} />
              <span>LinkedIn</span>
            </a>
            <a href="mailto:team@careerhut.org" style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none', fontSize: '0.78rem' }}>
              <Mail size={14} />
              <span>Email Us</span>
            </a>
          </div>

          <div>
            © 2026 Careerhut. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
