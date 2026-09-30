import express from 'express';
import { getDb } from '../db/database.js';
import { getOrCreateTag } from './tags.js';

const router = express.Router();

// POST /api/problems/:problemId/solutions - Add solution to problem
router.post('/problems/:problemId/solutions', (req, res) => {
  try {
    const problemId = req.params.problemId;
    const { title, url, notes, tags = [] } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Solution title is required' });
    }

    const db = getDb();
    const problem = db.prepare('SELECT id FROM problems WHERE id = ?').get(problemId);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const solTx = db.transaction(() => {
      const info = db.prepare(`
        INSERT INTO solutions (problem_id, title, url, notes)
        VALUES (?, ?, ?, ?)
      `).run(problemId, title.trim(), url || null, notes || null);

      const solutionId = info.lastInsertRowid;

      for (const tagInput of tags) {
        let tagId = null;
        if (typeof tagInput === 'number') {
          tagId = tagInput;
        } else if (typeof tagInput === 'string' && tagInput.trim()) {
          tagId = getOrCreateTag(db, tagInput);
        }

        if (tagId) {
          db.prepare('INSERT OR IGNORE INTO solution_tags (solution_id, tag_id) VALUES (?, ?)').run(solutionId, tagId);
        }
      }

      return solutionId;
    });

    const solutionId = solTx();
    const created = db.prepare('SELECT * FROM solutions WHERE id = ?').get(solutionId);
    created.tags = db.prepare(`
      SELECT t.id, t.name FROM solution_tags st JOIN tags t ON t.id = st.tag_id WHERE st.solution_id = ?
    `).all(solutionId);

    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/solutions/:id - Update solution
router.put('/solutions/:id', (req, res) => {
  try {
    const solutionId = req.params.id;
    const { title, url, notes, tags = [] } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Solution title is required' });
    }

    const db = getDb();
    const existing = db.prepare('SELECT id FROM solutions WHERE id = ?').get(solutionId);
    if (!existing) {
      return res.status(404).json({ error: 'Solution not found' });
    }

    const updateTx = db.transaction(() => {
      db.prepare(`
        UPDATE solutions
        SET title = ?, url = ?, notes = ?
        WHERE id = ?
      `).run(title.trim(), url || null, notes || null, solutionId);

      db.prepare('DELETE FROM solution_tags WHERE solution_id = ?').run(solutionId);

      for (const tagInput of tags) {
        let tagId = null;
        if (typeof tagInput === 'number') {
          tagId = tagInput;
        } else if (typeof tagInput === 'string' && tagInput.trim()) {
          tagId = getOrCreateTag(db, tagInput);
        }

        if (tagId) {
          db.prepare('INSERT OR IGNORE INTO solution_tags (solution_id, tag_id) VALUES (?, ?)').run(solutionId, tagId);
        }
      }
    });

    updateTx();

    const updated = db.prepare('SELECT * FROM solutions WHERE id = ?').get(solutionId);
    updated.tags = db.prepare(`
      SELECT t.id, t.name FROM solution_tags st JOIN tags t ON t.id = st.tag_id WHERE st.solution_id = ?
    `).all(solutionId);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/solutions/:id - Delete solution
router.delete('/solutions/:id', (req, res) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM solutions WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
