import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { SCHEMA_SQL } from '../server/db/schema.js';
import { generateDailyPractice } from '../server/services/practiceAllocator.js';
import { updateProblemScheduling } from '../server/services/srsScheduler.js';

describe('Practice Allocator Module', () => {
  let db;

  beforeEach(() => {
    db = new Database(':memory:');
    db.exec(SCHEMA_SQL);
    db.prepare("INSERT INTO settings (key, value) VALUES ('daily_capacity', '5')").run();
  });

  afterEach(() => {
    db.close();
  });

  it('handles empty database gracefully', () => {
    const session = generateDailyPractice(db, new Date('2026-09-02'));
    expect(session.capacity).toBe(5);
    expect(session.reviewProblems).toHaveLength(0);
    expect(session.freshProblems).toHaveLength(0);
    expect(session.externalSlots).toHaveLength(5);
    expect(session.explanation).toBeDefined();
  });

  it('allocates due reviews, fresh problems, and external slot within capacity', () => {
    // Insert 10 problems
    for (let i = 1; i <= 10; i++) {
      db.prepare(`INSERT INTO problems (id, title, difficulty) VALUES (?, ?, 'easy')`).run(i, `Problem ${i}`);
    }

    // Mark problem 1 and 2 as due for review today
    updateProblemScheduling(db, 1, 'comfortable', new Date('2026-08-20'));
    updateProblemScheduling(db, 2, 'failed', new Date('2026-09-01'));
    // Mark as attempted so they are not fresh
    db.prepare(`INSERT INTO attempts (problem_id, attempt_type, result) VALUES (1, 'database', 'comfortable')`).run();
    db.prepare(`INSERT INTO attempts (problem_id, attempt_type, result) VALUES (2, 'database', 'failed')`).run();

    const session = generateDailyPractice(db, new Date('2026-09-02'));
    expect(session.capacity).toBe(5);

    const totalAllocated = session.reviewProblems.length + session.freshProblems.length + session.externalSlots.length;
    expect(totalAllocated).toBeLessThanOrEqual(5);

    expect(session.reviewProblems).toHaveLength(2);
    expect(session.freshProblems.length).toBeGreaterThan(0);
    expect(session.externalSlots).toHaveLength(1);
  });

  it('caps review backlog so reviews do not consume 100% of capacity', () => {
    // Insert 20 problems and make all 20 due for review
    for (let i = 1; i <= 20; i++) {
      db.prepare(`INSERT INTO problems (id, title, difficulty) VALUES (?, ?, 'medium')`).run(i, `Problem ${i}`);
      updateProblemScheduling(db, i, 'failed', new Date('2026-08-01')); // overdue
      db.prepare(`INSERT INTO attempts (problem_id, attempt_type, result) VALUES (?, 'database', 'failed')`).run(i);
    }

    const session = generateDailyPractice(db, new Date('2026-09-02'));
    expect(session.capacity).toBe(5);
    // Max review cap for capacity 5 is Math.floor(5 * 0.6) = 3
    expect(session.reviewProblems.length).toBeLessThanOrEqual(3);
    // Room preserved for external practice
    expect(session.externalSlots.length).toBeGreaterThanOrEqual(1);
  });

  it('adapts when capacity changes', () => {
    db.prepare("UPDATE settings SET value = '3' WHERE key = 'daily_capacity'").run();
    for (let i = 1; i <= 5; i++) {
      db.prepare(`INSERT INTO problems (id, title, difficulty) VALUES (?, ?, 'easy')`).run(i, `Problem ${i}`);
    }

    const session = generateDailyPractice(db, new Date('2026-09-02'));
    expect(session.capacity).toBe(3);
    const totalAllocated = session.reviewProblems.length + session.freshProblems.length + session.externalSlots.length;
    expect(totalAllocated).toBeLessThanOrEqual(3);
  });
});
