import express from 'express';
import { getDb } from '../db/database.js';

const router = express.Router();

/**
 * Normalizes and inserts tag if not exists, returning tag ID.
 * Case-insensitive deduplication (e.g. 'heap', 'Heap' -> same tag).
 */
export function getOrCreateTag(db, tagName) {
  const trimmed = tagName.trim();
  if (!trimmed) return null;

  // Check case-insensitive match
  const existing = db.prepare('SELECT id, name FROM tags WHERE name = ? COLLATE NOCASE').get(trimmed);
  if (existing) {
    return existing.id;
  }

  // Insert new tag
  const info = db.prepare('INSERT INTO tags (name) VALUES (?)').run(trimmed);
  return info.lastInsertRowid;
}

// GET /api/tags - List all tags
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const tags = db.prepare(`
      SELECT t.id, t.name, COUNT(DISTINCT pt.problem_id) as problem_count
      FROM tags t
      LEFT JOIN problem_tags pt ON pt.tag_id = t.id
      GROUP BY t.id
      ORDER BY t.name ASC
    `).all();
    res.json(tags);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tags - Create a tag
router.post('/', (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Tag name is required' });
    }
    const db = getDb();
    const tagId = getOrCreateTag(db, name);
    const tag = db.prepare('SELECT * FROM tags WHERE id = ?').get(tagId);
    res.status(201).json(tag);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/tags/:id - Update tag
router.put('/:id', (req, res) => {
  try {
    const { name } = req.body;
    const tagId = req.params.id;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Tag name is required' });
    }
    const db = getDb();
    
    // Check collision
    const existing = db.prepare('SELECT id FROM tags WHERE name = ? COLLATE NOCASE AND id != ?').get(name.trim(), tagId);
    if (existing) {
      return res.status(400).json({ error: 'A tag with this name already exists' });
    }

    db.prepare('UPDATE tags SET name = ? WHERE id = ?').run(name.trim(), tagId);
    const updated = db.prepare('SELECT * FROM tags WHERE id = ?').get(tagId);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/tags/:id - Delete tag
router.delete('/:id', (req, res) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM tags WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
