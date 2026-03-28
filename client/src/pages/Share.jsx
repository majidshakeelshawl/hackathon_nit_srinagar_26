import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchShareSnapshot } from '../lib/api';
import ChartPanel from '../components/ChartPanel';
import InsightsPanel from '../components/InsightsPanel';
import SQLViewer from '../components/SQLViewer';
import ExplainBadge from '../components/ExplainBadge';

export default function Share() {
  const { shareId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState('bar');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const snap = await fetchShareSnapshot(shareId);
        if (!cancelled) {
          setData(snap);
          setChartType(snap.chartType || 'bar');
        }
      } catch (e) {
        if (!cancelled) setError(e.message || 'Not found');
      }
    })();
    return () => { cancelled = true; };
  }, [shareId]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: 'var(--bg-primary)' }}>
        <p className="text-sm mb-4" style={{ color: 'var(--danger)' }}>{error}</p>
        <Link to="/workspace" className="text-sm" style={{ color: 'var(--accent)' }}>← Back to QueryWise</Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>
        Loading snapshot…
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <nav className="flex items-center justify-between px-5 py-3" style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)'
      }}>
        <Link to="/" className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>QueryWise</Link>
        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Shared result · read-only</span>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{data.question}</h1>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            Saved {new Date(data.createdAt).toLocaleString()}
          </p>
        </div>

        <SQLViewer
          sql={data.sql}
          streaming={false}
          executionTimeMs={null}
          rowCount={data.results?.length}
          readOnly
        />

        {data.explanation ? (
          <ExplainBadge explanation={data.explanation} streaming={false} />
        ) : null}

        <ChartPanel
          results={data.results}
          columns={data.columns}
          chartType={chartType}
          onChartTypeChange={setChartType}
          anomalyFlags={null}
        />

        <InsightsPanel insights={data.insights} />
      </div>
    </div>
  );
}
