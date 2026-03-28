import { useState, useEffect, useRef, useMemo } from 'react';

const defaultSuggestions = [
  'Show total revenue by product category',
  'What is the monthly revenue trend?',
  'Which region has the most orders?',
  'Top 10 customers by total spend'
];

export default function QueryInput({ onSubmit, loading, disabled, followUpActive, fileData }) {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  const suggestions = useMemo(() => {
    if (!fileData || !fileData.schema?.length) return defaultSuggestions;
    
    const nums = fileData.schema.filter(c => ['DOUBLE', 'BIGINT', 'INTEGER'].includes(c.type));
    const strings = fileData.schema.filter(c => c.type === 'VARCHAR');
    const dates = fileData.schema.filter(c => ['DATE', 'TIMESTAMP'].includes(c.type));

    const numCol = nums[0]?.baseName || nums[0]?.name;
    const strCol = strings[0]?.baseName || strings[0]?.name;
    const dateCol = dates[0]?.baseName || dates[0]?.name;

    const dynamic = [];
    if (numCol && strCol) dynamic.push(`Show total ${numCol.replace(/_/g, ' ')} by ${strCol.replace(/_/g, ' ')}`);
    if (numCol && dateCol) dynamic.push(`What is the trend of ${numCol.replace(/_/g, ' ')} over ${dateCol.replace(/_/g, ' ')}?`);
    if (strCol) dynamic.push(`Top 5 ${strCol.replace(/_/g, ' ')} by count`);
    if (numCol) dynamic.push(`List all records sorted by ${numCol.replace(/_/g, ' ')} descending`);
    
    return dynamic.length > 0 ? dynamic : defaultSuggestions;
  }, [fileData]);

  // Cmd+K / Ctrl+K to focus
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (trimmed && !loading && !disabled) {
      onSubmit(trimmed);
      setValue('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="fade-in-2" data-tour="query">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={followUpActive ? 'Follow up: e.g. “Only Q4” or “Break down by region”…' : 'Ask anything about your data…'}
          disabled={disabled || loading}
          className="w-full outline-none transition-all duration-200"
          style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '14px 52px 14px 16px',
            color: 'var(--text-primary)',
            fontSize: '15px',
            fontFamily: 'DM Sans'
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
        />
        <button
          onClick={handleSubmit}
          disabled={!value.trim() || loading || disabled}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 transition-all duration-200"
          style={{
            background: value.trim() ? 'var(--accent)' : 'transparent',
            color: value.trim() ? '#fff' : 'var(--text-tertiary)',
            cursor: value.trim() && !loading ? 'pointer' : 'default'
          }}
        >
          {loading ? (
            <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3"/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round"/>
              <polyline points="12,5 19,12 12,19" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </div>

      {/* Keyboard shortcut hint */}
      <div className="flex items-center gap-1 mt-2 ml-1">
        <span className="text-xs px-1.5 py-0.5 rounded" style={{ 
          background: 'var(--bg-tertiary)', 
          color: 'var(--text-tertiary)',
          fontFamily: 'JetBrains Mono',
          fontSize: '10px'
        }}>
          ⌘K
        </span>
        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>to focus</span>
      </div>

      {/* Suggestions */}
      {!value && !loading && (
        <div className="flex flex-wrap gap-2 mt-3">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => setValue(s)}
              className="text-xs px-3 py-1.5 rounded-full transition-all duration-200 hover:scale-105"
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = 'var(--accent)';
                e.target.style.color = 'var(--accent)';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = 'var(--border)';
                e.target.style.color = 'var(--text-secondary)';
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
