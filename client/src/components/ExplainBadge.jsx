import LoadingSkeleton from './LoadingSkeleton';

export default function ExplainBadge({ explanation }) {
  if (!explanation) {
    return <LoadingSkeleton lines={1} height={14} />;
  }

  return (
    <div className="fade-in-3 rounded-r-lg py-3 px-4 mt-3" style={{
      borderLeft: '3px solid var(--accent)',
      background: 'var(--accent-glow)'
    }}>
      <div className="text-[10px] font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>
        AI Explanation
      </div>
      <div className="flex items-start gap-2">
        <span className="text-sm">💡</span>
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{explanation}</span>
      </div>
    </div>
  );
}
