import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  queryHistory: defineTable({
    sessionId: v.string(),
    fileId: v.string(),
    question: v.string(),
    sql: v.string(),
    rowCount: v.number(),
    executionTimeMs: v.number(),
    createdAt: v.number(),
  }).index("by_session", ["sessionId", "createdAt"]),

  snapshots: defineTable({
    shareId: v.string(),
    question: v.string(),
    sql: v.string(),
    chartType: v.string(),
    columns: v.array(v.string()),
    resultsJson: v.string(),
    explanation: v.optional(v.string()),
    insights: v.optional(v.array(v.string())),
    createdAt: v.number(),
  }).index("by_shareId", ["shareId"]),
});
