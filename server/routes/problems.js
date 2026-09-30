import express from 'express';
import { getDb } from '../db/database.js';
import { getOrCreateTag } from './tags.js';
import { updateProblemScheduling } from '../services/srsScheduler.js';

const router = express.Router();

/**
 * Checks if a problem is a duplicate based on source_url, book details, or title.
 */
export function findDuplicateProblem(db, { title, source_type, source_url, book_name, book_page, book_problem_number }, excludeId = null) {
  // 1. Check duplicate URL (for online sources)
  if (source_url && source_url.trim()) {
    const cleanUrl = source_url.trim().replace(/\/+$/, '').toLowerCase();
    const existingByUrl = db.prepare(`
      SELECT * FROM problems 
      WHERE LOWER(REPLACE(source_url, '/', '')) = REPLACE(?, '/', '')
      ${excludeId ? 'AND id != ?' : ''}
    `).get(cleanUrl, ...(excludeId ? [excludeId] : []));

    if (existingByUrl) {
      return {
        isDuplicate: true,
        reason: `A problem with the same source URL already exists ("${existingByUrl.title}")`,
        existingProblem: existingByUrl,
      };
    }
  }

  // 2. Check duplicate Book entry (same book_name + book_page + book_problem_number)
  if (source_type === 'book' && book_name && book_name.trim() && book_page && book_problem_number) {
    const existingByBook = db.prepare(`
      SELECT * FROM problems 
      WHERE source_type = 'book'
        AND LOWER(book_name) = LOWER(?)
        AND LOWER(book_page) = LOWER(?)
        AND LOWER(book_problem_number) = LOWER(?)
      ${excludeId ? 'AND id != ?' : ''}
    `).get(
      book_name.trim(),
      String(book_page).trim(),
      String(book_problem_number).trim(),
      ...(excludeId ? [excludeId] : [])
    );

    if (existingByBook) {
      return {
        isDuplicate: true,
        reason: `A book problem from "${existingByBook.book_name}" (Page ${existingByBook.book_page}, #${existingByBook.book_problem_number}) already exists ("${existingByBook.title}")`,
        existingProblem: existingByBook,
      };
    }
  }

  // 3. Check duplicate Title (case-insensitive exact title match)
  if (title && title.trim()) {
    const existingByTitle = db.prepare(`
      SELECT * FROM problems 
      WHERE LOWER(title) = LOWER(?)
      ${excludeId ? 'AND id != ?' : ''}
    `).get(title.trim(), ...(excludeId ? [excludeId] : []));

    if (existingByTitle) {
      return {
        isDuplicate: true,
        reason: `A problem with the exact title "${existingByTitle.title}" already exists in your database`,
        existingProblem: existingByTitle,
      };
    }
  }

  return { isDuplicate: false };
}

// GET /api/problems - Search and filter problems
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const { search, difficulty, sourceType, tagId, dueStatus, attemptedStatus } = req.query;

    let query = `
      SELECT DISTINCT p.*, 
        s.last_review, s.interval, s.next_review,
        (SELECT COUNT(*) FROM attempts a WHERE a.problem_id = p.id) as attempt_count,
        (SELECT result FROM attempts a WHERE a.problem_id = p.id ORDER BY a.attempted_at DESC, a.id DESC LIMIT 1) as last_result
      FROM problems p
      LEFT JOIN scheduling s ON s.problem_id = p.id
      LEFT JOIN problem_tags pt ON pt.problem_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (search && search.trim()) {
      query += ` AND (p.title LIKE ? OR p.book_name LIKE ?)`;
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    if (difficulty) {
      query += ` AND p.difficulty = ?`;
      params.push(difficulty);
    }

    if (sourceType) {
      query += ` AND p.source_type = ?`;
      params.push(sourceType);
    }

    if (tagId) {
      query += ` AND pt.tag_id = ?`;
      params.push(tagId);
    }

    const todayStr = new Date().toISOString().split('T')[0];

    if (dueStatus === 'due') {
      query += ` AND s.next_review <= ?`;
      params.push(todayStr);
    } else if (dueStatus === 'upcoming') {
      query += ` AND s.next_review > ?`;
      params.push(todayStr);
    }

    if (attemptedStatus === 'attempted') {
      query += ` AND p.id IN (SELECT DISTINCT problem_id FROM attempts WHERE problem_id IS NOT NULL)`;
    } else if (attemptedStatus === 'unattempted') {
      query += ` AND p.id NOT IN (SELECT DISTINCT problem_id FROM attempts WHERE problem_id IS NOT NULL)`;
    }

    query += ` ORDER BY p.id DESC`;

    const problems = db.prepare(query).all(...params);

    // Attach tags and solutions count for each problem
    const getTagsStmt = db.prepare(`
      SELECT t.id, t.name 
      FROM problem_tags pt 
      JOIN tags t ON t.id = pt.tag_id 
      WHERE pt.problem_id = ?
    `);

    const getSolutionsCountStmt = db.prepare(`
      SELECT COUNT(*) as count FROM solutions WHERE problem_id = ?
    `);

    for (const prob of problems) {
      prob.tags = getTagsStmt.all(prob.id);
      prob.solutionsCount = getSolutionsCountStmt.get(prob.id).count;
    }

    res.json(problems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/problems/:id - Full problem details
router.get('/:id', (req, res) => {
  try {
    const db = getDb();
    const problem = db.prepare(`
      SELECT p.*, s.last_review, s.interval, s.next_review
      FROM problems p
      LEFT JOIN scheduling s ON s.problem_id = p.id
      WHERE p.id = ?
    `).get(req.params.id);

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // Problem tags
    problem.tags = db.prepare(`
      SELECT t.id, t.name 
      FROM problem_tags pt 
      JOIN tags t ON t.id = pt.tag_id 
      WHERE pt.problem_id = ?
    `).all(problem.id);

    // Solutions with solution tags
    const solutions = db.prepare(`
      SELECT * FROM solutions WHERE problem_id = ? ORDER BY id ASC
    `).all(problem.id);

    const getSolutionTagsStmt = db.prepare(`
      SELECT t.id, t.name 
      FROM solution_tags st 
      JOIN tags t ON t.id = st.tag_id 
      WHERE st.solution_id = ?
    `);

    for (const sol of solutions) {
      sol.tags = getSolutionTagsStmt.all(sol.id);
    }
    problem.solutions = solutions;

    // Problem comments
    problem.comments = db.prepare(`
      SELECT * FROM problem_comments WHERE problem_id = ? ORDER BY created_at DESC, id DESC
    `).all(problem.id);

    // Attempt history
    problem.attempts = db.prepare(`
      SELECT * FROM attempts WHERE problem_id = ? ORDER BY attempted_at DESC, id DESC
    `).all(problem.id);

    res.json(problem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/problems - Create problem
router.post('/', (req, res) => {
  try {
    const {
      title,
      difficulty,
      source_type,
      source_url,
      book_name,
      book_page,
      book_problem_number,
      notes,
      tags = [],
      allowDuplicate = false,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      return res.status(400).json({ error: 'Valid difficulty (easy, medium, hard) is required' });
    }

    const db = getDb();

    // Perform duplicate check unless force/allowDuplicate is passed
    if (!allowDuplicate) {
      const dupCheck = findDuplicateProblem(db, {
        title,
        source_type,
        source_url,
        book_name,
        book_page,
        book_problem_number,
      });

      if (dupCheck.isDuplicate) {
        return res.status(409).json({
          error: dupCheck.reason,
          isDuplicate: true,
          existingProblem: dupCheck.existingProblem,
        });
      }
    }

    const createTx = db.transaction(() => {
      const info = db.prepare(`
        INSERT INTO problems (title, difficulty, source_type, source_url, book_name, book_page, book_problem_number, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        title.trim(),
        difficulty,
        source_type || 'other',
        source_url || null,
        book_name || null,
        book_page || null,
        book_problem_number || null,
        notes || null
      );

      const problemId = info.lastInsertRowid;

      // Handle tags
      for (const tagInput of tags) {
        let tagId = null;
        if (typeof tagInput === 'number') {
          tagId = tagInput;
        } else if (typeof tagInput === 'string' && tagInput.trim()) {
          tagId = getOrCreateTag(db, tagInput);
        }

        if (tagId) {
          db.prepare('INSERT OR IGNORE INTO problem_tags (problem_id, tag_id) VALUES (?, ?)').run(problemId, tagId);
        }
      }

      return problemId;
    });

    const newProblemId = createTx();
    const createdProblem = db.prepare('SELECT * FROM problems WHERE id = ?').get(newProblemId);
    createdProblem.tags = db.prepare(`
      SELECT t.id, t.name FROM problem_tags pt JOIN tags t ON t.id = pt.tag_id WHERE pt.problem_id = ?
    `).all(newProblemId);

    res.status(201).json(createdProblem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/problems/:id - Update problem
router.put('/:id', (req, res) => {
  try {
    const problemId = req.params.id;
    const {
      title,
      difficulty,
      source_type,
      source_url,
      book_name,
      book_page,
      book_problem_number,
      notes,
      tags = [],
      allowDuplicate = false,
    } = req.body;

    const db = getDb();
    const existing = db.prepare('SELECT id FROM problems WHERE id = ?').get(problemId);
    if (!existing) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    if (!allowDuplicate) {
      const dupCheck = findDuplicateProblem(db, {
        title,
        source_type,
        source_url,
        book_name,
        book_page,
        book_problem_number,
      }, problemId);

      if (dupCheck.isDuplicate) {
        return res.status(409).json({
          error: dupCheck.reason,
          isDuplicate: true,
          existingProblem: dupCheck.existingProblem,
        });
      }
    }

    const updateTx = db.transaction(() => {
      db.prepare(`
        UPDATE problems 
        SET title = ?, difficulty = ?, source_type = ?, source_url = ?, book_name = ?, book_page = ?, book_problem_number = ?, notes = ?
        WHERE id = ?
      `).run(
        title.trim(),
        difficulty,
        source_type || 'other',
        source_url || null,
        book_name || null,
        book_page || null,
        book_problem_number || null,
        notes || null,
        problemId
      );

      // Update tags
      db.prepare('DELETE FROM problem_tags WHERE problem_id = ?').run(problemId);

      for (const tagInput of tags) {
        let tagId = null;
        if (typeof tagInput === 'number') {
          tagId = tagInput;
        } else if (typeof tagInput === 'string' && tagInput.trim()) {
          tagId = getOrCreateTag(db, tagInput);
        }

        if (tagId) {
          db.prepare('INSERT OR IGNORE INTO problem_tags (problem_id, tag_id) VALUES (?, ?)').run(problemId, tagId);
        }
      }
    });

    updateTx();

    const updated = db.prepare('SELECT * FROM problems WHERE id = ?').get(problemId);
    updated.tags = db.prepare(`
      SELECT t.id, t.name FROM problem_tags pt JOIN tags t ON t.id = pt.tag_id WHERE pt.problem_id = ?
    `).all(problemId);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/problems/:id/comments - Add comment to problem
router.post('/:id/comments', (req, res) => {
  try {
    const problemId = req.params.id;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const db = getDb();
    const problem = db.prepare('SELECT id FROM problems WHERE id = ?').get(problemId);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const info = db.prepare(`
      INSERT INTO problem_comments (problem_id, content)
      VALUES (?, ?)
    `).run(problemId, content.trim());

    const createdComment = db.prepare('SELECT * FROM problem_comments WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(createdComment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/problems/comments/:commentId - Delete problem comment
router.delete('/comments/:commentId', (req, res) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM problem_comments WHERE id = ?').run(req.params.commentId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/problems/:id - Delete problem
router.delete('/:id', (req, res) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM problems WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/problems/:id/attempts - Log an attempt for a problem
router.post('/:id/attempts', (req, res) => {
  try {
    const problemId = req.params.id;
    const { result, attempt_type = 'review', notes, time_spent } = req.body;

    if (!['failed', 'needed_hints', 'struggled', 'comfortable', 'trivial'].includes(result)) {
      return res.status(400).json({ error: 'Valid attempt result is required' });
    }

    const db = getDb();
    const problem = db.prepare('SELECT id FROM problems WHERE id = ?').get(problemId);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const logTx = db.transaction(() => {
      const now = new Date();
      const attemptedAt = now.toISOString().split('T')[0] + ' ' + now.toTimeString().split(' ')[0];

      db.prepare(`
        INSERT INTO attempts (problem_id, attempt_type, attempted_at, result, notes, time_spent)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(problemId, attempt_type, attemptedAt, result, notes || null, time_spent || null);

      // Update SRS scheduling
      const scheduling = updateProblemScheduling(db, problemId, result, now);

      return scheduling;
    });

    const scheduling = logTx();
    res.status(201).json({ success: true, scheduling });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
