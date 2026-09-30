# Scheduling & Practice Allocation Explanation

This document explains the algorithms powering Spaced Repetition (SRS), Daily Practice Allocation, and Fresh Problem Selection.

---

## 1. Spaced Repetition System (SRS)

The SRS scheduler determines when an attempted problem will become due for review again.

### Base Intervals
Upon recording an attempt, the next review interval is assigned based on performance:

| Result | Description | Initial Base Interval |
|---|---|---|
| `failed` | Total block / could not solve | 1 day |
| `needed_hints` | Solved with hints / editorial | 2 days |
| `struggled` | Solved with effort / slow | 4 days |
| `comfortable` | Clean optimal solution | 10 days |
| `trivial` | Instant / trivial solution | 21 days |

### Interval Multipliers for Repeated Attempts

When reviewing a problem that already has a scheduled interval ($I_{\text{prev}}$):

- **`failed`**: Resets interval to **1 day**.
- **`needed_hints`**: Resets interval to **2 days**.
- **`struggled`**: Expands interval: $\max(4, \text{round}(I_{\text{prev}} \times 1.3))$.
- **`comfortable`**: Expands interval: $\max(10, \text{round}(I_{\text{prev}} \times 2.2))$.
- **`trivial`**: Expands interval: $\max(21, \text{round}(I_{\text{prev}} \times 3.0))$.

Next review date calculation:
$$\text{Next Review Date} = \text{Attempt Date} + \text{Interval (days)}$$

---

## 2. Daily Practice Allocation Algorithm

The practice allocator (`server/services/practiceAllocator.js`) dynamically builds today's practice composition based on your configured **Daily Capacity** ($C$).

### Core Composition Rules

1. **Capacity Cap**: Total queued items $\le C$.
2. **Review Backlog Cap**: Review backlog is capped at $\approx 60\%$ of capacity ($\max(1, \lfloor C \times 0.6 \rfloor)$) when reviews accumulate.
   - *Why?* A massive review backlog must **never permanently eliminate** fresh problem exposure or external practice.
3. **Fresh & External Slot Preservation**: Always reserves slots for unattempted fresh problems (weak-topic prioritized) and external generalization practice.

### Example Allocations for Capacity = 5

- **Case 1: Normal Review Load (2 due reviews)**
  - 2 Reviews due
  - 2 Fresh problems (weak topic focused)
  - 1 External slot
  - Total = 5

- **Case 2: Heavy Review Backlog (15 due reviews)**
  - 3 Reviews (capped at $60\%$ of 5)
  - 1 Fresh problem
  - 1 External slot
  - Total = 5

- **Case 3: Zero Reviews Due**
  - 3 Fresh problems
  - 2 External slots
  - Total = 5

---

## 3. Fresh Problem Selection Algorithm

Fresh selector (`server/services/freshSelector.js`) chooses unattempted database problems for today's session.

### Selection Scoring Formula

For each unattempted problem $P$:

1. Calculate **Tag Weakness Scores** for its tags based on past attempt performance:
   $$\text{Tag Weakness} = 1.0 - \text{Average Score on Tag}$$
   *(If a tag has never been attempted, assigned an underrepresented bonus of $0.85$)*
2. Average tag weakness across problem $P$'s tags.
3. Add a random exploration factor ($0.0 \dots 0.4$) to ensure the selector does not exclusively choose the exact same weak topic forever.
4. Sort unattempted problems by final score descending and select top $N$.
