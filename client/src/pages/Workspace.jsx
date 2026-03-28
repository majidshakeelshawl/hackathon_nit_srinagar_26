import { useState, useEffect, useCallback } from 'react';
import { useFileUpload } from '../hooks/useFileUpload';
import { useQueryRunner } from '../hooks/useQueryRunner';
import { selectChartType } from '../lib/chartSelector';
import FileUpload from '../components/FileUpload';
import SchemaCard from '../components/SchemaCard';
import QueryInput from '../components/QueryInput';
import SQLViewer from '../components/SQLViewer';
import ExplainBadge from '../components/ExplainBadge';
import ChartPanel from '../components/ChartPanel';
import QueryHistory from '../components/QueryHistory';
import ExportButton from '../components/ExportButton';
import SampleDatasets from '../components/SampleDatasets';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { runRawSQL } from '../lib/api';

export default function Workspace({ sessionId }) {
  const { uploading, progress, error: uploadError, fileData, upload, reset } = useFileUpload();
  const { loading, error: queryError, result, execute, executeRaw, setResult } = useQueryRunner();
  const [currentChartType, setCurrentChartType] = useState('bar');
  const [history, setHistory] = useState([]);

  // Update chart type when result changes
  useEffect(() => {
    if (result?.chartType) {
      setCurrentChartType(result.chartType);
    }
  }, [result?.chartType]);

  const handleFileAccepted = useCallback(async (file) => {
    await upload(file);
  }, [upload]);

  const handleQuery = useCallback(async (question) => {
    if (!fileData?.fileId) return;
    const res = await execute(fileData.fileId, question);
    if (res) {
      // Save to local history
      setHistory(prev => [{
        _id: Date.now().toString(),
        question,
        sql: res.sql,
        rowCount: res.rowCount,
        executionTimeMs: res.executionTimeMs,
        createdAt: Date.now(),
        results: res.results,
        columns: res.columns,
        explanation: res.explanation,
        chartType: res.chartType
      }, ...prev].slice(0, 20));
    }
  }, [fileData, execute]);

  const handleRawResult = useCallback(async (sql) => {
    if (!fileData?.fileId) return;
    await executeRaw(fileData.fileId, sql);
  }, [fileData, executeRaw]);

  const handleSelectHistory = useCallback((item) => {
    if (item.results && item.columns) {
      const chartType = selectChartType(item.columns, item.results);
      setResult({
        sql: item.sql,
        results: item.results,
        columns: item.columns,
        rowCount: item.rowCount,
        executionTimeMs: item.executionTimeMs,
        explanation: item.explanation || '',
        chartType,
        question: item.question
      });
      setCurrentChartType(chartType);
    }
  }, [setResult]);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const handleChartTypeChange = useCallback((type) => {
    setCurrentChartType(type);
  }, []);

  // Cmd+Enter to submit
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        // Workspace-level shortcut handled by QueryInput
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Navbar */}
      <nav className="flex items-center justify-between px-5" style={{
        height: '52px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0
      }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
            <span className="text-white text-sm font-bold">Q</span>
          </div>
          <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>QueryWise</span>
        </div>
        <div className="flex items-center gap-3">
          {fileData && (
            <button
              onClick={reset}
              className="text-xs px-3 py-1.5 rounded-lg transition-all duration-200"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            >
              ← New file
            </button>
          )}
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            Powered by NVIDIA NIM
          </span>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* History sidebar */}
        <div className="hidden lg:block">
          <QueryHistory
            history={history}
            onSelectHistory={handleSelectHistory}
            onClearHistory={handleClearHistory}
          />
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
          {!fileData ? (
            /* ─── No file state ─── */
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8 fade-in">
                <h1 className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                  Query your data in <span style={{ color: 'var(--accent)' }}>plain English</span>
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Upload a CSV or Excel file, then ask questions to get instant charts and SQL.
                </p>
              </div>

              <SampleDatasets onLoad={handleFileAccepted} />

              <div className="max-w-lg mx-auto">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>or upload your own</span>
                  <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                </div>
                <FileUpload
                  onFileAccepted={handleFileAccepted}
                  uploading={uploading}
                  progress={progress}
                  error={uploadError}
                />
              </div>
            </div>
          ) : (
            /* ─── File loaded state ─── */
            <div className="max-w-4xl mx-auto space-y-5">
              <SchemaCard
                filename={fileData.filename}
                schema={fileData.schema}
                rowCount={fileData.rowCount}
              />

              <QueryInput
                onSubmit={handleQuery}
                loading={loading}
                disabled={!fileData}
              />

              {/* Error banner */}
              {queryError && (
                <div className="rounded-xl p-4 flex items-center justify-between fade-in" style={{
                  background: 'rgba(248,113,113,0.1)',
                  border: '1px solid var(--danger)'
                }}>
                  <span className="text-sm" style={{ color: 'var(--danger)' }}>{queryError}</span>
                  <button
                    onClick={() => {}} 
                    className="text-xs px-2 py-1 rounded"
                    style={{ color: 'var(--danger)' }}
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Loading state */}
              {loading && (
                <div className="space-y-4 fade-in">
                  <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <LoadingSkeleton lines={3} height={14} />
                  </div>
                  <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <LoadingSkeleton lines={1} height={200} />
                  </div>
                </div>
              )}

              {/* Results */}
              {result && !loading && (
                <div className="space-y-4">
                  <SQLViewer
                    sql={result.sql}
                    executionTimeMs={result.executionTimeMs}
                    rowCount={result.rowCount}
                    fileId={fileData.fileId}
                    onRawResult={handleRawResult}
                  />

                  <ExplainBadge explanation={result.explanation} />

                  <div className="flex items-center justify-between">
                    <div /> {/* spacer */}
                    <ExportButton
                      results={result.results}
                      columns={result.columns}
                      sql={result.sql}
                    />
                  </div>

                  <div className="fade-in-4">
                    <ChartPanel
                      results={result.results}
                      columns={result.columns}
                      chartType={currentChartType}
                      onChartTypeChange={handleChartTypeChange}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
