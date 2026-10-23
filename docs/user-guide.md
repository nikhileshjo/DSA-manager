# User Guide

This guide walks you through using the Personal Spark Practice Tracker step-by-step.

---

## Step 1: Add Your First Problem

1. Click the green **"+ Add Problem"** button in the navbar.
2. Fill in the problem details:
   - **Title**: e.g., `Binary Tree Zigzag Level Order Traversal`
   - **Difficulty**: Choose `Easy`, `Medium`, or `Hard` (this represents how difficult *you* feel the problem is).
   - **Source Type**: Select `LeetCode`, `Codeforces`, `HackerRank`, `Book`, or `URL`.
   - **Source Details**: Provide URL or Book details (Name, Page, Problem #).
3. **Select or Add Tags**: Click the tag input box to pick from existing database tags (e.g. `Array`, `Heap`, `Dynamic Programming`). If your desired tag does not exist, type its name and click `+ Add "[tag_name]" as a new tag`.
4. Click **"Create Problem"**.

> **Duplicate Problem Alert**: If you submit a problem with a URL, Book reference, or Title that already exists in your database, an alert banner will notify you. You can click *"View Existing Problem"* to see the original problem, or *"Add Anyway"* if you explicitly want to create another entry.

---

## Step 2: Add Solutions & Editorials

1. Navigate to the **Problems Library** tab or click on a problem title to open its Detail View.
2. Click **"Add Solution Link"**.
3. Enter:
   - **Title**: e.g., `Two Heaps Optimal Approach`
   - **URL**: Link to NeetCode video, LeetCode editorial, or blog post.
   - **Notes**: Key technical takeaways or code snippets.
   - **Solution Tags**: Independent tags specific to this solution approach (e.g., `Two Heaps, Priority Queue`).
4. Click **"Save Solution"**.

> **Independent Solution Tags**: Solution tags do *not* force-inherit problem tags. Solution 1 can have `Two Heaps` while Solution 2 has `Balanced BST`.

---

## Step 3: Configure Daily Practice Capacity

1. Click the **"Capacity: 5/day"** button in the navbar or top banner.
2. Select a daily capacity preset (`3`, `5`, `8`, `10`) or enter a custom number.
3. Click **"Save Capacity"**.

The application will adapt your daily practice list to never exceed this capacity.

---

## Step 4: Complete Today's Practice Queue

1. Open **"Today's Practice"** view.
2. Review the **Allocation Strategy Banner** explaining why today's items were chosen (e.g. `2 reviews due, 2 fresh problems for weak topics, 1 external slot for generalization`).
3. Solve each queued item:
   - For **Review Problems** or **Fresh Problems**: Click **"Record Attempt"** after solving.
   - Select your attempt performance:
     - `Failed`: Total block / could not solve (SRS resets to 1 day).
     - `Needed Hints`: Solved only with hints (SRS resets to 2 days).
     - `Struggled`: Solved with significant effort (SRS increases to 4+ days).
     - `Comfortable`: Clean optimal solution (SRS expands to 10+ days).
     - `Trivial`: Instant / trivial solution (SRS expands to 21+ days).
   - Add optional time spent (minutes) and notes.
4. Click **"Save Attempt & Schedule"**. The system instantly updates its SRS schedule.

---

## Step 5: Handle External Problem Slots

1. When an **EXTERNAL PROBLEM** slot appears in your queue, read the instruction:
   `Pick 1 random unsolved problem from LeetCode or another external source. Do not look at the solution first.`
2. Solve the problem on LeetCode or external platform.
3. Click **"Record External Attempt"** on the card.
4. Choose your performance result (`Failed`, `Needed Hints`, etc.).
5. **Optionally Import to Database**:
   - Check the box *"Optionally add this problem to your database for future SRS review tracking"*.
   - If checked, provide Title, Difficulty, Source, and Tags. It will become a normal tracked problem in your database!
   - If unchecked, it records your generalization attempt statistic without cluttering your database.

---

## Step 6: Review Analytics & Generalization Metrics

1. Open the **Analytics** tab.
2. Monitor key metrics:
   - **Review Solve Rate**: % solved on familiar database reviews (Retention metric).
   - **Fresh Solve Rate**: % solved on unseen database problems (Generalization metric).
   - **External Solve Rate**: % solved on manual external slots (Pure generalization metric).
3. **Generalization vs Retention Warning**:
   - If your Review Solve Rate is high (e.g. 92%) but your Fresh Solve Rate is low (e.g. 45%), the application will display an insight warning indicating that you may be memorizing past solutions rather than mastering underlying concepts.
4. **Weak & Strong Topics**: Check tag-level performance tables to see which topics require focused practice.

---
## Step 7: Back Up & Restore Your Database

The **Backup** button in the navbar opens the Backup & Restore panel.

### Exporting a backup
1. Click **Backup** in the navbar, then **Export & Download**.
2. The browser downloads a single JSON file (e.g. `spark_manager_backup_2026-01-15_14-30-00.json`) containing every problem, tag, solution link, attempt history, SRS schedule, and your daily capacity setting.
3. Save the file anywhere you like — it is your complete database snapshot.

### Importing a backup (on this or another computer)
1. Copy the exported JSON file to the other computer and open Spark Manager there.
2. Click **Backup**, then choose the `.json` file under **Import / Restore**.
3. The application shows what is inside the file (problem, attempt, and tag counts) and compares it against what is already in the database.

> **⚠️ Existing data will be wiped**: If the target database already contains data, importing replaces **all** of it — problems, attempts, solutions, schedules, tags, and settings. The application warns you before doing this.
>
> **Export first**: When existing data is detected, click **"Export Existing Data First"** to download a backup of your current data before importing. Once you have saved it, check "I understand this will erase all existing data" and click **"Import & Replace All Data"**.

4. After import completes, click **Reload App** so the restored data appears in the UI.

Your backup file is portable: export on one computer, import on another, and continue your practice exactly where you left off.

