export const CHART_COLORS = ['#4F8EF7', '#34D399', '#F59E0B', '#F87171', '#A78BFA', '#38BDF8', '#FB923C', '#E879F9'];

export function selectChartType(columns, rows) {
  if (!columns || !rows || columns.length === 0 || rows.length === 0) return 'table';

  let numericCols = 0;
  let textCols = 0;
  let dateCols = 0;

  columns.forEach(col => {
    const datePattern = /date|month|year|week|time/i;
    // Check sample values from first few rows
    const sampleValues = rows.slice(0, 10).map(r => r[col]).filter(v => v != null && v !== '');
    
    if (sampleValues.length === 0) return;

    // Check if column name suggests a date
    if (datePattern.test(col)) {
      dateCols++;
      return;
    }

    // Check if values are numeric
    const numericCount = sampleValues.filter(v => !isNaN(Number(v)) && String(v).trim() !== '').length;
    
    if (numericCount >= sampleValues.length * 0.8) {
      // Check if the values look like dates (YYYY-MM-DD pattern)
      const dateRegex = /^\d{4}-\d{2}(-\d{2})?$/;
      const dateCount = sampleValues.filter(v => dateRegex.test(String(v))).length;
      if (dateCount >= sampleValues.length * 0.5) {
        dateCols++;
      } else {
        numericCols++;
      }
    } else {
      // Check for date-like string values
      const dateRegex = /^\d{4}-\d{2}(-\d{2})?$/;
      const dateCount = sampleValues.filter(v => dateRegex.test(String(v))).length;
      if (dateCount >= sampleValues.length * 0.5) {
        dateCols++;
      } else {
        textCols++;
      }
    }
  });

  if (dateCols >= 1 && numericCols >= 1) return 'line';
  if (textCols === 1 && numericCols === 1 && rows.length <= 8) return 'pie';
  if (textCols >= 1 && numericCols >= 1) return 'bar';
  if (numericCols >= 2) return 'scatter';
  return 'table';
}
