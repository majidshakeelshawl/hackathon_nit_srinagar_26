import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveQuery = mutation({
  args: {
    sessionId: v.string(),
    fileId: v.string(),
    question: v.string(),
    sql: v.string(),
    rowCount: v.number(),
    executionTimeMs: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("queryHistory", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const getHistory = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    // Avoid hard-depending on a specific index name to keep history resilient
    // across deployments where schema/index migration may lag.
    const rows = await ctx.db.query("queryHistory").collect();
    return rows
      .filter((r) => r.sessionId === args.sessionId)
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      .slice(0, 20);
  },
});

export const clearHistory = mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const items = await ctx.db.query("queryHistory").collect();
    for (const item of items) {
      if (item.sessionId === args.sessionId) {
        await ctx.db.delete(item._id);
      }
    }
  },
});
