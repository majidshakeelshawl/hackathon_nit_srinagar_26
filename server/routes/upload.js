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

router.post('/dual', upload.fields([
  { name: 'file1', maxCount: 1 },
  { name: 'file2', maxCount: 1 }
]), async (req, res) => {
  try {
    const f1 = req.files?.file1?.[0];
    const f2 = req.files?.file2?.[0];
    if (!f1 || !f2) {
      return res.status(400).json({ error: 'Two files (file1 and file2) are required' });
    }

    let csvPathA;
    let csvPathB;
    try {
      csvPathA = ensureCsvPath(f1.path, f1.originalname);
    } catch (e) {
      return res.status(400).json({ error: 'Failed to process file 1: ' + e.message });
    }
    try {
      csvPathB = ensureCsvPath(f2.path, f2.originalname);
    } catch (e) {
      return res.status(400).json({ error: 'Failed to process file 2: ' + e.message });
    }

    const schemaA = await inferSchema(csvPathA);
    const schemaB = await inferSchema(csvPathB);
    const rowCountA = await getRowCount(csvPathA);
    const rowCountB = await getRowCount(csvPathB);
    const fileId = uuidv4();

    const combinedSchema = [
      ...schemaA.map((c) => ({ ...c, name: `a.${c.name}`, source: 'a', baseName: c.name })),
      ...schemaB.map((c) => ({ ...c, name: `b.${c.name}`, source: 'b', baseName: c.name }))
    ];

    fileRegistry.set(fileId, {
      mode: 'dual',
      csvPathA,
      csvPathB,
      filenameA: f1.originalname,
      filenameB: f2.originalname,
      schemaA,
      schemaB,
      schema: combinedSchema,
      rowCount: rowCountA + rowCountB,
      filename: `${f1.originalname} + ${f2.originalname}`
    });

    res.json({
      fileId,
      mode: 'dual',
      filename: `${f1.originalname} + ${f2.originalname}`,
      filenameA: f1.originalname,
      filenameB: f2.originalname,
      schemaA,
      schemaB,
      schema: combinedSchema,
      rowCountA,
      rowCountB,
      rowCount: rowCountA + rowCountB
    });
  } catch (err) {
    console.error('Dual upload error:', err);
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
