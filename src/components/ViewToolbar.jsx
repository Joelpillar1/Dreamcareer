import React from 'react';
import { LayoutGrid, Table as TableIcon, Kanban, Star } from 'lucide-react';

export default function ViewToolbar({ currentView, onViewChange, onlyBookmarked, onToggleBookmark, bookmarkCount }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
      paddingBottom: '14px',
      borderBottom: '1px solid var(--border-subtle)'
    }}>
      <div style={{
        display: 'flex',
        background: 'rgba(0, 0, 0, 0.35)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '4px',
        gap: '4px'
      }}>
        <button 
          className={`view-btn ${currentView === 'grid' ? 'active' : ''}`}
          onClick={() => onViewChange('grid')}
        >
          <LayoutGrid size={15} />
          Card Grid
        </button>
        <button 
          className={`view-btn ${currentView === 'table' ? 'active' : ''}`}
          onClick={() => onViewChange('table')}
        >
          <TableIcon size={15} />
          Compact Table
        </button>
        <button 
          className={`view-btn ${currentView === 'kanban' ? 'active' : ''}`}
          onClick={() => onViewChange('kanban')}
        >
          <Kanban size={15} />
          Pipeline Board
        </button>
      </div>

      <div>
        <button 
          onClick={onToggleBookmark}
          className={`btn btn-pill ${onlyBookmarked ? 'active' : ''}`}
        >
          <Star size={14} fill={onlyBookmarked ? '#fbbf24' : 'none'} color={onlyBookmarked ? '#fbbf24' : 'currentColor'} />
          <span>Bookmarked</span>
          <span className="pill-badge">{bookmarkCount}</span>
        </button>
      </div>
    </div>
  );
}
