import { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import Papa from 'papaparse';

export default function ExportButton({ results, columns, sql }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleExportPNG = async () => {
    setOpen(false);
    const el = document.getElementById('chart-panel');
    if (!el) return;
    try {
      const canvas = await html2canvas(el, { backgroundColor: '#141927' });
      const link = document.createElement('a');
      link.download = `querywise-chart-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (err) {
      console.error('PNG export failed:', err);
    }
  };

  const handleExportCSV = () => {
    setOpen(false);
    if (!results || !columns) return;
    const csv = Papa.unparse(results, { columns });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.download = `querywise-results-${Date.now()}.csv`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="text-xs px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1"
        style={{
          background: 'var(--bg-tertiary)',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border)'
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round"/>
          <polyline points="7,10 12,15 17,10" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="12" y1="15" x2="12" y2="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Export ▾
      </button>

      {open && (
        <div className="absolute right-0 mt-1 rounded-lg overflow-hidden z-50 shadow-xl" style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          minWidth: '180px'
        }}>
          <button
            onClick={handleExportPNG}
            className="w-full text-left text-xs px-4 py-2.5 transition-colors duration-150 flex items-center gap-2"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            🖼️ Export Chart as PNG
          </button>
          <button
            onClick={handleExportCSV}
            className="w-full text-left text-xs px-4 py-2.5 transition-colors duration-150 flex items-center gap-2"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            📄 Export Results as CSV
          </button>
        </div>
      )}
    </div>
  );
}
