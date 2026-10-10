import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X, Search } from 'lucide-react';
import CompanyLogo from './CompanyLogo';

export default function CustomDropdown({
  options = [],
  value = '',
  onChange = () => {},
  placeholder = 'Select...',
  triggerIcon: TriggerIcon,
  searchPlaceholder = 'Search...',
  searchable = true,
  className = '',
  style = {},
  variant = 'command', // 'command' | 'sidebar' | 'modal'
  align = 'left'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen, searchable]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter((opt) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const labelMatch = (opt.label || opt.value || '').toLowerCase().includes(q);
    return labelMatch;
  });

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
  };

  // Base styling depending on variant
  const isCommand = variant === 'command';
  const isSidebar = variant === 'sidebar';
  const isModal = variant === 'modal';

  const isSelected = Boolean(value);

  return (
    <div
      ref={containerRef}
      className={`custom-dropdown-root ${className}`}
      style={{
        position: 'relative',
        display: 'inline-block',
        width: isSidebar || isModal ? '100%' : 'auto',
        minWidth: isSidebar || isModal ? '100%' : '170px',
        userSelect: 'none',
        ...style
      }}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          background: isSelected ? 'var(--primary-light)' : 'var(--bg-input)',
          border: isCommand
            ? `1px dashed ${isSelected ? '#780115' : '#cbd5e1'}`
            : `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
          borderRadius: isCommand ? 0 : 'var(--radius-sm)',
          padding: isSidebar ? '7px 10px' : '7px 12px',
          color: isSelected ? 'var(--primary-text)' : 'var(--text-main)',
          fontSize: '0.85rem',
          fontFamily: 'var(--font-main)',
          fontWeight: isSelected ? 600 : 500,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          textAlign: 'left',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
          {selectedOption?.logoUrl ? (
            <CompanyLogo src={selectedOption.logoUrl} name={selectedOption.label} size={16} radius={4} />
          ) : selectedOption?.icon ? (
            <span style={{ fontSize: '0.95rem', lineHeight: 1, flexShrink: 0 }}>{selectedOption.icon}</span>
          ) : TriggerIcon ? (
            <TriggerIcon size={15} color={isSelected ? 'var(--primary)' : 'var(--text-subtle)'} style={{ flexShrink: 0 }} />
          ) : null}

          <span
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              color: isSelected ? 'var(--primary-text)' : 'var(--text-main)',
              fontSize: '0.84rem'
            }}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>

          {selectedOption && selectedOption.count != null && (
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: 'var(--primary)',
                background: 'rgba(120, 1, 21, 0.08)',
                padding: '1px 5px',
                borderRadius: '4px',
                flexShrink: 0
              }}
            >
              {selectedOption.count}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          {isSelected && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              title="Clear selection"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2px',
                borderRadius: '50%',
                color: 'var(--text-subtle)',
                cursor: 'pointer',
                transition: 'color 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-subtle)')}
            >
              <X size={13} />
            </span>
          )}
          <ChevronDown
            size={14}
            color="var(--text-subtle)"
            style={{
              transition: 'transform 0.2s ease',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
            }}
          />
        </div>
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: align === 'right' ? 'auto' : 0,
            right: align === 'right' ? 0 : 'auto',
            width: isSidebar || isModal ? '100%' : 'max(100%, 240px)',
            maxWidth: isModal ? '100%' : '320px',
            background: 'var(--bg-surface)',
            border: isCommand ? '1px dashed #cbd5e1' : '1px solid var(--border-color)',
            borderRadius: isCommand ? 0 : 'var(--radius-md)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            zIndex: 9999,
            overflow: 'hidden',
            animation: 'fadeIn 0.15s ease'
          }}
        >
          {/* Quick Search Input */}
          {searchable && options.length > 5 && (
            <div
              style={{
                padding: '8px 10px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--bg-secondary)'
              }}
            >
              <Search size={14} color="var(--text-subtle)" style={{ flexShrink: 0 }} />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-main)',
                  color: 'var(--text-main)'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    color: 'var(--text-subtle)',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          )}

          {/* Options Scroll List */}
          <div
            style={{
              maxHeight: '260px',
              overflowY: 'auto',
              padding: '4px'
            }}
          >
            {/* 'All' default option */}
            <div
              onClick={() => handleSelect('')}
              role="option"
              aria-selected={!value}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '7px 10px',
                borderRadius: 'var(--radius-sm)',
                background: !value ? 'var(--primary-light)' : 'transparent',
                color: !value ? 'var(--primary-text)' : 'var(--text-main)',
                fontWeight: !value ? 700 : 500,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'background 0.12s ease'
              }}
              onMouseEnter={(e) => {
                if (value) e.currentTarget.style.background = 'var(--bg-secondary)';
              }}
              onMouseLeave={(e) => {
                if (value) e.currentTarget.style.background = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.95rem' }}>🌐</span>
                <span>{placeholder}</span>
              </div>
              {!value && <Check size={14} color="var(--primary)" />}
            </div>

            {/* Filtered options list */}
            {filteredOptions.length === 0 ? (
              <div
                style={{
                  padding: '16px',
                  textAlign: 'center',
                  color: 'var(--text-subtle)',
                  fontSize: '0.78rem'
                }}
              >
                No matching results
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isItemActive = value === opt.value;
                return (
                  <div
                    key={opt.value || opt.label}
                    onClick={() => handleSelect(opt.value)}
                    role="option"
                    aria-selected={isItemActive}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '7px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: isItemActive ? 'var(--primary-light)' : 'transparent',
                      color: isItemActive ? 'var(--primary-text)' : 'var(--text-main)',
                      fontWeight: isItemActive ? 700 : 500,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      transition: 'background 0.12s ease',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      if (!isItemActive) e.currentTarget.style.background = 'var(--bg-secondary)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isItemActive) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                      {opt.logoUrl ? (
                        <CompanyLogo src={opt.logoUrl} name={opt.label} size={18} radius={4} />
                      ) : opt.icon ? (
                        <span style={{ fontSize: '0.95rem', flexShrink: 0 }}>{opt.icon}</span>
                      ) : null}
                      <span
                        style={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {opt.label}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      {opt.count != null && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            color: isItemActive ? 'var(--primary-text)' : 'var(--text-subtle)',
                            background: isItemActive ? 'rgba(120, 1, 21, 0.08)' : 'var(--bg-secondary)',
                            padding: '1px 5px',
                            borderRadius: '4px'
                          }}
                        >
                          {opt.count}
                        </span>
                      )}
                      {isItemActive && <Check size={14} color="var(--primary)" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
