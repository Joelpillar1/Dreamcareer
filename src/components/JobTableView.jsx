import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export default function JobTableView({ jobs, onSelectJob, onToggleBookmark, onChangeStatus }) {
  if (jobs.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📋</div>
        <h3>No Matching Positions Found</h3>
        <p style={{ color: 'var(--text-dim)' }}>Try adjusting your search filters.</p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
        <thead>
          <tr>
            <th style={{ background: 'var(--bg-secondary)', padding: '12px 16px', textAlign: 'left', fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dim)', borderBottom: '1px solid var(--border-subtle)', width: '40px' }}>⭐</th>
            <th style={{ background: 'var(--bg-secondary)', padding: '12px 16px', textAlign: 'left', fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dim)', borderBottom: '1px solid var(--border-subtle)' }}>Job Title</th>
            <th style={{ background: 'var(--bg-secondary)', padding: '12px 16px', textAlign: 'left', fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dim)', borderBottom: '1px solid var(--border-subtle)' }}>Company</th>
            <th style={{ background: 'var(--bg-secondary)', padding: '12px 16px', textAlign: 'left', fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dim)', borderBottom: '1px solid var(--border-subtle)' }}>Department</th>
            <th style={{ background: 'var(--bg-secondary)', padding: '12px 16px', textAlign: 'left', fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dim)', borderBottom: '1px solid var(--border-subtle)' }}>Location</th>
            <th style={{ background: 'var(--bg-secondary)', padding: '12px 16px', textAlign: 'left', fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dim)', borderBottom: '1px solid var(--border-subtle)' }}>Type</th>
            <th style={{ background: 'var(--bg-secondary)', padding: '12px 16px', textAlign: 'left', fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dim)', borderBottom: '1px solid var(--border-subtle)' }}>Follow-up Email</th>
            <th style={{ background: 'var(--bg-secondary)', padding: '12px 16px', textAlign: 'left', fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dim)', borderBottom: '1px solid var(--border-subtle)' }}>Status</th>
            <th style={{ background: 'var(--bg-secondary)', padding: '12px 16px', textAlign: 'left', fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dim)', borderBottom: '1px solid var(--border-subtle)' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr 
              key={job.id}
              onClick={() => onSelectJob(job)}
              style={{ cursor: 'pointer', borderBottom: '1px solid var(--border-subtle)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-secondary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <td 
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleBookmark(job.id);
                }}
                style={{ padding: '14px 16px', textAlign: 'center' }}
              >
                {job.is_bookmarked ? '⭐' : '☆'}
              </td>
              <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-main)' }}>{job.title}</td>
              <td style={{ padding: '14px 16px', color: 'var(--accent-cyan)', fontWeight: 600 }}>{job.company}</td>
              <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>{job.department || 'General'}</td>
              <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>{job.location}</td>
              <td style={{ padding: '14px 16px' }}>
                <span className={job.workplace_type?.toLowerCase() === 'remote' ? 'badge-remote' : 'badge-generic'}>
                  {job.workplace_type}
                </span>
              </td>
              <td style={{ padding: '14px 16px', color: 'var(--accent-cyan)', fontSize: '0.82rem' }}>
                {job.contact_email || <span style={{ color: 'var(--text-dim)' }}>N/A</span>}
              </td>
              <td style={{ padding: '14px 16px' }}>
                <select 
                  value={job.app_status || 'Discovered'}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => onChangeStatus(job.id, e.target.value)}
                  style={{
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-main)',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '0.78rem'
                  }}
                >
                  <option value="Discovered">Discovered</option>
                  <option value="Saved">Saved</option>
                  <option value="Applied">Applied</option>
                  <option value="Interviewing">Interviewing</option>
                  <option value="Offered">Offered</option>
                </select>
              </td>
              <td style={{ padding: '14px 16px' }}>
                <a 
                  href={job.apply_url || job.job_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-link"
                  style={{ display: 'flex', alignItems: 'center', gap: '2px' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  Apply
                  <ArrowUpRight size={13} />
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
