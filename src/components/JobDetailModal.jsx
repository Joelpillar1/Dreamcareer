import React, { useState } from 'react';
import { Mail, Copy, Check, ArrowUpRight, X } from 'lucide-react';

const EMAIL_TEMPLATES = {
  followup: {
    title: 'Application Follow-up',
    subject: (job) => `Application Follow-up: ${job.title} - ${job.company}`,
    body: (job) => `Hi ${job.company} Hiring Team,\n\nI hope this email finds you well.\n\nI recently reviewed the ${job.title} opening on your official career portal (${job.job_url}) and wanted to follow up directly. My background closely aligns with your team's focus, and I am very interested in contributing to ${job.company}.\n\nI have attached my resume for your review and would love to connect for a brief conversation regarding how I can add immediate value.\n\nThank you for your time and consideration.\n\nBest regards,\n[Your Name]\n[Your Phone / Portfolio]`
  },
  pitch: {
    title: 'Direct Recruiter Pitch',
    subject: (job) => `Inquiry: ${job.title} Role at ${job.company} - [Your Name]`,
    body: (job) => `Hello ${job.company} Talent Team,\n\nI noticed the ${job.title} opening listed on your careers page. Having followed ${job.company}'s recent growth, I wanted to reach out directly to express my enthusiasm for this role.\n\nWith experience in [Your Core Skill / Tech Stack], I have previously delivered [mention 1 strong achievement or project]. I believe my experience makes me a strong fit for your team.\n\nWould you be open to a 10-minute chat this week?\n\nBest,\n[Your Name]\n[Your LinkedIn/GitHub]`
  },
  informational: {
    title: 'Informational Inquiry',
    subject: (job) => `Exploring ${job.title} opportunities at ${job.company}`,
    body: (job) => `Hi there,\n\nI'm reaching out regarding the ${job.title} position at ${job.company}.\n\nI admire what ${job.company} is building and would love to learn more about the team culture and priorities for this role. If you are the right person to speak with or can point me to the hiring manager for this team, I would greatly appreciate it.\n\nThanks so much!\n\nBest regards,\n[Your Name]`
  }
};

export default function JobDetailModal({ job, onClose, onSaveNotes, onChangeStatus }) {
  const [selectedTemplate, setSelectedTemplate] = useState('followup');
  const [notes, setNotes] = useState(job?.notes || '');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPitch, setCopiedPitch] = useState(false);

  if (!job) return null;

  const tpl = EMAIL_TEMPLATES[selectedTemplate];
  const emailSubject = tpl.subject(job);
  const emailBody = tpl.body(job);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(job.contact_email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyPitch = () => {
    navigator.clipboard.writeText(emailBody);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card modal-lg" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={18} />
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px', marginBottom: '18px' }}>
          <div>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {job.company}
            </span>
            <h2 style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0 10px' }}>
              {job.title}
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>📍 <strong>Location:</strong> {job.location}</span>
              <span>🏢 <strong>Department:</strong> {job.department || 'General'}</span>
              <span>💼 <strong>Workplace:</strong> {job.workplace_type} ({job.employment_type})</span>
            </div>
          </div>
          <div>
            <span className={job.workplace_type?.toLowerCase() === 'remote' ? 'badge-remote' : 'badge-generic'} style={{ fontSize: '0.8rem', padding: '4px 12px' }}>
              {job.workplace_type}
            </span>
          </div>
        </div>

        {job.salary_range && (
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', padding: '10px 16px', marginBottom: '20px', color: 'var(--accent-amber)', fontWeight: 700, fontSize: '0.95rem' }}>
            💰 Compensation: {job.salary_range}
          </div>
        )}

        {/* Follow-up Recruiter Outreach Studio */}
        {job.contact_email && (
          <div style={{ background: 'rgba(2, 132, 199, 0.06)', border: '1px solid rgba(2, 132, 199, 0.25)', borderRadius: '12px', padding: '18px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-cyan)', letterSpacing: '0.05em' }}>
                  Verified Recruiter & Follow-up Email
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                  {job.contact_email}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  onClick={handleCopyEmail}
                >
                  {copiedEmail ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
                  <span>{copiedEmail ? 'Copied!' : 'Copy Email'}</span>
                </button>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Outreach Pitch Template:
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {Object.entries(EMAIL_TEMPLATES).map(([key, value]) => (
                    <button 
                      key={key}
                      className="preset-btn"
                      style={{
                        background: selectedTemplate === key ? 'var(--primary)' : 'var(--bg-card-solid)',
                        color: selectedTemplate === key ? '#fff' : 'var(--text-muted)'
                      }}
                      onClick={() => setSelectedTemplate(key)}
                    >
                      {value.title}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '0.85rem',
                color: 'var(--text-main)',
                whiteSpace: 'pre-line',
                maxHeight: '130px',
                overflowY: 'auto'
              }}>
                {emailBody}
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <a 
                  href={`mailto:${job.contact_email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`}
                  className="btn btn-primary"
                  style={{ flex: 2, textDecoration: 'none', padding: '9px', fontSize: '0.9rem' }}
                >
                  <Mail size={15} />
                  Open in Mail Client
                </a>
                <button 
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '9px', fontSize: '0.9rem' }}
                  onClick={handleCopyPitch}
                >
                  {copiedPitch ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
                  <span>{copiedPitch ? 'Copied Pitch!' : 'Copy Pitch'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '8px' }}>
            Official Career Source
          </h4>
          <a 
            href={job.career_page_url} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: 'var(--accent-cyan)', wordBreak: 'break-all', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            {job.career_page_url}
            <ArrowUpRight size={13} />
          </a>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '10px' }}>
            Job Description & Overview
          </h4>
          <div style={{
            color: 'var(--text-muted)',
            lineHeight: 1.7,
            fontSize: '0.92rem',
            whiteSpace: 'pre-line',
            maxHeight: '200px',
            overflowY: 'auto',
            background: 'var(--bg-secondary)',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)'
          }}>
            {job.description || 'No direct description excerpt available from the career overview.'}
          </div>
        </div>

        {/* Application Stage & Notes */}
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dim)' }}>
              Application Stage:
            </label>
            <select 
              value={job.app_status || 'Discovered'}
              onChange={(e) => onChangeStatus(job.id, e.target.value)}
              style={{ background: 'var(--bg-card-solid)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', borderRadius: '6px', padding: '6px 12px', fontSize: '0.85rem' }}
            >
              <option value="Discovered">Discovered</option>
              <option value="Saved">Saved & Researching</option>
              <option value="Applied">Applied</option>
              <option value="Interviewing">Interviewing</option>
              <option value="Offered">Offered 🎉</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
              Personal Notes & Follow-up Checklist:
            </label>
            <textarea 
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => onSaveNotes(job.id, notes)}
              placeholder="Add interview dates, recruiter notes, questions to ask..."
              style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '8px', color: 'var(--text-main)', fontFamily: 'var(--font-main)', fontSize: '0.85rem' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <a 
            href={job.apply_url || job.job_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ flex: 2, padding: '12px', fontSize: '0.95rem', textDecoration: 'none' }}
          >
            Apply Directly on Employer Site &rarr;
          </a>
          <button className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
