import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const client = new OpenAI({
  apiKey: process.env.NVIDIA_NIM_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1'
});

const MODEL = 'meta/llama-3.1-70b-instruct';

function stripMarkdown(text) {
  return text
    .replace(/```sql\s*/gi, '')
    .replace(/```\s*/g, '')
    .replace(/`/g, '')
    .trim();
}

export async function nl2sql(question, schema) {
  const schemaDescription = schema
    .map(col => `${col.name} (${col.type}) — example: ${col.sample}`)
    .join('\n');

  const systemPrompt = `You are a DuckDB SQL expert. TABLE NAME IS ALWAYS: data
COLUMNS:
${schemaDescription}
RULES: Return ONLY raw SQL. No backticks. No explanation. No preamble.
Only SELECT. Use only columns listed above. Use DuckDB syntax.
For top N use ORDER BY + LIMIT. Use readable column aliases.`;

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: question }
    ],
    temperature: 0.1,
    max_tokens: 500
  });

  const raw = response.choices[0].message.content;
  return stripMarkdown(raw);
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
