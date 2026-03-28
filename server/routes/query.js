import { Router } from 'express';
import { fileRegistry } from './upload.js';
import { nl2sql, explainSQL } from '../services/nim.js';
import { runQuery } from '../services/duckdb.js';

const router = Router();

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

    // Generate SQL from natural language
    const sql = await nl2sql(question, fileInfo.schema);
    if (!sql) {
      return res.status(422).json({ error: 'Could not generate SQL for your question. Try rephrasing it.' });
    }

    // Execute the query
    const { rows, columns, executionTimeMs } = await runQuery(fileInfo.csvPath, sql);

    // Get explanation (non-critical)
    let explanation = '';
    try {
      explanation = await explainSQL(sql);
    } catch {
      // Non-critical — continue without explanation
    }

    res.json({
      sql,
      results: rows,
      columns,
      rowCount: rows.length,
      executionTimeMs,
      explanation
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

    const { rows, columns, executionTimeMs } = await runQuery(fileInfo.csvPath, sql);

    res.json({
      results: rows,
      columns,
      rowCount: rows.length,
      executionTimeMs
    });
  } catch (err) {
    console.error('Raw query error:', err);
    res.status(500).json({ error: `Query failed: ${err.message}` });
  }
});

export default router;
