import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { getDb } from './db/database.js';
import problemsRouter from './routes/problems.js';
import tagsRouter from './routes/tags.js';
import solutionsRouter from './routes/solutions.js';
import practiceRouter from './routes/practice.js';
import statsRouter from './routes/stats.js';
import settingsRouter from './routes/settings.js';
import backupRouter from './routes/backup.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize SQLite database
getDb();

// API Routes
app.use('/api/problems', problemsRouter);
app.use('/api/tags', tagsRouter);
app.use('/api', solutionsRouter);
app.use('/api/practice', practiceRouter);
app.use('/api/stats', statsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/backup', backupRouter);

// Serve static frontend in production
const distPath = path.resolve(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Spark Practice Tracker server running on port ${PORT}`);
  });
}

export default app;
