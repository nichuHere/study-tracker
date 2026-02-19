# Points System (Leaderboard)

## Overview

Gamification system that awards points for study activities to encourage consistent learning. Points accumulate from task completion, study time, badges earned, and completion milestones.

---

## Requirements

### Functional Requirements
- Calculate points from multiple sources
- Display current point total
- Show breakdown by category
- Calculate study streaks
- Support leaderboard across profiles

### Non-Functional Requirements
- Points calculated in real-time
- Only count completed tasks
- Fair calculation (prevents gaming)

---

## Points Breakdown

### 1. Task Completion Points

| Action | Points |
|--------|--------|
| Complete 1 task | 10 points |

**Examples:**
- 5 tasks = 50 points
- 20 tasks = 200 points
- 100 tasks = 1,000 points

---

### 2. Study Time Points

| Action | Points |
|--------|--------|
| 1 minute studied | 1 point |

**Examples:**
- 30 minutes = 30 points
- 2 hours = 120 points
- 10 hours = 600 points

**Note:** Only completed task durations count.

---

### 3. Badge Points

| Badge Tier | Points |
|------------|--------|
| Common | 50 |
| Rare | 100 |
| Epic | 200 |
| Legendary | 500 |

**Examples:**
- 3 Common badges = 150 points
- 1 Legendary badge = 500 points
- 5 mixed badges = varies

---

### 4. Completion Milestones

| Completion % | Points |
|--------------|--------|
| 50% | 50 |
| 75% | 100 |
| 90% | 200 |
| 100% | 500 |

**Important Rules:**
- Only ONE milestone awarded (highest achieved)
- Only counts tasks up to today (excludes future)
- Minimum 10 tasks required

---

## Business Rules

1. **Task Counting**:
   - Only completed tasks count
   - Only tasks with date <= today
   - Future tasks excluded from calculations

2. **Minimum Tasks**:
   - Need 10+ tasks for completion milestones
   - Prevents gaming (e.g., 1 task, 100% complete)

3. **Study Time**:
   - Sum of duration from completed tasks
   - Measured in minutes

4. **Badge Points**:
   - Awarded once per badge unlock
   - Based on badge tier

5. **Completion Percentage**:
   - Formula: `(completed / relevant) * 100`
   - Relevant = tasks with date <= today

---

## Calculation Examples

### Example A: Perfect Score
```
Tasks: 20 total (10 past, 5 today, 5 future)
Completed: 15 (all past + today)
Calculation: 15/15 = 100%
Milestone Points: 500
```

### Example B: Good Progress
```
Tasks: 50 total (30 past/today, 20 future)
Completed: 27
Calculation: 27/30 = 90%
Milestone Points: 200
```

### Example C: Not Enough Tasks
```
Tasks: 5 total
Completed: 5 (100%)
Milestone Points: 0 (minimum not met)
```

---

## Total Points Formula

```javascript
totalPoints = 
  (completedTasks * 10) +           // Task points
  totalStudyMinutes +                // Time points
  badgePoints +                      // Badge tier sum
  completionMilestonePoints;         // Highest milestone
```

---

## Study Streak

Consecutive days with completed tasks:

```javascript
function calculateStreak(tasks) {
  // Sort by date descending
  // Count consecutive days from today
  // Break on missed day
}
```

### Streak Display
- Fire icon for active streak
- Days count badge
- Resets if day is missed

---

## User Interface

### Points Display (Dashboard)
- Total points prominently shown
- Flame icon for streak
- Trophy icon for rank

### Points Breakdown Modal
- Triggered by info icon
- Shows calculation per category:
  - Tasks: X × 10 = Y
  - Study Time: X minutes = Y
  - Badges: List with tier points
  - Milestone: X% = Y points
- Total at bottom

### Leaderboard
- Rank by total points
- Shows all profiles
- Current profile highlighted

---

## Data Sources

| Metric | Source |
|--------|--------|
| Tasks completed | `tasks` table, `completed = true` |
| Study time | Sum of `duration` from completed tasks |
| Badges unlocked | Calculated from task/time stats |
| Completion % | `completed / (date <= today)` |

---

## Helper Functions

Located in `src/utils/helpers.js`:

```javascript
// Calculate total points
calculatePoints(tasks, badges)

// Calculate current streak
calculateStreak(tasks)

// Get completion percentage
getCompletionRate(tasks)
```

---

## Components

| Component | File | Purpose |
|-----------|------|---------|
| Dashboard | `src/components/Dashboard.jsx` | Points display, breakdown |
| helpers | `src/utils/helpers.js` | Point calculations |

---

## Related Specs

- [TASKS.md](TASKS.md) - Task completion data
- [BADGES.md](BADGES.md) - Badge tier points
