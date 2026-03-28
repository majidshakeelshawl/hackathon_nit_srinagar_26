export default function InsightsPanel({ insights }) {
  if (!insights?.length) return null;

  return (
    <div className="fade-in-3 rounded-xl p-4 mt-4" style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)'
    }}>
      <div className="text-[10px] font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--accent)' }}>
        AI insights
      </div>
      <ul className="space-y-3">
        {insights.map((line, i) => (
          <li
            key={i}
            className="flex gap-3 text-sm leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            <span className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold" style={{
              background: 'var(--accent-glow)',
              color: 'var(--accent)'
            }}>
              {i + 1}
            </span>
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
