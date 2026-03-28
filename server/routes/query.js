import { Router } from 'express';
import { fileRegistry } from './upload.js';
import {
  nl2sql,
  explainSQL,
  streamNl2sql,
  streamExplainSQL,
  stripMarkdown,
  generateInsights
} from '../services/nim.js';
import { runQuery } from '../services/duckdb.js';
import { flagAnomalyRows } from '../utils/anomalies.js';
import { convexMutation } from '../services/convex.js';

const router = Router();

function sseWrite(res, event, data) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

function queryContext(body) {
  const { previousSql, previousQuestion } = body;
  if (!previousSql) return {};
  return { previousSql, previousQuestion: previousQuestion || '' };
}

function querySessionId(body, fileId) {
  if (body?.sessionId && typeof body.sessionId === 'string') return body.sessionId;
  return `file:${fileId}`;
}

// Natural language query
router.post('/', async (req, res) => {
  try {
    const { fileId, question } = req.body;

    if (!fileId || !question) {
      return res.status(400).json({ error: 'fileId and question are required' });
    }

    const fileInfo = fileRegistry.get(fileId);
    if (!fileInfo) {
      return res.status(404).json({ error: 'File not found. Please upload again.' });
    }

    const ctx = queryContext(req.body);
    const sql = await nl2sql(question, fileInfo, ctx);
    if (!sql) {
      return res.status(422).json({ error: 'Could not generate SQL for your question. Try rephrasing it.' });
    }

    const { rows, columns, executionTimeMs } = await runQuery(fileInfo, sql);
    const anomalyFlags = flagAnomalyRows(rows, columns);

    let explanation = '';
    try {
      explanation = await explainSQL(sql);
    } catch {
      // non-critical
    }

    let insights = [];
    try {
      insights = await generateInsights(sql, columns, rows);
    } catch {
      // non-critical
    }

    try {
      await convexMutation('history:saveQuery', {
        sessionId: querySessionId(req.body, fileId),
        fileId,
        question,
        sql,
        rowCount: rows.length,
        executionTimeMs
      });
    } catch (e) {
      console.warn('Convex history save failed:', e?.message || e);
    }

    res.json({
      sql,
      results: rows,
      columns,
      rowCount: rows.length,
      executionTimeMs,
      explanation,
      anomalyFlags,
      insights
    });
  } catch (err) {
    console.error('Query error:', err);
    const msg = err.message || String(err);
    if (msg.toLowerCase().includes('column')) {
      return res.status(500).json({ error: 'Column not found — try rephrasing your question' });
    }
    if (msg.toLowerCase().includes('syntax')) {
      return res.status(500).json({ error: 'SQL syntax issue — try rephrasing more specifically' });
    }
    res.status(500).json({ error: `Query failed: ${msg}` });
  }
});

// SSE: stream SQL, results, explanation, insights
router.post('/stream', async (req, res) => {
  const { fileId, question } = req.body;

  if (!fileId || !question) {
    return res.status(400).json({ error: 'fileId and question are required' });
  }

  const fileInfo = fileRegistry.get(fileId);
  if (!fileInfo) {
    return res.status(404).json({ error: 'File not found. Please upload again.' });
  }

  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  if (typeof res.flushHeaders === 'function') res.flushHeaders();

  const sendError = (message) => {
    try {
      sseWrite(res, 'error', { message });
    } catch { /* noop */ }
    try {
      res.end();
    } catch { /* noop */ }
  };

  const ctx = queryContext(req.body);

  try {
    sseWrite(res, 'start', {});

    const stream = await streamNl2sql(question, fileInfo, ctx);
    let rawSql = '';
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content ?? '';
      if (content) {
        rawSql += content;
        sseWrite(res, 'sql_chunk', { chunk: content });
      }
    }

    const sql = stripMarkdown(rawSql);
    if (!sql) {
      sendError('Could not generate SQL for your question. Try rephrasing it.');
      return;
    }

    sseWrite(res, 'sql', { sql });

    let rows;
    let columns;
    let executionTimeMs;
    try {
      const out = await runQuery(fileInfo, sql);
      rows = out.rows;
      columns = out.columns;
      executionTimeMs = out.executionTimeMs;
    } catch (err) {
      console.error('Query execution error:', err);
      const msg = err.message || String(err);
      if (msg.toLowerCase().includes('column')) {
        sendError('Column not found — try rephrasing your question');
        return;
      }
      if (msg.toLowerCase().includes('syntax')) {
        sendError('SQL syntax issue — try rephrasing more specifically');
        return;
      }
      sendError(`Query failed: ${msg}`);
      return;
    }

    const anomalyFlags = flagAnomalyRows(rows, columns);

    sseWrite(res, 'result', {
      results: rows,
      columns,
      rowCount: rows.length,
      executionTimeMs,
      anomalyFlags
    });

    try {
      const exStream = await streamExplainSQL(sql);
      for await (const chunk of exStream) {
        const content = chunk.choices[0]?.delta?.content ?? '';
        if (content) {
          sseWrite(res, 'explanation_chunk', { chunk: content });
        }
      }
    } catch {
      // optional
    }

    try {
      const insights = await generateInsights(sql, columns, rows);
      sseWrite(res, 'insights', { bullets: insights });
    } catch {
      sseWrite(res, 'insights', { bullets: [] });
    }

    try {
      await convexMutation('history:saveQuery', {
        sessionId: querySessionId(req.body, fileId),
        fileId,
        question,
        sql,
        rowCount: rows.length,
        executionTimeMs
      });
    } catch (e) {
      console.warn('Convex history save failed:', e?.message || e);
    }

    sseWrite(res, 'done', {});
    res.end();
  } catch (err) {
    console.error('Stream query error:', err);
    sendError(err.message || String(err));
  }
});

// Raw SQL query
router.post('/raw', async (req, res) => {
  try {
    const { fileId, sql } = req.body;

    if (!fileId || !sql) {
      return res.status(400).json({ error: 'fileId and sql are required' });
    }

    const fileInfo = fileRegistry.get(fileId);
    if (!fileInfo) {
      return res.status(404).json({ error: 'File not found. Please upload again.' });
    }

    const { rows, columns, executionTimeMs } = await runQuery(fileInfo, sql);
    const anomalyFlags = flagAnomalyRows(rows, columns);

    res.json({
      results: rows,
      columns,
      rowCount: rows.length,
      executionTimeMs,
      anomalyFlags
    });
  } catch (err) {
    console.error('Raw query error:', err);
    res.status(500).json({ error: `Query failed: ${err.message}` });
  }
});

export default router;
