import { ConvexHttpClient } from 'convex/browser';

const convexUrl = process.env.CONVEX_URL || process.env.VITE_CONVEX_URL || '';
const convex = convexUrl ? new ConvexHttpClient(convexUrl) : null;

let warnedMissing = false;

export function isConvexEnabled() {
  return Boolean(convex);
}

export async function convexMutation(name, args = {}) {
  if (!convex) {
    if (!warnedMissing) {
      warnedMissing = true;
      console.warn('[Convex] Disabled: set CONVEX_URL in server/.env to enable durable storage.');
    }
    return null;
  }
  return convex.mutation(name, args);
}

export async function convexQuery(name, args = {}) {
  if (!convex) return null;
  return convex.query(name, args);
}
