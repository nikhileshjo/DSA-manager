import { selectFreshProblems } from './freshSelector.js';

/**
 * Calculates daily practice composition based on daily capacity, due reviews, and unattempted fresh problems.
 * 
 * Rules:
 * - Total practice items <= daily capacity.
 * - Review backlog is capped (max ~60-70% of capacity) so reviews do not consume 100% of capacity.
 * - Always preserves room for fresh problems and external practice slots.
 * - Provides plain language explanation for allocation decisions.
 */
export function generateDailyPractice(db, currentDate = new Date()) {
  const dateStr = typeof currentDate === 'string'
    ? currentDate
    : currentDate.toISOString().split('T')[0];

  // Fetch daily capacity setting (default 5)
  const capacityRow = db.prepare("SELECT value FROM settings WHERE key = 'daily_capacity'").get();
  const capacity = capacityRow ? parseInt(capacityRow.value, 10) : 5;

  if (capacity <= 0) {
    return {
      capacity: 0,
      completedCount: 0,
      reviewProblems: [],
      freshProblems: [],
      externalSlots: [],
      explanation: 'Daily practice capacity is set to 0.',
    };
  }

  // 1. Fetch due review problems
  const dueReviewsAll = db.prepare(`
    SELECT p.*, s.last_review, s.interval, s.next_review
    FROM problems p
    JOIN scheduling s ON s.problem_id = p.id
    WHERE s.next_review <= ?
    ORDER BY s.next_review ASC, p.id ASC
  `).all(dateStr);

  // Attach tags to review problems
  const getProblemTags = db.prepare(`
    SELECT pt.tag_id as id, t.name
    FROM problem_tags pt
    JOIN tags t ON t.id = pt.tag_id
    WHERE pt.problem_id = ?
  `);
  for (const prob of dueReviewsAll) {
    prob.tags = getProblemTags.all(prob.id);
  }

  // 2. Count unattempted fresh problems in DB
  const unattemptedCountRow = db.prepare(`
    SELECT COUNT(*) as count 
    FROM problems p
    WHERE p.id NOT IN (
      SELECT DISTINCT problem_id FROM attempts WHERE problem_id IS NOT NULL
    )
  `).get();
  const totalFreshAvailable = unattemptedCountRow ? unattemptedCountRow.count : 0;

  // 3. Determine breakdown allocation counts
  const totalDueCount = dueReviewsAll.length;

  let reviewSlotCount = 0;
  let freshSlotCount = 0;
  let externalSlotCount = 0;

  if (capacity === 1) {
    if (totalDueCount > 0) {
      reviewSlotCount = 1;
    } else if (totalFreshAvailable > 0) {
      freshSlotCount = 1;
    } else {
      externalSlotCount = 1;
    }
  } else {
    // Review cap: at most floor(capacity * 0.6) when reviews are backlog, leaving room for fresh/external
    const maxReviewCap = Math.max(1, Math.floor(capacity * 0.6));
    reviewSlotCount = Math.min(totalDueCount, maxReviewCap);

    let remainingCapacity = capacity - reviewSlotCount;

    // Allocate 1 slot for external problem if remaining capacity >= 1
    if (remainingCapacity > 0) {
      externalSlotCount = 1;
      remainingCapacity -= 1;
    }

    // Allocate remaining slots to fresh problems
    if (remainingCapacity > 0 && totalFreshAvailable > 0) {
      freshSlotCount = Math.min(totalFreshAvailable, remainingCapacity);
      remainingCapacity -= freshSlotCount;
    }

    // If remaining capacity still exists (e.g. no fresh problems available), allocate to external slots
    if (remainingCapacity > 0) {
      externalSlotCount += remainingCapacity;
    }
  }

  // 4. Select actual problems for each category
  const selectedReviews = dueReviewsAll.slice(0, reviewSlotCount);
  const selectedFresh = selectFreshProblems(db, freshSlotCount);

  // Generate external slot items
  const externalSlots = [];
  for (let i = 1; i <= externalSlotCount; i++) {
    externalSlots.push({
      id: `ext-${i}`,
      title: `Pick 1 random unsolved problem from LeetCode or another external source`,
      instruction: `Find a fresh problem from LeetCode, Codeforces, HackerRank, or a textbook. Do not look at the solution first. Solve it, record your performance, and optionally add it to your database.`,
      slotIndex: i,
    });
  }

  // 5. Generate plain-language explanation breakdown
  const explanationParts = [];
  if (reviewSlotCount > 0) {
    explanationParts.push(`${reviewSlotCount} review ${reviewSlotCount === 1 ? 'problem' : 'problems'} due (out of ${totalDueCount} backlog)`);
  } else {
    explanationParts.push(`0 reviews due today`);
  }

  if (freshSlotCount > 0) {
    explanationParts.push(`${freshSlotCount} fresh ${freshSlotCount === 1 ? 'problem' : 'problems'} selected for weak/unpracticed topics`);
  }

  if (externalSlotCount > 0) {
    explanationParts.push(`${externalSlotCount} external ${externalSlotCount === 1 ? 'slot' : 'slots'} for generalization on unseen problems`);
  }

  const explanation = `Today's Allocation (Capacity: ${capacity}): ` + explanationParts.join(', ') + '.';

  return {
    capacity,
    completedCount: 0, // frontend tracks today's completed attempts
    reviewProblems: selectedReviews,
    freshProblems: selectedFresh,
    externalSlots,
    explanation,
    summary: {
      dueReviewsCount: totalDueCount,
      freshAvailableCount: totalFreshAvailable,
      allocatedReviews: reviewSlotCount,
      allocatedFresh: freshSlotCount,
      allocatedExternal: externalSlotCount,
    },
  };
}
