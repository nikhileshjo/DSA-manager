import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { SCHEMA_SQL } from '../server/db/schema.js';
import { getOrCreateTag } from '../server/routes/tags.js';

describe('Data Integrity & Database Operations', () => {
  let db;

  beforeEach(() => {
    db = new Database(':memory:');
    db.exec(SCHEMA_SQL);
  });

  afterEach(() => {
    db.close();
  });

  it('prevents duplicate tags with case-insensitive matching', () => {
    const id1 = getOrCreateTag(db, 'Heap');
    const id2 = getOrCreateTag(db, 'heap');
    const id3 = getOrCreateTag(db, 'HEAP');

    expect(id1).toEqual(id2);
    expect(id2).toEqual(id3);

    const totalTags = db.prepare("SELECT COUNT(*) as count FROM tags").get().count;
    expect(totalTags).toBe(1);
  });

  it('maintains independent problem tags and solution tags', () => {
    // Problem
    db.prepare("INSERT INTO problems (id, title, difficulty) VALUES (1, 'Find Median from Data Stream', 'hard')").run();

    const tagHeap = getOrCreateTag(db, 'Heap');
    const tagBST = getOrCreateTag(db, 'Balanced BST');

    // Attach Heap tag to problem
    db.prepare("INSERT INTO problem_tags (problem_id, tag_id) VALUES (1, ?)").run(tagHeap);

    // Solution
    const solInfo = db.prepare("INSERT INTO solutions (problem_id, title) VALUES (1, 'Balanced BST approach')").run();
    const solId = solInfo.lastInsertRowid;

    // Attach Balanced BST tag to solution
    db.prepare("INSERT INTO solution_tags (solution_id, tag_id) VALUES (?, ?)").run(solId, tagBST);

    const probTags = db.prepare("SELECT tag_id FROM problem_tags WHERE problem_id = 1").all();
    const solTags = db.prepare("SELECT tag_id FROM solution_tags WHERE solution_id = ?").all(solId);

    expect(probTags).toEqual([{ tag_id: tagHeap }]);
    expect(solTags).toEqual([{ tag_id: tagBST }]);
  });

  it('preserves attempt history without overwriting previous attempts', () => {
    db.prepare("INSERT INTO problems (id, title, difficulty) VALUES (1, 'Kth Largest', 'medium')").run();

    db.prepare("INSERT INTO attempts (problem_id, attempt_type, result, notes) VALUES (1, 'fresh', 'struggled', 'First attempt')").run();
    db.prepare("INSERT INTO attempts (problem_id, attempt_type, result, notes) VALUES (1, 'review', 'comfortable', 'Second attempt')").run();

    const attempts = db.prepare("SELECT * FROM attempts WHERE problem_id = 1 ORDER BY id ASC").all();
    expect(attempts).toHaveLength(2);
    expect(attempts[0].result).toBe('struggled');
    expect(attempts[1].result).toBe('comfortable');
  });

  it('detects duplicate problems by URL, Book details, or Title', async () => {
    const { findDuplicateProblem } = await import('../server/routes/problems.js');

    // Create problem 1: URL source
    db.prepare("INSERT INTO problems (title, difficulty, source_type, source_url) VALUES ('Two Sum', 'easy', 'leetcode', 'https://leetcode.com/problems/two-sum')").run();

    // Duplicate URL check
    const dupUrl = findDuplicateProblem(db, {
      title: 'Different Title',
      source_type: 'leetcode',
      source_url: 'https://leetcode.com/problems/two-sum/',
    });
    expect(dupUrl.isDuplicate).toBe(true);
    expect(dupUrl.existingProblem.title).toBe('Two Sum');

    // Create problem 2: Book source
    db.prepare("INSERT INTO problems (title, difficulty, source_type, book_name, book_page, book_problem_number) VALUES ('CCI 4.1 Route Between Nodes', 'medium', 'book', 'Cracking the Coding Interview', '108', '4.1')").run();

    // Duplicate Book check
    const dupBook = findDuplicateProblem(db, {
      title: 'Another Name',
      source_type: 'book',
      book_name: 'Cracking the Coding Interview',
      book_page: '108',
      book_problem_number: '4.1',
    });
    expect(dupBook.isDuplicate).toBe(true);

    // Duplicate Title check
    const dupTitle = findDuplicateProblem(db, {
      title: 'two sum',
      source_type: 'other',
    });
    expect(dupTitle.isDuplicate).toBe(true);
  });
});
