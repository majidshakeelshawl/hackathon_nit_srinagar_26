import { useState, useEffect, useCallback } from 'react';
import { useFileUpload } from '../hooks/useFileUpload';
import { useQueryRunner } from '../hooks/useQueryRunner';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { selectChartType } from '../lib/chartSelector';
import { fetchQueryHistory, clearQueryHistory } from '../lib/api';
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
import OnboardingTour from '../components/OnboardingTour';
import ThemeToggle from '../components/ThemeToggle';
import InsightsPanel from '../components/InsightsPanel';
import ShareLinkButton from '../components/ShareLinkButton';

export default function Workspace() {
  const isMobile = useMediaQuery('(max-width: 1023px)');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState('single');
  const [conversationContext, setConversationContext] = useState(null);
  const [sessionId] = useState(() => {
    const key = 'querywise_session_id';
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const next = (globalThis.crypto?.randomUUID?.() || `session_${Date.now()}`);
    localStorage.setItem(key, next);
    return next;
  });

  const { uploading, progress, error: uploadError, fileData, upload, uploadMulti, reset } = useFileUpload();
  const {
    loading,
    error: queryError,
    clearError,
    result,
    execute,
    executeRaw,
    setResult,
    streamingSql,
    streamingExplanation,
    sqlStreaming
  } = useQueryRunner();

  const [currentChartType, setCurrentChartType] = useState('bar');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (result?.chartType) {
      setCurrentChartType(result.chartType);
    }
  }, [result?.chartType]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const persisted = await fetchQueryHistory(sessionId);
        if (!mounted) return;
        setHistory(persisted.map((item, idx) => ({
          _id: item._id || `${item.createdAt || item._creationTime || Date.now()}_${idx}`,
          question: item.question,
          sql: item.sql,
          rowCount: item.rowCount,
          executionTimeMs: item.executionTimeMs,
          createdAt: item.createdAt || item._creationTime || Date.now()
        })));
      } catch {
        // non-critical; local history still works
      }
    })();
    return () => {
      mounted = false;
    };
  }, [sessionId]);

  const handleFileAccepted = useCallback(async (file) => {
    await upload(file);
  }, [upload]);

  const handleMultiAccepted = useCallback(async (files) => {
    await uploadMulti(files);
  }, [uploadMulti]);

  const handleReset = useCallback(() => {
    reset();
    setConversationContext(null);
  }, [reset]);

  const handleQuery = useCallback(async (question) => {
    if (!fileData?.fileId) return;
    const ctx = conversationContext?.previousSql
      ? {
          previousSql: conversationContext.previousSql,
          previousQuestion: conversationContext.previousQuestion || '',
          sessionId
        }
      : { sessionId };
    const res = await execute(fileData.fileId, question, ctx);
    if (res) {
      setConversationContext({ previousSql: res.sql, previousQuestion: res.question });
      setHistory((prev) => [{
        _id: Date.now().toString(),
        question,
        sql: res.sql,
        rowCount: res.rowCount,
        executionTimeMs: res.executionTimeMs,
        createdAt: Date.now(),
        results: res.results,
        columns: res.columns,
        explanation: res.explanation,
        chartType: res.chartType,
        insights: res.insights,
        anomalyFlags: res.anomalyFlags
      }, ...prev].slice(0, 20));
    }
  }, [fileData, execute, conversationContext, sessionId]);

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
        question: item.question,
        insights: item.insights || [],
        anomalyFlags: item.anomalyFlags || []
      });
      setCurrentChartType(chartType);
      setConversationContext({
        previousSql: item.sql,
        previousQuestion: item.question
      });
    }
  }, [setResult]);

  const handleClearHistory = useCallback(async () => {
    setHistory([]);
    try {
      await clearQueryHistory(sessionId);
    } catch {
      // non-critical
    }
  }, [sessionId]);

  const handleChartTypeChange = useCallback((type) => {
    setCurrentChartType(type);
  }, []);

  const displaySql = result?.sql ?? streamingSql;
  const showResultsBlock = result && !loading;
  const showStreamingResults = loading && (streamingSql || sqlStreaming);

  return (
    <div className="flex flex-col h-[100dvh] bg-grad-saas min-h-0" style={{ background: 'var(--bg-primary)' }}>
      <OnboardingTour fileData={fileData} />

      <nav className="glass-nav z-10 sticky top-0 flex items-center justify-between px-3 sm:px-5 gap-2" style={{
        height: '52px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0
      }}>
        <a href="/" className="flex items-center gap-2 min-w-0 transition-opacity hover:opacity-80">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-accent-gradient">
            <span className="text-white text-xs font-bold">Q</span>
          </div>
          <span className="font-semibold text-[15px] tracking-tight truncate" style={{ color: 'var(--text-primary)' }}>QueryWise</span>
        </a>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <ThemeToggle />
          {fileData && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all duration-200 hover:border-[var(--accent)] hover:text-[var(--accent)]"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
              title="Reset and upload a new file"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="1,4 1,10 7,10" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="hidden sm:inline">Start Over</span>
            </button>
          )}
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden min-h-0">
        {!isMobile && (
          <div className="flex h-full shrink-0">
            <QueryHistory
              history={history}
              onSelectHistory={handleSelectHistory}
              onClearHistory={handleClearHistory}
              variant="sidebar"
            />
          </div>
        )}

        {isMobile && fileData && (
          <aside
            className="flex flex-col w-12 shrink-0 items-center py-3 gap-3 border-r"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
          >
            <button
              type="button"
              onClick={() => setHistoryOpen(true)}
              className="p-2 rounded-lg"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
              aria-label="Open query history"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12,6 12,12 16,14" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </aside>
        )}

        {isMobile && (
          <QueryHistory
            history={history}
            onSelectHistory={handleSelectHistory}
            onClearHistory={handleClearHistory}
            variant="sheet"
            open={historyOpen}
            onClose={() => setHistoryOpen(false)}
          />
        )}

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-6 lg:px-8 py-4 sm:py-6 min-w-0">
          {!fileData ? (
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-6 sm:mb-8 fade-in">
                <h1 className="text-2xl sm:text-4xl font-bold mb-3 tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  Query your data in <span className="text-gradient">plain English</span>
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Upload one or multiple CSV/Excel files (up to 4). AI infers JOIN keys automatically. Ask follow-ups to refine results.
                </p>
              </div>

              <div className="flex justify-center gap-2 mb-6">
                <button
                  type="button"
                  onClick={() => setUploadMode('single')}
                  className="text-xs px-4 py-2 rounded-lg font-medium"
                  style={{
                    background: uploadMode === 'single' ? 'var(--accent)' : 'var(--bg-tertiary)',
                    color: uploadMode === 'single' ? '#fff' : 'var(--text-secondary)',
                    border: '1px solid var(--border)'
                  }}
                >
                  One file
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('multi')}
                  className="text-xs px-4 py-2 rounded-lg font-medium"
                  style={{
                    background: uploadMode === 'multi' ? 'var(--accent)' : 'var(--bg-tertiary)',
                    color: uploadMode === 'multi' ? '#fff' : 'var(--text-secondary)',
                    border: '1px solid var(--border)'
                  }}
                >
                  Multiple files (JOIN)
                </button>
              </div>

              <div data-tour="upload" className="space-y-6">
                {uploadMode === 'single' && (
                  <>
                    <SampleDatasets onLoad={handleFileAccepted} />
                    <div className="max-w-lg mx-auto">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>or upload your own</span>
                        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                      </div>
                    </div>
                  </>
                )}

                <div className="max-w-lg mx-auto">
                  <FileUpload
                    multi={uploadMode === 'multi'}
                    onFileAccepted={handleFileAccepted}
                    onMultiAccepted={handleMultiAccepted}
                    uploading={uploading}
                    progress={progress}
                    error={uploadError}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto flex flex-col gap-4 sm:gap-5">
              <SchemaCard
                mode={fileData.mode}
                filename={fileData.filename}
                schema={fileData.schema}
                rowCount={fileData.rowCount}
                fileData={fileData}
              />

              {conversationContext?.previousSql && (
                <div className="text-xs rounded-lg px-3 py-2" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>Conversation mode · </span>
                  Refining: <span style={{ color: 'var(--text-primary)' }}>{conversationContext.previousQuestion}</span>
                  <button
                    type="button"
                    className="ml-2 underline"
                    style={{ color: 'var(--accent)' }}
                    onClick={() => setConversationContext(null)}
                  >
                    Clear
                  </button>
                </div>
              )}

              <QueryInput
                onSubmit={handleQuery}
                loading={loading}
                disabled={!fileData}
                followUpActive={!!conversationContext?.previousSql}
                fileData={fileData}
              />

              {queryError && (
                <div className="rounded-xl p-4 flex items-center justify-between fade-in" style={{
                  background: 'rgba(248,113,113,0.1)',
                  border: '1px solid var(--danger)'
                }}>
                  <span className="text-sm" style={{ color: 'var(--danger)' }}>{queryError}</span>
                  <button
                    type="button"
                    onClick={() => clearError()}
                    className="text-xs px-2 py-1 rounded"
                    style={{ color: 'var(--danger)' }}
                  >
                    ✕
                  </button>
                </div>
              )}

              {(showStreamingResults || showResultsBlock) && (
                <SQLViewer
                  sql={displaySql}
                  streaming={sqlStreaming}
                  executionTimeMs={result?.executionTimeMs}
                  rowCount={result?.rowCount}
                  onRawResult={handleRawResult}
                />
              )}

              {loading && !showStreamingResults && !result && (
                <div className="space-y-4 fade-in">
                  <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <LoadingSkeleton lines={3} height={14} />
                  </div>
                </div>
              )}

              {result && (
                <ExplainBadge
                  explanation={result.explanation}
                  streamingText={streamingExplanation}
                  streaming={loading && !!streamingExplanation}
                />
              )}

              {showResultsBlock && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 flex-wrap">
                  <ShareLinkButton
                    question={result.question}
                    sql={result.sql}
                    chartType={currentChartType}
                    columns={result.columns}
                    results={result.results}
                    explanation={result.explanation}
                    insights={result.insights}
                  />
                  <ExportButton
                    results={result.results}
                    columns={result.columns}
                    sql={result.sql}
                  />
                </div>
              )}

              <div data-tour="chart" className="flex flex-col gap-3 min-h-[140px]">
                {showResultsBlock && (
                  <>
                    <div className="fade-in-4">
                      <ChartPanel
                        results={result.results}
                        columns={result.columns}
                        chartType={currentChartType}
                        onChartTypeChange={handleChartTypeChange}
                        anomalyFlags={result.anomalyFlags}
                      />
                    </div>
                    <InsightsPanel insights={result.insights} />

                    {/* Start Over button after results */}
                    <div className="flex justify-center pt-4 pb-2 fade-in-4">
                      <button
                        onClick={handleReset}
                        className="flex items-center gap-2 text-sm px-5 py-2.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                        style={{
                          background: 'var(--bg-tertiary)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border)'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="1,4 1,10 7,10" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Start Over with New Data
                      </button>
                    </div>
                  </>
                )}
                {!result && !loading && (
                  <div
                    className="rounded-xl flex flex-col items-center justify-center py-10 px-4 text-center border border-dashed"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-tertiary)' }}
                  >
                    <span className="text-sm">Charts and breakdowns appear here after you ask a question.</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
