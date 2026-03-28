#!/usr/bin/env node
/**
 * API smoke tests — run with the API server up:
 *   node scripts/smoke.mjs
 *   API_URL=http://localhost:3001 node scripts/smoke.mjs
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SAMPLE = join(ROOT, 'client/public/samples/sales_data.csv');
const SAMPLE2 = join(ROOT, 'client/public/samples/hr_data.csv');

const BASE = process.env.API_URL || 'http://localhost:3001';

let failed = 0;
function ok(name, cond, detail = '') {
  if (cond) console.log(`  ✓ ${name}${detail ? ' ' + detail : ''}`);
  else {
    console.log(`  ✗ ${name}`);
    failed++;
  }
}

async function main() {
  console.log(`QueryWise smoke test → ${BASE}\n`);

  const health = await fetch(`${BASE}/health`).then((r) => r.json()).catch(() => null);
  ok('GET /health', health?.status === 'ok', health?.status || '');

  const fd = new FormData();
  fd.append('file', new Blob([readFileSync(SAMPLE)]), 'sales_data.csv');
  const up = await fetch(`${BASE}/api/upload`, { method: 'POST', body: fd }).then((r) => r.json()).catch((e) => ({ error: e.message }));
  ok('POST /api/upload', !!up.fileId && !up.error, up.fileId?.slice(0, 8) + '…');

  const fd2 = new FormData();
  fd2.append('file1', new Blob([readFileSync(SAMPLE)]), 'sales_data.csv');
  fd2.append('file2', new Blob([readFileSync(SAMPLE2)]), 'hr_data.csv');
  const dualRes = await fetch(`${BASE}/api/upload/dual`, { method: 'POST', body: fd2 });
  const dualText = await dualRes.text();
  let dual;
  try {
    dual = JSON.parse(dualText);
  } catch {
    dual = null;
  }
  ok('POST /api/upload/dual', dualRes.ok && dual?.mode === 'dual', dual?.mode || dualText.slice(0, 50));
  if (!dualRes.ok && dualText.includes('Cannot POST')) {
    console.log('    → Restart the API server (nodemon) so /api/upload/dual is registered.');
  }

  const shareBody = {
    question: 'Smoke test',
    sql: 'SELECT 1 AS n',
    chartType: 'bar',
    columns: ['n'],
    results: [{ n: 1 }],
    explanation: '',
    insights: ['one', 'two', 'three']
  };
  const sh = await fetch(`${BASE}/api/share`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(shareBody)
  });
  const shText = await sh.text();
  let shareJson;
  try {
    shareJson = JSON.parse(shText);
  } catch {
    shareJson = null;
  }
  ok('POST /api/share', sh.ok && shareJson?.shareId, shareJson?.shareId || shText.slice(0, 50));
  if (!sh.ok && shText.includes('Cannot POST')) {
    console.log('    → Restart the API server so /api/share is registered.');
  }

  if (shareJson?.shareId) {
    const get = await fetch(`${BASE}/api/share/${shareJson.shareId}`).then((r) => r.json());
    ok('GET /api/share/:id', get.question === 'Smoke test');
  }

  if (up.fileId) {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 45000);
    let stream;
    let text = '';
    let streamAborted = false;
    try {
      stream = await fetch(`${BASE}/api/query/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
        body: JSON.stringify({ fileId: up.fileId, question: 'How many rows?' }),
        signal: ac.signal
      });
      text = await stream.text();
    } catch (e) {
      if (e.name === 'AbortError') {
        console.log('  ✗ POST /api/query/stream (timeout 45s)');
        failed++;
        console.log('    → Check NVIDIA_NIM_API_KEY and network to NIM');
        streamAborted = true;
      } else {
        throw e;
      }
    } finally {
      clearTimeout(t);
    }
    if (!streamAborted) {
      ok('POST /api/query/stream', stream.ok && text.includes('event: result'), stream.ok ? '' : String(stream.status));
      if (!stream.ok || !text.includes('event: result')) {
        console.log('    → Check NVIDIA_NIM_API_KEY in server/.env');
      }
    }
  }

  console.log('');
  if (failed) {
    console.log(`Finished with ${failed} failure(s).`);
    process.exit(1);
  }
  console.log('All smoke checks passed.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
