import React, { useState, useEffect } from 'react';
import { Layers, Download, PlusSquare, Sun, Moon } from 'lucide-react';

export default function Navbar({ status, onOpenBatch }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('careerhut_theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('careerhut_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const statusColor = {
    ready: '#059669',
    fetching: '#d97706',
    error: '#e11d48'
  }[status.state] || '#059669';

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '14px 24px',
      background: 'var(--bg-card)',
      backdropFilter: 'blur(20px)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-md)',
      marginBottom: '32px',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img 
          src="/Careerhut.png" 
          alt="Careerhut" 
          style={{
            height: '36px',
            width: 'auto',
            maxWidth: '180px',
            objectFit: 'contain',
            display: 'block'
          }} 
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Status Pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.8rem',
          fontWeight: 600,
          padding: '6px 14px',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(5, 150, 105, 0.1)',
          border: '1px solid rgba(5, 150, 105, 0.25)',
          color: 'var(--accent-emerald)'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: statusColor,
            boxShadow: `0 0 10px ${statusColor}`
          }}></span>
          <span>{status.message}</span>
        </div>

        {/* Theme Toggle Button */}
        <button 
          onClick={toggleTheme}
          className="btn btn-secondary"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          style={{ padding: '8px 12px' }}
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} color="#fbbf24" />}
          <span style={{ fontSize: '0.82rem' }}>{theme === 'light' ? 'Dark' : 'Light'}</span>
        </button>

        {/* Batch Sync */}
        <button onClick={onOpenBatch} className="btn btn-secondary">
          <PlusSquare size={15} />
          Batch Sync
        </button>
      </div>
    </header>
  );
}
