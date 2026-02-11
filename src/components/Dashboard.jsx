import React, { useMemo, useState } from 'react';
import { 
  Clock, Target, TrendingUp, Zap, Info, X, Flame
} from 'lucide-react';
import { getTodayDateIST, calculatePoints, calculateStreak } from '../utils/helpers';
import BadgeIcon from './BadgeIcon';
import { BADGE_ID_MAP } from '../utils/badgeIcons';

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

const Dashboard = ({ 
  tasks, 
  exams, 
  subjects, 
  profiles, 
  activeProfile 
}) => {
  const [showPointsInfo, setShowPointsInfo] = useState(false);
  const [showBadgeInfo, setShowBadgeInfo] = useState(false);
  
  // Calculate current streak
  const currentStreak = useMemo(() => calculateStreak(tasks), [tasks]);
  
  // Get current week (Monday to Sunday) for calendar
  const streakCalendar = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const calendar = [];
    
    // Calculate days from Monday (0 = Mon, 1 = Tue, ..., 6 = Sun)
    const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1;
    
    // Get Monday of current week
    const monday = new Date(today);
    monday.setDate(today.getDate() - daysFromMonday);
    
    // Build 7-day week from Monday to Sunday
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayTasks = tasks.filter(t => t.date === dateStr);
      const completedTasks = dayTasks.filter(t => t.completed);
      
      calendar.push({
        date: dateStr,
        day: date.getDate(),
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        hasActivity: completedTasks.length > 0,
        taskCount: completedTasks.length,
        isToday: dateStr === getTodayDateIST()
      });
    }
    
    return calendar;
  }, [tasks]);
  
  // Calculate stats
  const stats = useMemo(() => {
    const today = getTodayDateIST();
    const todayTasks = tasks.filter(t => t.date === today);
    const completedToday = todayTasks.filter(t => t.completed);
    const totalMinutesToday = completedToday.reduce((sum, t) => sum + (t.duration || 0), 0);
    
    // Calculate weekly study time (last 7 days)
    const todayDate = new Date(today);
    const weekAgo = new Date(todayDate);
    weekAgo.setDate(weekAgo.getDate() - 6); // Last 7 days including today
    const weekAgoStr = weekAgo.toISOString().split('T')[0];
    
    const weeklyTasks = tasks.filter(t => {
      return t.completed && t.date >= weekAgoStr && t.date <= today;
    });
    const totalMinutesWeek = weeklyTasks.reduce((sum, t) => sum + (t.duration || 0), 0);
    
    // Get all tasks for this profile
    const allTasks = tasks;
    const allCompleted = allTasks.filter(t => t.completed);
    
    // Calculate completion percentage
    const completionRate = allTasks.length > 0 
      ? Math.round((allCompleted.length / allTasks.length) * 100)
      : 0;
    
    // Upcoming exams
    const upcomingExams = exams.filter(exam => {
      const examDates = exam.subjects?.map(s => s.date) || [];
      return examDates.some(date => date >= today);
    }).length;

    return {
      completionRate,
      completedToday: completedToday.length,
      totalToday: todayTasks.length,
      studyMinutesToday: totalMinutesToday,
      studyHoursToday: Math.floor(totalMinutesToday / 60),
      studyMinutesWeek: totalMinutesWeek,
      studyHoursWeek: Math.floor(totalMinutesWeek / 60),
      upcomingExams,
      totalSubjects: subjects.length,
    };
  }, [tasks, exams, subjects]);

  // Get all badges with locked/unlocked status
  const allBadgesWithStatus = useMemo(() => {
    return ALL_BADGES.map(badge => ({
      ...badge,
      unlocked: badge.checkUnlocked({ ...stats, totalSubjects: subjects.length })
    }));
  }, [stats, subjects.length]);

  // Calculate leaderboard with real points
  const leaderboard = useMemo(() => {
    return profiles.map(profile => {
      // Get tasks for this profile
      const profileTasks = tasks.filter(t => t.profileId === profile.id);
      
      // Get unlocked badges for this profile
      const profileStats = {
        completedToday: profileTasks.filter(t => t.completed && t.date === getTodayDateIST()).length,
        studyMinutesToday: profileTasks
          .filter(t => t.completed && t.date === getTodayDateIST())
          .reduce((sum, t) => sum + (t.duration || 0), 0),
        studyMinutesWeek: profileTasks
          .filter(t => {
            const today = getTodayDateIST();
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 6);
            const weekAgoStr = weekAgo.toISOString().split('T')[0];
            return t.completed && t.date >= weekAgoStr && t.date <= today;
          })
          .reduce((sum, t) => sum + (t.duration || 0), 0),
        completionRate: profileTasks.length > 0
          ? Math.round((profileTasks.filter(t => t.completed).length / profileTasks.length) * 100)
          : 0,
        totalSubjects: subjects.length
      };
      
      const unlockedBadges = ALL_BADGES.filter(badge => 
        badge.checkUnlocked(profileStats)
      );
      
      // Get exams for this profile
      const profileExams = exams.filter(e => e.profile_id === profile.id);
      
      // Calculate real points
      const points = calculatePoints(profile, profileTasks, unlockedBadges, profileExams);
      
      return {
        ...profile,
        points
      };
    })
    .sort((a, b) => b.points - a.points)
    .slice(0, 5);
  }, [profiles, tasks, subjects, exams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {activeProfile?.name || 'Student'}! 👋
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Completion Card */}
              <div className="bg-pastel-blue-light rounded-2xl p-6 shadow-soft hover:shadow-card transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Completed</span>
                  <CheckCircleIcon className="w-5 h-5 text-gray-700" />
                </div>
                <div className="text-4xl font-bold text-gray-800">
                  {stats.completionRate}%
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {stats.completedToday}/{stats.totalToday} tasks today
                </p>
              </div>

              {/* Subjects Card */}
              <div className="bg-pastel-purple-light rounded-2xl p-6 shadow-soft hover:shadow-card transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Today</span>
                  <Clock className="w-5 h-5 text-gray-700" />
                </div>
                <div className="text-4xl font-bold text-gray-800">
                  {Math.floor(stats.studyMinutesToday / 60)}<span className="text-2xl">.{Math.floor((stats.studyMinutesToday % 60) / 6)}</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  hours studied today
                </p>
              </div>

              {/* Study Hours Card */}
              <div className="bg-pastel-pink-light rounded-2xl p-6 shadow-soft hover:shadow-card transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">This Week</span>
                  <TrendingUp className="w-5 h-5 text-gray-700" />
                </div>
                <div className="text-4xl font-bold text-gray-800">
                  {Math.floor(stats.studyMinutesWeek / 60)}<span className="text-2xl">h</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {stats.studyMinutesWeek} mins total
                </p>
              </div>
            </div>

            {/* Study Streak Section - Duolingo Style */}
            <div className="bg-white rounded-2xl p-6 shadow-card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-800">Study Streak</h2>
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              
              {/* Main Streak Counter */}
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                  <div className="relative bg-gradient-to-br from-orange-400 to-red-500 rounded-full p-8 shadow-lg">
                    <Flame className="w-16 h-16 text-white" />
                  </div>
                </div>
                <div className="ml-6">
                  <div className="text-6xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                    {currentStreak}
                  </div>
                  <div className="text-sm font-semibold text-gray-600 mt-1">
                    day{currentStreak !== 1 ? 's' : ''} streak
                  </div>
                </div>
              </div>
              
              {/* Motivational Message */}
              <div className="text-center mb-6">
                {stats.completedToday === 0 && (
                  <p className="text-sm text-gray-600">
                    🌟 Complete a task today to keep your streak going!
                  </p>
                )}
                {stats.completedToday > 0 && currentStreak < 7 && (
                  <p className="text-sm text-orange-600 font-semibold">
                    🔥 Great work today! {7 - currentStreak} more day{7 - currentStreak !== 1 ? 's' : ''} to reach 7-day milestone!
                  </p>
                )}
                {currentStreak >= 7 && currentStreak < 14 && (
                  <p className="text-sm text-orange-600 font-semibold">
                    🎉 Amazing streak! {14 - currentStreak} day{14 - currentStreak !== 1 ? 's' : ''} to 2-week milestone!
                  </p>
                )}
                {currentStreak >= 14 && currentStreak < 30 && (
                  <p className="text-sm text-orange-600 font-semibold">
                    🏆 Incredible! {30 - currentStreak} day{30 - currentStreak !== 1 ? 's' : ''} to 30-day champion!
                  </p>
                )}
                {currentStreak >= 30 && (
                  <p className="text-sm bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent font-bold">
                    👑 You're a Study Champion! Keep this legendary streak alive!
                  </p>
                )}
              </div>
              
              {/* Calendar Heatmap - Current Week (Mon-Sun) */}
              <div className="mb-4">
                <div className="text-xs font-semibold text-gray-600 mb-3">This Week</div>
                <div className="grid grid-cols-7 gap-2">
                  {streakCalendar.map((day, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <div className="text-xs text-gray-500 mb-1">{day.dayName[0]}</div>
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                          day.hasActivity
                            ? day.isToday
                              ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-lg scale-110 ring-2 ring-orange-300'
                              : 'bg-gradient-to-br from-orange-300 to-red-400 text-white shadow-md hover:scale-105'
                            : day.isToday
                            ? 'bg-gray-200 text-gray-400 ring-2 ring-gray-300'
                            : 'bg-gray-100 text-gray-300'
                        }`}
                        title={`${day.date}: ${day.taskCount} task${day.taskCount !== 1 ? 's' : ''} completed`}
                      >
                        {day.isToday ? '•' : day.hasActivity ? '✓' : day.day}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Streak Milestones - Compact */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { days: 7, label: '7-Day', bonus: 200, emoji: '🔥' },
                    { days: 14, label: '14-Day', bonus: 400, emoji: '⚔️' },
                    { days: 30, label: '30-Day', bonus: 1000, emoji: '🏆' }
                  ].map((milestone) => (
                    <div
                      key={milestone.days}
                      className={`p-2 rounded-lg text-center transition-all ${
                        currentStreak >= milestone.days
                          ? 'bg-gradient-to-br from-orange-100 to-red-100 border-2 border-orange-400'
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="text-xl mb-1">{milestone.emoji}</div>
                      <div className={`text-xs font-bold ${
                        currentStreak >= milestone.days ? 'text-orange-600' : 'text-gray-500'
                      }`}>
                        {milestone.label}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">+{milestone.bonus}</div>
                      {currentStreak >= milestone.days && (
                        <div className="text-xs text-green-600 font-bold mt-1">✓</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Today's Progress */}
            <div className="bg-white rounded-2xl p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">Today's Progress</h2>
                <button className="text-sm text-accent-blue hover:underline">
                  View all
                </button>
              </div>
              
              {/* Simple bar chart */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium text-gray-600 w-24">Completed</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-green-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.min((stats.completedToday / Math.max(stats.totalToday, 1)) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-800 w-16 text-right">
                    {stats.completedToday}/{stats.totalToday}
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium text-gray-600 w-24">Study Time</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-purple-400 to-purple-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.min((stats.studyMinutesToday / 240) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-800 w-16 text-right">
                    {stats.studyMinutesToday}m
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium text-gray-600 w-24">Weekly</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-400 to-indigo-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.min((stats.studyMinutesWeek / 1260) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-800 w-16 text-right">
                    {Math.floor(stats.studyMinutesWeek / 60)}h
                  </span>
                </div>
              </div>
            </div>

            {/* Badges Section */}
            <div className="bg-white rounded-2xl p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-800">Badge Collection</h2>
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">
                    {allBadgesWithStatus.filter(b => b.unlocked).length}/{allBadgesWithStatus.length}
                  </span>
                </div>
                <button
                  onClick={() => setShowBadgeInfo(!showBadgeInfo)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  title="Learn about badges"
                >
                  <Info className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              
              {/* Badge Info Tooltip */}
              {showBadgeInfo && (
                <div className="mb-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200 relative">
                  <button
                    onClick={() => setShowBadgeInfo(false)}
                    className="absolute top-2 right-2 p-1 hover:bg-white rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                  <h3 className="font-bold text-gray-800 mb-3 text-sm flex items-center gap-2">
                    🏅 How Badges Work
                  </h3>
                  <div className="space-y-3 text-xs text-gray-700">
                    <div>
                      <p className="font-semibold text-gray-800 mb-1">🎯 How to Unlock Badges:</p>
                      <p className="text-gray-600 leading-relaxed">
                        Complete tasks, study regularly, and reach milestones to unlock badges! Each badge has specific requirements - check what you need to do when hovering over locked badges.
                      </p>
                    </div>
                    
                    <div className="border-t border-purple-200 pt-2">
                      <p className="font-semibold text-gray-800 mb-2">🌟 Badge Tiers & Rewards:</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white rounded-lg p-2">
                          <div className="flex items-center gap-1 mb-1">
                            <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                            <span className="font-bold text-gray-700">Common</span>
                          </div>
                          <p className="text-gray-600 text-[10px]">Easy to get</p>
                          <p className="font-bold text-blue-600 text-xs">+50 points</p>
                        </div>
                        <div className="bg-white rounded-lg p-2">
                          <div className="flex items-center gap-1 mb-1">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span className="font-bold text-blue-700">Rare</span>
                          </div>
                          <p className="text-gray-600 text-[10px]">Takes effort</p>
                          <p className="font-bold text-blue-600 text-xs">+100 points</p>
                        </div>
                        <div className="bg-white rounded-lg p-2">
                          <div className="flex items-center gap-1 mb-1">
                            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                            <span className="font-bold text-purple-700">Epic</span>
                          </div>
                          <p className="text-gray-600 text-[10px]">Challenging!</p>
                          <p className="font-bold text-purple-600 text-xs">+200 points</p>
                        </div>
                        <div className="bg-white rounded-lg p-2">
                          <div className="flex items-center gap-1 mb-1">
                            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                            <span className="font-bold text-orange-700">Legendary</span>
                          </div>
                          <p className="text-gray-600 text-[10px]">Super hard!</p>
                          <p className="font-bold text-orange-600 text-xs">+500 points</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t border-purple-200 pt-2">
                      <p className="font-semibold text-gray-800 mb-1">💡 Pro Tips:</p>
                      <ul className="space-y-1 text-gray-600 text-[11px] list-disc list-inside">
                        <li>Start with <strong>Common</strong> badges - they're easier to unlock!</li>
                        <li>Focus on <strong>Daily</strong> badges first for quick wins</li>
                        <li><strong>Weekly</strong> badges give more points but need consistency</li>
                        <li>Collect all badges to become the ultimate champion! 🏆</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-2 mt-2">
                      <p className="font-bold text-orange-800 text-xs mb-1">✨ Why Collect Badges?</p>
                      <p className="text-orange-700 text-[10px]">
                        Badges boost your leaderboard score and show off your study achievements. Higher tier badges = more points = higher rank!
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {allBadgesWithStatus.map((badge) => {
                  // Tier colors and labels
                  const tierConfig = {
                    common: { color: 'bg-gray-500', label: 'Common', textColor: 'text-gray-500' },
                    rare: { color: 'bg-blue-500', label: 'Rare', textColor: 'text-blue-500' },
                    epic: { color: 'bg-purple-500', label: 'Epic', textColor: 'text-purple-500' },
                    legendary: { color: 'bg-orange-500', label: 'Legendary', textColor: 'text-orange-500' }
                  };
                  const tier = tierConfig[badge.tier] || tierConfig.common;
                  
                  return (
                    <div
                      key={badge.id}
                      className={`text-center transition-all duration-200 cursor-pointer relative ${
                        badge.unlocked 
                          ? 'hover:scale-110'
                          : 'opacity-60'
                      }`}
                      title={badge.unlocked ? badge.description : badge.requirement}
                    >
                      {/* Tier Badge */}
                      <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10 ${tier.color} text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase shadow-sm`}>
                        {tier.label}
                      </div>
                      
                      {/* Badge Icon */}
                      <div className={`w-28 h-28 mx-auto mb-1 flex items-center justify-center transition-transform duration-200 ${
                        badge.special && badge.unlocked ? 'drop-shadow-lg' : ''
                      }`}>
                        <BadgeIcon
                          badgeId={BADGE_ID_MAP[badge.id] || badge.id}
                          state={badge.unlocked ? 'enabled' : 'disabled'}
                          size={96}
                          decorative={false}
                        />
                      </div>
                      
                      <div className={`text-[10px] font-bold mb-0.5 ${
                        badge.unlocked ? 'text-gray-800' : 'text-gray-500'
                      }`}>
                        {badge.name}
                      </div>
                      <div className={`text-[10px] ${
                        badge.unlocked ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {badge.unlocked ? badge.description : badge.requirement}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Tier Legend */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-xs font-semibold text-gray-700 mb-2">Badge Tiers:</div>
                <div className="flex flex-wrap gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                    <span className="text-gray-600">Common (50 pts)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-gray-600">Rare (100 pts)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span className="text-gray-600">Epic (200 pts)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span className="text-gray-600">Legendary (500 pts)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Leaderboard */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-card sticky top-6 z-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">Leaderboard</h2>
                <button
                  onClick={() => setShowPointsInfo(!showPointsInfo)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  title="How points are calculated"
                >
                  <Info className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              
              {/* Points Info Tooltip */}
              {showPointsInfo && (
                <div className="mb-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border-2 border-blue-200 relative">
                  <button
                    onClick={() => setShowPointsInfo(false)}
                    className="absolute top-2 right-2 p-1 hover:bg-white rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                  <h3 className="font-bold text-gray-800 mb-3 text-sm flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    How to Earn Points
                  </h3>
                  <div className="space-y-2 text-xs text-gray-700">
                    <div className="flex justify-between items-start">
                      <span className="flex items-start gap-1">
                        <span className="text-blue-600 font-bold">✓</span>
                        <span>Complete a task</span>
                      </span>
                      <span className="font-bold text-blue-600">10 pts</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="flex items-start gap-1">
                        <span className="text-purple-600 font-bold">⏱</span>
                        <span>Study time</span>
                      </span>
                      <span className="font-bold text-purple-600">1 pt/min</span>
                    </div>
                    <div className="border-t border-blue-200 my-2 pt-2">
                      <div className="font-bold text-gray-800 mb-1">🏅 Badge Bonuses:</div>
                      <div className="pl-4 space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Common</span>
                          <span className="font-bold">50 pts</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Rare</span>
                          <span className="font-bold">100 pts</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Epic</span>
                          <span className="font-bold">200 pts</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Legendary</span>
                          <span className="font-bold text-orange-600">500 pts</span>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-blue-200 my-2 pt-2">
                      <div className="font-bold text-gray-800 mb-1">🔥 Streak Rewards:</div>
                      <div className="pl-4 space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Daily streak</span>
                          <span className="font-bold">25 pts/day</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">7-day bonus</span>
                          <span className="font-bold text-orange-600">+200 pts</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">14-day bonus</span>
                          <span className="font-bold text-orange-600">+400 pts</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">30-day bonus</span>
                          <span className="font-bold text-orange-600">+1000 pts</span>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-blue-200 my-2 pt-2">
                      <div className="font-bold text-gray-800 mb-1">📊 Completion Milestones:</div>
                      <div className="pl-4 space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-600">50% complete</span>
                          <span className="font-bold">50 pts</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">75% complete</span>
                          <span className="font-bold">100 pts</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">90% complete</span>
                          <span className="font-bold">200 pts</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">100% complete</span>
                          <span className="font-bold text-green-600">500 pts</span>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-blue-200 my-2 pt-2">
                      <div className="font-bold text-gray-800 mb-1">🎯 Exam Score Bonuses:</div>
                      <div className="pl-4 space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-600">&gt;90% score</span>
                          <span className="font-bold">100 pts</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">&gt;95% score</span>
                          <span className="font-bold text-orange-600">200 pts</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">100% score</span>
                          <span className="font-bold text-green-600">300 pts</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                {leaderboard.map((profile, idx) => {
                  const colors = [
                    'bg-pastel-orange-light',
                    'bg-pastel-green-light', 
                    'bg-pastel-coral-light',
                    'bg-gray-50',
                    'bg-gray-50',
                  ];
                  const bgColor = colors[idx];
                  const rankColors = ['text-yellow-600', 'text-gray-400', 'text-orange-600'];
                  
                  return (
                    <div
                      key={profile.id}
                      className={`${bgColor} rounded-xl p-4 flex items-center gap-3 hover:scale-102 transition-transform`}
                    >
                      <div className={`text-2xl font-bold ${rankColors[idx] || 'text-gray-400'} w-8`}>
                        #{idx + 1}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                        {profile.name[0]}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-gray-800">
                          {profile.name}
                        </div>
                        <div className="text-xs text-gray-600">
                          {profile.class}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-accent-blue">
                          <Zap className="w-4 h-4" />
                          <span className="text-sm font-bold">{profile.points}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {profiles.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Add profiles to see rankings! 👥
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-accent-purple to-accent-blue rounded-2xl p-6 shadow-card text-white">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-90">Upcoming Exams</span>
                  <span className="font-bold text-lg">{stats.upcomingExams}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-90">Active Subjects</span>
                  <span className="font-bold text-lg">{stats.totalSubjects}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-90">Today's Tasks</span>
                  <span className="font-bold text-lg">{stats.totalToday}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple CheckCircle icon component
const CheckCircleIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default Dashboard;
