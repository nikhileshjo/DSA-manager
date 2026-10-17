# Architecture & Schema Documentation

This document describes the software architecture, database schema, domain modules, REST APIs, and Docker infrastructure.

---

## 1. System Architecture

```text
       ┌──────────────────────────────────────────────┐
       │                React SPA (Vite)              │
       └──────────────────────┬───────────────────────┘
                              │ REST API Requests
                              ▼
       ┌──────────────────────────────────────────────┐
       │                Express Server                │
       └──────┬───────────────┼───────────────┬───────┘
              │               │               │
              ▼               ▼               ▼
     ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
     │ srsScheduler │ │ practiceAlloc│ │ freshSelector│
     └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
            │                │                │
            └────────────────┼────────────────┘
                             ▼
              ┌──────────────────────────────┐
              │     SQLite Database          │
              │  (/app/data/sql_manager.db)  │
              └──────────────────────────────┘
```

---

## 2. Database Schema

The database uses SQLite with strict Foreign Keys (`PRAGMA foreign_keys = ON`).

### Table Entity Definitions

```sql
-- 1. Problems Table
CREATE TABLE problems (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK(difficulty IN ('easy', 'medium', 'hard')),
  source_type TEXT NOT NULL DEFAULT 'other',
  source_url TEXT,
  book_name TEXT,
  book_page TEXT,
  book_problem_number TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 2. Tags Table (Case-insensitive unique)
CREATE TABLE tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE COLLATE NOCASE
);

-- 3. Problem Tags Many-to-Many
CREATE TABLE problem_tags (
  problem_id INTEGER NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (problem_id, tag_id)
);

-- 4. Solutions Table
CREATE TABLE solutions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  problem_id INTEGER NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 5. Solution Tags Many-to-Many (Independent of problem_tags)
CREATE TABLE solution_tags (
  solution_id INTEGER NOT NULL REFERENCES solutions(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (solution_id, tag_id)
);

-- 6. Attempts Table (Append-only)
CREATE TABLE attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  problem_id INTEGER REFERENCES problems(id) ON DELETE CASCADE,
  attempt_type TEXT NOT NULL DEFAULT 'database' CHECK(attempt_type IN ('review', 'fresh', 'external', 'database')),
  attempted_at TEXT NOT NULL DEFAULT (datetime('now')),
  result TEXT NOT NULL CHECK(result IN ('failed', 'needed_hints', 'struggled', 'comfortable', 'trivial')),
  notes TEXT,
  time_spent INTEGER
);

-- 7. Scheduling Table
CREATE TABLE scheduling (
  problem_id INTEGER PRIMARY KEY REFERENCES problems(id) ON DELETE CASCADE,
  last_review TEXT,
  interval INTEGER NOT NULL DEFAULT 1,
  next_review TEXT NOT NULL
);

-- 8. Settings Table
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

---

## 3. Domain Service Modules

All business logic is isolated into pure, independently testable modules:

- **`server/services/srsScheduler.js`**: Calculates next interval and review date based on attempt result and interval history.
- **`server/services/practiceAllocator.js`**: Generates daily practice composition, balancing due reviews, weak fresh problems, and external practice slots.
- **`server/services/freshSelector.js`**: Prioritizes unattempted problems by analyzing tag performance history and exploration factors.
- **`server/services/statsService.js`**: Computes retention vs generalization metrics, solve rates, tag performance, and generalization warning insights.
- **`findDuplicateProblem` helper (`server/routes/problems.js`)**: Checks incoming problem submissions against existing database records using case-normalized URL matching, Book composite key (`book_name` + `book_page` + `book_problem_number`), and exact title matching.

---

## 4. REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/practice/today` | Fetch today's practice queue & composition |
| `POST` | `/api/practice/attempt` | Log attempt for practice item (database or external slot) |
| `GET` | `/api/problems` | Search and filter problem repository |
| `POST` | `/api/problems` | Add a new problem with tags |
| `GET` | `/api/problems/:id` | Get problem details, solutions, attempt history, SRS status |
| `PUT` | `/api/problems/:id` | Update problem details & tags |
| `DELETE` | `/api/problems/:id` | Delete problem |
| `POST` | `/api/problems/:id/attempts` | Log attempt directly for a problem |
| `POST` | `/api/problems/:id/solutions` | Add solution to problem with solution tags |
| `DELETE` | `/api/solutions/:id` | Delete solution |
| `GET` | `/api/tags` | List all tags with usage count |
| `GET` | `/api/stats` | Analytics dashboard metrics & generalization insights |
| `GET` | `/api/settings` | Get configuration settings |
| `PUT` | `/api/settings` | Update configuration settings |

---

## 5. Docker Infrastructure

- Multi-stage `Dockerfile`:
  - `builder`: Compiles native SQLite bindings (`better-sqlite3`) & builds Vite React bundle.
  - `runner`: Lightweight production image with SQLite runtime and static assets.
- Named Volume `sql_data` mounted at `/app/data/` for permanent database storage.
