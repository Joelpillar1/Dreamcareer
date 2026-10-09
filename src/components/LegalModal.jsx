import React from 'react';
import { X, ShieldCheck, FileText, CheckCircle2, Lock, Scale } from 'lucide-react';

export default function LegalModal({ isOpen, type = 'privacy', onClose }) {
  if (!isOpen) return null;

  const isPrivacy = type === 'privacy';

  return (
    <div 
      className="modal-backdrop" 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div 
        className="modal-card" 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#ffffff',
          width: '100%',
          maxWidth: '840px',
          maxHeight: '88vh',
          borderRadius: '12px',
          border: '1px solid #cbd5e1',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#fafaf9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#fff1f2',
              border: '1px solid #fecdd3',
              color: '#780115',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {isPrivacy ? <ShieldCheck size={20} /> : <Scale size={20} />}
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                {isPrivacy ? 'Privacy Policy' : 'Terms of Service'}
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0' }}>
                Last updated: October 9, 2026 • Careerhut Direct Discovery Platform
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              background: 'transparent',
              border: '1px solid #e2e8f0',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f1f5f9';
              e.currentTarget.style.color = '#0f172a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#64748b';
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{
          padding: '28px 28px 40px',
          overflowY: 'auto',
          fontSize: '0.92rem',
          lineHeight: 1.7,
          color: '#334155'
        }}>
          {isPrivacy ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ padding: '14px 16px', backgroundColor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '8px', color: '#780115', fontSize: '0.86rem', fontWeight: 600 }}>
                🔒 Summary: Careerhut respects your privacy. We do not sell user data, track you with third-party advertising cookies, or store your bookmarks on central servers without consent.
              </div>

              <section>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                  1. Information We Collect
                </h4>
                <p>
                  Careerhut is designed to minimize personal data collection. When you browse the platform, the following data applies:
                </p>
                <ul style={{ paddingLeft: '20px', marginTop: '6px' }}>
                  <li><strong>Local Client Preferences:</strong> Saved job bookmarks, application statuses, and search filter selections are stored locally in your browser's <code>localStorage</code>.</li>
                  <li><strong>Server Log Data:</strong> Basic technical logs (such as IP address, user agent, and request timestamps) are processed transiently for security and rate limiting.</li>
                  <li><strong>Public Career Data:</strong> All job postings, company information, and recruiter contact details are parsed strictly from public employer career portals.</li>
                </ul>
              </section>

              <section>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                  2. How We Use Information
                </h4>
                <p>
                  Any information gathered is utilized exclusively to:
                </p>
                <ul style={{ paddingLeft: '20px', marginTop: '6px' }}>
                  <li>Provide real-time career page search and filtering capabilities.</li>
                  <li>Extract and display authentic hiring contact details to facilitate direct career communication.</li>
                  <li>Maintain platform stability, prevent malicious scraping, and ensure high system uptime.</li>
                </ul>
              </section>

              <section>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                  3. Cookies and Tracking Technologies
                </h4>
                <p>
                  Careerhut does not use cross-site tracking cookies, third-party analytics pixels, or behavioral tracking beacons. Essential session storage is used strictly to retain your user interface state (such as light mode theme and active view preferences).
                </p>
              </section>

              <section>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                  4. Employer & Data Subject Rights
                </h4>
                <p>
                  If you are an employer or hiring partner and wish to update, modify, or request the removal of any listed career portal page or contact address, please email us directly at <a href="mailto:privacy@careerhut.org" style={{ color: '#780115', fontWeight: 600 }}>privacy@careerhut.org</a>. Requests are processed within 48 hours.
                </p>
              </section>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ padding: '14px 16px', backgroundColor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '8px', color: '#780115', fontSize: '0.86rem', fontWeight: 600 }}>
                📜 Summary: By accessing Careerhut, you agree to use the direct career discovery tools responsibly, without abusive scraping or spamming hiring teams.
              </div>

              <section>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                  1. Acceptance of Terms
                </h4>
                <p>
                  By accessing or utilizing the Careerhut platform (https://careerhut.org), you acknowledge that you have read, understood, and agreed to be bound by these Terms of Service. If you disagree with any portion of these terms, please discontinue use of the platform.
                </p>
              </section>

              <section>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                  2. Platform Purpose & Discovery Scope
                </h4>
                <p>
                  Careerhut provides an indexing and direct discovery interface that surfaces career opportunities hosted on official employer portals. Careerhut is not an employment agency, headhunter, or employer representative. Application decisions, interviews, and hiring outcomes are managed entirely by the respective hiring companies.
                </p>
              </section>

              <section>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                  3. Acceptable Use Guidelines
                </h4>
                <p>
                  Users agree to engage with the platform in accordance with the following rules:
                </p>
                <ul style={{ paddingLeft: '20px', marginTop: '6px' }}>
                  <li>You will not use automated mechanisms to conduct denial-of-service attacks or flood the crawler API.</li>
                  <li>You will not use extracted recruiter emails for mass unsolicited marketing, commercial spam, or harassment.</li>
                  <li>You will only use hiring contacts for legitimate, professional job inquiries and direct application submissions.</li>
                </ul>
              </section>

              <section>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                  4. Disclaimer of Warranties
                </h4>
                <p>
                  Careerhut provides all services and data "as is" and "as available". While we continuously verify and refresh career portal postings, we make no warranties regarding the immediate real-time accuracy, availability, or compensation estimates of third-party employer listings.
                </p>
              </section>

              <section>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                  5. Contact & Legal Notices
                </h4>
                <p>
                  For questions or formal inquiries regarding these Terms of Service, reach out to our team at <a href="mailto:legal@careerhut.org" style={{ color: '#780115', fontWeight: 600 }}>legal@careerhut.org</a>.
                </p>
              </section>
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div style={{
          padding: '16px 28px',
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#fafaf9',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 20px',
              backgroundColor: '#780115',
              color: '#ffffff',
              borderRadius: '6px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(120, 1, 21, 0.2)'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
