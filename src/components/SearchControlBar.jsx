import React from 'react';
import { Search, Briefcase, MapPin, SlidersHorizontal, ArrowRight, Sparkles, Globe } from 'lucide-react';

const POPULAR_TAGS = [
  'Frontend',
  'Backend',
  'Full Stack',
  'AI / ML',
  'DevOps / Cloud',
  'Product Design',
  'Data Engineer',
  'Engineering Manager'
];

function CornerPlusMarkers({ color = '#94a3b8', bg = '#ffffff', size = '13px' }) {
  return (
    <>
      <span aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, transform: 'translate(-50%, -50%)', fontSize: size, fontWeight: 300, color, lineHeight: 1, backgroundColor: bg, padding: '1px 2px', userSelect: 'none', zIndex: 10, pointerEvents: 'none' }}>+</span>
      <span aria-hidden="true" style={{ position: 'absolute', top: 0, right: 0, transform: 'translate(50%, -50%)', fontSize: size, fontWeight: 300, color, lineHeight: 1, backgroundColor: bg, padding: '1px 2px', userSelect: 'none', zIndex: 10, pointerEvents: 'none' }}>+</span>
      <span aria-hidden="true" style={{ position: 'absolute', bottom: 0, left: 0, transform: 'translate(-50%, 50%)', fontSize: size, fontWeight: 300, color, lineHeight: 1, backgroundColor: bg, padding: '1px 2px', userSelect: 'none', zIndex: 10, pointerEvents: 'none' }}>+</span>
      <span aria-hidden="true" style={{ position: 'absolute', bottom: 0, right: 0, transform: 'translate(50%, 50%)', fontSize: size, fontWeight: 300, color, lineHeight: 1, backgroundColor: bg, padding: '1px 2px', userSelect: 'none', zIndex: 10, pointerEvents: 'none' }}>+</span>
    </>
  );
}

export default function SearchControlBar({
  keyword,
  onKeywordChange,
  workplace,
  onWorkplaceChange,
  location,
  onLocationChange,
  onSearchOrCrawl,
  isSearching,
  activeTag,
  onSelectTag
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearchOrCrawl();
    }
  };

  const workplaceOptions = [
    { label: 'All', value: '' },
    { label: 'Remote', value: 'Remote' },
    { label: 'Hybrid', value: 'Hybrid' },
    { label: 'On-site', value: 'On-site' }
  ];

  return (
    <div 
      className="search-control-container"
      style={{
        background: 'var(--bg-surface)',
        border: '1px dashed #cbd5e1',
        borderRadius: 0,
        padding: '14px 18px',
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        position: 'relative',
        flexShrink: 0,
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      <CornerPlusMarkers color="#94a3b8" bg="#ffffff" size="13px" />
      {/* Sleek Command-style Main Search Row */}
      <div className="search-control-row" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        flexWrap: 'wrap'
      }}>
        {/* Main Search Input */}
        <div 
          className="search-main-input-wrap"
          style={{
            flex: '1 1 280px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'var(--bg-input)',
            border: '1px dashed #cbd5e1',
            borderRadius: 0,
            padding: '8px 14px',
            transition: 'border-color 0.15s ease'
          }}
        >
          <Search size={16} color="var(--text-subtle)" />
          <input 
            type="text"
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search roles, companies, skills, or paste a career URL..."
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-main)',
              fontSize: '0.9rem',
              fontFamily: 'var(--font-main)',
              outline: 'none'
            }}
          />
        </div>

        {/* Location Input (Compact) */}
        <div 
          className="search-location-input-wrap"
          style={{
            flex: '0 1 180px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-input)',
            border: '1px dashed #cbd5e1',
            borderRadius: 0,
            padding: '8px 12px'
          }}
        >
          <MapPin size={15} color="var(--text-subtle)" />
          <input 
            type="text"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Any location..."
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-main)',
              fontSize: '0.88rem',
              fontFamily: 'var(--font-main)',
              outline: 'none'
            }}
          />
        </div>

        {/* Workplace Pill Toggles */}
        <div 
          className="search-workplace-pills"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'var(--bg-input)',
            border: '1px dashed #cbd5e1',
            borderRadius: 0,
            padding: '3px'
          }}
        >
          {workplaceOptions.map((opt) => {
            const isSelected = workplace === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onWorkplaceChange(opt.value)}
                style={{
                  background: isSelected ? '#780115' : 'transparent',
                  color: isSelected ? '#ffffff' : 'var(--text-muted)',
                  border: 'none',
                  borderRadius: 0,
                  padding: '5px 10px',
                  fontSize: '0.78rem',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Action Button */}
        <button 
          onClick={onSearchOrCrawl}
          disabled={isSearching}
          className="search-submit-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            backgroundColor: '#780115',
            color: '#ffffff',
            border: 'none',
            borderRadius: 0,
            padding: '9px 18px',
            fontSize: '0.88rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'background-color 0.15s ease',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5c0010'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#780115'}
        >
          {isSearching ? (
            <div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} />
          ) : (
            <>
              <span>Search</span>
              <ArrowRight size={14} />
            </>
          )}
        </button>
      </div>

      {/* Quick Tag Pills (Subtle, clean row) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        overflowX: 'auto',
        marginTop: '12px',
        paddingTop: '10px',
        borderTop: '1px solid var(--border-color)',
        scrollbarWidth: 'none'
      }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-subtle)', marginRight: '4px', whiteSpace: 'nowrap' }}>
          Quick filters:
        </span>
        {POPULAR_TAGS.map((tag) => {
          const isActive = activeTag === tag;
          return (
            <button
              key={tag}
              onClick={() => onSelectTag(isActive ? '' : tag)}
              style={{
                background: isActive ? '#fff1f2' : 'transparent',
                border: `1px solid ${isActive ? '#780115' : 'var(--border-color)'}`,
                color: isActive ? '#780115' : 'var(--text-muted)',
                padding: '4px 10px',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.color = 'var(--text-main)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }
              }}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
}
