import { Router } from 'express';
import { randomBytes } from 'crypto';
import { convexMutation, convexQuery } from '../services/convex.js';

const router = Router();

/** In-memory fallback cache. Convex `snapshots` table is the durable source when configured. */
const snapshots = new Map();

const MAX_ROWS = 500;

router.post('/', async (req, res) => {
  try {
    const {
      question,
      sql,
      chartType,
      columns,
      results,
      explanation,
      insights
    } = req.body;

    if (!question || !sql || !columns || !Array.isArray(results)) {
      return res.status(400).json({ error: 'question, sql, columns, and results are required' });
    }

    const trimmed = results.slice(0, MAX_ROWS);
    const id = randomBytes(5).toString('hex').slice(0, 10);

    const snapshot = {
      question,
      sql,
      chartType: chartType || 'bar',
      columns,
      results: trimmed,
      explanation: explanation || '',
      insights: Array.isArray(insights) ? insights : [],
      createdAt: Date.now()
    };
    snapshots.set(id, snapshot);

    try {
      await convexMutation('snapshots:createSnapshot', {
        shareId: id,
        question: snapshot.question,
        sql: snapshot.sql,
        chartType: snapshot.chartType,
        columns: snapshot.columns,
        resultsJson: JSON.stringify(snapshot.results),
        explanation: snapshot.explanation,
        insights: snapshot.insights
      });
    } catch (e) {
      console.warn('Convex snapshot save failed, using in-memory fallback:', e?.message || e);
    }

    res.json({ shareId: id });
  } catch (e) {
    console.error('Share create error:', e);
    res.status(500).json({ error: 'Failed to create share link' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const fromConvex = await convexQuery('snapshots:getSnapshot', { shareId: req.params.id });
    if (fromConvex) {
      return res.json({
        question: fromConvex.question,
        sql: fromConvex.sql,
        chartType: fromConvex.chartType || 'bar',
        columns: Array.isArray(fromConvex.columns) ? fromConvex.columns : [],
        results: fromConvex.resultsJson ? JSON.parse(fromConvex.resultsJson) : [],
        explanation: fromConvex.explanation || '',
        insights: Array.isArray(fromConvex.insights) ? fromConvex.insights : [],
        createdAt: fromConvex.createdAt || fromConvex._creationTime
      });
    }
  } catch (e) {
    console.warn('Convex snapshot read failed, trying in-memory fallback:', e?.message || e);
  }

  const snap = snapshots.get(req.params.id);
  if (!snap) return res.status(404).json({ error: 'Snapshot not found or expired' });
  return res.json(snap);
});

export default router;
