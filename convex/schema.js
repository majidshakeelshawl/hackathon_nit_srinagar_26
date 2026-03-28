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
});
