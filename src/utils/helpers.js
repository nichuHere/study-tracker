// Date and Time Utilities

export const getTodayDateIST = () => {
  const now = new Date();
  const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  return istTime.toISOString().split('T')[0];
};

export const getISTNow = () => {
  const now = new Date();
  return new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
};

export const convertTo12Hour = (time24) => {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const getDayName = (dayNumber) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayNumber] || '';
};

export const getShortDayName = (dayNumber) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[dayNumber] || '';
};

export const getDaysUntil = (targetDate) => {
  const today = getTodayDateIST();
  const target = new Date(targetDate);
  const current = new Date(today);
  const diffTime = target - current;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const isToday = (dateString) => {
  return dateString === getTodayDateIST();
};

export const isTomorrow = (dateString) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowIST = new Date(tomorrow.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  return dateString === tomorrowIST.toISOString().split('T')[0];
};

export const formatDisplayDate = (dateString) => {
  if (isToday(dateString)) return 'Today';
  if (isTomorrow(dateString)) return 'Tomorrow';
  return formatDate(dateString);
};

// Calendar Utilities

export const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

export const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month, 1).getDay();
};

export const getMonthName = (monthIndex) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthIndex] || '';
};

// Data Processing Utilities

export const sortByDate = (items, dateField = 'date', ascending = true) => {
  return [...items].sort((a, b) => {
    const dateA = new Date(a[dateField]);
    const dateB = new Date(b[dateField]);
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

export const filterByDateRange = (items, startDate, endDate, dateField = 'date') => {
  return items.filter(item => {
    const itemDate = new Date(item[dateField]);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return itemDate >= start && itemDate <= end;
  });
};

export const groupByDate = (items, dateField = 'date') => {
  return items.reduce((acc, item) => {
    const date = item[dateField];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {});
};

// Validation Utilities

export const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

export const isValidTime = (timeString) => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeString);
};

// String Utilities

export const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Array Utilities

export const uniqueById = (items) => {
  const seen = new Set();
  return items.filter(item => {
    const duplicate = seen.has(item.id);
    seen.add(item.id);
    return !duplicate;
  });
};

export const removeItem = (items, id) => {
  return items.filter(item => item.id !== id);
};

export const updateItem = (items, id, updates) => {
  return items.map(item => 
    item.id === id ? { ...item, ...updates } : item
  );
};

// Points Calculation Utilities

/**
 * Badge tier to points mapping
 */
const BADGE_POINTS = {
  common: 50,
  rare: 100,
  epic: 200,
  legendary: 500
};

/**
 * Completion milestone to points mapping
 */
const COMPLETION_MILESTONES = [
  { threshold: 100, points: 500 },
  { threshold: 90, points: 200 },
  { threshold: 75, points: 100 },
  { threshold: 50, points: 50 }
];

/**
 * Streak milestone bonuses
 */
const STREAK_MILESTONES = [
  { days: 30, bonus: 1000, label: '30-Day Champion' },
  { days: 14, bonus: 400, label: '2-Week Warrior' },
  { days: 7, bonus: 200, label: '7-Day Streak' }
];

/**
 * Exam score bonuses
 */
const EXAM_SCORE_BONUSES = [
  { threshold: 100, bonus: 300, label: 'Perfect Score' },
  { threshold: 95, bonus: 200, label: 'Excellence' },
  { threshold: 90, bonus: 100, label: 'Outstanding' }
];

/**
 * Calculate total points for a profile based on their activity
 * 
 * POINTS SYSTEM BREAKDOWN:
 * 
 * 1. TASK COMPLETION: 10 pts per completed task
 * 
 * 2. STUDY TIME: 1 pt per minute studied
 * 
 * 3. BADGES: Based on tier
 *    - Common: 50 pts
 *    - Rare: 100 pts
 *    - Epic: 200 pts
 *    - Legendary: 500 pts
 * 
 * 4. COMPLETION MILESTONES: Based on % of tasks completed (only past/today tasks)
 *    - 50%: 50 pts
 *    - 75%: 100 pts
 *    - 90%: 200 pts
 *    - 100%: 500 pts
 * 
 * 5. DAILY STREAKS: 25 pts per consecutive day
 * 
 * 6. STREAK BONUSES: (Cumulative - you get all bonuses you qualify for)
 *    - 7-day streak: +200 pts bonus
 *    - 14-day streak: +400 pts bonus (in addition to 7-day)
 *    - 30-day streak: +1000 pts bonus (in addition to 7-day and 14-day)
 *    Example: 30-day streak = (30 × 25) + 200 + 400 + 1000 = 2350 total
 * 
 * 7. EXAM BONUSES: Per subject in each exam
 *    - 90-94%: 100 pts per subject
 *    - 95-99%: 200 pts per subject
 *    - 100%: 300 pts per subject
 *    Note: If you have 5 subjects and score 100% in all, you get 5 × 300 = 1500 pts
 * 
 * @param {Object} profile - User profile
 * @param {Array} tasks - All tasks for this profile
 * @param {Array} badges - Unlocked badges for this profile
 * @param {Array} exams - All exams for this profile
 * @returns {number} Total points
 */
export const calculatePoints = (profile, tasks = [], badges = [], exams = []) => {
  let totalPoints = 0;
  
  // 1. Task Completion Points (10 pts per task)
  const completedTasks = tasks.filter(t => t.completed);
  totalPoints += completedTasks.length * 10;
  
  // 2. Study Time Points (1 pt per minute)
  const totalStudyMinutes = completedTasks.reduce((sum, t) => sum + (t.duration || 0), 0);
  totalPoints += totalStudyMinutes;
  
  // 3. Badge Points (tier-based)
  const badgePoints = badges.reduce((sum, badge) => {
    const tier = badge.tier || 'common';
    return sum + (BADGE_POINTS[tier] || 50);
  }, 0);
  totalPoints += badgePoints;
  
  // 4. Completion Milestone Points (FIXED: Only count tasks up to today, not future tasks)
  const today = getTodayDateIST();
  const pastAndTodayTasks = tasks.filter(t => t.date <= today);
  const pastCompletedTasks = pastAndTodayTasks.filter(t => t.completed);
  
  const relevantTasksCount = pastAndTodayTasks.length;
  const relevantCompletedCount = pastCompletedTasks.length;
  const completionRate = relevantTasksCount > 0 
    ? Math.round((relevantCompletedCount / relevantTasksCount) * 100)
    : 0;
  
  // Only award milestone if there are at least 10 tasks to prevent gaming the system
  const milestone = relevantTasksCount >= 10 
    ? COMPLETION_MILESTONES.find(m => completionRate >= m.threshold)
    : null;
  if (milestone) {
    totalPoints += milestone.points;
  }
  
  // 5. Daily Streak Points (25 pts per day)
  const streak = calculateStreak(tasks);
  totalPoints += streak * 25;
  
  // 6. Streak Milestone Bonuses (CUMULATIVE - you earn all bonuses you qualify for)
  const streakBonus = STREAK_MILESTONES
    .filter(sm => streak >= sm.days)
    .reduce((sum, sm) => sum + sm.bonus, 0);
  totalPoints += streakBonus;
  
  // 7. Exam Score Bonuses (per subject - can add up significantly)
  const examBonusPoints = calculateExamBonuses(exams);
  totalPoints += examBonusPoints;
  
  return totalPoints;
};

/**
 * Calculate bonus points from exam scores
 * @param {Array} exams - All exams with marks
 * @returns {number} Total exam bonus points
 */
export const calculateExamBonuses = (exams = []) => {
  let bonusPoints = 0;
  
  exams.forEach(exam => {
    if (exam.subjects && Array.isArray(exam.subjects)) {
      exam.subjects.forEach(subject => {
        if (subject.marks != null && subject.marks >= 0) {
          const percentage = subject.marks;
          const bonus = EXAM_SCORE_BONUSES.find(b => percentage >= b.threshold);
          if (bonus) {
            bonusPoints += bonus.bonus;
          }
        }
      });
    }
  });
  
  return bonusPoints;
};

/**
 * Calculate consecutive day streak
 * @param {Array} tasks - All tasks
 * @returns {number} Streak in days
 */
export const calculateStreak = (tasks) => {
  if (!tasks || tasks.length === 0) return 0;
  
  const completedTasks = tasks.filter(t => t.completed);
  if (completedTasks.length === 0) return 0;
  
  // Get unique dates with completed tasks
  const uniqueDates = [...new Set(completedTasks.map(t => t.date))].sort().reverse();
  
  if (uniqueDates.length === 0) return 0;
  
  const today = getTodayDateIST();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  let streak = 0;
  let currentDate = new Date(today);
  
  // Check if most recent completed task is today or yesterday
  // (Allow streak to continue if user hasn't completed anything today yet)
  const mostRecentDate = uniqueDates[0];
  if (mostRecentDate !== today && mostRecentDate !== yesterdayStr) {
    // Streak is broken - last activity was more than 1 day ago
    return 0;
  }
  
  // If no task today, start counting from yesterday
  if (mostRecentDate !== today) {
    currentDate = yesterday;
  }
  
  for (let i = 0; i < uniqueDates.length; i++) {
    const taskDate = uniqueDates[i];
    const expectedDate = currentDate.toISOString().split('T')[0];
    
    if (taskDate === expectedDate) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
};

/**
 * Get detailed points breakdown for display
 * @param {Object} profile - User profile
 * @param {Array} tasks - All tasks for this profile
 * @param {Array} badges - Unlocked badges for this profile
 * @param {Array} exams - All exams for this profile
 * @returns {Object} Points breakdown
 */
export const getPointsBreakdown = (profile, tasks = [], badges = [], exams = []) => {
  const completedTasks = tasks.filter(t => t.completed);
  const totalStudyMinutes = completedTasks.reduce((sum, t) => sum + (t.duration || 0), 0);
  
  // Use same logic as calculatePoints - only past and today's tasks
  const today = getTodayDateIST();
  const pastAndTodayTasks = tasks.filter(t => t.date <= today);
  const pastCompletedTasks = pastAndTodayTasks.filter(t => t.completed);
  
  const relevantTasksCount = pastAndTodayTasks.length;
  const relevantCompletedCount = pastCompletedTasks.length;
  const completionRate = relevantTasksCount > 0 
    ? Math.round((relevantCompletedCount / relevantTasksCount) * 100)
    : 0;
  
  const milestone = relevantTasksCount >= 10 
    ? COMPLETION_MILESTONES.find(m => completionRate >= m.threshold)
    : null;
  const streak = calculateStreak(tasks);
  
  const badgePoints = badges.reduce((sum, badge) => {
    const tier = badge.tier || 'common';
    return sum + (BADGE_POINTS[tier] || 50);
  }, 0);
  
  const streakBonus = STREAK_MILESTONES
    .filter(sm => streak >= sm.days)
    .reduce((sum, sm) => sum + sm.bonus, 0);
  
  const earnedMilestones = STREAK_MILESTONES
    .filter(sm => streak >= sm.days)
    .map(sm => ({ days: sm.days, label: sm.label, bonus: sm.bonus }));
  
  const examBonusPoints = calculateExamBonuses(exams);
  
  // Count exams with marks
  let examCount = 0;
  const examScores = [];
  exams.forEach(exam => {
    if (exam.subjects && Array.isArray(exam.subjects)) {
      exam.subjects.forEach(subject => {
        if (subject.marks != null && subject.marks >= 0) {
          examCount++;
          const bonus = EXAM_SCORE_BONUSES.find(b => subject.marks >= b.threshold);
          if (bonus) {
            examScores.push({ 
              subject: subject.subject, 
              marks: subject.marks, 
              bonus: bonus.bonus,
              label: bonus.label 
            });
          }
        }
      });
    }
  });
  
  return {
    taskPoints: completedTasks.length * 10,
    studyTimePoints: totalStudyMinutes,
    badgePoints: badgePoints,
    milestonePoints: milestone ? milestone.points : 0,
    streakPoints: streak * 25,
    streakBonusPoints: streakBonus,
    examBonusPoints: examBonusPoints,
    total: calculatePoints(profile, tasks, badges, exams),
    breakdown: {
      completedTasks: completedTasks.length,
      totalTasks: tasks.length,
      relevantTasks: relevantTasksCount,
      relevantCompleted: relevantCompletedCount,
      studyMinutes: totalStudyMinutes,
      unlockedBadges: badges.length,
      completionRate: completionRate,
      completionMilestoneQualified: relevantTasksCount >= 10,
      streak: streak,
      streakMilestones: earnedMilestones,
      examCount: examCount,
      examScores: examScores
    }
  };
};
