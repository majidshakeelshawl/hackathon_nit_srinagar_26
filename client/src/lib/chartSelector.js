export const CHART_COLORS = ['#4F8EF7', '#34D399', '#F59E0B', '#F87171', '#A78BFA', '#38BDF8', '#FB923C', '#E879F9'];

/**
 * Parse Excel/CSV string numbers: commas, currency, %, accounting parentheses.
 */
export function parseFlexibleNumber(v) {
  if (v == null || v === '') return null;
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'bigint') return Number(v);
  const raw = String(v).trim();
  if (raw === '' || raw === '-') return null;
  const negParen = /^\(.*\)$/.test(raw);
  let s = raw.replace(/[$€£¥₹₽,\s\u00A0]/g, '').replace(/%$/, '');
  if (negParen) s = s.replace(/^\(|\)$/g, '');
  if (s === '') return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return negParen ? -Math.abs(n) : n;
}

function columnNumericRatio(rows, col, maxRows = 80) {
  const sample = rows.slice(0, Math.min(maxRows, rows.length));
  const vals = sample.map((r) => r[col]).filter((v) => v != null && v !== '');
  if (vals.length === 0) return 0;
  const ok = vals.filter((v) => parseFlexibleNumber(v) !== null).length;
  return ok / vals.length;
}

/**
 * Text vs numeric columns + rows with numeric fields coerced for Recharts.
 * Excel uploads often yield string numbers — use parseFlexibleNumber.
 */
export function inferColumnRoles(columns, rows) {
  if (!columns?.length || !rows?.length) {
    return { textCols: [], numericCols: [], processedData: [] };
  }

  const text = [];
  const numeric = [];

  for (const col of columns) {
    const ratio = columnNumericRatio(rows, col);
    if (ratio >= 0.72) {
      numeric.push(col);
    } else {
      text.push(col);
    }
  }

  // Looser pass — Excel often has inconsistent formatting in the first rows
  if (numeric.length === 0) {
    for (const col of columns) {
      if (columnNumericRatio(rows, col, 150) >= 0.42) {
        if (!numeric.includes(col)) numeric.push(col);
      }
    }
    for (const n of numeric) {
      const i = text.indexOf(n);
      if (i !== -1) text.splice(i, 1);
    }
  }

  // Last column often totals (GROUP BY … SUM)
  if (numeric.length === 0 && columns.length >= 1) {
    const last = columns[columns.length - 1];
    const sample = rows.slice(0, Math.min(100, rows.length));
    const vals = sample.map((r) => r[last]).filter((v) => v != null && v !== '');
    if (vals.some((v) => parseFlexibleNumber(v) !== null)) {
      numeric.push(last);
      const ti = text.indexOf(last);
      if (ti !== -1) text.splice(ti, 1);
    }
  }

  const processed = rows.map((row) => {
    const newRow = { ...row };
    for (const col of numeric) {
      const p = parseFlexibleNumber(row[col]);
      newRow[col] = p != null ? p : 0;
    }
    return newRow;
  });

  return { textCols: text, numericCols: numeric, processedData: processed };
}

/** Category / X axis: prefer a text column; else first column (stringified in chart). */
export function pickXAxisColumn(textCols, columns) {
  if (textCols.length > 0) return textCols[0];
  return columns[0];
}

export function selectChartType(columns, rows) {
  if (!columns?.length || !rows?.length) return 'table';

  const { textCols, numericCols } = inferColumnRoles(columns, rows);
  const nNum = numericCols.length;
  const nText = textCols.length;

  const datePattern = /date|month|year|week|time|day/i;
  const hasDateNamedCol = columns.some((c) => datePattern.test(c));

  if (hasDateNamedCol && nNum >= 1) return 'line';
  if (nText === 1 && nNum === 1 && rows.length <= 8) return 'pie';
  if (nText >= 1 && nNum >= 1) return 'bar';
  if (nNum >= 2) return 'scatter';
  return 'table';
}
