# Leaderboard Points System - Complete Guide

## Fixed Issues

### 1. **Completion Milestone Calculation** ✅ FIXED
**Problem:** The system was counting ALL tasks (including future tasks) when calculating completion percentage.

**Example of the Problem:**
- You have 100 tasks total
- 50 are for future dates
- You completed all 50 tasks that were past/today (50/50 = 100%)
- But the system calculated: 50/100 = 50% completion
- Result: You got only 50 points instead of 500 points!

**Fix:** Now only counts tasks up to today's date, excluding future tasks.

**New Requirement:** Must have at least 10 tasks to prevent gaming the system (e.g., creating 1 task and completing it for instant 100% = 500 pts).

---

## Complete Points Breakdown

### 1. Task Completion Points
**Formula:** `10 points per completed task`

**Examples:**
- Complete 5 tasks = 50 points
- Complete 20 tasks = 200 points
- Complete 100 tasks = 1,000 points

**Tip:** Every task matters! Even small tasks add up.

---

### 2. Study Time Points
**Formula:** `1 point per minute studied`

**Examples:**
- Study for 30 minutes = 30 points
- Study for 2 hours (120 min) = 120 points
- Study for 10 hours in a week = 600 points

**Tip:** Track your study duration accurately to maximize points!

---

### 3. Badge Points
**Formula:** Based on badge tier

| Badge Tier  | Points |
|-------------|--------|
| Common      | 50     |
| Rare        | 100    |
| Epic        | 200    |
| Legendary   | 500    |

**Examples:**
- Unlock 3 Common badges = 150 points
- Unlock 1 Legendary badge = 500 points
- Unlock 5 badges (2 Common, 2 Rare, 1 Epic) = 100 + 200 + 200 = 500 points

**Tip:** Focus on unlocking higher-tier badges for bigger point rewards!

---

### 4. Completion Milestones
**Formula:** Based on % of tasks completed (only past/today tasks, minimum 10 tasks)

| Completion % | Points |
|--------------|--------|
| 50%          | 50     |
| 75%          | 100    |
| 90%          | 200    |
| 100%         | 500    |

**Important:** 
- Only tasks up to TODAY are counted (future tasks excluded)
- You must have at least 10 tasks created
- Only ONE milestone is awarded (the highest you qualify for)

**Examples:**

**Scenario A:**
- 20 tasks created (10 past, 5 today, 5 future)
- 15 tasks completed
- Calculation: 15/15 relevant tasks = 100% ✓
- Points: **500**

**Scenario B:**
- 50 tasks total (30 past/today, 20 future)
- 27 completed
- Calculation: 27/30 = 90% ✓
- Points: **200**

**Scenario C:**
- 5 tasks total, 5 completed
- Calculation: 5/5 = 100% but only 5 tasks!
- Points: **0** (minimum 10 tasks required)

---

### 5. Daily Streak Points
**Formula:** `25 points per consecutive day`

**Examples:**
- 5-day streak = 5 × 25 = **125 points**
- 10-day streak = 10 × 25 = **250 points**
- 30-day streak = 30 × 25 = **750 points**

**How Streaks Work:**
- Must complete at least 1 task per day
- Counts consecutive days from today backwards
- Breaks if you miss even one day

---

### 6. Streak Milestone Bonuses ⚡ (CUMULATIVE!)
**Formula:** Bonus points that ADD to your daily streak points

| Streak Length | Bonus Points | Label           |
|---------------|--------------|-----------------|
| 7 days        | +200         | 7-Day Streak    |
| 14 days       | +400         | 2-Week Warrior  |
| 30 days       | +1,000       | 30-Day Champion |

**IMPORTANT:** These bonuses are **CUMULATIVE** - you get ALL bonuses you qualify for!

**Examples:**

**7-Day Streak:**
- Daily points: 7 × 25 = 175
- 7-day bonus: +200
- **Total: 375 points**

**14-Day Streak:**
- Daily points: 14 × 25 = 350
- 7-day bonus: +200
- 14-day bonus: +400
- **Total: 950 points**

**30-Day Streak:**
- Daily points: 30 × 25 = 750
- 7-day bonus: +200
- 14-day bonus: +400
- 30-day bonus: +1,000
- **Total: 2,350 points!** 🔥

**Why it's cumulative:** If you reach 30 days, you've also achieved 7 and 14 days, so you deserve all those bonuses!

---

### 7. Exam Score Bonuses 🎯
**Formula:** Points awarded **PER SUBJECT** based on percentage

| Score Range | Points per Subject | Label          |
|-------------|-------------------|----------------|
| 90-94%      | 100               | Outstanding    |
| 95-99%      | 200               | Excellence     |
| 100%        | 300               | Perfect Score  |

**IMPORTANT:** These are awarded **PER SUBJECT**, so they can add up very quickly!

**Examples:**

**Scenario A - One Exam, 5 Subjects:**
- Math: 100% = 300 points
- Science: 95% = 200 points
- English: 92% = 100 points
- History: 88% = 0 points
- Art: 100% = 300 points
- **Total: 900 points from one exam!**

**Scenario B - Multiple Exams:**
- Exam 1: 5 subjects, all 100% = 5 × 300 = 1,500 points
- Exam 2: 6 subjects, all 95% = 6 × 200 = 1,200 points
- **Total: 2,700 points from exams!**

**Scenario C - Perfect Student:**
- 3 exams throughout the year
- 5 subjects each
- All scores 100%
- **Total: 15 × 300 = 4,500 points!** 🏆

---

## Real-World Examples

### Example 1: Active Beginner (1 week)
```
Tasks: 7 completed × 10 = 70 pts
Study Time: 4 hours total = 240 pts  
Badges: 2 Common = 100 pts
Completion: 7/10 tasks = 70% = 100 pts
Streak: 7 days × 25 = 175 pts
Streak Bonus: 7-day = 200 pts
Exams: None = 0 pts

TOTAL: 885 points
```

### Example 2: Dedicated Student (1 month)
```
Tasks: 30 completed × 10 = 300 pts
Study Time: 60 hours total = 3,600 pts
Badges: 1 Common, 2 Rare, 1 Epic = 50 + 200 + 200 = 450 pts
Completion: 30/30 = 100% = 500 pts
Streak: 30 days × 25 = 750 pts
Streak Bonuses: 200 + 400 + 1,000 = 1,600 pts
Exams: 2 exams, 10 subjects avg 95% = 10 × 200 = 2,000 pts

TOTAL: 9,200 points
```

### Example 3: Top Achiever (3 months)
```
Tasks: 90 completed × 10 = 900 pts
Study Time: 180 hours total = 10,800 pts
Badges: 3 Common, 4 Rare, 3 Epic, 1 Legendary = 
        (150 + 400 + 600 + 500) = 1,650 pts
Completion: 90/100 tasks = 90% = 200 pts
Streak: 30 days × 25 = 750 pts
Streak Bonuses: 200 + 400 + 1,000 = 1,600 pts
Exams: 3 major exams, 15 subjects total, 85% avg 100% = 
       15 × 300 = 4,500 pts

TOTAL: 20,400 points! 🏆
```

---

## Tips for Maximizing Points

1. **Consistency is King** 🔥
   - Maintain your streak! A 30-day streak is worth 2,350 points alone
   - Even one task per day keeps your streak alive

2. **Quality Study Time** ⏱️
   - 1 hour of study = 60 points, which adds up quickly
   - 2 hours daily for a month = 3,600 points

3. **Ace Your Exams** 🎯
   - The difference between 89% and 90% is 100 points per subject
   - Perfect scores are worth 3× as much as 90%

4. **Complete Your Tasks** ✅
   - Keep your completion rate high to maintain milestone bonuses
   - Don't create too many future tasks or it dilutes your completion %

5. **Unlock Badges** 🏅
   - Focus on rare/epic/legendary badges (100-500 pts each)
   - Check badge requirements and work toward them systematically

---

## Common Questions

**Q: Why did my completion % go down even though I completed tasks?**
A: If you added new tasks for dates in the past/today, your completion % is recalculated. Only future tasks don't affect your %.

**Q: Why do I need 10 tasks minimum for completion milestones?**
A: To prevent gaming: creating 1 task and completing it shouldn't give 500 points instantly.

**Q: Are streak bonuses cumulative?**
A: Yes! A 30-day streak gives you 750 (daily) + 200 (7-day) + 400 (14-day) + 1,000 (30-day) = 2,350 total.

**Q: Do I get exam bonuses for every subject?**
A: Yes! If you score 100% in 5 subjects, you get 5 × 300 = 1,500 points.

**Q: What if I break my streak?**
A: Your streak resets to 0 and you lose all streak points and bonuses. Start fresh tomorrow!

**Q: Can completion % exceed 100%?**
A: No, 100% is the maximum and gives 500 points.

---

## Summary Cheat Sheet

| Category | How to Earn | Points |
|----------|-------------|--------|
| **Tasks** | Complete one task | 10 |
| **Study** | Study for 1 hour | 60 |
| **Badges** | Unlock Legendary badge | 500 |
| **Completion** | Achieve 100% completion | 500 |
| **Streak** | Maintain 30-day streak | 2,350 |
| **Exams** | Score 100% in 5 subjects | 1,500 |

**Fastest way to climb:** Combine everything! Study daily (streak + time), complete tasks (completion + task points), and ace exams.
