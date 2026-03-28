const typeIcons = {
  string: '📝',
  number: '🔢',
  date: '📅',
  boolean: '✅'
};

const typeColors = {
  string: '#A78BFA',
  number: '#4F8EF7',
  date: '#F59E0B',
  boolean: '#34D399'
};

function ColumnStrip({ schema }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
      {schema?.map((col, i) => (
        <div
          key={i}
          className="flex-shrink-0 rounded-lg p-3 transition-all duration-200 hover:scale-[1.02]"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            minWidth: '140px',
            maxWidth: '180px'
          }}
        >
          <div className="text-lg mb-1">{typeIcons[col.type] || '📝'}</div>
          <div className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }} title={col.name}>
            {col.name.length > 18 ? col.name.slice(0, 18) + '…' : col.name}
          </div>
          <div className="text-xs mt-0.5" style={{ color: typeColors[col.type] || 'var(--text-tertiary)' }}>
            {col.type}
          </div>
          {col.sample && (
            <div className="text-xs mt-1.5 italic truncate" style={{ color: 'var(--text-tertiary)' }} title={col.sample}>
              {String(col.sample).length > 20 ? String(col.sample).slice(0, 20) + '…' : col.sample}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function SchemaCard({
  filename,
  schema,
  rowCount,
  mode,
  filenameA,
  filenameB,
  schemaA,
  schemaB,
  rowCountA,
  rowCountB
}) {
  if (mode === 'dual' && schemaA && schemaB) {
    return (
      <div className="fade-in-1 space-y-4">
        <div className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
          Two datasets · JOIN with views <code className="text-[10px]">a</code> and <code className="text-[10px]">b</code>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{filenameA}</span>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--accent-glow)', color: 'var(--accent)', fontFamily: 'JetBrains Mono' }}>
              {rowCountA?.toLocaleString()} rows
            </span>
          </div>
          <ColumnStrip schema={schemaA} />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{filenameB}</span>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--accent-glow)', color: 'var(--accent)', fontFamily: 'JetBrains Mono' }}>
              {rowCountB?.toLocaleString()} rows
            </span>
          </div>
          <ColumnStrip schema={schemaB} />
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in-1">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="14,2 14,8 20,8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{filename}</span>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full" style={{
          background: 'var(--accent-glow)',
          color: 'var(--accent)',
          fontFamily: 'JetBrains Mono'
        }}>
          {rowCount?.toLocaleString()} rows
        </span>
        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          {schema?.length} columns
        </span>
      </div>

      <ColumnStrip schema={schema} />
    </div>
  );
}
