export default function ResultsTable({ results, columns, anomalyFlags }) {
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

  const flags = anomalyFlags?.length === results.length ? anomalyFlags : null;

  return (
    <div className="overflow-auto rounded-lg" style={{ maxHeight: '320px', border: '1px solid var(--border)' }}>
      <table className="w-full" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {flags && (
              <th className="text-left text-[10px] font-medium uppercase px-2 py-3 sticky top-0 w-10" style={{
                background: 'var(--bg-secondary)',
                color: 'var(--text-tertiary)',
                borderBottom: '1px solid var(--border)'
              }}>
              </th>
            )}
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
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = ri % 2 === 0 ? 'var(--bg-primary)' : 'var(--bg-secondary)'; }}
            >
              {flags && (
                <td className="px-1 py-2 align-middle text-center" style={{ borderBottom: '1px solid var(--border)' }}>
                  {flags[ri] && (
                    <span
                      className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px]"
                      title="Statistical outlier in numeric column(s)"
                      style={{ background: 'rgba(245,158,11,0.2)', color: 'var(--warning)' }}
                    >
                      ⚠
                    </span>
                  )}
                </td>
              )}
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
