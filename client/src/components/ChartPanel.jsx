import { useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { CHART_COLORS } from '../lib/chartSelector';
import ResultsTable from './ResultsTable';
import html2canvas from 'html2canvas';

const chartTypes = ['bar', 'line', 'pie', 'scatter', 'table'];
const chartLabels = { bar: 'Bar', line: 'Line', pie: 'Pie', scatter: 'Scatter', table: 'Table' };
const chartIcons = {
  bar: '📊', line: '📈', pie: '🥧', scatter: '⬡', table: '📋'
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '10px 14px',
      fontFamily: 'DM Sans',
      fontSize: '12px'
    }}>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color, margin: 0 }}>
          {entry.name}: <strong>{typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}</strong>
        </p>
      ))}
    </div>
  );
};

export default function ChartPanel({ results, columns, chartType, onChartTypeChange }) {
  const { textCols, numericCols, processedData } = useMemo(() => {
    if (!columns || !results || results.length === 0) return { textCols: [], numericCols: [], processedData: [] };
    
    const text = [];
    const numeric = [];
    
    columns.forEach(col => {
      const vals = results.slice(0, 10).map(r => r[col]).filter(v => v != null && v !== '');
      const numCount = vals.filter(v => !isNaN(Number(v))).length;
      if (numCount >= vals.length * 0.8 && vals.length > 0) {
        numeric.push(col);
      } else {
        text.push(col);
      }
    });

    // Convert numeric values
    const processed = results.map(row => {
      const newRow = { ...row };
      numeric.forEach(col => {
        newRow[col] = Number(row[col]) || 0;
      });
      return newRow;
    });

    return { textCols: text, numericCols: numeric, processedData: processed };
  }, [columns, results]);

  const handleExportPNG = async () => {
    const el = document.getElementById('chart-panel');
    if (!el) return;
    try {
      const canvas = await html2canvas(el, { backgroundColor: '#141927' });
      const link = document.createElement('a');
      link.download = `querywise-chart-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (err) {
      console.error('PNG export failed:', err);
    }
  };

  const xCol = textCols[0] || columns[0];
  const yCol = numericCols[0] || columns[1];
  const yCol2 = numericCols[1];

  const renderChart = () => {
    const effectiveType = chartType === 'pie' && processedData.length > 8 ? 'bar' : chartType;

    switch (effectiveType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={processedData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey={xCol} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {numericCols.map((col, i) => (
                <Bar key={col} dataKey={col} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={processedData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey={xCol} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {numericCols.map((col, i) => (
                <Line key={col} type="monotone" dataKey={col} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2} dot={{ r: 4 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={processedData}
                cx="50%"
                cy="50%"
                outerRadius={110}
                dataKey={yCol}
                nameKey={xCol}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={true}
              >
                {processedData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={320}>
            <ScatterChart margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey={numericCols[0]} name={numericCols[0]} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <YAxis dataKey={numericCols[1] || numericCols[0]} name={numericCols[1] || numericCols[0]} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Scatter data={processedData} fill={CHART_COLORS[0]} />
            </ScatterChart>
          </ResponsiveContainer>
        );

      case 'table':
      default:
        return <ResultsTable results={results} columns={columns} />;
    }
  };

  return (
    <div>
      {/* Chart type toggle + Export PNG */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1 rounded-lg p-1" style={{ background: 'var(--bg-secondary)' }}>
          {chartTypes.map(t => (
            <button
              key={t}
              onClick={() => onChartTypeChange(t)}
              className="text-xs px-3 py-1.5 rounded-md transition-all duration-200 flex items-center gap-1"
              style={{
                background: chartType === t ? 'var(--accent)' : 'transparent',
                color: chartType === t ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: chartType === t ? 600 : 400
              }}
            >
              <span>{chartIcons[t]}</span>
              <span className="hidden sm:inline">{chartLabels[t]}</span>
            </button>
          ))}
        </div>

        {chartType !== 'table' && (
          <button
            onClick={handleExportPNG}
            className="text-xs px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="7,10 12,15 17,10" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="15" x2="12" y2="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            PNG
          </button>
        )}
      </div>

      {/* Chart */}
      <div
        id="chart-panel"
        key={chartType}
        className="chart-in rounded-xl p-4"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        {renderChart()}
      </div>
    </div>
  );
}
