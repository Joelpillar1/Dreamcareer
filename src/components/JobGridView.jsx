import React from 'react';
import JobCard from './JobCard';

export default function JobGridView({ jobs, onSelectJob, onToggleBookmark, onOpenOutreach }) {
  if (jobs.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🔍</div>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>No Matching Positions Found</h3>
        <p style={{ color: 'var(--text-dim)', maxWidth: '440px', margin: '0 auto' }}>
          Try adjusting your filter search criteria or discover an official company career portal above.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '18px'
    }}>
      {jobs.map((job) => (
        <JobCard 
          key={job.id}
          job={job}
          onSelect={onSelectJob}
          onToggleBookmark={onToggleBookmark}
          onOpenOutreach={onOpenOutreach}
        />
      ))}
    </div>
  );
}
