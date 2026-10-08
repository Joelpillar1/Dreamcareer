import React, { useState, useEffect, useRef } from 'react';
import { X, Zap } from 'lucide-react';

export default function BatchCrawlModal({ onClose, onBatchCrawl, isCrawling, onMassComplete }) {
  const [mode, setMode] = useState('urls');

  const [urlsText, setUrlsText] = useState(
    "https://openai.com/careers\nhttps://stripe.com/jobs\nhttps://www.figma.com/careers\nhttps://spotify.com/jobs"
  );

  // Mass-fetch config
  const [limit, setLimit] = useState(60);
  const [workers, setWorkers] = useState(10);
  const [maxJobs, setMaxJobs] = useState(500);

  const [isMassRunning, setIsMassRunning] = useState(false);
  const [massStatus, setMassStatus] = useState(null);
  const pollRef = useRef(null);

  // Poll mass-fetch progress while running
  useEffect(() => {
    if (!isMassRunning) return;
    let cancelled = false;

    const tick = async () => {
      try {
        const res = await fetch('/api/mass-fetch/status');
        if (!res.ok) return;
        const status = await res.json();
        if (cancelled) return;
        setMassStatus(status);

        if (!status.running) {
          setIsMassRunning(false);
          if (onMassComplete) {
            await onMassComplete(status);
          }
        }
      } catch (e) {
        // keep polling; transient errors are expected
      }
    };

    tick();
    pollRef.current = setInterval(tick, 1200);
    return () => {
      cancelled = true;
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [isMassRunning]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const urls = urlsText
      .split('\n')
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    if (urls.length === 0) {
      alert('Please enter at least one company career page URL.');
      return;
    }
    onBatchCrawl(urls);
  };

  const handleStartMassFetch = async () => {
    try {
      const res = await fetch('/api/mass-fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          limit: Number(limit) || 0,
          workers: Number(workers) || 10,
          max_jobs: Number(maxJobs) || 500
        })
      });
      const data = await res.json();
      if (res.ok && (data.status === 'started' || data.status === 'already_running')) {
        setMassStatus({
          running: true,
          completed: 0,
          total: data.companies || limit || 0,
          jobs_found: 0,
          jobs_saved: 0,
          engine_breakdown: {}
        });
        setIsMassRunning(true);
      } else {
        alert(`Mass fetch could not start: ${data.error_message || data.status || 'unknown error'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Error starting mass fetch.');
    }
  };

  const completed = massStatus?.completed || 0;
  const total = massStatus?.total || 0;
  const percent = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
  const engines = Object.entries(massStatus?.engine_breakdown || {});
  const busy = isCrawling || isMassRunning;

  const tabStyle = (active) => ({
    flex: 1,
    padding: '9px 14px',
    borderRadius: 'var(--radius-sm)',
    border: `1px solid ${active ? 'var(--primary)' : 'var(--border-color)'}`,
    background: active ? 'var(--primary-light)' : 'transparent',
    color: active ? 'var(--primary-text)' : 'var(--text-muted)',
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'var(--transition)'
  });

  const fieldStyle = {
    width: '100%',
    background: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 12px',
    color: 'var(--text-main)',
    fontSize: '0.9rem',
    outline: 'none'
  };

  const labelStyle = { fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 600, marginBottom: '5px', display: 'block' };

  return (
    <div className="modal-backdrop" onClick={busy ? undefined : onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} disabled={busy}>
          <X size={18} />
        </button>

        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '6px' }}>
            Bulk Career Portal Sync
          </h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.88rem' }}>
            Fetch jobs directly from official company career pages — via each employer's
            first-party ATS board, direct page render, or verified portal sync.
          </p>
        </div>

        {/* Mode tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
          <button type="button" disabled={busy} style={tabStyle(mode === 'urls')} onClick={() => setMode('urls')}>
            Custom URLs
          </button>
          <button
            type="button"
            disabled={busy}
            style={{ ...tabStyle(mode === 'mass'), display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            onClick={() => setMode('mass')}
          >
            <Zap size={14} /> Mass Fetch (1000s of jobs)
          </button>
        </div>

        {mode === 'urls' && (
          <form onSubmit={handleSubmit}>
            <textarea
              rows="6"
              value={urlsText}
              onChange={(e) => setUrlsText(e.target.value)}
              disabled={busy}
              style={{
                width: '100%',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px',
                color: 'var(--text-main)',
                fontFamily: 'monospace',
                fontSize: '0.88rem',
                outline: 'none',
                resize: 'vertical'
              }}
            />

            {isCrawling && (
              <div style={{ marginTop: '16px' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--accent-cyan, var(--primary-text))', fontWeight: 600, marginBottom: '6px' }}>
                  Batch syncing company portals in progress...
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: '100%' }}></div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button type="submit" disabled={busy} className="btn btn-primary">
                {isCrawling ? 'Syncing in background...' : 'Start Batch Sync'}
              </button>
              <button type="button" onClick={onClose} disabled={busy} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        )}

        {mode === 'mass' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>Companies (0 = all seeds)</label>
                <input type="number" min="0" value={limit} disabled={busy}
                  onChange={(e) => setLimit(e.target.value)} style={fieldStyle} />
              </div>
              <div>
                <label style={labelStyle}>Concurrent workers</label>
                <input type="number" min="1" max="32" value={workers} disabled={busy}
                  onChange={(e) => setWorkers(e.target.value)} style={fieldStyle} />
              </div>
              <div>
                <label style={labelStyle}>Max jobs / company</label>
                <input type="number" min="1" value={maxJobs} disabled={busy}
                  onChange={(e) => setMaxJobs(e.target.value)} style={fieldStyle} />
              </div>
            </div>

            <p style={{ color: 'var(--text-dim)', fontSize: '0.82rem', marginBottom: '16px' }}>
              Syncs a large list of well-known company career pages in parallel and stores
              every extracted opening. Only official employer career pages are used.
            </p>

            {massStatus && (
              <div style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '14px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--primary-text)', fontWeight: 600 }}>
                    {isMassRunning ? 'Syncing career pages...' : 'Mass fetch finished'}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>{completed}/{total} companies</span>
                </div>

                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${percent}%` }}></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '8px' }}>
                  <span>{massStatus.current_company ? `Now: ${massStatus.current_company}${massStatus.current_engine ? ` (${massStatus.current_engine})` : ''}` : '\u00a0'}</span>
                  <span>{massStatus.jobs_found || 0} jobs found · {massStatus.jobs_saved || 0} saved</span>
                </div>

                {engines.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                    {engines.map(([engine, count]) => (
                      <span key={engine} style={{
                        fontSize: '0.72rem',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: 'var(--bg-tag, var(--primary-light))',
                        color: 'var(--text-muted)',
                        border: '1px solid var(--border-color)'
                      }}>
                        {engine}: {count}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" disabled={busy} className="btn btn-primary" onClick={handleStartMassFetch}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isMassRunning ? <><div className="spinner"></div> Fetching...</> : <><Zap size={15} /> Start Mass Fetch</>}
              </button>
              <button type="button" onClick={onClose} disabled={busy} className="btn btn-secondary">
                {isMassRunning ? 'Running...' : 'Close'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
