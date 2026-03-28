import { useState, useEffect, useCallback } from 'react';
import { useFileUpload } from '../hooks/useFileUpload';
import { useQueryRunner } from '../hooks/useQueryRunner';
import { useMediaQuery } from '../hooks/useMediaQuery';
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
import OnboardingTour from '../components/OnboardingTour';
import ThemeToggle from '../components/ThemeToggle';
import InsightsPanel from '../components/InsightsPanel';
import ShareLinkButton from '../components/ShareLinkButton';

export default function Workspace() {
  const isMobile = useMediaQuery('(max-width: 1023px)');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState('single');
  const [conversationContext, setConversationContext] = useState(null);

  const { uploading, progress, error: uploadError, fileData, upload, uploadDual, reset } = useFileUpload();
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

  const handleFileAccepted = useCallback(async (file) => {
    await upload(file);
  }, [upload]);

  const handleDualAccepted = useCallback(async (f1, f2) => {
    await uploadDual(f1, f2);
  }, [uploadDual]);

  const handleReset = useCallback(() => {
    reset();
    setConversationContext(null);
  }, [reset]);

  const handleQuery = useCallback(async (question) => {
    if (!fileData?.fileId) return;
    const ctx = conversationContext?.previousSql
      ? {
          previousSql: conversationContext.previousSql,
          previousQuestion: conversationContext.previousQuestion || ''
        }
      : null;
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
  }, [fileData, execute, conversationContext]);

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

  const handleClearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const handleChartTypeChange = useCallback((type) => {
    setCurrentChartType(type);
  }, []);

  const displaySql = result?.sql ?? streamingSql;
  const showResultsBlock = result && !loading;
  const showStreamingResults = loading && (streamingSql || sqlStreaming);

  return (
    <div className="flex flex-col h-[100dvh] min-h-0" style={{ background: 'var(--bg-primary)' }}>
      <OnboardingTour fileData={fileData} />

      <nav className="flex items-center justify-between px-3 sm:px-5 gap-2" style={{
        height: '52px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0
      }}>
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--accent)' }}>
            <span className="text-white text-sm font-bold">Q</span>
          </div>
          <span className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>QueryWise</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <ThemeToggle />
          {fileData && (
            <button
              onClick={handleReset}
              className="text-xs px-2 sm:px-3 py-1.5 rounded-lg transition-all duration-200"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            >
              <span className="hidden sm:inline">← New file</span>
              <span className="sm:hidden">New</span>
            </button>
          )}
          <span className="text-[10px] sm:text-xs hidden sm:inline max-w-[100px] sm:max-w-none truncate" style={{ color: 'var(--text-tertiary)' }}>
            NVIDIA NIM
          </span>
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
                <h1 className="text-2xl sm:text-4xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                  Query your data in <span style={{ color: 'var(--accent)' }}>plain English</span>
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Upload one or two CSV/Excel files. With two files, AI infers JOIN keys. Ask follow-ups to refine results.
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
                  onClick={() => setUploadMode('dual')}
                  className="text-xs px-4 py-2 rounded-lg font-medium"
                  style={{
                    background: uploadMode === 'dual' ? 'var(--accent)' : 'var(--bg-tertiary)',
                    color: uploadMode === 'dual' ? '#fff' : 'var(--text-secondary)',
                    border: '1px solid var(--border)'
                  }}
                >
                  Two files (JOIN)
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
                    dual={uploadMode === 'dual'}
                    onFileAccepted={handleFileAccepted}
                    onDualAccepted={handleDualAccepted}
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
                filenameA={fileData.filenameA}
                filenameB={fileData.filenameB}
                schemaA={fileData.schemaA}
                schemaB={fileData.schemaB}
                rowCountA={fileData.rowCountA}
                rowCountB={fileData.rowCountB}
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
