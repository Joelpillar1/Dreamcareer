import React, { useState, useEffect } from 'react';
import { Layers, Bookmark, Bell, Mail, Download, PlusSquare, Sun, Moon } from 'lucide-react';

export default function Header({ onOpenBatch, bookmarkedCount, onToggleBookmarkView, onlyBookmarked }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('careerhut_theme') || 'light');
  const [exportOpen, setExportOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('careerhut_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 24px',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-md)',
      marginBottom: '18px',
      boxShadow: 'var(--shadow-subtle)'
    }}>
      {/* Breadcrumb / Section Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
          Official Jobs Portal
        </div>
        <span style={{
          fontSize: '0.72rem',
          fontWeight: 700,
          color: 'var(--primary)',
          background: 'var(--primary-light)',
          padding: '2px 8px',
          borderRadius: 'var(--radius-sm)'
        }}>
          Direct Index
        </span>
      </div>

      {/* Quick Status / Nav Menu */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '0.86rem', fontWeight: 600 }}>
        <span style={{ color: 'var(--primary)', cursor: 'pointer' }}>Live Explorer</span>
        <span style={{ color: 'var(--text-muted)', cursor: 'pointer' }} onClick={onOpenBatch}>Ingestion Engine</span>
      </nav>

      {/* Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button 
          onClick={onOpenBatch}
          className="btn btn-secondary"
          style={{ padding: '7px 13px', fontSize: '0.82rem' }}
        >
          <PlusSquare size={14} />
          <span>Batch Sync</span>
        </button>

        <button 
          onClick={onToggleBookmarkView}
          className={`btn btn-secondary ${onlyBookmarked ? 'active' : ''}`}
          title="Filter saved roles"
          style={{
            padding: '7px 12px',
            fontSize: '0.82rem',
            background: onlyBookmarked ? 'var(--primary-light)' : 'var(--bg-surface)',
            color: onlyBookmarked ? 'var(--primary-text)' : 'var(--text-main)',
            borderColor: onlyBookmarked ? 'var(--primary)' : 'var(--border-color)'
          }}
        >
          <Bookmark size={14} />
          <span>Saved ({bookmarkedCount})</span>
        </button>

        <button 
          onClick={toggleTheme}
          className="btn btn-secondary"
          style={{ padding: '7px 10px' }}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon size={15} /> : <Sun size={15} color="#f59e0b" />}
        </button>

        {/* User avatar */}
        <div style={{
          width: '34px',
          height: '34px',
          borderRadius: '50%',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: '0.82rem',
          color: 'var(--primary)',
          marginLeft: '4px'
        }}>
          CH
        </div>
      </div>
    </header>
  );
}
