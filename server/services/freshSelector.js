/**
 * Selects fresh (unattempted) problems from database based on weak/underrepresented tags
 * while preserving exploration randomness.
 */
export function selectFreshProblems(db, limit = 1) {
  if (limit <= 0) return [];

  // Get all problems that have never been attempted
  const unattemptedProblems = db.prepare(`
    SELECT p.* 
    FROM problems p
    WHERE p.id NOT IN (
      SELECT DISTINCT problem_id 
      FROM attempts 
      WHERE problem_id IS NOT NULL
    )
    ORDER BY p.id ASC
  `).all();

  if (unattemptedProblems.length === 0) {
    return [];
  }

  // Calculate tag scores (weakness & underrepresentation)
  // Get all attempts with problem_tags
  const tagStats = db.prepare(`
    SELECT 
      pt.tag_id,
      t.name as tag_name,
      COUNT(a.id) as total_attempts,
      SUM(CASE WHEN a.result IN ('comfortable', 'trivial') THEN 1 ELSE 0 END) as successful_attempts,
      AVG(CASE 
        WHEN a.result = 'trivial' THEN 1.0
        WHEN a.result = 'comfortable' THEN 0.8
        WHEN a.result = 'struggled' THEN 0.5
        WHEN a.result = 'needed_hints' THEN 0.2
        WHEN a.result = 'failed' THEN 0.0
      END) as avg_score
    FROM tags t
    JOIN problem_tags pt ON pt.tag_id = t.id
    LEFT JOIN attempts a ON a.problem_id = pt.problem_id
    GROUP BY t.id
  `).all();

  const tagScoresMap = {};
  for (const stat of tagStats) {
    if (stat.total_attempts === 0) {
      // Underrepresented tag bonus
      tagScoresMap[stat.tag_id] = 0.85;
    } else {
      // Weakness score: lower score on past attempts means higher priority
      const weakness = 1.0 - (stat.avg_score || 0);
      tagScoresMap[stat.tag_id] = Math.min(1.0, Math.max(0.1, weakness));
    }
  }

  // Get problem tags map for unattempted problems
  const problemTags = db.prepare(`
    SELECT pt.problem_id, pt.tag_id, t.name
    FROM problem_tags pt
    JOIN tags t ON t.id = pt.tag_id
  `).all();

  const problemTagsMap = {};
  for (const row of problemTags) {
    if (!problemTagsMap[row.problem_id]) {
      problemTagsMap[row.problem_id] = [];
    }
    problemTagsMap[row.problem_id].push(row);
  }

  // Score each unattempted problem
  const scoredProblems = unattemptedProblems.map((prob) => {
    const tags = problemTagsMap[prob.id] || [];
    let tagScoreSum = 0;
    if (tags.length > 0) {
      tagScoreSum = tags.reduce((acc, t) => acc + (tagScoresMap[t.tag_id] || 0.7), 0) / tags.length;
    } else {
      tagScoreSum = 0.5; // neutral score for untagged problems
    }

    // Add exploration factor (random weight between 0 and 0.4)
    const exploration = Math.random() * 0.4;
    const finalScore = tagScoreSum + exploration;

    return {
      ...prob,
      tags: tags.map(t => ({ id: t.tag_id, name: t.name })),
      selectionScore: finalScore,
    };
  });

  // Sort descending by finalScore
  scoredProblems.sort((a, b) => b.selectionScore - a.selectionScore);

  return scoredProblems.slice(0, limit);
}
