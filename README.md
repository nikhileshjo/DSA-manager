# Personal DSA Practice Tracker

A personal Data Structures & Algorithms practice management application designed to optimize actual problem-solving ability through spaced repetition (SRS), weak topic prioritization, external problem generalization slots, and user-controlled daily practice capacity.

---

## Key Features

1. **Spaced Repetition System (SRS)**:
   - Automated review scheduling based on attempt performance (`Failed` 1d, `Needed hints` 2d, `Struggled` 4d, `Comfortable` 10d, `Trivial` 21d).
   - Interval expansion on repeated success; interval resets on poor performance.

2. **Adaptive Daily Practice Capacity**:
   - User-configurable daily practice capacity (e.g. 3, 5, 8, 10 problems/day).
   - Dynamically balances **Due Reviews**, **Fresh Database Problems** (weak-topic prioritized), and **External Practice Slots**.
   - Review backlog cap ensures review backlog never consumes 100% of daily practice.

3. **Retention vs Generalization Analytics**:
   - Tracks **Review Solve Rate**, **Fresh Solve Rate**, and **External Solve Rate** separately.
   - Detects when high review success rate might indicate solution memorization rather than concept generalization.
   - Detailed tag-level performance breakdown (Weak & Strong topics).

4. **Normalized Database Schema & Interactive Tag Selector**:
   - Interactive dropdown tag selector for choosing existing tags or adding new ones on-the-fly.
   - Pre-seeded standard DSA tags (`Array`, `Heap`, `Binary Tree`, `Dynamic Programming`, `Sliding Window`, etc.) to prevent tag spelling duplicates.
   - Many-to-many relationship for problem tags (`problems` ↔ `tags`).
   - Multiple solutions per problem (`solutions` ↔ `tags`) with **independent solution tags** that do not force inherit problem tags.
   - Complete, append-only attempt history.

5. **Duplicate Problem Prevention**:
   - Automatically checks for duplicate entries by **Source URL**, **Book details** (Book name + Page + Problem #), or **Exact Title**.
   - Displays a warning banner with options to *"View Existing Problem"* or *"Add Anyway (Force Create)"*.

6. **External Problem Workflow**:
   - Explicit manual external slot instruction ("Pick 1 random unsolved problem from LeetCode or another source").
   - Record attempt result and optionally import into database as a tracked problem.

6. **100% Docker Containerized**:
   - Runs entirely inside Docker keeping your host system clean.
   - SQLite database volume persistence.

---

## Quick Start (Docker)

### Prerequisites
- Docker Engine (version 20+)
- Docker Compose (v2+)

### Run Application
Build and start the application container:

```bash
docker compose build
docker compose up -x
# Or detached mode:
docker compose up -d
```

Open your browser and navigate to:
**`http://localhost:3000`**

### Run Unit Tests
Run the test suite inside the isolated Docker environment:

```bash
docker compose run --rm app npm test
```

### Stop Application
```bash
docker compose down
```

---

## Documentation

Comprehensive user and architecture documentation is available in `docs/`:

- [Getting Started](docs/getting-started.md): Installation, Docker commands, volume persistence, first-time setup.
- [User Guide](docs/user-guide.md): Step-by-step workflow guide with concrete examples.
- [Scheduling Explanation](docs/scheduling.md): Plain-language guide to SRS intervals, fresh selection, and review backlog cap.
- [Architecture & Schema](docs/architecture.md): Database schema breakdown, module isolation, API routes, and customization guide.
