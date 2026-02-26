// Define ALL possible badges (Ordered by category and difficulty progression)
const ALL_BADGES = [
  // DAILY STUDY BADGES (Easiest to Hardest)
  {
    id: 'keep-going',
    name: 'Keep Going',
    description: '2 hours study today',
    requirement: 'Study for 2+ hours in one day',
    tier: 'rare',
    category: 'daily',
    checkUnlocked: (s) => s.studyMinutesToday >= 120
  },
  {
    id: 'study-rockstar',
    name: 'Study Rockstar',
    description: '3 hours study today',
    requirement: 'Study for 3+ hours in one day',
    tier: 'legendary',
    category: 'daily',
    checkUnlocked: (s) => s.studyMinutesToday >= 180,
    animate: true
  },
  
  // WEEKLY STUDY BADGES (Easiest to Hardest)
  {
    id: 'weekly-warrior',
    name: 'Weekly Warrior',
    description: '10 hrs this week',
    requirement: 'Study for 10+ hours per week',
    tier: 'rare',
    category: 'weekly',
    checkUnlocked: (s) => s.studyMinutesWeek >= 600
  },
  {
    id: 'study-champion',
    name: 'Study Champion',
    description: '15 hrs this week',
    requirement: 'Study for 15+ hours per week',
    tier: 'epic',
    category: 'weekly',
    checkUnlocked: (s) => s.studyMinutesWeek >= 900
  },
  {
    id: 'ultimate-scholar',
    name: 'Ultimate Scholar',
    description: '21+ hrs this week!',
    requirement: 'Study for 21+ hours per week',
    tier: 'legendary',
    category: 'weekly',
    checkUnlocked: (s) => s.studyMinutesWeek >= 1260,
    animate: true,
    special: true
  },
  
  // ACHIEVEMENT BADGES (Easiest to Hardest)
  {
    id: 'knowledge-seeker',
    name: 'Knowledge Seeker',
    description: '5+ subjects',
    requirement: 'Study 5+ different subjects',
    tier: 'common',
    category: 'achievement',
    checkUnlocked: (s) => s.totalSubjects >= 5
  },
  {
    id: 'star-student',
    name: 'Star Student',
    description: '80%+ completion',
    requirement: '80%+ task completion rate',
    tier: 'common',
    category: 'achievement',
    checkUnlocked: (s) => s.completionRate >= 80
  },
  {
    id: 'task-master',
    name: 'Task Master',
    description: '5+ tasks today',
    requirement: 'Complete 5+ tasks in one day',
    tier: 'rare',
    category: 'achievement',
    checkUnlocked: (s) => s.completedToday >= 5
  }
];

export default ALL_BADGES;
