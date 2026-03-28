import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import { upload } from '../middleware/upload.js';
import { inferSchema, getRowCount } from '../services/duckdb.js';

const router = Router();

// In-memory file registry
export const fileRegistry = new Map();

function ensureCsvPath(diskPath, originalName) {
  let csvPath = diskPath;
  const ext = path.extname(originalName).toLowerCase();
  if (ext === '.xlsx' || ext === '.xls') {
    const workbook = XLSX.readFile(csvPath);
    const sheetName = workbook.SheetNames[0];
    const csvData = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
    const newPath = csvPath.replace(/\.(xlsx|xls)$/i, '.csv');
    fs.writeFileSync(newPath, csvData);
    fs.unlinkSync(csvPath);
    csvPath = newPath;
  }
  return csvPath;
}

router.post('/multi', upload.array('files', 4), async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length < 2) {
      return res.status(400).json({ error: 'At least two files are required for JOIN mode' });
    }

    const processedFiles = [];
    let totalRows = 0;
    const combinedSchema = [];

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      let csvPath;
      try {
        csvPath = ensureCsvPath(f.path, f.originalname);
      } catch (e) {
        return res.status(400).json({ error: `Failed to process file ${i + 1}: ${e.message}` });
      }

      const schema = await inferSchema(csvPath);
      const rowCount = await getRowCount(csvPath);
      const tablePrefix = `table${i + 1}`;

      processedFiles.push({
        filename: f.originalname,
        csvPath,
        schema,
        rowCount,
        tablePrefix
      });

      totalRows += rowCount;
      schema.forEach(c => {
        combinedSchema.push({
          ...c,
          name: `${tablePrefix}.${c.name}`,
          source: tablePrefix,
          baseName: c.name
        });
      });
    }

    const fileId = uuidv4();
    const joinedNames = processedFiles.map(f => f.filename).join(' + ');

    fileRegistry.set(fileId, {
      mode: 'multi',
      files: processedFiles,
      schema: combinedSchema,
      rowCount: totalRows,
      filename: joinedNames
    });

    res.json({
      fileId,
      mode: 'multi',
      filename: joinedNames,
      files: processedFiles.map(f => ({
        filename: f.filename,
        schema: f.schema,
        rowCount: f.rowCount
      })),
      schema: combinedSchema,
      rowCount: totalRows
    });
  } catch (err) {
    console.error('Multi upload error:', err);
    res.status(500).json({ error: 'Failed to process files: ' + err.message });
  }
});

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const originalName = req.file.originalname;
    let csvPath;
    try {
      csvPath = ensureCsvPath(req.file.path, originalName);
    } catch (convErr) {
      return res.status(400).json({ error: 'Failed to convert Excel file: ' + convErr.message });
    }

    const schema = await inferSchema(csvPath);
    const rowCount = await getRowCount(csvPath);
    const fileId = uuidv4();
    const fileSizeMB = (fs.statSync(csvPath).size / (1024 * 1024)).toFixed(2);

    fileRegistry.set(fileId, {
      mode: 'single',
      csvPath,
      originalName,
      filename: originalName,
      schema,
      rowCount
    });

    res.json({
      fileId,
      mode: 'single',
      filename: originalName,
      schema,
      rowCount,
      fileSizeMB
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to process file: ' + err.message });
  }
});

export default router;
