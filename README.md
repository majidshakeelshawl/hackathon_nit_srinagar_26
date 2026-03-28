# QueryWise

> Query your company data in plain English. Get instant SQL, charts, and insights. No coding needed.

## What it does

- **Single file** — Upload a CSV or Excel file, ask questions in natural language, get DuckDB SQL and charts.
- **Two files (JOIN)** — Upload two related tables; the model infers join keys and writes SQL over views `a` and `b` (DuckDB `read_csv_auto`).
- **Conversational analytics** — After a result, ask follow-ups like “Only Q4” or “Break that down by region”; the previous SQL and question are sent as context to NVIDIA NIM.
- **Streaming** — NL→SQL streams over SSE for a live “typing” SQL panel; explanations and insight bullets load after execution.
- **AI insights** — A second model pass turns result samples into three plain-English business bullet points.
- **Anomaly hints** — Numeric columns get simple z-score style flags; outlier rows show a warning in the table view.
- **Share links** — Save a snapshot (question, SQL, rows, chart type, insights) and open a read-only **`/share/{id}`** page. Snapshots are stored in the API process memory until restart; Convex schema includes a `snapshots` table for durable storage when you deploy Convex.
- **UX** — First-run onboarding tour (`localStorage: `qw_onboarded``), light/dark/system theme (`qw_theme`), mobile-friendly layout (history bottom sheet + icon rail).

## Tech stack

| Layer | Technology |
|--------|------------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Charts | Recharts + html2canvas (PNG export) |
| SQL engine | DuckDB (in-process) |
| AI | NVIDIA NIM — `meta/llama-3.1-70b-instruct` (OpenAI-compatible SDK) |
| Backend | Node.js + Express (upload, query stream, share API) |
| Optional | Convex (`convex/` — schema for history/snapshots; run `npx convex dev` when connected to a project) |

## Environment variables

From the **repository root**, copy the example env and edit keys:

```bash
cp .env.example server/.env
# optional: cp .env.example client/.env
```

| Variable | Where | Purpose |
|----------|--------|---------|
| `NVIDIA_NIM_API_KEY` | `server/.env` | Required for NL→SQL, explanations, insights |
| `PORT` | `server/.env` | API port (default `3001`) |
| `VITE_API_URL` | `client/.env` | API base URL (defaults to `http://localhost:3001` if unset) |
| `VITE_CONVEX_URL` | `client/.env` | Optional; set when using Convex client features |

## Run locally

```bash
# Terminal 1 — API
cd server && npm install
# Ensure server/.env exists with NVIDIA_NIM_API_KEY (see above)
npm run dev
# → http://localhost:3001  (health: /health)

# Terminal 2 — Frontend
cd client && npm install
npm run dev
# → http://localhost:5173
```

Open **http://localhost:5173**, then use **Try it** or go to **`/workspace`**.

### Optional: Convex

If you use Convex for durable history or snapshots:

```bash
cd client && npx convex dev
```

Add `VITE_CONVEX_URL` from the Convex dashboard to `client/.env`. The repo includes `convex/schema.js`; wire mutations to the UI when ready.

## Demo queries

With **one file** and the sample datasets:

- *“Show total revenue by product category”*
- *“What is the monthly revenue trend?”*
- *“Top 10 customers by total spend”*

With **two files**, try questions that relate both tables, e.g. *“Join customers to orders and show revenue by region.”*

After any result, try **follow-ups**:

- *“Now show only Q4”*
- *“Group that by region”*

## Testing

### Automated API smoke test

From the **repository root** (with the API already running on port 3001):

```bash
npm install   # once, if you have not installed root deps
npm run smoke
```

This checks `/health`, single upload, **dual** upload, **share** create/read, and **streaming query** (45s max). Use `API_URL=http://localhost:PORT npm run smoke` if your API uses another port.

If **dual** or **share** fail with `Cannot POST`, stop and restart the API (`Ctrl+C` in the server terminal, then `npm run dev` again) so the latest routes are loaded.

### Manual UI checklist

1. **Landing** — http://localhost:5173 loads; navigate to **Workspace**.
2. **Single file** — Load a sample dataset or upload one CSV; ask a question; confirm streaming SQL, chart, explanation, **insight bullets**, and **Share result** (opens copied `/share/...` link).
3. **Table + anomalies** — Switch chart type to **Table**; confirm **⚠** on outlier rows when present.
4. **Follow-up** — After a result, ask a refinement; confirm the conversation banner and new SQL.
5. **Two files** — Use **Two files (JOIN)**; upload two CSVs; ask a join question.
6. **Theme** — Cycle the theme control (system / light / dark).
7. **Onboarding** — `localStorage.removeItem('qw_onboarded')` in DevTools, refresh, confirm the 3-step tour.

## Project layout

```
client/          # Vite + React app
server/          # Express API (upload, /api/query/stream, /api/share)
convex/          # Convex schema (optional deployment)
```

## License / attribution

Built for hackathon demos. Powered by **NVIDIA NIM**, **DuckDB**, and **Cursor**.
