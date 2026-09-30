/**
 * Calculates the next interval in days based on performance result and previous interval.
 * 
 * Result values & initial base intervals:
 * - failed        -> 1 day
 * - needed_hints  -> 2 days
 * - struggled     -> 4 days
 * - comfortable   -> 10 days
 * - trivial       -> 21 days
 * 
 * For subsequent attempts:
 * - failed: reset to 1 day
 * - needed_hints: reset to 2 days
 * - struggled: Math.max(4, Math.round(previousInterval * 1.3))
 * - comfortable: Math.max(10, Math.round(previousInterval * 2.2))
 * - trivial: Math.max(21, Math.round(previousInterval * 3.0))
 */
export function calculateNextInterval(result, previousInterval = 0) {
  const baseIntervals = {
    failed: 1,
    needed_hints: 2,
    struggled: 4,
    comfortable: 10,
    trivial: 21,
  };

  const base = baseIntervals[result];
  if (base === undefined) {
    throw new Error(`Invalid result: ${result}`);
  }

  // If no previous interval or if performance was poor (failed / needed_hints), use or reset base interval
  if (!previousInterval || previousInterval <= 0 || result === 'failed' || result === 'needed_hints') {
    return base;
  }

  // Repeated success increases interval
  switch (result) {
    case 'struggled':
      return Math.max(4, Math.round(previousInterval * 1.3));
    case 'comfortable':
      return Math.max(10, Math.round(previousInterval * 2.2));
    case 'trivial':
      return Math.max(21, Math.round(previousInterval * 3.0));
    default:
      return base;
  }
}

/**
 * Calculates next review ISO date string (YYYY-MM-DD) given an attempt date and interval in days.
 */
export function calculateNextReviewDate(attemptDate = new Date(), intervalInDays = 1) {
  const dateObj = new Date(attemptDate);
  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid attemptDate provided');
  }
  // Add days
  dateObj.setDate(dateObj.getDate() + intervalInDays);
  return dateObj.toISOString().split('T')[0];
}

/**
 * Updates or creates scheduling state for a problem in the database.
 */
export function updateProblemScheduling(db, problemId, result, attemptDate = new Date()) {
  const existing = db.prepare('SELECT interval FROM scheduling WHERE problem_id = ?').get(problemId);
  const prevInterval = existing ? existing.interval : 0;

  const nextInterval = calculateNextInterval(result, prevInterval);
  const attemptedAtStr = typeof attemptDate === 'string' 
    ? attemptDate 
    : attemptDate.toISOString().split('T')[0];
    
  const nextReviewStr = calculateNextReviewDate(attemptDate, nextInterval);

  db.prepare(`
    INSERT INTO scheduling (problem_id, last_review, interval, next_review)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(problem_id) DO UPDATE SET
      last_review = excluded.last_review,
      interval = excluded.interval,
      next_review = excluded.next_review
  `).run(problemId, attemptedAtStr, nextInterval, nextReviewStr);

  return {
    problemId,
    lastReview: attemptedAtStr,
    interval: nextInterval,
    nextReview: nextReviewStr,
  };
}
