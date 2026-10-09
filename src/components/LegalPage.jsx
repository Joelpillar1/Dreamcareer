import React, { useEffect } from 'react';
import { 
  ShieldCheck, 
  Scale, 
  CreditCard, 
  ArrowLeft, 
  CheckCircle2, 
  Copy, 
  Printer, 
  Mail, 
  Sparkles
} from 'lucide-react';
import CornerPlusMarkers from './CornerPlusMarkers';
import GlobalNavbar from './GlobalNavbar';
import GlobalFooter from './GlobalFooter';

export default function LegalPage({ 
  type = 'privacy', 
  onNavigate, 
  onGoToLanding, 
  onExploreJobs,
  totalJobsCount = 0
}) {
  useEffect(() => {
    window.scrollTo(0, 0);
    const titles = {
      privacy: 'Privacy Policy — Careerhut',
      terms: 'Terms of Service — Careerhut',
      refund: 'Refund & Cancellation Policy — Careerhut'
    };
    document.title = titles[type] || 'Legal — Careerhut';
  }, [type]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      alert('Page URL copied to clipboard!');
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      color: '#0f172a',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'inherit'
    }}>
      {/* Global Top Navbar */}
      <GlobalNavbar 
        onGoToLanding={onGoToLanding}
        onExploreJobs={onExploreJobs}
        totalJobsCount={totalJobsCount}
        isLegalPage={true}
      />

      {/* Main Container */}
      <div style={{
        maxWidth: '1280px',
        width: '100%',
        margin: '28px auto 48px',
        padding: '0 24px',
        flex: 1
      }}>
        {/* Document Switcher & Breadcrumbs Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <button
            onClick={onGoToLanding}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ffffff',
              border: '1px dashed #cbd5e1',
              borderRadius: '6px',
              padding: '7px 14px',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#475569',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#780115';
              e.currentTarget.style.color = '#780115';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#cbd5e1';
              e.currentTarget.style.color = '#475569';
            }}
          >
            <ArrowLeft size={14} />
            <span>← Back to Platform</span>
          </button>

          {/* Policy Switcher Tabs */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            padding: '4px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            gap: '4px',
            flexWrap: 'wrap',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <button
              onClick={() => onNavigate('privacy')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.82rem',
                fontWeight: type === 'privacy' ? 700 : 600,
                backgroundColor: type === 'privacy' ? '#780115' : 'transparent',
                color: type === 'privacy' ? '#ffffff' : '#64748b',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <ShieldCheck size={14} />
              <span>Privacy Policy</span>
            </button>

            <button
              onClick={() => onNavigate('terms')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.82rem',
                fontWeight: type === 'terms' ? 700 : 600,
                backgroundColor: type === 'terms' ? '#780115' : 'transparent',
                color: type === 'terms' ? '#ffffff' : '#64748b',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Scale size={14} />
              <span>Terms of Service</span>
            </button>

            <button
              onClick={() => onNavigate('refund')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.82rem',
                fontWeight: type === 'refund' ? 700 : 600,
                backgroundColor: type === 'refund' ? '#780115' : 'transparent',
                color: type === 'refund' ? '#ffffff' : '#64748b',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <CreditCard size={14} />
              <span>Refund Policy</span>
            </button>
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          border: '1px dashed #cbd5e1',
          position: 'relative',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)'
        }}>
          {/* Corner Plus Markers */}
          <CornerPlusMarkers color="#94a3b8" bg="#ffffff" size="13px" />

          {/* Top Title Banner */}
          <div style={{
            padding: '36px 40px 28px',
            borderBottom: '1px dashed #cbd5e1',
            backgroundColor: '#fafaf9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '6px',
                backgroundColor: '#fff1f2',
                border: '1px solid #fecdd3',
                color: '#780115',
                fontSize: '0.76rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '10px'
              }}>
                <Sparkles size={12} />
                <span>Official Legal Documentation</span>
              </div>
              <h1 style={{
                fontSize: '2.1rem',
                fontWeight: 800,
                color: '#0f172a',
                margin: 0,
                letterSpacing: '-0.03em',
                lineHeight: 1.2
              }}>
                {type === 'privacy' && 'Privacy Policy'}
                {type === 'terms' && 'Terms of Service'}
                {type === 'refund' && 'Refund & Cancellation Policy'}
              </h1>
              <p style={{
                fontSize: '0.88rem',
                color: '#64748b',
                marginTop: '8px',
                marginBottom: 0
              }}>
                Effective Date: October 9, 2026 • Careerhut Direct Tech Job Discovery Platform
              </p>
            </div>

            {/* Utility Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={handleCopyLink}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer'
                }}
              >
                <Copy size={13} />
                <span>Share URL</span>
              </button>
              <button
                onClick={handlePrint}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer'
                }}
              >
                <Printer size={13} />
                <span>Print Document</span>
              </button>
            </div>
          </div>

          {/* Document Body Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) 280px',
            gap: 0
          }} className="legal-content-grid">
            {/* Main Policy Content */}
            <div style={{
              padding: '40px',
              borderRight: '1px dashed #cbd5e1',
              fontSize: '0.94rem',
              lineHeight: 1.75,
              color: '#334155'
            }}>
              {/* ==================== PRIVACY POLICY ==================== */}
              {type === 'privacy' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  <div style={{
                    padding: '16px 20px',
                    backgroundColor: '#fff1f2',
                    border: '1px solid #fecdd3',
                    borderRadius: '8px',
                    color: '#780115',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    lineHeight: 1.6
                  }}>
                    🔒 <strong>Executive Summary:</strong> Careerhut is committed to total data privacy. We do not sell user data, track visitors across sites with third-party advertising cookies, or store your personal job bookmarks on centralized servers without explicit consent.
                  </div>

                  <section id="section-1">
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
                      1. Core Data Minimization Philosophy
                    </h2>
                    <p>
                      Careerhut is engineered as an open, accessible direct career directory. Unlike conventional job boards that monetize candidate personal data, resumes, and behavioral logs, Careerhut operates under strict data minimization principles. You can freely discover roles, filter company portals, and retrieve verified recruiter emails without creating an account or providing personal identifiers.
                    </p>
                  </section>

                  <section id="section-2">
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
                      2. Information We Process
                    </h2>
                    <p>When you interact with the Careerhut platform, the following data categories apply:</p>
                    <ul style={{ paddingLeft: '22px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <li>
                        <strong>Client-Side Local Storage:</strong> All saved job bookmarks, application stage indicators, and customized filter preferences are preserved locally within your browser's <code>localStorage</code>. This data never leaves your device unless you choose to export it.
                      </li>
                      <li>
                        <strong>Transient Server Request Logs:</strong> Standard technical access logs (including IP address, request method, browser user agent, and timestamp) are processed temporarily to ensure system stability, enforce API rate limits, and mitigate DDoS attacks.
                      </li>
                      <li>
                        <strong>Public Career Data & Recruiter Inboxes:</strong> All listed job descriptions, salary estimates, and verified hiring contact emails are indexed exclusively from official public employer career portals (e.g. Miro, Supabase, Stripe, Figma).
                      </li>
                    </ul>
                  </section>

                  <section id="section-3">
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
                      3. Cookies & Tracking Technologies
                    </h2>
                    <p>
                      Careerhut does not deploy cross-site tracking cookies, behavioral tracking pixels (e.g. Meta Pixel, TikTok Pixel), or aggressive third-party marketing tags. We utilize essential session storage strictly to retain your user interface settings (such as active search queries, theme state, and sidebar collapsed status).
                    </p>
                  </section>

                  <section id="section-4">
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
                      4. External Employer Links & ATS Submissions
                    </h2>
                    <p>
                      When you click "Apply Direct" or follow an outbound portal link, you are redirected to the official career portal of the respective hiring employer. Submitting job applications, resumes, and personal information on those external sites is governed by the respective employer's independent privacy policy.
                    </p>
                  </section>

                  <section id="section-5">
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
                      5. Employer & Data Subject Rights (GDPR / CCPA)
                    </h2>
                    <p>
                      If you are an employer, hiring partner, or individual seeking to update, verify, or request the immediate removal of any career portal listing or verified contact address from our discovery index, please reach out to us at <a href="mailto:privacy@careerhut.org" style={{ color: '#780115', fontWeight: 700 }}>privacy@careerhut.org</a>. All removal requests are processed within 48 hours.
                    </p>
                  </section>

                  <section id="section-6">
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
                      6. Changes to this Policy
                    </h2>
                    <p>
                      We may periodically update this Privacy Policy to reflect platform enhancements or regulatory changes. Any modifications will be posted directly to this dedicated page with a revised effective date.
                    </p>
                  </section>
                </div>
              )}

              {/* ==================== TERMS OF SERVICE ==================== */}
              {type === 'terms' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  <div style={{
                    padding: '16px 20px',
                    backgroundColor: '#fff1f2',
                    border: '1px solid #fecdd3',
                    borderRadius: '8px',
                    color: '#780115',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    lineHeight: 1.6
                  }}>
                    📜 <strong>Terms Summary:</strong> By utilizing Careerhut, you agree to engage with the platform responsibly, respect employer contact communication channels, and refrain from abusive automated harvesting.
                  </div>

                  <section id="terms-1">
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
                      1. Acceptance of Terms
                    </h2>
                    <p>
                      By accessing, browsing, or utilizing the Careerhut platform (https://careerhut.org) or its associated APIs and crawler endpoints, you confirm that you have read, understood, and agreed to be legally bound by these Terms of Service. If you do not agree to these terms, you must refrain from using the platform.
                    </p>
                  </section>

                  <section id="terms-2">
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
                      2. Platform Scope & Directory Model
                    </h2>
                    <p>
                      Careerhut operates as an intelligent indexing and direct discovery engine designed to connect job seekers directly with official employer career portals. Careerhut is not an employment agency, headhunting agency, or direct employer. We do not participate in candidate interviews, hiring determinations, salary negotiations, or employment contracts.
                    </p>
                  </section>

                  <section id="terms-3">
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
                      3. Acceptable Use & Conduct
                    </h2>
                    <p>Users and automated systems agree to abide by the following standards:</p>
                    <ul style={{ paddingLeft: '22px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <li>
                        <strong>Professional Outreach:</strong> Verified recruiter email addresses displayed on Careerhut must only be used for legitimate, individualized job inquiries and professional career communications.
                      </li>
                      <li>
                        <strong>No Commercial Spam:</strong> Using contact addresses extracted from Careerhut for unsolicited commercial email campaigns, recruiting lead generation lists, or marketing mass spam is strictly forbidden.
                      </li>
                      <li>
                        <strong>API & Platform Integrity:</strong> Users must not conduct automated denial-of-service operations, probe for security vulnerabilities, or circumvent API rate limits.
                      </li>
                    </ul>
                  </section>

                  <section id="terms-4">
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
                      4. Intellectual Property & Employer Trademarks
                    </h2>
                    <p>
                      All company logos, brand trademarks, and career portal listings belong to their respective corporate owners. Their display on Careerhut is strictly for identification and direct indexing purposes under fair use principles. The Careerhut code repository, brand assets, and interface architecture are protected under open-source and copyright licenses.
                    </p>
                  </section>

                  <section id="terms-5">
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
                      5. Disclaimer of Warranties
                    </h2>
                    <p>
                      Careerhut provides its platform, job feeds, and indexing tools on an "as is" and "as available" basis without warranties of any kind, whether express or implied. While we strive to verify posting active dates and authentic recruiter links, we do not warrant that all listings will remain available or unfulfilled by the hiring companies.
                    </p>
                  </section>

                  <section id="terms-6">
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
                      6. Governing Contact & Notices
                    </h2>
                    <p>
                      For legal notices, compliance queries, or rights enforcement requests, contact our legal counsel team directly at <a href="mailto:legal@careerhut.org" style={{ color: '#780115', fontWeight: 700 }}>legal@careerhut.org</a>.
                    </p>
                  </section>
                </div>
              )}

              {/* ==================== REFUND & CANCELLATION POLICY ==================== */}
              {type === 'refund' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  <div style={{
                    padding: '16px 20px',
                    backgroundColor: '#fff1f2',
                    border: '1px solid #fecdd3',
                    borderRadius: '8px',
                    color: '#780115',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    lineHeight: 1.6
                  }}>
                    💳 <strong>Refund Policy Summary:</strong> Careerhut is 100% free for all job seekers. For employer sponsorship and hiring spotlight services, we provide a 14-day transparent refund guarantee on unrendered promotional placements.
                  </div>

                  <section id="refund-1">
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
                      1. 100% Free Core Platform Guarantee for Job Seekers
                    </h2>
                    <p>
                      Careerhut is founded on the principle of open, uninhibited access to employment opportunities. Job seekers are never charged any subscription fees, application submission costs, or paywalls for:
                    </p>
                    <ul style={{ paddingLeft: '22px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <li>Browsing, filtering, and searching the verified jobs database.</li>
                      <li>Viewing direct employer ATS career portals and recruiter contacts.</li>
                      <li>Saving bookmarks, tracking applications, and setting local preferences.</li>
                    </ul>
                  </section>

                  <section id="refund-2">
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
                      2. Employer Sponsorship & Featured Spotlights
                    </h2>
                    <p>
                      For verified companies, startup founders, and recruitment partners who purchase custom featured listings, company spotlights, or prioritized ATS crawling schedules, the following terms apply:
                    </p>
                    <ul style={{ paddingLeft: '22px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <li>
                        <strong>14-Day Refund Window:</strong> You may cancel and request a full 100% refund within 14 calendar days of payment if the sponsored placement has not yet been published to the live directory.
                      </li>
                      <li>
                        <strong>Technical Non-Delivery:</strong> If a technical fault or indexing error on our infrastructure prevents your featured listing from appearing for more than 48 consecutive hours during an active campaign, a pro-rated refund or equivalent placement extension will be issued upon request.
                      </li>
                      <li>
                        <strong>Completed Placements:</strong> Once a featured campaign has successfully run and completed its scheduled display duration, fees are considered earned and non-refundable.
                      </li>
                    </ul>
                  </section>

                  <section id="refund-3">
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
                      3. Recurring Sponsorship Cancellations
                    </h2>
                    <p>
                      Employers with recurring promotional sponsorships may cancel renewal at any time prior to the next billing date. Upon cancellation, your listing will remain featured until the end of the current billing cycle, with no subsequent charges incurred.
                    </p>
                  </section>

                  <section id="refund-4">
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
                      4. Submitting a Refund Request
                    </h2>
                    <p>
                      To request a refund or inquire about a billing transaction, please email our finance team at <a href="mailto:billing@careerhut.org" style={{ color: '#780115', fontWeight: 700 }}>billing@careerhut.org</a> with your transaction ID, organization name, and reason for the request. All requests are evaluated and processed within 2 business days.
                    </p>
                  </section>
                </div>
              )}
            </div>

            {/* Sidebar Quick Navigation & Details */}
            <div style={{
              padding: '32px 24px',
              backgroundColor: '#fafaf9',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}>
              <div>
                <div style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#780115',
                  marginBottom: '12px'
                }}>
                  Document Index
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem' }}>
                  {type === 'privacy' && (
                    <>
                      <a href="#section-1" style={{ color: '#475569', textDecoration: 'none' }}>1. Data Minimization</a>
                      <a href="#section-2" style={{ color: '#475569', textDecoration: 'none' }}>2. Information Processed</a>
                      <a href="#section-3" style={{ color: '#475569', textDecoration: 'none' }}>3. Cookies & Tracking</a>
                      <a href="#section-4" style={{ color: '#475569', textDecoration: 'none' }}>4. External ATS Links</a>
                      <a href="#section-5" style={{ color: '#475569', textDecoration: 'none' }}>5. GDPR & CCPA Rights</a>
                      <a href="#section-6" style={{ color: '#475569', textDecoration: 'none' }}>6. Policy Updates</a>
                    </>
                  )}
                  {type === 'terms' && (
                    <>
                      <a href="#terms-1" style={{ color: '#475569', textDecoration: 'none' }}>1. Acceptance of Terms</a>
                      <a href="#terms-2" style={{ color: '#475569', textDecoration: 'none' }}>2. Platform Scope</a>
                      <a href="#terms-3" style={{ color: '#475569', textDecoration: 'none' }}>3. Acceptable Use</a>
                      <a href="#terms-4" style={{ color: '#475569', textDecoration: 'none' }}>4. Intellectual Property</a>
                      <a href="#terms-5" style={{ color: '#475569', textDecoration: 'none' }}>5. Warranty Disclaimer</a>
                      <a href="#terms-6" style={{ color: '#475569', textDecoration: 'none' }}>6. Legal Notices</a>
                    </>
                  )}
                  {type === 'refund' && (
                    <>
                      <a href="#refund-1" style={{ color: '#475569', textDecoration: 'none' }}>1. Free Job Seeker Access</a>
                      <a href="#refund-2" style={{ color: '#475569', textDecoration: 'none' }}>2. Employer Sponsorships</a>
                      <a href="#refund-3" style={{ color: '#475569', textDecoration: 'none' }}>3. Cancellations</a>
                      <a href="#refund-4" style={{ color: '#475569', textDecoration: 'none' }}>4. Requesting a Refund</a>
                    </>
                  )}
                </div>
              </div>

              <div style={{ height: '1px', backgroundColor: '#e2e8f0', width: '100%' }} />

              {/* Verified Trust Badge */}
              <div style={{
                padding: '16px',
                backgroundColor: '#ffffff',
                border: '1px dashed #cbd5e1',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <CheckCircle2 size={16} color="#059669" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>Verified Policy</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                  Governed under open web standards and verified against global transparency benchmarks.
                </p>
              </div>

              {/* Direct Inquiries */}
              <div style={{
                padding: '16px',
                backgroundColor: '#fff1f2',
                border: '1px solid #fecdd3',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Mail size={15} color="#780115" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#780115' }}>Have Questions?</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#780115', margin: 0, lineHeight: 1.5 }}>
                  Contact our compliance team anytime at <a href="mailto:team@careerhut.org" style={{ color: '#780115', fontWeight: 700, textDecoration: 'underline' }}>team@careerhut.org</a>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Segmented Footer */}
      <GlobalFooter 
        onExploreJobs={onExploreJobs}
        onNavigateLegal={onNavigate}
      />
    </div>
  );
}
