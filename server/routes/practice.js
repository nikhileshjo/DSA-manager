import express from 'express';
import { getDb } from '../db/database.js';
import { generateDailyPractice } from '../services/practiceAllocator.js';
import { updateProblemScheduling } from '../services/srsScheduler.js';
import { getOrCreateTag } from './tags.js';
import { findDuplicateProblem } from './problems.js';

const router = express.Router();

// GET /api/practice/today - Daily practice queue
router.get('/today', (req, res) => {
  try {
    const db = getDb();
    const practiceSession = generateDailyPractice(db);
    res.json(practiceSession);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/practice/attempt - Record a practice attempt
router.post('/attempt', (req, res) => {
  try {
    const {
      problem_id,
      attempt_type = 'database', // 'review', 'fresh', 'external'
      result,
      notes,
      time_spent,
      // Optional external problem save payload
      addToDatabase = false,
      title,
      difficulty,
      source_type,
      source_url,
      tags = [],
      allowDuplicate = false,
    } = req.body;

    if (!['failed', 'needed_hints', 'struggled', 'comfortable', 'trivial'].includes(result)) {
      return res.status(400).json({ error: 'Valid attempt result is required' });
    }

    const db = getDb();

    const processTx = db.transaction(() => {
      let targetProblemId = problem_id;

      // Handle External Problem Optional Save
      if (attempt_type === 'external' && addToDatabase) {
        if (!title || !title.trim() || !difficulty) {
          throw new Error('Title and difficulty are required to add external problem to database');
        }

        if (!allowDuplicate) {
          const dupCheck = findDuplicateProblem(db, { title, source_type, source_url });
          if (dupCheck.isDuplicate) {
            const err = new Error(dupCheck.reason);
            err.isDuplicate = true;
            err.existingProblem = dupCheck.existingProblem;
            throw err;
          }
        }

        const info = db.prepare(`
          INSERT INTO problems (title, difficulty, source_type, source_url)
          VALUES (?, ?, ?, ?)
        `).run(title.trim(), difficulty, source_type || 'other', source_url || null);

        targetProblemId = info.lastInsertRowid;

        for (const tagInput of tags) {
          let tagId = null;
          if (typeof tagInput === 'number') {
            tagId = tagInput;
          } else if (typeof tagInput === 'string' && tagInput.trim()) {
            tagId = getOrCreateTag(db, tagInput);
          }

          if (tagId) {
            db.prepare('INSERT OR IGNORE INTO problem_tags (problem_id, tag_id) VALUES (?, ?)').run(targetProblemId, tagId);
          }
        }
      }

      const now = new Date();
      const attemptedAt = now.toISOString().split('T')[0] + ' ' + now.toTimeString().split(' ')[0];

      // Log attempt
      db.prepare(`
        INSERT INTO attempts (problem_id, attempt_type, attempted_at, result, notes, time_spent)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        targetProblemId || null,
        attempt_type,
        attemptedAt,
        result,
        notes || null,
        time_spent || null
      );

      // If tied to a database problem, update SRS scheduling
      let scheduling = null;
      if (targetProblemId) {
        scheduling = updateProblemScheduling(db, targetProblemId, result, now);
      }

      return {
        problemId: targetProblemId,
        scheduling,
        addedToDatabase: !!(attempt_type === 'external' && addToDatabase),
      };
    });

    const resultData = processTx();
    res.status(201).json({ success: true, ...resultData });
  } catch (err) {
    if (err.isDuplicate) {
      return res.status(409).json({
        error: err.message,
        isDuplicate: true,
        existingProblem: err.existingProblem,
      });
    }
    res.status(500).json({ error: err.message });
  }
});

export default router;
