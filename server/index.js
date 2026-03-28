import dotenv from 'dotenv';
dotenv.config();

// Patch BigInt for JSON serialization
BigInt.prototype.toJSON = function() { return Number(this); };

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import uploadRouter from './routes/upload.js';
import queryRouter from './routes/query.js';
import shareRouter from './routes/share.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '15mb' }));

// Create uploads directory
fs.mkdirSync('./tmp/uploads', { recursive: true });

// Routes
app.use('/api/upload', uploadRouter);
app.use('/api/query', queryRouter);
app.use('/api/share', shareRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware for multer errors
app.use((err, req, res, next) => {
  if (err.message === 'Only CSV and Excel files are allowed') {
    return res.status(400).json({ error: err.message });
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large. Maximum size is 50MB.' });
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 QueryWise server running on http://localhost:${PORT}`);
  console.log(`📁 Upload directory: ./tmp/uploads`);
});
