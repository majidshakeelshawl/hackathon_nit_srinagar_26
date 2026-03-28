export default function ResultsTable({ results, columns }) {
  if (!results || results.length === 0) {
    return (
      <div className="flex items-center justify-center py-12" style={{ color: 'var(--text-tertiary)' }}>
        <p className="text-sm">No results returned</p>
      </div>
    );
  }

  const isNumeric = (val) => {
    if (val == null || val === '') return false;
    return !isNaN(Number(val));
  };

  return (
    <div className="overflow-auto rounded-lg" style={{ maxHeight: '320px', border: '1px solid var(--border)' }}>
      <table className="w-full" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i} className="text-left text-xs font-medium uppercase tracking-wider px-4 py-3 sticky top-0" style={{
                background: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                borderBottom: '1px solid var(--border)',
                whiteSpace: 'nowrap'
              }}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {results.map((row, ri) => (
            <tr key={ri} className="transition-colors duration-150" style={{
              background: ri % 2 === 0 ? 'var(--bg-primary)' : 'var(--bg-secondary)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
            onMouseLeave={(e) => e.currentTarget.style.background = ri % 2 === 0 ? 'var(--bg-primary)' : 'var(--bg-secondary)'}
            >
              {columns.map((col, ci) => (
                <td key={ci} className="px-4 py-2.5 text-[13px]" style={{
                  borderBottom: '1px solid var(--border)',
                  textAlign: isNumeric(row[col]) ? 'right' : 'left',
                  fontFamily: isNumeric(row[col]) ? 'JetBrains Mono, monospace' : 'inherit',
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap'
                }}>
                  {row[col] != null ? String(row[col]) : '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
