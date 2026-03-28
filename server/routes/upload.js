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

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let csvPath = req.file.path;
    const originalName = req.file.originalname;
    const ext = path.extname(originalName).toLowerCase();

    // Convert Excel to CSV if needed
    if (ext === '.xlsx' || ext === '.xls') {
      try {
        const workbook = XLSX.readFile(csvPath);
        const sheetName = workbook.SheetNames[0];
        const csvData = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
        const newPath = csvPath.replace(/\.(xlsx|xls)$/i, '.csv');
        fs.writeFileSync(newPath, csvData);
        // Remove original Excel file
        fs.unlinkSync(csvPath);
        csvPath = newPath;
      } catch (convErr) {
        return res.status(400).json({ error: 'Failed to convert Excel file: ' + convErr.message });
      }
    }

    const schema = await inferSchema(csvPath);
    const rowCount = await getRowCount(csvPath);
    const fileId = uuidv4();
    const fileSizeMB = (fs.statSync(csvPath).size / (1024 * 1024)).toFixed(2);

    fileRegistry.set(fileId, {
      csvPath,
      originalName,
      schema,
      rowCount
    });

    res.json({
      fileId,
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
