import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const client = new OpenAI({
  apiKey: process.env.NVIDIA_NIM_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1'
});

const MODEL = 'meta/llama-3.1-70b-instruct';

export function stripMarkdown(text) {
  return text
    .replace(/```sql\s*/gi, '')
    .replace(/```\s*/g, '')
    .replace(/`/g, '')
    .trim();
}

function describeColumns(schema, tablePrefix = '') {
  return schema
    .map((col) => {
      const name = col.baseName || col.name;
      const qualified = tablePrefix ? `${tablePrefix}.${name}` : name;
      return `${qualified} (${col.type}) — example: ${col.sample ?? ''}`;
    })
    .join('\n');
}

function followUpBlock(context) {
  if (!context?.previousSql) return '';
  return `
The user is refining a previous answer. Use the same table(s) and column names unless they ask to change scope.

PREVIOUS QUESTION: ${context.previousQuestion || '(none)'}
PREVIOUS SQL:
${context.previousSql}

Interpret the new request as a modification or follow-up to that query (e.g. filter to Q4, group by region, limit results). Return a new SELECT that answers the new request.
`;
}

export function buildNl2SqlSystemPrompt(fileInfo, context = {}) {
  const fu = followUpBlock(context);

  if (fileInfo.mode === 'dual') {
    const aCols = describeColumns(fileInfo.schemaA, 'a');
    const bCols = describeColumns(fileInfo.schemaB, 'b');
    return `You are a DuckDB SQL expert. Two datasets are available as views:
VIEW a — from file "${fileInfo.filenameA || 'file1'}"
VIEW b — from file "${fileInfo.filenameB || 'file2'}"

TABLE a columns:
${aCols}

TABLE b columns:
${bCols}

JOIN RULES: Infer join keys from matching column names (e.g. customer_id, order_id, region) or semantic keys. Use explicit INNER JOIN a ... ON ... b ... when combining both tables. If the question only needs one table, query only that view (a or b).

${fu}
RULES: Return ONLY raw SQL. No backticks. No explanation. No preamble.
Only SELECT. Use DuckDB syntax. Qualify columns with a. or b. when both tables are used.
For top N use ORDER BY + LIMIT. Use readable column aliases.`;
  }

  const schemaDescription = describeColumns(fileInfo.schema);
  return `You are a DuckDB SQL expert. TABLE NAME IS ALWAYS: data
COLUMNS:
${schemaDescription}

${fu}
RULES: Return ONLY raw SQL. No backticks. No explanation. No preamble.
Only SELECT. Use only columns listed above. Use DuckDB syntax.
For top N use ORDER BY + LIMIT. Use readable column aliases.`;
}

export async function nl2sql(question, fileInfo, context = {}) {
  const systemPrompt = buildNl2SqlSystemPrompt(fileInfo, context);

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: question }
    ],
    temperature: 0.1,
    max_tokens: 800
  });

  const raw = response.choices[0].message.content;
  return stripMarkdown(raw);
}

export async function streamNl2sql(question, fileInfo, context = {}) {
  const systemPrompt = buildNl2SqlSystemPrompt(fileInfo, context);

  return client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: question }
    ],
    temperature: 0.1,
    max_tokens: 800,
    stream: true
  });
}

export async function streamExplainSQL(sql) {
  return client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: 'Explain SQL in exactly one sentence starting with "This query". Plain English. No jargon.' },
      { role: 'user', content: sql }
    ],
    temperature: 0.3,
    max_tokens: 100,
    stream: true
  });
}

export async function explainSQL(sql) {
  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'Explain SQL in exactly one sentence starting with "This query". Plain English. No jargon.' },
        { role: 'user', content: sql }
      ],
      temperature: 0.3,
      max_tokens: 100
    });
    return response.choices[0].message.content.trim();
  } catch {
    return '';
  }
}

export async function generateInsights(sql, columns, rows) {
  const sample = rows.slice(0, 60);
  const payload = JSON.stringify({ columns, rows: sample });
  const user = `A query was run in DuckDB.

SQL:
${sql}

Sample of result rows (JSON, truncated):
${payload}

Respond with exactly 3 bullet points of concise business insights in plain English. Start each line with "- ". No other text before or after.`;

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: 'You are a senior business analyst. Highlight patterns, comparisons, or notable values. Be specific. No SQL jargon.'
      },
      { role: 'user', content: user }
    ],
    temperature: 0.4,
    max_tokens: 400
  });

  const text = response.choices[0].message.content || '';
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('-'))
    .map((l) => l.replace(/^-\s*/, '').trim())
    .filter(Boolean)
    .slice(0, 3);
}
