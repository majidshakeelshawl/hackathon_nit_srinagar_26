import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';

export default function SQLViewer({ sql, executionTimeMs, rowCount, fileId, onRawResult }) {
  const [displayedSql, setDisplayedSql] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedSql, setEditedSql] = useState('');
  const [copied, setCopied] = useState(false);
  const prevSqlRef = useRef('');

  // Typewriter effect
  useEffect(() => {
    if (!sql || sql === prevSqlRef.current) return;
    prevSqlRef.current = sql;
    setIsTyping(true);
    setDisplayedSql('');
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayedSql(sql.slice(0, i));
      if (i >= sql.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 12);
    return () => clearInterval(interval);
  }, [sql]);

  const handleCopy = () => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleEdit = () => {
    if (!editMode) {
      setEditedSql(sql);
    }
    setEditMode(!editMode);
  };

  const handleRunSql = () => {
    if (onRawResult && editedSql.trim()) {
      onRawResult(editedSql.trim());
    }
  };

  return (
    <div className="rounded-xl overflow-hidden fade-in-3" style={{ 
      background: 'var(--bg-card)', 
      border: `1px solid ${editMode ? 'var(--warning)' : 'var(--border)'}`,
      transition: 'border-color 0.2s'
    }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
            <polyline points="16,18 22,12 16,6" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="8,6 2,12 8,18" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Generated SQL</span>
          {editMode && (
            <span className="text-xs px-1.5 py-0.5 rounded" style={{ 
              background: 'rgba(245,158,11,0.15)', 
              color: 'var(--warning)',
              fontSize: '10px' 
            }}>
              EDIT MODE
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="text-xs px-2 py-1 rounded transition-all duration-200"
            style={{ 
              color: copied ? 'var(--success)' : 'var(--text-tertiary)',
              background: 'var(--bg-tertiary)'
            }}
          >
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleToggleEdit}
            className="text-xs px-2 py-1 rounded transition-all duration-200 flex items-center gap-1"
            style={{ 
              color: editMode ? 'var(--warning)' : 'var(--text-tertiary)',
              background: editMode ? 'rgba(245,158,11,0.1)' : 'var(--bg-tertiary)'
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {editMode ? 'View' : 'Edit'}
          </button>
          {editMode && (
            <button
              onClick={handleRunSql}
              className="text-xs px-3 py-1 rounded font-medium transition-all duration-200"
              style={{ 
                background: 'var(--accent)',
                color: '#fff'
              }}
            >
              ▶ Run SQL
            </button>
          )}
        </div>
      </div>

      {/* Editor */}
      <div style={{ position: 'relative' }}>
        {editMode ? (
          <Editor
            height="160px"
            language="sql"
            theme="vs-dark"
            value={editedSql}
            onChange={setEditedSql}
            options={{
              readOnly: false,
              minimap: { enabled: false },
              fontSize: 13,
              lineNumbers: 'on',
              fontFamily: 'JetBrains Mono, monospace',
              scrollBeyondLastLine: false,
              padding: { top: 12, bottom: 12 },
              renderLineHighlight: 'none',
              overviewRulerLanes: 0,
              hideCursorInOverviewRuler: true,
              scrollbar: { vertical: 'hidden', horizontal: 'hidden' }
            }}
          />
        ) : (
          <div className="p-4" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', minHeight: '60px' }}>
            <span style={{ color: 'var(--text-primary)' }}>{displayedSql}</span>
            {isTyping && <span className="cursor-blink" />}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2" style={{ borderTop: '1px solid var(--border)' }}>
        <span className="text-xs" style={{ color: 'var(--text-tertiary)', fontFamily: 'JetBrains Mono' }}>
          {executionTimeMs != null && `Ran in ${executionTimeMs}ms`}
          {rowCount != null && ` · ${rowCount} rows returned`}
        </span>
      </div>
    </div>
  );
}
