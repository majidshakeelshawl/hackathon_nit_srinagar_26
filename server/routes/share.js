import { Router } from 'express';
import { randomBytes } from 'crypto';

const router = Router();

/** In-memory snapshots (survives until server restart). Use Convex `snapshots` table for durable storage. */
const snapshots = new Map();

const MAX_ROWS = 500;

router.post('/', (req, res) => {
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

    snapshots.set(id, {
      question,
      sql,
      chartType: chartType || 'bar',
      columns,
      results: trimmed,
      explanation: explanation || '',
      insights: Array.isArray(insights) ? insights : [],
      createdAt: Date.now()
    });

    res.json({ shareId: id });
  } catch (e) {
    console.error('Share create error:', e);
    res.status(500).json({ error: 'Failed to create share link' });
  }
});

router.get('/:id', (req, res) => {
  const snap = snapshots.get(req.params.id);
  if (!snap) {
    return res.status(404).json({ error: 'Snapshot not found or expired' });
  }
  res.json(snap);
});

export default router;
