import express from 'express';
import { getDb } from '../db/database.js';
import { getOrCreateTag } from './tags.js';
import { findDuplicateProblem } from './problems.js';

const router = express.Router();

/**
 * Builds the complete export payload of the database.
 */
export function generateExportData(db) {
  const problems = db.prepare(`SELECT * FROM problems ORDER BY id ASC`).all();

  const getTagsStmt = db.prepare(`
    SELECT t.name 
    FROM problem_tags pt 
    JOIN tags t ON t.id = pt.tag_id 
    WHERE pt.problem_id = ?
    ORDER BY t.name ASC
  `);

  const getSolutionsStmt = db.prepare(`
    SELECT * FROM solutions WHERE problem_id = ? ORDER BY id ASC
  `);

  const getSolutionTagsStmt = db.prepare(`
    SELECT t.name 
    FROM solution_tags st 
    JOIN tags t ON t.id = st.tag_id 
    WHERE st.solution_id = ?
    ORDER BY t.name ASC
  `);

  const getCommentsStmt = db.prepare(`
    SELECT content, created_at FROM problem_comments WHERE problem_id = ? ORDER BY id ASC
  `);

  const getAttemptsStmt = db.prepare(`
    SELECT attempt_type, attempted_at, result, notes, time_spent 
    FROM attempts 
    WHERE problem_id = ? 
    ORDER BY id ASC
  `);

  const getSchedulingStmt = db.prepare(`
    SELECT last_review, interval, next_review FROM scheduling WHERE problem_id = ?
  `);

  const fullProblems = problems.map((prob) => {
    const probTags = getTagsStmt.all(prob.id).map(r => r.name);
    
    const solutions = getSolutionsStmt.all(prob.id).map((sol) => {
      const solTags = getSolutionTagsStmt.all(sol.id).map(r => r.name);
      return {
        title: sol.title,
        url: sol.url,
        notes: sol.notes,
        created_at: sol.created_at,
        tags: solTags,
      };
    });

    const comments = getCommentsStmt.all(prob.id);
    const attempts = getAttemptsStmt.all(prob.id);
    const scheduling = getSchedulingStmt.get(prob.id) || null;

    return {
      title: prob.title,
      difficulty: prob.difficulty,
      source_type: prob.source_type,
      source_url: prob.source_url,
      book_name: prob.book_name,
      book_page: prob.book_page,
      book_problem_number: prob.book_problem_number,
      notes: prob.notes,
      created_at: prob.created_at,
      tags: probTags,
      solutions,
      comments,
      attempts,
      scheduling: scheduling ? {
        last_review: scheduling.last_review,
        interval: scheduling.interval,
        next_review: scheduling.next_review,
      } : null,
    };
  });

  const externalAttempts = db.prepare(`
    SELECT attempt_type, attempted_at, result, notes, time_spent 
    FROM attempts 
    WHERE problem_id IS NULL 
    ORDER BY id ASC
  `).all();

  const allTags = db.prepare(`SELECT name FROM tags ORDER BY name ASC`).all().map(r => r.name);
  const settingsRows = db.prepare(`SELECT key, value FROM settings`).all();
  const settings = {};
  for (const row of settingsRows) {
    settings[row.key] = row.value;
  }

  return {
    version: 1,
    app: 'dsa-manager',
    exported_at: new Date().toISOString(),
    settings,
    tags: allTags,
    problems: fullProblems,
    external_attempts: externalAttempts,
  };
}

/**
 * Validates and inspects an import payload against existing database records.
 */
export function inspectImportData(db, backupData) {
  if (!backupData || typeof backupData !== 'object') {
    throw new Error('Invalid backup file format: Root must be an object.');
  }

  const rawProblems = Array.isArray(backupData.problems) ? backupData.problems : [];
  
  // Existing database counts
  const problemsCount = db.prepare('SELECT count(*) as c FROM problems').get().c;
  const attemptsCount = db.prepare('SELECT count(*) as c FROM attempts').get().c;
  const tagsCount = db.prepare('SELECT count(*) as c FROM tags').get().c;
  const hasExistingData = (problemsCount > 0 || attemptsCount > 0);

  // Incoming backup statistics
  const importProblemsCount = rawProblems.length;
  const importAttemptsCount = rawProblems.reduce((sum, p) => sum + (Array.isArray(p.attempts) ? p.attempts.length : 0), 0) +
    (Array.isArray(backupData.external_attempts) ? backupData.external_attempts.length : 0);
  const importTagsCount = Array.isArray(backupData.tags) ? backupData.tags.length : 0;

  // Detect duplicate problems
  const duplicates = [];

  rawProblems.forEach((prob, index) => {
    if (!prob.title || !prob.title.trim()) return;

    const dupCheck = findDuplicateProblem(db, {
      title: prob.title,
      source_type: prob.source_type,
      source_url: prob.source_url,
      book_name: prob.book_name,
      book_page: prob.book_page,
      book_problem_number: prob.book_problem_number,
    });

    if (dupCheck.isDuplicate) {
      duplicates.push({
        index,
        reason: dupCheck.reason,
        suggestedRename: `${prob.title.trim()} (Imported)`,
        importedProblem: {
          title: prob.title,
          difficulty: prob.difficulty,
          source_type: prob.source_type,
          source_url: prob.source_url,
          book_name: prob.book_name,
          book_page: prob.book_page,
          book_problem_number: prob.book_problem_number,
          attemptsCount: Array.isArray(prob.attempts) ? prob.attempts.length : 0,
        },
        existingProblem: {
          id: dupCheck.existingProblem.id,
          title: dupCheck.existingProblem.title,
          difficulty: dupCheck.existingProblem.difficulty,
          source_type: dupCheck.existingProblem.source_type,
          source_url: dupCheck.existingProblem.source_url,
          book_name: dupCheck.existingProblem.book_name,
          book_page: dupCheck.existingProblem.book_page,
          book_problem_number: dupCheck.existingProblem.book_problem_number,
        },
      });
    }
  });

  return {
    valid: true,
    hasExistingData,
    existingStats: {
      problemsCount,
      attemptsCount,
      tagsCount,
    },
    importStats: {
      problemsCount: importProblemsCount,
      attemptsCount: importAttemptsCount,
      tagsCount: importTagsCount,
    },
    duplicates,
  };
}

/**
 * Executes import in either 'wipe' or 'merge' mode.
 */
export function executeImport(db, { mode = 'merge', backupData, duplicateResolutions = {} }) {
  if (!backupData || typeof backupData !== 'object') {
    throw new Error('Invalid backup file content');
  }

  const rawProblems = Array.isArray(backupData.problems) ? backupData.problems : [];
  const rawTags = Array.isArray(backupData.tags) ? backupData.tags : [];
  const rawExternal = Array.isArray(backupData.external_attempts) ? backupData.external_attempts : [];
  const rawSettings = backupData.settings || {};

  const importTx = db.transaction(() => {
    let importedProblemsCount = 0;
    let importedAttemptsCount = 0;
    let skippedDuplicatesCount = 0;
    let replacedDuplicatesCount = 0;
    let renamedDuplicatesCount = 0;

    if (mode === 'wipe') {
      // 1. Wipe all existing data in safe foreign-key order
      db.prepare('DELETE FROM problem_tags').run();
      db.prepare('DELETE FROM solution_tags').run();
      db.prepare('DELETE FROM solutions').run();
      db.prepare('DELETE FROM problem_comments').run();
      db.prepare('DELETE FROM attempts').run();
      db.prepare('DELETE FROM scheduling').run();
      db.prepare('DELETE FROM problems').run();
      db.prepare('DELETE FROM tags').run();
      db.prepare('DELETE FROM settings').run();

      // 2. Restore settings
      const insertSetting = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
      if (Array.isArray(rawSettings)) {
        for (const s of rawSettings) {
          if (s.key) insertSetting.run(s.key, String(s.value));
        }
      } else {
        for (const [k, v] of Object.entries(rawSettings)) {
          insertSetting.run(k, String(v));
        }
      }

      // Ensure default daily_capacity if missing
      const hasCap = db.prepare("SELECT value FROM settings WHERE key = 'daily_capacity'").get();
      if (!hasCap) {
        insertSetting.run('daily_capacity', '5');
      }
    } else {
      // In merge mode, preserve settings, but set daily_capacity if empty
      const hasCap = db.prepare("SELECT value FROM settings WHERE key = 'daily_capacity'").get();
      if (!hasCap && rawSettings.daily_capacity) {
        db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('daily_capacity', String(rawSettings.daily_capacity));
      }
    }

    // Insert tags
    for (const tagItem of rawTags) {
      const tagName = typeof tagItem === 'string' ? tagItem : tagItem?.name;
      if (tagName && tagName.trim()) {
        getOrCreateTag(db, tagName.trim());
      }
    }

    // Helper to insert a single problem with all child entities
    const insertSingleProblem = (prob, customTitle = null) => {
      const finalTitle = (customTitle || prob.title || '').trim();
      if (!finalTitle) return null;

      const info = db.prepare(`
        INSERT INTO problems (title, difficulty, source_type, source_url, book_name, book_page, book_problem_number, notes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        finalTitle,
        prob.difficulty && ['easy', 'medium', 'hard'].includes(prob.difficulty) ? prob.difficulty : 'medium',
        prob.source_type || 'other',
        prob.source_url || null,
        prob.book_name || null,
        prob.book_page || null,
        prob.book_problem_number || null,
        prob.notes || null,
        prob.created_at || new Date().toISOString()
      );

      const problemId = info.lastInsertRowid;
      importedProblemsCount++;

      // Problem tags
      if (Array.isArray(prob.tags)) {
        for (const tagItem of prob.tags) {
          const tName = typeof tagItem === 'string' ? tagItem : tagItem?.name;
          if (tName && tName.trim()) {
            const tId = getOrCreateTag(db, tName.trim());
            db.prepare('INSERT OR IGNORE INTO problem_tags (problem_id, tag_id) VALUES (?, ?)').run(problemId, tId);
          }
        }
      }

      // Solutions & Solution tags
      if (Array.isArray(prob.solutions)) {
        for (const sol of prob.solutions) {
          if (!sol.title || !sol.title.trim()) continue;
          const sInfo = db.prepare(`
            INSERT INTO solutions (problem_id, title, url, notes, created_at)
            VALUES (?, ?, ?, ?, ?)
          `).run(
            problemId,
            sol.title.trim(),
            sol.url || null,
            sol.notes || null,
            sol.created_at || new Date().toISOString()
          );
          const solutionId = sInfo.lastInsertRowid;

          if (Array.isArray(sol.tags)) {
            for (const sTag of sol.tags) {
              const stName = typeof sTag === 'string' ? sTag : sTag?.name;
              if (stName && stName.trim()) {
                const stId = getOrCreateTag(db, stName.trim());
                db.prepare('INSERT OR IGNORE INTO solution_tags (solution_id, tag_id) VALUES (?, ?)').run(solutionId, stId);
              }
            }
          }
        }
      }

      // Comments
      if (Array.isArray(prob.comments)) {
        for (const comm of prob.comments) {
          if (comm.content && comm.content.trim()) {
            db.prepare(`
              INSERT INTO problem_comments (problem_id, content, created_at)
              VALUES (?, ?, ?)
            `).run(problemId, comm.content.trim(), comm.created_at || new Date().toISOString());
          }
        }
      }

      // Attempts
      if (Array.isArray(prob.attempts)) {
        for (const att of prob.attempts) {
          if (!att.result) continue;
          db.prepare(`
            INSERT INTO attempts (problem_id, attempt_type, attempted_at, result, notes, time_spent)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run(
            problemId,
            att.attempt_type || 'review',
            att.attempted_at || new Date().toISOString(),
            att.result,
            att.notes || null,
            att.time_spent || null
          );
          importedAttemptsCount++;
        }
      }

      // Scheduling
      if (prob.scheduling && prob.scheduling.next_review) {
        db.prepare(`
          INSERT INTO scheduling (problem_id, last_review, interval, next_review)
          VALUES (?, ?, ?, ?)
        `).run(
          problemId,
          prob.scheduling.last_review || null,
          prob.scheduling.interval || 1,
          prob.scheduling.next_review
        );
      }

      return problemId;
    };

    // Process problems
    rawProblems.forEach((prob, index) => {
      if (mode === 'wipe') {
        insertSingleProblem(prob);
      } else {
        // Merge mode - handle duplicate resolution
        const resolution = duplicateResolutions[index];

        if (resolution) {
          const action = typeof resolution === 'object' ? resolution.action : resolution;

          if (action === 'skip') {
            skippedDuplicatesCount++;
            return; // Skip importing this duplicate
          } else if (action === 'replace') {
            // Delete older problem from existing database
            const existingId = typeof resolution === 'object' ? resolution.existingId : null;
            if (existingId) {
              db.prepare('DELETE FROM problems WHERE id = ?').run(existingId);
            }
            replacedDuplicatesCount++;
            insertSingleProblem(prob);
          } else if (action === 'rename') {
            const newTitle = (typeof resolution === 'object' && resolution.newTitle) ? resolution.newTitle : `${prob.title} (Imported)`;
            renamedDuplicatesCount++;
            insertSingleProblem(prob, newTitle);
          } else {
            // Default to skip if unknown action
            skippedDuplicatesCount++;
          }
        } else {
          // Check if it's an unflagged duplicate
          const dupCheck = findDuplicateProblem(db, {
            title: prob.title,
            source_type: prob.source_type,
            source_url: prob.source_url,
            book_name: prob.book_name,
            book_page: prob.book_page,
            book_problem_number: prob.book_problem_number,
          });

          if (dupCheck.isDuplicate) {
            // If duplicate was found and had no explicit resolution, default to skip
            skippedDuplicatesCount++;
          } else {
            insertSingleProblem(prob);
          }
        }
      }
    });

    // External attempts (problem_id is NULL)
    for (const ext of rawExternal) {
      if (!ext.result) continue;
      db.prepare(`
        INSERT INTO attempts (problem_id, attempt_type, attempted_at, result, notes, time_spent)
        VALUES (NULL, ?, ?, ?, ?, ?)
      `).run(
        ext.attempt_type || 'external',
        ext.attempted_at || new Date().toISOString(),
        ext.result,
        ext.notes || null,
        ext.time_spent || null
      );
      importedAttemptsCount++;
    }

    return {
      success: true,
      mode,
      importedProblemsCount,
      importedAttemptsCount,
      skippedDuplicatesCount,
      replacedDuplicatesCount,
      renamedDuplicatesCount,
    };
  });

  return importTx();
}

// GET /api/backup/export - Export database as a downloadable file
router.get('/export', (req, res) => {
  try {
    const db = getDb();
    const data = generateExportData(db);

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    const filename = `dsa_manager_backup_${dateStr}_${timeStr}.json`;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(JSON.stringify(data, null, 2));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/backup/inspect - Inspect backup file and check for existing data/duplicates
router.post('/inspect', (req, res) => {
  try {
    const { backupData } = req.body;
    if (!backupData) {
      return res.status(400).json({ error: 'backupData is required' });
    }

    const db = getDb();
    const result = inspectImportData(db, backupData);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/backup/import - Execute import (wipe or merge)
router.post('/import', (req, res) => {
  try {
    const { mode, backupData, duplicateResolutions } = req.body;
    if (!backupData) {
      return res.status(400).json({ error: 'backupData is required' });
    }
    if (!['wipe', 'merge'].includes(mode)) {
      return res.status(400).json({ error: 'Valid mode (wipe or merge) is required' });
    }

    const db = getDb();
    const result = executeImport(db, {
      mode,
      backupData,
      duplicateResolutions: duplicateResolutions || {},
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
