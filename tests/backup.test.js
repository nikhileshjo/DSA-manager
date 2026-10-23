import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { SCHEMA_SQL } from '../server/db/schema.js';
import {
  generateExportData,
  inspectImportData,
  executeImport,
} from '../server/routes/backup.js';

describe('Backup & Restore', () => {
  let db;

  beforeEach(() => {
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    db.exec(SCHEMA_SQL);

    db.prepare("INSERT INTO settings (key, value) VALUES ('daily_capacity', '5')").run();
    db.prepare("INSERT INTO tags (name) VALUES ('Heap'), ('Array')").run();
    const tagHeap = db.prepare("SELECT id FROM tags WHERE name = 'Heap'").get().id;

    const prob = db.prepare(
      "INSERT INTO problems (title, difficulty, source_type, source_url, book_name, book_page, book_problem_number, notes, created_at) VALUES ('Two Sum', 'easy', 'leetcode', 'https://leetcode.com/problems/two-sum', NULL, NULL, NULL, 'Hash map approach', datetime('now'))"
    ).run();
    const problemId = prob.lastInsertRowid;

    db.prepare("INSERT INTO problem_tags (problem_id, tag_id) VALUES (?, ?)").run(problemId, tagHeap);
    db.prepare(
      "INSERT INTO solutions (problem_id, title, url, notes, created_at) VALUES (?, 'Two pointers', 'https://leetcode.com/problems/two-sum/solution', 'Hash map approach', datetime('now'))"
    ).run(problemId);
    db.prepare(
      "INSERT INTO attempts (problem_id, attempt_type, result, attempted_at, notes, time_spent) VALUES (?, 'fresh', 'comfortable', datetime('now'), 'Solved it', 12)"
    ).run(problemId);
    db.prepare(
      "INSERT INTO scheduling (problem_id, last_review, interval, next_review) VALUES (?, datetime('now'), 10, datetime('now', '+10 days'))"
    ).run(problemId);
    db.prepare(
      "INSERT INTO attempts (problem_id, attempt_type, result, attempted_at) VALUES (NULL, 'external', 'failed', datetime('now'))"
    ).run();
  });

  afterEach(() => {
    db.close();
  });

  it('exports the complete database payload', () => {
    const data = generateExportData(db);

    expect(data.version).toBe(1);
    expect(data.app).toBe('spark-manager');
    expect(data.settings.daily_capacity).toBe('5');
    expect(data.tags).toContain('Heap');
    expect(data.tags).toContain('Array');

    expect(data.problems).toHaveLength(1);
    expect(data.problems[0].title).toBe('Two Sum');
    expect(data.problems[0].difficulty).toBe('easy');
    expect(data.problems[0].tags).toContain('Heap');

    expect(data.problems[0].solutions).toHaveLength(1);
    expect(data.problems[0].solutions[0].title).toBe('Two pointers');
    expect(data.problems[0].solutions[0].tags).toEqual([]);

    expect(data.problems[0].attempts).toHaveLength(1);
    expect(data.problems[0].attempts[0].result).toBe('comfortable');

    expect(data.problems[0].scheduling.next_review).toBeTruthy();
    expect(data.external_attempts).toHaveLength(1);
  });

  it('detects existing data during import inspection', () => {
    const data = generateExportData(db);
    const report = inspectImportData(db, data);

    expect(report.valid).toBe(true);
    expect(report.hasExistingData).toBe(true);
    expect(report.existingStats.problemsCount).toBe(1);
    expect(report.existingStats.attemptsCount).toBe(2);
    expect(report.importStats.problemsCount).toBe(1);
    expect(report.importStats.attemptsCount).toBe(2);
  });

  it('reports no existing data on an empty database', () => {
    const emptyDb = new Database(':memory:');
    emptyDb.pragma('foreign_keys = ON');
    emptyDb.exec(SCHEMA_SQL);
    emptyDb.prepare("INSERT INTO settings (key, value) VALUES ('daily_capacity', '5')").run();

    const data = generateExportData(emptyDb);
    const report = inspectImportData(emptyDb, data);

    expect(report.hasExistingData).toBe(false);
    expect(report.existingStats.problemsCount).toBe(0);
    expect(report.importStats.problemsCount).toBe(0);

    emptyDb.close();
  });

  it('rejects invalid backup payloads', () => {
    expect(() => inspectImportData(db, null)).toThrow();
    expect(() => inspectImportData(db, { problems: 'not-an-array' })).not.toThrow();
  });

  it('performs a full wipe import round-trip', () => {
    const data = generateExportData(db);
    const result = executeImport(db, { mode: 'wipe', backupData: data });

    expect(result.success).toBe(true);
    expect(result.mode).toBe('wipe');
    expect(result.importedProblemsCount).toBe(1);
    expect(result.importedAttemptsCount).toBe(2);

    const remaining = db.prepare("SELECT COUNT(*) as c FROM problems").get().c;
    expect(remaining).toBe(1);
    const problem = db.prepare("SELECT * FROM problems WHERE title = 'Two Sum'").get();
    expect(problem.difficulty).toBe('easy');

    const tagCount = db.prepare("SELECT COUNT(*) as c FROM tags").get().c;
    expect(tagCount).toBe(2);

    const attempts = db.prepare("SELECT COUNT(*) as c FROM attempts").get().c;
    expect(attempts).toBe(2);

    const settings = db.prepare("SELECT value FROM settings WHERE key = 'daily_capacity'").get();
    expect(settings.value).toBe('5');
  });

  it('imports into an empty database', () => {
    const emptyDb = new Database(':memory:');
    emptyDb.pragma('foreign_keys = ON');
    emptyDb.exec(SCHEMA_SQL);

    const data = generateExportData(db);
    const result = executeImport(emptyDb, { mode: 'wipe', backupData: data });

    expect(result.success).toBe(true);
    expect(emptyDb.prepare("SELECT COUNT(*) as c FROM problems").get().c).toBe(1);
    expect(emptyDb.prepare("SELECT COUNT(*) as c FROM attempts").get().c).toBe(2);
    expect(emptyDb.prepare("SELECT COUNT(*) as c FROM tags").get().c).toBe(2);

    emptyDb.close();
  });
});
