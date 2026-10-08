import React from 'react';
import { Search, RotateCcw } from 'lucide-react';

export default function SidebarFilters({ filters, onFilterChange, onReset, companies }) {
  return (
    <aside style={{
      background: 'var(--bg-card)',
      backdropFilter: 'blur(16px)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-md)',
      padding: '22px',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '18px',
        paddingBottom: '10px',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>Filter & Discover</h3>
        <button onClick={onReset} className="btn-link" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <RotateCcw size={12} />
          Clear All
        </button>
      </div>

      <div style={{ marginBottom: '18px' }}>
        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-dim)', marginBottom: '8px' }}>
          Search Keyword
        </label>
        <div style={{ position: 'relative' }}>
          <input 
            type="text"
            value={filters.keyword}
            onChange={(e) => onFilterChange('keyword', e.target.value)}
            placeholder="Title, skill, team, role..."
            style={{
              width: '100%',
              padding: '9px 12px 9px 34px',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-main)',
              fontFamily: 'var(--font-main)',
              fontSize: '0.88rem',
              outline: 'none'
            }}
          />
          <Search size={15} color="var(--text-dim)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>
      </div>

      <div style={{ marginBottom: '18px' }}>
        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-dim)', marginBottom: '8px' }}>
          Company
        </label>
        <select 
          value={filters.company}
          onChange={(e) => onFilterChange('company', e.target.value)}
          style={{
            width: '100%',
            padding: '9px 12px',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-main)',
            fontFamily: 'var(--font-main)',
            fontSize: '0.88rem',
            outline: 'none'
          }}
        >
          <option value="">All Companies</option>
          {companies.map((c) => (
            <option key={c.company} value={c.company}>
              {c.company} ({c.job_count})
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '18px' }}>
        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-dim)', marginBottom: '8px' }}>
          Workplace Type
        </label>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          background: 'var(--bg-secondary)',
          padding: '3px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)'
        }}>
          {['', 'Remote', 'Hybrid', 'On-site'].map((type) => (
            <button
              key={type}
              className={`pill-btn ${filters.workplace === type ? 'active' : ''}`}
              onClick={() => onFilterChange('workplace', type)}
            >
              {type || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '18px' }}>
        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-dim)', marginBottom: '8px' }}>
          Location / City
        </label>
        <input 
          type="text"
          value={filters.location}
          onChange={(e) => onFilterChange('location', e.target.value)}
          placeholder="San Francisco, London, Remote..."
          style={{
            width: '100%',
            padding: '9px 12px',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-main)',
            fontFamily: 'var(--font-main)',
            fontSize: '0.88rem',
            outline: 'none'
          }}
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <input 
            type="checkbox"
            checked={filters.hasEmail}
            onChange={(e) => onFilterChange('hasEmail', e.target.checked)}
            style={{ accentColor: 'var(--primary)', width: '16px', height: '16px', cursor: 'pointer' }}
          />
          <span>Only show roles with verified follow-up email</span>
        </label>
      </div>
    </aside>
  );
}
