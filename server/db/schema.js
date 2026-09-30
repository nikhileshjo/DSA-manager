export const SCHEMA_SQL = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS problems (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK(difficulty IN ('easy', 'medium', 'hard')),
  source_type TEXT NOT NULL DEFAULT 'other',
  source_url TEXT,
  book_name TEXT,
  book_page TEXT,
  book_problem_number TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE COLLATE NOCASE
);

CREATE TABLE IF NOT EXISTS problem_tags (
  problem_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY (problem_id, tag_id),
  FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS solutions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  problem_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  url TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS solution_tags (
  solution_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY (solution_id, tag_id),
  FOREIGN KEY (solution_id) REFERENCES solutions(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS problem_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  problem_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  problem_id INTEGER,
  attempt_type TEXT NOT NULL DEFAULT 'database' CHECK(attempt_type IN ('review', 'fresh', 'external', 'database')),
  attempted_at TEXT NOT NULL DEFAULT (datetime('now')),
  result TEXT NOT NULL CHECK(result IN ('failed', 'needed_hints', 'struggled', 'comfortable', 'trivial')),
  notes TEXT,
  time_spent INTEGER,
  FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS scheduling (
  problem_id INTEGER PRIMARY KEY,
  last_review TEXT,
  interval INTEGER NOT NULL DEFAULT 1,
  next_review TEXT NOT NULL,
  FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_problems_difficulty ON problems(difficulty);
CREATE INDEX IF NOT EXISTS idx_scheduling_next_review ON scheduling(next_review);
CREATE INDEX IF NOT EXISTS idx_attempts_problem_id ON attempts(problem_id);
CREATE INDEX IF NOT EXISTS idx_attempts_attempt_type ON attempts(attempt_type);
CREATE INDEX IF NOT EXISTS idx_problem_comments_problem_id ON problem_comments(problem_id);
`;
