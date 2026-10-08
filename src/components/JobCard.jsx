import React from 'react';
import { MapPin, Folder, Mail, ArrowUpRight } from 'lucide-react';

export default function JobCard({ job, onSelect, onToggleBookmark, onOpenOutreach }) {
  const isRemote = job.workplace_type?.toLowerCase() === 'remote';

  return (
    <div 
      className="job-card"
      onClick={() => onSelect(job)}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '12px' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {job.company}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className={isRemote ? 'badge-remote' : 'badge-generic'}>
              {job.workplace_type}
            </span>
            <button 
              className={`star-btn ${job.is_bookmarked ? 'bookmarked' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(job.id);
              }}
              title="Bookmark position"
            >
              {job.is_bookmarked ? '⭐' : '☆'}
            </button>
          </div>
        </div>

        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.35, marginBottom: '12px' }}>
          {job.title}
        </h3>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={13} />
            {job.location}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Folder size={13} />
            {job.department || 'General'}
          </span>
        </div>

        {job.contact_email && (
          <div className="email-chip" title="Direct recruiter/follow-up email">
            <Mail size={13} />
            <span>{job.contact_email}</span>
          </div>
        )}
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '14px',
        borderTop: '1px solid var(--border-subtle)'
      }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--accent-amber)' }}>
          {job.salary_range || 'Salary not disclosed'}
        </span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {job.contact_email && (
            <button 
              className="btn btn-secondary"
              style={{ padding: '4px 10px', fontSize: '0.78rem' }}
              onClick={(e) => {
                e.stopPropagation();
                onOpenOutreach(job);
              }}
            >
              <Mail size={12} />
              Follow-Up
            </button>
          )}
          <a 
            href={job.job_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-link"
            style={{ display: 'flex', alignItems: 'center', gap: '2px' }}
            onClick={(e) => e.stopPropagation()}
          >
            View
            <ArrowUpRight size={13} />
          </a>
        </div>
      </div>
    </div>
  );
}
