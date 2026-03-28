import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const createSnapshot = mutation({
  args: {
    shareId: v.string(),
    question: v.string(),
    sql: v.string(),
    chartType: v.string(),
    columns: v.array(v.string()),
    resultsJson: v.string(),
    explanation: v.optional(v.string()),
    insights: v.optional(v.array(v.string()))
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('snapshots', {
      ...args,
      createdAt: Date.now()
    });
    return { shareId: args.shareId };
  }
});

export const getSnapshot = query({
  args: { shareId: v.string() },
  handler: async (ctx, args) => {
    const hit = await ctx.db
      .query('snapshots')
      .withIndex('by_shareId', (q) => q.eq('shareId', args.shareId))
      .order('desc')
      .first();

    return hit || null;
  }
});
