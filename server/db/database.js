import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { SCHEMA_SQL } from './schema.js';

let dbInstance = null;

export function getDb(dbPathOverride = null) {
  if (dbInstance && !dbPathOverride) {
    return dbInstance;
  }

  const dbPath = dbPathOverride || process.env.DATABASE_PATH || path.resolve(process.cwd(), 'dsa_manager.db');
  
  // Ensure directory exists if path includes subfolder
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new Database(dbPath);
  db.pragma('foreign_keys = ON');
  db.exec(SCHEMA_SQL);

  // Migration: Ensure notes column exists in problems table for older databases
  try {
    const tableInfo = db.prepare("PRAGMA table_info(problems)").all();
    const hasNotes = tableInfo.some(col => col.name === 'notes');
    if (!hasNotes) {
      db.exec("ALTER TABLE problems ADD COLUMN notes TEXT");
    }
  } catch (err) {
    console.error('Migration notice:', err.message);
  }

  // Initialize default settings if not exists
  const getCapacity = db.prepare("SELECT value FROM settings WHERE key = 'daily_capacity'").get();
  if (!getCapacity) {
    db.prepare("INSERT INTO settings (key, value) VALUES ('daily_capacity', '5')").run();
  }

  // Seed standard DSA tags if tags table is empty
  const tagCount = db.prepare("SELECT COUNT(*) as count FROM tags").get().count;
  if (tagCount === 0) {
    const defaultTags = [
      'Array', 'String', 'Hash Map', 'Stack', 'Queue', 'Heap',
      'Priority Queue', 'Binary Tree', 'BST', 'Graph', 'BFS', 'DFS',
      'Dynamic Programming', 'Greedy', 'Binary Search', 'Two Pointers',
      'Sliding Window', 'Recursion', 'Backtracking'
    ];
    const insertTag = db.prepare("INSERT OR IGNORE INTO tags (name) VALUES (?)");
    const seedTx = db.transaction(() => {
      for (const tag of defaultTags) {
        insertTag.run(tag);
      }
    });
    seedTx();
  }

  if (!dbPathOverride) {
    dbInstance = db;
  }
  return db;
}

export function closeDb() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
