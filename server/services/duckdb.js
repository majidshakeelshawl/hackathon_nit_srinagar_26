import duckdb from 'duckdb';

const db = new duckdb.Database(':memory:');

function normalizeType(t) {
  const upper = (t || '').toUpperCase();
  if (['INT', 'INTEGER', 'FLOAT', 'DOUBLE', 'DECIMAL', 'NUMERIC', 'BIGINT', 'HUGEINT', 'SMALLINT', 'TINYINT', 'UBIGINT', 'UINTEGER', 'USMALLINT', 'UTINYINT', 'INT8', 'INT16', 'INT32', 'INT64', 'INT128', 'FLOAT4', 'FLOAT8'].some(n => upper.includes(n))) return 'number';
  if (['DATE', 'TIME', 'TIMESTAMP'].some(n => upper.includes(n))) return 'date';
  if (upper.includes('BOOL')) return 'boolean';
  return 'string';
}

function safePath(filePath) {
  return filePath.replace(/\\/g, '/');
}

export function runQuery(fileInfo, sql) {
  return new Promise((resolve, reject) => {
    const conn = db.connect();
    const start = Date.now();

    const runSql = () => {
      conn.all(sql, (err2, rows) => {
        const executionTimeMs = Date.now() - start;
        if (err2) {
          conn.close();
          return reject(err2);
        }
        const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
        conn.close();
        resolve({ rows, columns, executionTimeMs });
      });
    };

    if (fileInfo?.mode === 'multi' && fileInfo.files) {
      let createViews = Promise.resolve();
      fileInfo.files.forEach((f) => {
        const fp = safePath(f.csvPath);
        createViews = createViews.then(() => new Promise((res, rej) => {
          conn.run(`CREATE OR REPLACE VIEW ${f.tablePrefix} AS SELECT * FROM read_csv_auto('${fp}', header=true)`, (err) => {
            if (err) rej(err);
            else res();
          });
        }));
      });
      createViews.then(runSql).catch((err) => {
        conn.close();
        reject(err);
      });
      return;
    }

    const csvPath = fileInfo.csvPath || fileInfo.path;
    if (!csvPath) {
      conn.close();
      return reject(new Error('No CSV path in file info'));
    }
    const fp = safePath(csvPath);
    conn.run(`CREATE OR REPLACE VIEW data AS SELECT * FROM read_csv_auto('${fp}', header=true)`, (err) => {
      if (err) {
        conn.close();
        return reject(err);
      }
      runSql();
    });
  });
}

export function inferSchema(filePath) {
  return new Promise((resolve, reject) => {
    const conn = db.connect();
    const fp = safePath(filePath);

    conn.all(`DESCRIBE SELECT * FROM read_csv_auto('${fp}', header=true)`, (err, descRows) => {
      if (err) {
        conn.close();
        return reject(err);
      }
      conn.all(`SELECT * FROM read_csv_auto('${fp}', header=true) LIMIT 1`, (err2, sampleRows) => {
        conn.close();
        if (err2) return reject(err2);

        const sample = sampleRows[0] || {};
        const schema = descRows.map(row => ({
          name: row.column_name,
          type: normalizeType(row.column_type),
          sample: sample[row.column_name] != null ? String(sample[row.column_name]) : ''
        }));
        resolve(schema);
      });
    });
  });
}

export function getRowCount(filePath) {
  return new Promise((resolve, reject) => {
    const conn = db.connect();
    const fp = safePath(filePath);

    conn.all(`SELECT COUNT(*) as count FROM read_csv_auto('${fp}', header=true)`, (err, rows) => {
      conn.close();
      if (err) return reject(err);
      resolve(Number(rows[0].count));
    });
  });
}
