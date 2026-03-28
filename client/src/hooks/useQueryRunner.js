import { useState, useCallback } from 'react';
import { runQueryStream, runRawSQL } from '../lib/api';
import { selectChartType } from '../lib/chartSelector';

export function useQueryRunner() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [streamingSql, setStreamingSql] = useState('');
  const [streamingExplanation, setStreamingExplanation] = useState('');
  const [sqlStreaming, setSqlStreaming] = useState(false);

  const execute = useCallback(async (fileId, question, conversationContext = null) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setStreamingSql('');
    setStreamingExplanation('');
    setSqlStreaming(true);

    let finalSql = '';
    let explanationAcc = '';
    let insightsBullets = [];
    let finalResult = null;

    try {
      await runQueryStream(
        fileId,
        question,
        {
          onSqlChunk: (chunk) => {
            setStreamingSql((prev) => prev + chunk);
          },
          onSql: (sql) => {
            finalSql = sql;
            setStreamingSql(sql);
            setSqlStreaming(false);
          },
          onResult: (data) => {
            const chartType = selectChartType(data.columns, data.results);
            finalResult = {
              sql: finalSql,
              results: data.results,
              columns: data.columns,
              rowCount: data.rowCount,
              executionTimeMs: data.executionTimeMs,
              chartType,
              question,
              explanation: '',
              anomalyFlags: data.anomalyFlags || [],
              insights: []
            };
            setResult(finalResult);
          },
          onExplanationChunk: (chunk) => {
            explanationAcc += chunk;
            setStreamingExplanation((prev) => prev + chunk);
          },
          onInsights: (bullets) => {
            insightsBullets = bullets || [];
            if (finalResult) {
              finalResult = { ...finalResult, insights: insightsBullets };
            }
            setResult((prev) =>
              prev ? { ...prev, insights: insightsBullets } : null
            );
          },
          onDone: () => {
            if (finalResult) {
              const done = {
                ...finalResult,
                explanation: explanationAcc.trim(),
                insights: insightsBullets.length ? insightsBullets : (finalResult.insights || [])
              };
              finalResult = done;
              setResult(done);
            }
            setStreamingExplanation('');
          },
          onError: (msg) => {
            setError(msg);
            setSqlStreaming(false);
          }
        },
        conversationContext
      );

      return finalResult;
    } catch (err) {
      const msg = err.message || 'Query failed';
      setError(msg);
      setSqlStreaming(false);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const executeRaw = useCallback(async (fileId, sql) => {
    setLoading(true);
    setError(null);

    try {
      const data = await runRawSQL(fileId, sql);
      const chartType = selectChartType(data.columns, data.results);
      setResult((prev) => ({
        ...prev,
        results: data.results,
        columns: data.columns,
        rowCount: data.rowCount,
        executionTimeMs: data.executionTimeMs,
        chartType,
        sql,
        anomalyFlags: data.anomalyFlags || [],
        insights: []
      }));
      return data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Query failed';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    loading,
    error,
    clearError,
    result,
    execute,
    executeRaw,
    setResult,
    streamingSql,
    streamingExplanation,
    sqlStreaming
  };
}
