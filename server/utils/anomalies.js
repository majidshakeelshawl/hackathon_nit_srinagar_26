/**
 * Flag rows where any numeric column is a z-score outlier vs column distribution.
 */
export function flagAnomalyRows(rows, columns) {
  if (!rows?.length || !columns?.length) {
    return rows?.length ? new Array(rows.length).fill(false) : [];
  }

  const flags = new Array(rows.length).fill(false);
  const numericCols = [];

  for (const col of columns) {
    const nums = [];
    for (const row of rows) {
      const v = row[col];
      if (v == null || v === '') continue;
      const n = Number(v);
      if (Number.isFinite(n)) nums.push(n);
    }
    if (nums.length < 3) continue;
    const allNumeric = rows.every((row) => {
      const v = row[col];
      if (v == null || v === '') return true;
      return Number.isFinite(Number(v));
    });
    if (allNumeric) numericCols.push(col);
  }

  for (const col of numericCols) {
    const nums = rows.map((row) => {
      const v = row[col];
      if (v == null || v === '') return null;
      return Number(v);
    });
    const valid = nums.filter((n) => n != null && Number.isFinite(n));
    if (valid.length < 3) continue;
    const mean = valid.reduce((a, b) => a + b, 0) / valid.length;
    const variance = valid.reduce((s, n) => s + (n - mean) ** 2, 0) / valid.length;
    const std = Math.sqrt(variance);
    if (std < 1e-9) continue;

    rows.forEach((_, i) => {
      const n = nums[i];
      if (n == null || !Number.isFinite(n)) return;
      if (Math.abs((n - mean) / std) > 2.5) flags[i] = true;
    });
  }

  return flags;
}
