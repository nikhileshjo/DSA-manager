import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { SCHEMA_SQL } from '../server/db/schema.js';
import { selectFreshProblems } from '../server/services/freshSelector.js';

describe('Fresh Selector Module', () => {
  let db;

  beforeEach(() => {
    db = new Database(':memory:');
    db.exec(SCHEMA_SQL);
  });

  afterEach(() => {
    db.close();
  });

  it('never selects already-attempted problems as fresh', () => {
    db.prepare("INSERT INTO problems (id, title, difficulty) VALUES (1, 'Attempted Problem', 'easy')").run();
    db.prepare("INSERT INTO problems (id, title, difficulty) VALUES (2, 'Unattempted Problem', 'medium')").run();

    db.prepare("INSERT INTO attempts (problem_id, attempt_type, result) VALUES (1, 'fresh', 'comfortable')").run();

    const selected = selectFreshProblems(db, 5);
    expect(selected).toHaveLength(1);
    expect(selected[0].id).toBe(2);
    expect(selected[0].title).toBe('Unattempted Problem');
  });

  it('prioritizes weak/underrepresented tags', () => {
    // Tags: Heap (id 1), Array (id 2)
    db.prepare("INSERT INTO tags (id, name) VALUES (1, 'Heap'), (2, 'Array')").run();

    // Problems
    db.prepare("INSERT INTO problems (id, title, difficulty) VALUES (10, 'Past Heap Fail', 'hard')").run();
    db.prepare("INSERT INTO problem_tags (problem_id, tag_id) VALUES (10, 1)").run();
    // Record failed attempt for Heap tag
    db.prepare("INSERT INTO attempts (problem_id, attempt_type, result) VALUES (10, 'fresh', 'failed')").run();

    // Fresh problem with Heap tag vs Fresh problem with Array tag
    db.prepare("INSERT INTO problems (id, title, difficulty) VALUES (11, 'Fresh Heap Problem', 'hard')").run();
    db.prepare("INSERT INTO problem_tags (problem_id, tag_id) VALUES (11, 1)").run();

    db.prepare("INSERT INTO problems (id, title, difficulty) VALUES (12, 'Fresh Array Problem', 'easy')").run();
    db.prepare("INSERT INTO problem_tags (problem_id, tag_id) VALUES (12, 2)").run();

    const selected = selectFreshProblems(db, 2);
    expect(selected).toHaveLength(2);
    // Heap has lower performance history, so Fresh Heap Problem should be prioritized
    const selectedIds = selected.map(p => p.id);
    expect(selectedIds).toContain(11);
    expect(selectedIds).toContain(12);
  });
});
