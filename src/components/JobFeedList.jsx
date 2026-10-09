import React, { useState, useEffect, useRef } from 'react';
import { SlidersHorizontal, Mail, MapPin } from 'lucide-react';
import CompanyLogo, { resolveLogoUrl } from './CompanyLogo';

export default function JobFeedList({ jobs, selectedJob, onSelectJob, onOpenFilterModal }) {
  const [displayCount, setDisplayCount] = useState(60);
  const scrollContainerRef = useRef(null);

  // Reset display count when jobs search/filter changes
  useEffect(() => {
    setDisplayCount(60);
  }, [jobs]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 200) {
      if (displayCount < jobs.length) {
        setDisplayCount((prev) => Math.min(prev + 50, jobs.length));
      }
    }
  };

  const visibleJobs = jobs.slice(0, displayCount);

  return (
    <aside style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-md)',
      padding: '14px 16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
      height: 'calc(100vh - 180px)',
      minHeight: '600px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* List Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
        paddingBottom: '10px',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>Positions</span>
          <span style={{
            fontSize: '0.74rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            backgroundColor: 'var(--bg-input)',
            padding: '2px 7px',
            borderRadius: '999px',
            border: '1px solid var(--border-color)'
          }}>
            {jobs.length.toLocaleString()}
          </span>
        </div>
        <button 
          onClick={onOpenFilterModal}
          className="btn btn-secondary"
          style={{ padding: '4px 9px', fontSize: '0.76rem', borderRadius: 'var(--radius-sm)' }}
        >
          <SlidersHorizontal size={12} />
          <span>Filters</span>
        </button>
      </div>

      {/* Scrollable Job Cards List */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          paddingRight: '2px'
        }}
      >
        {jobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-subtle)' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🔍</div>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)', marginBottom: '4px' }}>No Positions Found</div>
            <div style={{ fontSize: '0.78rem' }}>Adjust search filters or discover a company portal above.</div>
          </div>
        ) : (
          visibleJobs.map((job) => {
            const isSelected = selectedJob?.id === job.id;
            const isRemote = (job.workplace_type || job.workplace || '').toLowerCase().includes('remote');
            const jobTitle = job.title || job.role || 'Position';
            const locationText = job.location || job.country || 'Headquarters';
            const email = job.contact_email || job.recruiterEmail || null;
            const logoUrl = resolveLogoUrl(job);

            return (
              <div
                key={job.id}
                onClick={() => onSelectJob(job)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  background: isSelected ? 'var(--primary-light)' : 'transparent',
                  border: isSelected ? '1px solid var(--primary)' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'var(--bg-input)';
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                  }
                }}
              >
                {/* Left: Logo & Details */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', minWidth: 0, flex: 1 }}>
                  <div style={{ marginTop: '2px' }}>
                    <CompanyLogo src={logoUrl} name={job.company} size={30} radius={6} />
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{
                      fontWeight: 700,
                      fontSize: '0.86rem',
                      color: isSelected ? 'var(--primary-text)' : 'var(--text-main)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      lineHeight: 1.3
                    }}>
                      {jobTitle}
                    </div>

                    <div style={{
                      fontSize: '0.76rem',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginTop: '2px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{job.company}</span>
                      <span>•</span>
                      <span style={{ color: 'var(--text-subtle)' }}>{locationText}</span>
                      {email && (
                        <span title={`Direct recruiter contact: ${email}`} style={{ display: 'inline-flex', alignItems: 'center' }}>
                          <Mail size={11} color="#780115" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Clean pill */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: '3px',
                  flexShrink: 0,
                  marginLeft: '8px'
                }}>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: isRemote ? '#780115' : 'var(--text-muted)',
                    background: isRemote ? '#fff1f2' : 'var(--bg-tag)',
                    border: isRemote ? '1px dashed #fecdd3' : '1px solid var(--border-color)',
                    padding: '1px 6px',
                    borderRadius: '4px'
                  }}>
                    {isRemote ? 'Remote' : (job.workplace_type || job.workplace || 'On-site')}
                  </span>
                </div>
              </div>
            );
          })
        )}

        {/* Load More indicator if more items available */}
        {displayCount < jobs.length && (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <button
              onClick={() => setDisplayCount((prev) => Math.min(prev + 50, jobs.length))}
              className="btn btn-secondary"
              style={{ fontSize: '0.76rem', padding: '5px 12px', width: '100%', borderRadius: 'var(--radius-sm)' }}
            >
              Showing {displayCount} of {jobs.length.toLocaleString()} (Load More)
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
