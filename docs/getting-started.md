# Getting Started Guide

This guide explains how to set up, run, test, and manage the Personal DSA Practice Manager application using Docker.

---

## 1. Prerequisites

The application is completely containerized. You **do not need** to install Node.js, SQLite CLI, C++ build tools, or package managers on your host machine.

Required on host machine:
- **Docker**: Version 20.10+
- **Docker Compose**: Version 2.0+

---

## 2. Docker Setup & Build Commands

### Step A: Clone / Navigate to Workspace
```bash
cd DSA-manager
```

### Step B: Build Docker Image
```bash
docker compose build
```

This compiles the Vite frontend SPA, installs production Node.js packages inside the multi-stage container, and pre-configures native SQLite drivers (`better-sqlite3`).

### Step C: Start Application
```bash
docker compose up
```

Once started, the server will output:
`DSA Practice Tracker server running on port 3000`

Access the web interface at:
**`http://localhost:3000`** (or `http://127.0.0.1:3000`)

To run in detached background mode:
```bash
docker compose up -d
```

---

## 3. Running Unit Tests

All unit tests for SRS scheduling, practice allocation, fresh selection, and database data integrity run inside Docker:

```bash
docker compose run --rm app npm test
```

Expected output:
- `srsScheduler.test.js`: 5 passed
- `practiceAllocator.test.js`: 4 passed
- `freshSelector.test.js`: 2 passed
- `db.test.js`: 3 passed

---

## 4. Database Location & Data Persistence

The application uses an embedded **SQLite** database (`dsa_manager.db`).

- **Inside Container Path**: `/app/data/dsa_manager.db`
- **Docker Volume Name**: `dsa_data` (mapped in `docker-compose.yml`)

### How Data Persists
Because the database file is stored inside the named Docker volume `dsa_data`, your problems, attempt histories, solution links, and settings **persist permanently across container restarts, rebuilds, and updates**.

### Resetting / Clearing Data (Optional)
If you ever want to completely wipe the database and start fresh:
```bash
docker compose down -v
```

### Backups (Export / Restore)
The application includes a **Backup & Restore** feature (Backup button in the navbar) so you can snapshot your entire database at any time:

- **Export**: Downloads one JSON file with all problems, tags, solutions, attempts, SRS schedules, and settings to your browser's download location.
- **Import**: Restores that JSON file on this computer or any other computer running DSA Manager.
- Importing wipes existing data; when data exists, the UI prompts you to export your current data first.

Backups are the recommended way to move your practice data between computers or to safeguard it before resetting the database.


---

## 5. Updating / Rebuilding Code

When modifying backend business logic or frontend React components:

```bash
docker compose build
docker compose up -d
```
