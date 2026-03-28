import { useState } from 'react';

function getRelativeTime(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours} hr ago`;
}

function HistoryList({
  history,
  hoveredIdx,
  setHoveredIdx,
  onSelectHistory,
  onClearHistory
}) {
  return (
    <>
      <div className="flex-1 overflow-y-auto min-h-0">
        {(!history || history.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5" className="mb-3 opacity-40">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round"/>
            </svg>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              No queries yet
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
              Ask your first question →
            </p>
          </div>
        ) : (
          <div className="py-1">
            {history.map((item, i) => (
              <div
                key={item._id || i}
                className="px-3 py-2.5 cursor-pointer transition-all duration-150 slide-in-left"
                style={{
                  background: hoveredIdx === i ? 'var(--bg-tertiary)' : 'transparent',
                  borderLeft: hoveredIdx === i ? '2px solid var(--accent)' : '2px solid transparent'
                }}
                onClick={() => onSelectHistory(item)}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(-1)}
              >
                <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {item.question?.length > 50 ? item.question.slice(0, 50) + '…' : item.question}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                    {getRelativeTime(item.createdAt || item._creationTime)}
                  </span>
                  {item.rowCount != null && (
                    <span className="text-[10px]" style={{ color: 'var(--text-tertiary)', fontFamily: 'JetBrains Mono' }}>
                      {item.rowCount} rows
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {history && history.length > 0 && (
        <div className="px-3 py-2 shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
          <button
            onClick={onClearHistory}
            className="w-full text-xs py-1.5 rounded-md transition-all duration-200"
            style={{ color: 'var(--text-tertiary)', background: 'var(--bg-tertiary)' }}
            onMouseEnter={(e) => { e.target.style.color = 'var(--danger)'; }}
            onMouseLeave={(e) => { e.target.style.color = 'var(--text-tertiary)'; }}
          >
            Clear history
          </button>
        </div>
      )}
    </>
  );
}

export default function QueryHistory({
  history,
  onSelectHistory,
  onClearHistory,
  variant = 'sidebar',
  open = false,
  onClose
}) {
  const [hoveredIdx, setHoveredIdx] = useState(-1);

  const header = (
    <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="flex items-center gap-2">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12,6 12,12 16,14" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>History</span>
      </div>
      <div className="flex items-center gap-2">
        {history && history.length > 0 && (
          <span className="text-xs px-1.5 py-0.5 rounded-full" style={{
            background: 'var(--bg-tertiary)',
            color: 'var(--text-tertiary)',
            fontFamily: 'JetBrains Mono',
            fontSize: '10px'
          }}>
            {history.length}
          </span>
        )}
        {variant === 'sheet' && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-lg leading-none"
            style={{ color: 'var(--text-tertiary)' }}
            aria-label="Close"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );

  if (variant === 'sheet') {
    if (!open) return null;
    return (
      <>
        <div
          className="fixed inset-0 z-[60] lg:hidden"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={onClose}
          aria-hidden
        />
        <div
          className="fixed bottom-0 left-0 right-0 z-[61] flex flex-col max-h-[72vh] rounded-t-2xl lg:hidden shadow-2xl"
          style={{
            background: 'var(--bg-secondary)',
            borderTop: '1px solid var(--border)'
          }}
        >
          {header}
          <HistoryList
            history={history}
            hoveredIdx={hoveredIdx}
            setHoveredIdx={setHoveredIdx}
            onSelectHistory={(item) => {
              onSelectHistory(item);
              onClose?.();
            }}
            onClearHistory={onClearHistory}
          />
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-col h-full w-full lg:w-[240px]" style={{
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border)'
    }}>
      {header}
      <HistoryList
        history={history}
        hoveredIdx={hoveredIdx}
        setHoveredIdx={setHoveredIdx}
        onSelectHistory={onSelectHistory}
        onClearHistory={onClearHistory}
      />
    </div>
  );
}
