import express from 'express';
import { getDb } from '../db/database.js';
import { calculateStatistics } from '../services/statsService.js';

const router = express.Router();

// GET /api/stats - Statistics dashboard metrics
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const stats = calculateStatistics(db);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
