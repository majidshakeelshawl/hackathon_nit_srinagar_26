import { useState } from 'react';
import { runQuery, runRawSQL } from '../lib/api';
import { selectChartType } from '../lib/chartSelector';

export function useQueryRunner() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const execute = async (fileId, question) => {
    setLoading(true);
    setError(null);

    try {
      const data = await runQuery(fileId, question);
      const chartType = selectChartType(data.columns, data.results);
      const fullResult = { ...data, chartType, question };
      setResult(fullResult);
      return fullResult;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Query failed';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const executeRaw = async (fileId, sql) => {
    setLoading(true);
    setError(null);

    try {
      const data = await runRawSQL(fileId, sql);
      const chartType = selectChartType(data.columns, data.results);
      setResult(prev => ({
        ...prev,
        results: data.results,
        columns: data.columns,
        rowCount: data.rowCount,
        executionTimeMs: data.executionTimeMs,
        chartType,
        sql
      }));
      return data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Query failed';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, result, execute, executeRaw, setResult };
}
