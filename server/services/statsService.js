/**
 * Calculates retention vs generalization metrics, tag-level stats, and problem counts.
 */
export function calculateStatistics(db, currentDate = new Date()) {
  const dateStr = typeof currentDate === 'string'
    ? currentDate
    : currentDate.toISOString().split('T')[0];

  // 1. Core Counts
  const totalProblems = db.prepare("SELECT COUNT(*) as count FROM problems").get().count;
  const problemsAttempted = db.prepare("SELECT COUNT(DISTINCT problem_id) as count FROM attempts WHERE problem_id IS NOT NULL").get().count;
  
  const dueReviewsCount = db.prepare("SELECT COUNT(*) as count FROM scheduling WHERE next_review <= ?").get(dateStr).count;
  
  const capacityRow = db.prepare("SELECT value FROM settings WHERE key = 'daily_capacity'").get();
  const dailyCapacity = capacityRow ? parseInt(capacityRow.value, 10) : 5;

  // 2. Attempt counts by attempt_type
  const attemptsByType = db.prepare(`
    SELECT 
      attempt_type,
      COUNT(*) as total_attempts,
      SUM(CASE WHEN result IN ('comfortable', 'trivial') THEN 1 ELSE 0 END) as solve_count
    FROM attempts
    GROUP BY attempt_type
  `).all();

  const typeStats = {
    review: { total: 0, solved: 0, rate: 0 },
    fresh: { total: 0, solved: 0, rate: 0 },
    external: { total: 0, solved: 0, rate: 0 },
    database: { total: 0, solved: 0, rate: 0 },
  };

  for (const row of attemptsByType) {
    const type = row.attempt_type || 'database';
    const total = row.total_attempts || 0;
    const solved = row.solve_count || 0;
    const rate = total > 0 ? Math.round((solved / total) * 100) : 0;
    typeStats[type] = { total, solved, rate };
  }

  // 3. Tag-Level Statistics (Fresh vs Review solve rates per tag)
  const tagsStatsQuery = db.prepare(`
    SELECT 
      t.id as tag_id,
      t.name as tag_name,
      COUNT(CASE WHEN a.attempt_type = 'fresh' THEN 1 END) as fresh_total,
      SUM(CASE WHEN a.attempt_type = 'fresh' AND a.result IN ('comfortable', 'trivial') THEN 1 ELSE 0 END) as fresh_solved,
      COUNT(CASE WHEN a.attempt_type = 'review' THEN 1 END) as review_total,
      SUM(CASE WHEN a.attempt_type = 'review' AND a.result IN ('comfortable', 'trivial') THEN 1 ELSE 0 END) as review_solved,
      COUNT(a.id) as overall_total,
      SUM(CASE WHEN a.result IN ('comfortable', 'trivial') THEN 1 ELSE 0 END) as overall_solved
    FROM tags t
    LEFT JOIN problem_tags pt ON pt.tag_id = t.id
    LEFT JOIN attempts a ON a.problem_id = pt.problem_id
    GROUP BY t.id
    HAVING overall_total > 0
    ORDER BY t.name ASC
  `).all();

  const tagLevelStats = tagsStatsQuery.map(row => {
    const freshTotal = row.fresh_total || 0;
    const freshSolved = row.fresh_solved || 0;
    const freshRate = freshTotal > 0 ? Math.round((freshSolved / freshTotal) * 100) : null;

    const reviewTotal = row.review_total || 0;
    const reviewSolved = row.review_solved || 0;
    const reviewRate = reviewTotal > 0 ? Math.round((reviewSolved / reviewTotal) * 100) : null;

    const overallTotal = row.overall_total || 0;
    const overallSolved = row.overall_solved || 0;
    const overallRate = overallTotal > 0 ? Math.round((overallSolved / overallTotal) * 100) : 0;

    return {
      tagId: row.tag_id,
      tagName: row.tag_name,
      freshTotal,
      freshSolved,
      freshRate,
      reviewTotal,
      reviewSolved,
      reviewRate,
      overallTotal,
      overallSolved,
      overallRate,
    };
  });

  // Weak and strong tags based on fresh/overall rate
  const weakTags = [...tagLevelStats]
    .filter(t => t.overallTotal >= 1)
    .sort((a, b) => (a.overallRate) - (b.overallRate))
    .slice(0, 5);

  const strongTags = [...tagLevelStats]
    .filter(t => t.overallTotal >= 1)
    .sort((a, b) => (b.overallRate) - (a.overallRate))
    .slice(0, 5);

  // 4. Repeatedly failed problems (problems with 2 or more 'failed' or 'needed_hints' attempts)
  const repeatedlyFailedProblems = db.prepare(`
    SELECT 
      p.id, p.title, p.difficulty,
      COUNT(a.id) as fail_count
    FROM problems p
    JOIN attempts a ON a.problem_id = p.id
    WHERE a.result IN ('failed', 'needed_hints')
    GROUP BY p.id
    HAVING fail_count >= 2
    ORDER BY fail_count DESC
  `).all();

  // 5. Retention vs Generalization Insight Notice
  let generalizationInsight = null;
  if (typeStats.review.total >= 3 && typeStats.fresh.total >= 3) {
    const diff = typeStats.review.rate - typeStats.fresh.rate;
    if (diff > 25) {
      generalizationInsight = `Warning: High Review Solve Rate (${typeStats.review.rate}%) vs Fresh Solve Rate (${typeStats.fresh.rate}%). You may be memorizing past solutions rather than generalizing underlying concepts. Focus on Fresh and External problem slots!`;
    } else if (typeStats.fresh.rate >= 70) {
      generalizationInsight = `Great balance! Your Fresh Solve Rate is strong (${typeStats.fresh.rate}%), showing high problem-solving generalization across unseen problems.`;
    }
  }

  return {
    overview: {
      totalProblems,
      problemsAttempted,
      freshAttempted: typeStats.fresh.total,
      reviewsCompleted: typeStats.review.total,
      externalCompleted: typeStats.external.total,
      dueReviewsCount,
      dailyCapacity,
    },
    solveRates: {
      reviewSolveRate: typeStats.review.rate,
      freshSolveRate: typeStats.fresh.rate,
      externalSolveRate: typeStats.external.rate,
      reviewStats: typeStats.review,
      freshStats: typeStats.fresh,
      externalStats: typeStats.external,
    },
    generalizationInsight,
    tagLevelStats,
    weakTags,
    strongTags,
    repeatedlyFailedProblems,
  };
}
