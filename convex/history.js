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
    const results = await ctx.db
      .query("queryHistory")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .take(20);
    return results;
  },
});

export const clearHistory = mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("queryHistory")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();
    for (const item of items) {
      await ctx.db.delete(item._id);
    }
  },
});
