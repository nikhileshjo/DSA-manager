import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { SCHEMA_SQL } from '../server/db/schema.js';
import { calculateNextInterval, calculateNextReviewDate, updateProblemScheduling } from '../server/services/srsScheduler.js';

describe('SRS Scheduler Module', () => {
  let db;

  beforeEach(() => {
    db = new Database(':memory:');
    db.exec(SCHEMA_SQL);
  });

  afterEach(() => {
    db.close();
  });

  it('calculates initial intervals correctly according to result', () => {
    expect(calculateNextInterval('failed', 0)).toBe(1);
    expect(calculateNextInterval('needed_hints', 0)).toBe(2);
    expect(calculateNextInterval('struggled', 0)).toBe(4);
    expect(calculateNextInterval('comfortable', 0)).toBe(10);
    expect(calculateNextInterval('trivial', 0)).toBe(21);
  });

  it('increases interval upon repeated successful attempts', () => {
    const nextStruggled = calculateNextInterval('struggled', 4);
    expect(nextStruggled).toBeGreaterThanOrEqual(5);

    const nextComfortable = calculateNextInterval('comfortable', 10);
    expect(nextComfortable).toBe(22); // 10 * 2.2

    const nextTrivial = calculateNextInterval('trivial', 21);
    expect(nextTrivial).toBe(63); // 21 * 3.0
  });

  it('resets interval upon poor performance (failed / needed_hints)', () => {
    expect(calculateNextInterval('failed', 63)).toBe(1);
    expect(calculateNextInterval('needed_hints', 63)).toBe(2);
  });

  it('calculates correct next review date string', () => {
    const attemptDate = new Date('2026-09-02');
    const reviewDate = calculateNextReviewDate(attemptDate, 10);
    expect(reviewDate).toBe('2026-09-12');
  });

  it('persists and updates scheduling in database correctly', () => {
    db.prepare("INSERT INTO problems (id, title, difficulty) VALUES (1, 'Two Sum', 'easy')").run();

    // First attempt: comfortable
    const result1 = updateProblemScheduling(db, 1, 'comfortable', new Date('2026-09-02'));
    expect(result1.interval).toBe(10);
    expect(result1.nextReview).toBe('2026-09-12');

    let row = db.prepare('SELECT * FROM scheduling WHERE problem_id = 1').get();
    expect(row.interval).toBe(10);
    expect(row.next_review).toBe('2026-09-12');

    // Second attempt: trivial
    const result2 = updateProblemScheduling(db, 1, 'trivial', new Date('2026-09-12'));
    expect(result2.interval).toBe(30); // 10 * 3.0

    row = db.prepare('SELECT * FROM scheduling WHERE problem_id = 1').get();
    expect(row.interval).toBe(30);
  });
});
