import React from 'react';
import { Briefcase, Building2, Mail, Globe } from 'lucide-react';

export default function MetricsRibbon({ stats }) {
  return (
    <section style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '16px',
      marginBottom: '36px'
    }}>
      <div className="metric-card" style={{
        background: 'var(--bg-card)',
        backdropFilter: 'blur(16px)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '18px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: 'rgba(79, 70, 229, 0.12)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Briefcase size={22} />
        </div>
        <div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>
            {stats.total_jobs || 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '3px' }}>
            Total Jobs Extracted
          </div>
        </div>
      </div>

      <div className="metric-card" style={{
        background: 'var(--bg-card)',
        backdropFilter: 'blur(16px)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '18px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: 'rgba(2, 132, 199, 0.12)',
          color: 'var(--accent-cyan)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Building2 size={22} />
        </div>
        <div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>
            {stats.total_companies || 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '3px' }}>
            Direct Companies
          </div>
        </div>
      </div>

      <div className="metric-card" style={{
        background: 'var(--bg-card)',
        backdropFilter: 'blur(16px)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '18px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: 'rgba(2, 132, 199, 0.12)',
          color: 'var(--accent-cyan)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Mail size={22} />
        </div>
        <div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--accent-cyan)', lineHeight: 1.1 }}>
            {stats.total_with_emails || 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '3px' }}>
            Recruiter & Hiring Emails
          </div>
        </div>
      </div>

      <div className="metric-card" style={{
        background: 'var(--bg-card)',
        backdropFilter: 'blur(16px)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '18px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: 'rgba(5, 150, 105, 0.12)',
          color: 'var(--accent-emerald)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Globe size={22} />
        </div>
        <div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>
            {stats.workplace_breakdown?.Remote || 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '3px' }}>
            Remote Positions
          </div>
        </div>
      </div>
    </section>
  );
}
