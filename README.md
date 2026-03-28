# QueryWise

> Query your company data in plain English. Get instant SQL + charts. No coding needed.

Built at **Cursor Hackathon 2025**

## What it does

Upload a CSV or Excel file. Ask "What were our top 5 products last quarter?".
QueryWise generates the SQL, runs it, and shows a beautiful chart in under a second.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Charts | Recharts |
| SQL Engine | DuckDB (in-process, no DB setup needed) |
| AI | NVIDIA NIM — meta/llama-3.1-70b-instruct |
| Real-time History | **Convex** (hackathon sponsor) |
| Frontend Deploy | **Vercel** (hackathon sponsor) |
| IDE | **Cursor** (hackathon title sponsor — entire project built with Cursor Composer) |
| Backend | Node.js + Express |

## Sponsor Tools Used

- **Cursor** — Entire codebase scaffolded and built using Cursor Composer AI
- **Convex** — Powers real-time query history sidebar with live sync across sessions
- **Vercel** — Zero-config frontend deployment with automatic preview URLs

## Why NVIDIA NIM?

- Free API credits, no credit card required
- OpenAI-compatible SDK — same code, different endpoint
- Llama 3.1 70B excels at text-to-SQL tasks

## Run locally

```bash
git clone https://github.com/yourteam/querywise

# Backend
cd server && npm install
# Add your NVIDIA_NIM_API_KEY to server/.env
npm run dev

# Frontend (new terminal)
cd client && npm install
# Run: npx convex dev (get your CONVEX_URL, add to client/.env)
npm run dev
```

Open http://localhost:5173

## Demo Queries

Try these with the built-in sample datasets:

**Sales Data:**
- "Show total revenue by product category"
- "What is the monthly revenue trend for 2024?"
- "Top 10 customers by total spend"

**HR Analytics:**
- "What is the average salary by department?"
- "How many employees were hired each year?"

**E-Commerce:**
- "What percentage of orders are Delivered vs Pending?"
- "Top 5 products by total quantity sold"
