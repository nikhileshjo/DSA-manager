# Build: Personal DSA Practice Tracker

Build a personal DSA practice management application.

The purpose is to help me improve actual DSA problem-solving ability through a combination of:

1. Spaced repetition of problems I've already attempted.
2. Regular exposure to fresh problems.
3. External/random problems that I manually choose.
4. Tracking of problem difficulty, performance, topics/tags, sources, and solutions.
5. User-controlled daily practice capacity.

The system should optimize for **actual problem-solving ability**, not merely remembering a fixed collection of known problems.

---

# 1. First inspect the repository

Before implementing anything, inspect the existing repository.

Determine:

* Programming language
* Framework
* Existing architecture
* Existing dependencies
* Existing database setup
* Existing UI
* Build system
* Test framework

If the repository already contains an application, integrate into it instead of rewriting unrelated code.

If repository is empty, choose a simple, lightweight stack appropriate for a local personal application.

Keep architecture simple. This is a personal tool, not a production SaaS application.

Before making major architectural choices, briefly explain the proposed architecture and then implement it.

---

# 2. Problem model

Each problem represents a DSA problem that I have added to my personal database.

Store:

* `id`
* `title`
* `difficulty`
* `source_type`
* `source_url`
* `book_name`
* `book_page`
* `book_problem_number`
* `created_at`

Difficulty is manually assigned by me:

```text
easy
medium
hard
```

This represents **how difficult I feel the problem is**, not how well I performed on it.

A problem may come from:

* LeetCode
* Codeforces
* HackerRank
* A book
* Any arbitrary URL
* Any other source

For books, support:

```text
Book name
Page
Problem number
```

For online sources, support:

```text
Source URL
```

Do not require irrelevant fields.

---

# 3. Tags

Problems must support multiple reusable tags.

Examples:

```text
Array
String
Hash Map
Stack
Queue
Heap
Priority Queue
Binary Tree
BST
Graph
BFS
DFS
Dynamic Programming
Greedy
Binary Search
Two Pointers
Sliding Window
Recursion
Backtracking
```

Tags describe the concepts/data structures involved in the problem.

A problem can have any number of tags, including zero.

Tags must be reusable.

Use a normalized many-to-many relationship:

```text
problems
tags
problem_tags
```

Do NOT store tags as comma-separated strings.

Tags should be:

* Searchable
* Filterable
* Addable
* Editable
* Deletable

Avoid duplicate tags caused by capitalization differences:

```text
heap
Heap
HEAP
```

These should represent one tag.

---

# 4. Solutions

A problem can have **zero or more solution links**.

Examples:

* LeetCode editorial
* YouTube explanation
* NeetCode video
* Blog post
* Alternative solution
* Personal notes
* Any other URL

Each solution should store:

* `id`
* `problem_id`
* `title`
* `url`
* optional `notes`
* `created_at`

A solution has its own tags.

This is important.

**Problem tags and solution tags are independent.**

Example:

```text
Problem:
Find Median from Data Stream

Problem tags:
- Heap
- Priority Queue

Solution 1:
Two Heaps

Tags:
- Heap
- Two Heaps

Solution 2:
Balanced BST

Tags:
- Balanced BST
- Ordered Set
```

Model this as:

```text
problems
    │
    ├── problem_tags ──> tags
    │
    └── solutions
            │
            └── solution_tags ──> tags
```

Use a many-to-many relationship for solution tags as well.

A solution's tags must not automatically inherit problem tags.

---

# 5. Attempt history

Never overwrite previous attempts.

Every time I attempt a problem, create an attempt record.

Store:

* `id`
* `problem_id`
* `attempted_at`
* `result`
* optional notes
* optional time spent

Result should support:

```text
failed
needed_hints
struggled
comfortable
trivial
```

The distinction is important:

```text
Difficulty:
How difficult I think the problem is.

Result:
How well I performed when attempting it.
```

Example:

```text
Difficulty: hard
Result: comfortable
```

or:

```text
Difficulty: easy
Result: failed
```

Keep complete attempt history.

---

# 6. Spaced repetition

Problems that I have already attempted should eventually become due for review.

Implement a simple, transparent SRS algorithm initially.

Suggested initial intervals:

```text
failed        -> 1 day
needed_hints  -> 2 days
struggled     -> 4 days
comfortable   -> 10 days
trivial       -> 21 days
```

Repeated successful attempts should gradually increase the interval.

Poor performance should reduce/reset the interval.

Store scheduling state separately from attempt history:

```text
problem_id
last_review
interval
next_review
```

The scheduling algorithm must be isolated into its own module/service.

It must be independently testable.

Do not tightly couple scheduling logic to UI.

Design it so a more sophisticated algorithm can replace it later.

---

# 7. Daily practice capacity

I must be able to choose how many problems I want to do each day.

Example:

```text
Daily capacity: 5
```

The system must generate **at most that many problems**.

Allow me to change this setting.

Examples:

```text
3 problems/day
5 problems/day
8 problems/day
10 problems/day
```

The exact UI is up to you.

Persist the setting.

---

# 8. Daily practice composition

Daily practice should combine:

### A. Review problems

Problems whose `next_review` is today or overdue.

### B. Fresh problems

Problems in my database that I have **never attempted before**.

### C. External problem slots

Occasionally instruct me to manually pick an unseen problem from an external source.

Example:

```text
EXTERNAL PROBLEM

Pick 1 random unsolved problem
from LeetCode or another source.
```

IMPORTANT:

The application should NOT:

* Scrape LeetCode
* Call LeetCode APIs
* Maintain an external problem catalog
* Automatically retrieve external problems
* Automatically select an external problem

I will manually choose the external problem.

This is intentional.

The application only decides that an external-problem slot should exist.

---

# 9. Daily allocation

Do not use a rigid fixed ratio.

Allocation should adapt.

Example:

```text
Daily capacity = 5
Reviews due = 1

1 review
3 fresh
1 external
```

Another day:

```text
Daily capacity = 5
Reviews due = 10

3 reviews
1 fresh
1 external
```

Another day:

```text
Daily capacity = 5
Reviews due = 0

3 fresh
2 external
```

The exact allocation algorithm should be simple and configurable.

CRITICAL:

**Review backlog must not permanently consume 100% of daily practice.**

Always try to preserve some exposure to fresh/external problems.

The system should explain why today's problems were selected.

For example:

```text
2 reviews due
2 fresh problems for weak topics
1 external problem for generalization
```

---

# 10. Fresh-problem selection

Fresh problems are problems already in my database that have never been attempted.

Selection should consider:

* Weak topics/tags
* Underrepresented topics/tags
* Time since topic/tag was last practiced
* Difficulty
* Some exploration/randomness

Example:

```text
Fresh performance:

Heap          40%
Binary Tree   55%
Graph         78%
Arrays        85%
```

Fresh-problem selection should favor:

```text
Heap
Binary Tree
```

but should NOT exclusively select weak topics forever.

Maintain exploration.

The system should prevent the practice set from becoming a collection of only familiar problems.

---

# 11. Generalization vs retention

This is a core requirement.

Track performance separately for:

```text
Review problems
Fresh problems
External problems
```

A high review success rate must NOT automatically mean mastery.

Example:

```text
Review solve rate: 91%
Fresh solve rate: 54%
```

This should indicate that I may be remembering known problems better than I am generalizing the underlying concepts.

Track statistics such as:

* Review solve rate
* Fresh solve rate
* External solve rate
* Fresh solve rate by tag
* Review solve rate by tag
* Number of fresh problems attempted
* Number of reviews completed
* Problems repeatedly failed
* Weak tags
* Strong tags

Use these statistics to improve future fresh-problem selection.

---

# 12. External problem handling

When an external slot appears, display something simple:

```text
EXTERNAL PROBLEM

Pick 1 random unsolved problem
from LeetCode or another external source.

Do not look at the solution first.
```

After I solve it, allow me to optionally add it to the database.

If I add it:

```text
Title
Source
URL
Difficulty
Tags
Solutions
```

Then it becomes a normal tracked problem.

If I don't add it, it does not enter the SRS database.

Do not make external-problem management more complicated than this.

---

# 13. Main daily practice screen

Create a clear daily practice screen.

Example:

```text
TODAY'S PRACTICE

Capacity: 5
Completed: 2

REVIEW

1. Binary Search
   Easy
   Tags: Binary Search, Arrays
   Due today

2. Knapsack
   Hard
   Tags: Dynamic Programming
   Due today

FRESH

3. Tree Diameter
   Medium
   Tags: Binary Tree, DFS
   New

4. Sliding Window
   Medium
   Tags: Arrays, Two Pointers
   New

EXTERNAL

5. Pick 1 random unsolved problem
   from LeetCode or another source
```

Clicking a problem should open its details.

After completing it, quickly select:

```text
Failed
Needed hints
Struggled
Comfortable
Trivial
```

Then the system automatically updates its scheduling state.

---

# 14. Problem detail page

Problem detail should show:

```text
Title
Difficulty
Tags
Source
Attempt history
Current SRS status
Next review
Solutions
```

Example:

```text
Kth Smallest Element in BST

Difficulty:
Hard

Tags:
[Binary Tree] [BST] [DFS] [Inorder]

Source:
LeetCode

Next review:
September 10

Attempts:
Sep 2 — Struggled
Aug 29 — Needed hints

Solutions:

NeetCode
Tags: [BST] [DFS] [Inorder]

Alternative approach
Tags: [Balanced BST]
```

---

# 15. Problem management

Implement:

* Add problem
* Edit problem
* Delete problem
* Search problems
* Filter problems
* View problem details

Filters should include:

* Tags
* Difficulty
* Source
* Due status
* Attempted/unattempted
* Review/fresh status

---

# 16. Solution management

For each problem:

* Add solution
* Edit solution
* Delete solution
* Open solution URL
* Add/remove solution tags
* Add solution notes

Do not automatically open solution links during practice.

Solutions are reference material, not part of the problem selection process.

---

# 17. Statistics/dashboard

Create a basic statistics view.

At minimum show:

```text
Problems in database
Problems attempted
Fresh problems attempted
Reviews completed
External problems completed
Problems currently due
Current daily capacity

Review solve rate
Fresh solve rate
External solve rate
```

Also provide tag-level statistics.

Example:

```text
TAG PERFORMANCE

Binary Tree
Fresh: 62%
Review: 91%

Heap
Fresh: 41%
Review: 84%

Graph
Fresh: 73%
Review: 88%
```

---

# 18. Database design

Use a normalized relational database, preferably SQLite for a local application.

Suggested structure:

```text
problems
    id
    title
    difficulty
    source_type
    source_url
    book_name
    book_page
    book_problem_number
    created_at

tags
    id
    name

problem_tags
    problem_id
    tag_id

solutions
    id
    problem_id
    title
    url
    notes
    created_at

solution_tags
    solution_id
    tag_id

attempts
    id
    problem_id
    attempted_at
    result
    notes
    time_spent

scheduling
    problem_id
    last_review
    interval
    next_review

settings
    key
    value
```

Use foreign keys.

Add appropriate indexes.

Use schema migrations/versioning if appropriate.

Store timestamps consistently.

---

# 19. Architecture

Keep these components separate:

```text
Database
    ↓
Domain models
    ↓
SRS scheduler
    ↓
Practice allocator
    ↓
Fresh-problem selector
    ↓
UI
```

SRS scheduler should answer:

```text
When should this problem appear again?
```

Practice allocator should answer:

```text
What should I practice today given my capacity?
```

Fresh selector should answer:

```text
Which unattempted database problems are most useful right now?
```

External selection should NOT answer anything. It simply creates an external-practice slot.

Keep business logic independent from UI.

---

# 20. Tests

Write unit tests for core logic.

At minimum test:

### SRS

* Failed → 1-day review
* Needed hints → 2-day review
* Struggled → 4-day review
* Comfortable → 10-day review
* Trivial → 21-day review
* Repeated success increases intervals
* Poor performance reduces/resets intervals

### Practice allocation

* Never exceeds daily capacity
* Due problems appear
* Fresh problems appear
* External slots can appear
* Review backlog cannot consume all capacity
* Allocation changes when capacity changes
* Handles zero due reviews
* Handles zero fresh problems
* Handles empty database

### Fresh selection

* Never selects already-attempted problems as fresh
* Weak tags receive higher priority
* Underrepresented tags receive attention
* Exploration/randomness remains possible

### Data integrity

* Attempt history is preserved
* Deleting/editing problem behaves correctly
* Tags are reusable
* Duplicate tags are prevented
* Multiple solutions per problem work
* Multiple tags per solution work
* Problem and solution tags remain independent

---

# 21. Documentation

Create **easy-to-follow documentation for me as the user**.

Do not write documentation only for developers.

At minimum create:

```text
README.md
docs/
    getting-started.md
    user-guide.md
    scheduling.md
    architecture.md
```

Documentation should explain:

### Getting started

* Prerequisites
* Installation
* Build commands
* Run commands
* Database location
* First-time setup

### User guide

Explain step-by-step:

1. Add first problem.
2. Add tags.
3. Add solution links.
4. Start today's practice.
5. Record result after solving.
6. Understand when a problem will return.
7. Change daily capacity.
8. Handle external-problem slots.
9. Add an external problem to the database afterward.
10. View statistics.

Use concrete examples.

### Scheduling explanation

Explain in plain language:

* What review means.
* What fresh means.
* What external means.
* How intervals work.
* How performance affects scheduling.
* How fresh-problem selection works.
* Why fresh problems are necessary.

### Architecture documentation

Explain implementation details for future maintenance.

Include:

* Database schema
* Important modules
* SRS algorithm
* Daily allocation algorithm
* Fresh selection algorithm
* How to run tests
* How to modify scheduling rules

Documentation should be accurate to the implementation.

Do not document features that don't exist.

---

# 22. UI principles

Keep UI simple and functional.

Prioritize:

1. Today's practice
2. Quickly recording results
3. Adding problems
4. Reviewing problem history
5. Finding/filtering problems
6. Understanding why a problem was selected

Avoid unnecessary dashboards, animations, gamification, social features, accounts, cloud sync, etc.

This is a personal tool.

---

# 23. Important design constraints

Do NOT:

* Scrape external websites.
* Build LeetCode integration.
* Build an external problem catalog.
* Automatically retrieve external problems.
* Automatically select external problems.
* Replace attempt history with current state.
* Treat difficulty as performance.
* Let review problems completely eliminate fresh/external practice.
* Overengineer the SRS algorithm.
* Add unnecessary infrastructure.

The external-problem workflow is intentionally manual:

```text
System:
"Pick 1 random unsolved problem externally."

Me:
Finds problem manually.

Me:
Solves problem.

Me:
Optionally adds problem to system.
```

---

# 24. Implementation strategy

Build in incremental stages:

### Stage 1

Database + models.

### Stage 2

Problem CRUD + tags + solutions.

### Stage 3

Attempt history.

### Stage 4

SRS scheduler.

### Stage 5

Daily capacity and practice allocation.

### Stage 6

Fresh-problem selection.

### Stage 7

External-practice slots.

### Stage 8

Statistics.

### Stage 9

Tests.

### Stage 10

Documentation and polish.

After each major stage, verify existing functionality still works.

Do not stop at scaffolding. Implement a working end-to-end application.

---

# 25. Docker / Environment Isolation

The application must run entirely inside Docker containers.

**Do not install project dependencies directly on the host machine.**

If dependencies, runtimes, libraries, databases, build tools, package managers, or other software are required for the application, install/use them inside Docker.

Requirements:

* Provide a `Dockerfile`.
* Provide a `docker-compose.yml` / `compose.yaml` if multiple services are needed.
* Keep the host environment clean.
* Do not require installing Node.js, Python, C++, Java, SQLite CLI, package managers, etc. directly on the host unless absolutely unavoidable.
* Dependency installation must happen during Docker image build or container startup.
* Application should be runnable with a simple Docker command.
* Tests should also be runnable inside Docker.
* Database/storage should be persisted using Docker volumes or a clearly documented bind mount.
* Source code should be mounted appropriately for development if useful.
* Avoid unnecessary containers/services. If the application can use SQLite inside one container, prefer that over adding a separate database container.
* Do not introduce Kubernetes or other orchestration complexity.

Document the complete workflow.

For example, aim for:

```bash
docker compose build
docker compose up
```

and:

```bash
docker compose run --rm app test
```

Use the actual commands appropriate for the chosen stack.

## Docker documentation

The user documentation must clearly explain:

1. Docker prerequisites.
2. How to build the application.
3. How to start it.
4. How to stop it.
5. How to run tests.
6. Where the SQLite database/data is stored.
7. How data persists when containers are recreated.
8. How to update/rebuild after code changes.
9. How to completely remove the application's containers/images/volumes if desired.

The README should make clear that **all application dependencies run inside Docker**, keeping the host environment clean.

---

# Final acceptance criteria

Consider the project complete only when I can:

1. Add a DSA problem.
2. Give it Easy/Medium/Hard difficulty.
3. Add multiple tags.
4. Add one or more source references.
5. Add multiple solution links.
6. Give each solution its own tags.
7. Attempt the problem.
8. Record how the attempt went.
9. See the problem automatically scheduled for future review.
10. Set how many problems I want to practice each day.
11. Get a daily practice list containing appropriate reviews and fresh problems.
12. Get occasional external-problem instructions.
13. Practice external problems without the system needing external APIs.
14. Optionally add external problems afterward.
15. See separate fresh/review performance.
16. See weak/strong tags.
17. Search and filter my problem collection.
18. Run the test suite.
19. Follow the documentation from a clean checkout and successfully build/run the application.

Build the complete working application now.


DO NOT INSTALL ANYTHING