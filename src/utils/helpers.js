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
 * Simplified Points System:
 * - Task completed: 10 pts
 * - Study time: 1 pt/min
 * - Badge unlock: 50-500 pts (tier-based)
 * - Completion milestone: 50-500 pts
 * - Daily streak: 25 pts/day
 * - Streak bonuses: 200 pts (7 days), 400 pts (14 days), 1000 pts (30 days)
 * - Exam scores: 100 pts (>90%), 200 pts (>95%), 300 pts (100%)
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
  
  // 4. Completion Milestone Points
  const allTasksCount = tasks.length;
  const completedCount = completedTasks.length;
  const completionRate = allTasksCount > 0 
    ? Math.round((completedCount / allTasksCount) * 100)
    : 0;
  
  const milestone = COMPLETION_MILESTONES.find(m => completionRate >= m.threshold);
  if (milestone) {
    totalPoints += milestone.points;
  }
  
  // 5. Daily Streak Points (25 pts per day)
  const streak = calculateStreak(tasks);
  totalPoints += streak * 25;
  
  // 6. Streak Milestone Bonuses (7-day, 14-day, 30-day bonuses)
  const streakBonus = STREAK_MILESTONES
    .filter(sm => streak >= sm.days)
    .reduce((sum, sm) => sum + sm.bonus, 0);
  totalPoints += streakBonus;
  
  // 7. Exam Score Bonuses (>90%, >95%, 100%)
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
  let streak = 0;
  let currentDate = new Date(today);
  
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
  
  const allTasksCount = tasks.length;
  const completedCount = completedTasks.length;
  const completionRate = allTasksCount > 0 
    ? Math.round((completedCount / allTasksCount) * 100)
    : 0;
  
  const milestone = COMPLETION_MILESTONES.find(m => completionRate >= m.threshold);
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
      studyMinutes: totalStudyMinutes,
      unlockedBadges: badges.length,
      completionRate: completionRate,
      streak: streak,
      streakMilestones: earnedMilestones,
      examCount: examCount,
      examScores: examScores
    }
  };
};
