import React from 'react';
import { X } from 'lucide-react';

export default function FilterModal({
  isOpen,
  onClose,
  companies,
  selectedCompany,
  onSelectCompany,
  selectedWorkplace,
  onSelectWorkplace,
  hasEmailOnly,
  onToggleHasEmail,
  onReset
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={16} />
        </button>

        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '18px', color: 'var(--text-main)' }}>
          Filter Jobs
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Company Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-subtle)', marginBottom: '6px' }}>
              Company
            </label>
            <select
              value={selectedCompany}
              onChange={(e) => onSelectCompany(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
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

          {/* Workplace Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-subtle)', marginBottom: '6px' }}>
              Workplace Type
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              background: 'var(--bg-secondary)',
              padding: '3px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)'
            }}>
              {['', 'Remote', 'Hybrid', 'On-site'].map((type) => (
                <button
                  key={type}
                  onClick={() => onSelectWorkplace(type)}
                  style={{
                    background: selectedWorkplace === type ? 'var(--primary)' : 'transparent',
                    color: selectedWorkplace === type ? '#ffffff' : 'var(--text-muted)',
                    border: 'none',
                    padding: '6px 0',
                    borderRadius: '4px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {type || 'All'}
                </button>
              ))}
            </div>
          </div>

          {/* Verified Email Filter */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-main)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={hasEmailOnly}
                onChange={(e) => onToggleHasEmail(e.target.checked)}
                style={{ accentColor: 'var(--primary)', width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <span>Only show positions with verified recruiter email</span>
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
          <button onClick={onReset} className="btn btn-secondary">
            Reset Filters
          </button>
          <button onClick={onClose} className="btn btn-primary">
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
