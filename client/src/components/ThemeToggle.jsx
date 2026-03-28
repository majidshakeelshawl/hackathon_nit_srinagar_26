import { useState, useEffect } from 'react';
import { getThemeMode, cycleThemeMode } from '../lib/theme';

const labels = { system: 'System theme', light: 'Light theme', dark: 'Dark theme' };

export default function ThemeToggle({ className = '' }) {
  const [mode, setMode] = useState(getThemeMode);

  useEffect(() => {
    const onStorage = () => setMode(getThemeMode());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleClick = () => {
    const next = cycleThemeMode();
    setMode(next);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={labels[mode] || 'Theme'}
      aria-label={labels[mode] || 'Theme'}
      className={`p-2 rounded-lg transition-colors ${className}`}
      style={{
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--border)',
        color: 'var(--text-secondary)'
      }}
    >
      {mode === 'system' && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" strokeLinecap="round" />
        </svg>
      )}
      {mode === 'light' && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" strokeLinecap="round" />
        </svg>
      )}
      {mode === 'dark' && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
