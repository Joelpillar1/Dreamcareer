import React from 'react';
import { ArrowUpRight } from 'lucide-react';

const COLUMNS = [
  { id: 'Discovered', title: 'Discovered', dotClass: 'dot-discovered' },
  { id: 'Saved', title: 'Saved & Researching', dotClass: 'dot-saved' },
  { id: 'Applied', title: 'Applied', dotClass: 'dot-applied' },
  { id: 'Interviewing', title: 'Interviewing', dotClass: 'dot-interviewing' },
  { id: 'Offered', title: 'Offered 🎉', dotClass: 'dot-offered' }
];

export default function KanbanBoard({ jobs, onSelectJob, onToggleBookmark, onChangeStatus }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      gap: '14px',
      alignItems: 'start'
    }}>
      {COLUMNS.map((col) => {
        const colJobs = jobs.filter((j) => (j.app_status || 'Discovered') === col.id);

        return (
          <div 
            key={col.id}
            style={{
              background: 'rgba(18, 25, 38, 0.55)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              minHeight: '500px'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '14px',
              paddingBottom: '10px',
              borderBottom: '1px solid var(--border-subtle)'
            }}>
              <span className={`status-indicator-dot ${col.dotClass}`}></span>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, flex: 1 }}>{col.title}</h4>
              <span className="col-count">{colJobs.length}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {colJobs.map((job) => (
                <div 
                  key={job.id}
                  className="kanban-card"
                  onClick={() => onSelectJob(job)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                      {job.company}
                    </span>
                    <button 
                      className={`star-btn ${job.is_bookmarked ? 'bookmarked' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark(job.id);
                      }}
                    >
                      {job.is_bookmarked ? '⭐' : '☆'}
                    </button>
                  </div>

                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', lineHeight: 1.3, marginBottom: '8px' }}>
                    {job.title}
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    📍 {job.location}
                  </div>

                  {job.contact_email && (
                    <div style={{ fontSize: '0.75rem', color: '#38bdf8', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      ✉️ {job.contact_email}
                    </div>
                  )}

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '8px',
                    borderTop: '1px solid rgba(255,255,255,0.06)'
                  }}>
                    <select 
                      value={job.app_status || 'Discovered'}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => onChangeStatus(job.id, e.target.value)}
                      style={{
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid var(--border-subtle)',
                        color: '#fff',
                        borderRadius: '4px',
                        padding: '2px 6px',
                        fontSize: '0.72rem'
                      }}
                    >
                      {COLUMNS.map((c) => (
                        <option key={c.id} value={c.id}>{c.id}</option>
                      ))}
                    </select>

                    <a 
                      href={job.job_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-link"
                      style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '2px' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Link
                      <ArrowUpRight size={11} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
