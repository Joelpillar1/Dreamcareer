import React, { useState } from 'react';
import { Globe, ArrowRight } from 'lucide-react';

const PRESETS = [
  { name: 'OpenAI', url: 'https://openai.com/careers' },
  { name: 'Stripe', url: 'https://stripe.com/jobs' },
  { name: 'Anthropic', url: 'https://www.anthropic.com/careers' },
  { name: 'Figma', url: 'https://www.figma.com/careers' },
  { name: 'Spotify', url: 'https://spotify.com/jobs' }
];

export default function HeroCrawler({ onCrawl, isLoading }) {
  const [url, setUrl] = useState('');
  const [useBrowser, setUseBrowser] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    onCrawl(url.trim(), useBrowser);
  };

  const handlePresetClick = (presetUrl) => {
    setUrl(presetUrl);
    onCrawl(presetUrl, useBrowser);
  };

  return (
    <section style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto 36px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '2.6rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '10px', color: 'var(--text-main)' }}>
          Discover Direct <span className="gradient-text">Company Career Portals</span>
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)' }}>
          Bypass third-party job boards. Fetch verified roles, descriptions, and follow-up emails straight from official company domains.
        </p>
      </div>

      <form 
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          background: 'var(--bg-card)',
          backdropFilter: 'blur(24px)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '14px',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '8px 14px',
          background: 'var(--bg-input)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          <Globe size={20} color="var(--text-dim)" />
          <input 
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter official company website or career URL (e.g. stripe.com/jobs, openai.com/careers, figma.com)"
            required
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-main)',
              fontSize: '1.05rem',
              fontFamily: 'var(--font-main)',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <input 
              type="checkbox"
              checked={useBrowser}
              onChange={(e) => setUseBrowser(e.target.checked)}
              style={{ accentColor: 'var(--primary)', width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <span>SPA Deep Render</span>
          </label>

          <button 
            type="submit" 
            disabled={isLoading}
            className="btn btn-primary"
            style={{ minWidth: '150px' }}
          >
            {isLoading ? (
              <>
                <div className="spinner"></div>
                <span>Syncing...</span>
              </>
            ) : (
              <>
                <span>Discover & Sync</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </div>
      </form>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginTop: '16px', fontSize: '0.82rem' }}>
        <span style={{ color: 'var(--text-dim)' }}>Direct Portals:</span>
        {PRESETS.map((p) => (
          <button 
            key={p.name}
            onClick={() => handlePresetClick(p.url)}
            className="preset-btn"
          >
            {p.name}
          </button>
        ))}
      </div>
    </section>
  );
}
