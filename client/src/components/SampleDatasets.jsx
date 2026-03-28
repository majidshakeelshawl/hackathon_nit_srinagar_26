import { useState } from 'react';

const samples = [
  {
    title: 'Sales Data',
    desc: 'Revenue, products, regions, and salesperson performance across 2 years.',
    file: 'sales_data.csv',
    rows: 500,
    cols: 10
  },
  {
    title: 'HR Analytics',
    desc: 'Employee demographics, salaries, departments, and performance scores.',
    file: 'hr_data.csv',
    rows: 200,
    cols: 9
  },
  {
    title: 'E-Commerce',
    desc: 'Orders, customers, products, delivery status, and ratings.',
    file: 'ecommerce_data.csv',
    rows: 300,
    cols: 11
  }
];

const icons = ['📊', '👥', '🛒'];

export default function SampleDatasets({ onLoad }) {
  const [loading, setLoading] = useState(null);

  const handleLoad = async (sample, idx) => {
    setLoading(idx);
    try {
      const response = await fetch(`/samples/${sample.file}`);
      const blob = await response.blob();
      const file = new File([blob], sample.file, { type: 'text/csv' });
      onLoad(file);
    } catch (err) {
      console.error('Failed to load sample:', err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {samples.map((s, i) => (
        <div
          key={i}
          className="rounded-xl p-5 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer group"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
          onClick={() => handleLoad(s, i)}
        >
          <div className="text-2xl mb-3">{icons[i]}</div>
          <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{s.title}</h3>
          <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>{s.desc}</p>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ 
              background: 'var(--bg-tertiary)', 
              color: 'var(--text-tertiary)',
              fontFamily: 'JetBrains Mono'
            }}>
              {s.rows} rows
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ 
              background: 'var(--bg-tertiary)', 
              color: 'var(--text-tertiary)',
              fontFamily: 'JetBrains Mono'
            }}>
              {s.cols} cols
            </span>
          </div>
          <div className="text-xs font-medium flex items-center gap-1 transition-colors duration-200"
            style={{ color: loading === i ? 'var(--text-tertiary)' : 'var(--accent)' }}
          >
            {loading === i ? (
              <>
                <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                Loading...
              </>
            ) : (
              'Load sample →'
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
