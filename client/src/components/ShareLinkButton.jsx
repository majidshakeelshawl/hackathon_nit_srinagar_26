import { useState } from 'react';
import { createShareSnapshot } from '../lib/api';

export default function ShareLinkButton({
  question,
  sql,
  chartType,
  columns,
  results,
  explanation,
  insights
}) {
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [err, setErr] = useState(null);

  const handleShare = async () => {
    setBusy(true);
    setErr(null);
    try {
      const { shareId } = await createShareSnapshot({
        question,
        sql,
        chartType,
        columns,
        results,
        explanation,
        insights
      });
      const path = `/share/${shareId}`;
      const url = `${window.location.origin}${path}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      setErr(e.message || 'Could not create link');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleShare}
        disabled={busy}
        className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all disabled:opacity-50"
        style={{
          background: 'var(--bg-tertiary)',
          color: copied ? 'var(--success)' : 'var(--text-secondary)',
          border: '1px solid var(--border)'
        }}
      >
        {busy ? 'Creating…' : copied ? '✓ Link copied' : '🔗 Share result'}
      </button>
      {err && <span className="text-[10px]" style={{ color: 'var(--danger)' }}>{err}</span>}
    </div>
  );
}
