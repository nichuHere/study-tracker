import React, { useMemo, useState } from 'react';
import { 
  Clock, Target, TrendingUp, Zap, Info, X, Flame, AlertCircle, ChevronDown, ChevronUp
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
  const [showSubjectInsights, setShowSubjectInsights] = useState(true);
  const [leaderboardType, setLeaderboardType] = useState('all-time'); // 'all-time' or 'daily'
  
  // Filter tasks for active profile only
  const profileTasks = useMemo(() => {
    return activeProfile ? tasks.filter(t => t.profile_id === activeProfile.id) : tasks;
  }, [tasks, activeProfile]);
  
  // Filter subjects for active profile only
  const profileSubjects = useMemo(() => {
    return activeProfile ? subjects.filter(s => s.profile_id === activeProfile.id) : subjects;
  }, [subjects, activeProfile]);
  
  // Calculate current streak
  const currentStreak = useMemo(() => calculateStreak(profileTasks), [profileTasks]);
  
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
      
      const dayTasks = profileTasks.filter(t => t.date === dateStr);
      const completedTasks = dayTasks.filter(t => t.completed);
      const completedTime = completedTasks.reduce((sum, t) => sum + (t.duration || 0), 0);
      
      calendar.push({
        date: dateStr,
        day: date.getDate(),
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        hasActivity: completedTasks.length > 0,
        taskCount: completedTasks.length,
        completedTime,
        isToday: dateStr === getTodayDateIST()
      });
    }
    
    return calendar;
  }, [profileTasks]);
  
  // Calculate stats
  const stats = useMemo(() => {
    const today = getTodayDateIST();
    const todayTasks = profileTasks.filter(t => t.date === today);
    const completedToday = todayTasks.filter(t => t.completed);
    const totalMinutesToday = completedToday.reduce((sum, t) => sum + (t.duration || 0), 0);
    
    // Calculate weekly study time (last 7 days)
    const todayDate = new Date(today);
    const weekAgo = new Date(todayDate);
    weekAgo.setDate(weekAgo.getDate() - 6); // Last 7 days including today
    const weekAgoStr = weekAgo.toISOString().split('T')[0];
    
    const weeklyTasks = profileTasks.filter(t => {
      return t.completed && t.date >= weekAgoStr && t.date <= today;
    });
    const totalMinutesWeek = weeklyTasks.reduce((sum, t) => sum + (t.duration || 0), 0);
    
    // Get all tasks for this profile
    const allTasks = profileTasks;
    const allCompleted = allTasks.filter(t => t.completed);
    
    // Calculate completion percentage
    const completionRate = allTasks.length > 0 
      ? Math.round((allCompleted.length / allTasks.length) * 100)
      : 0;
    
    // Upcoming exams (filter by active profile)
    const profileExams = activeProfile ? exams.filter(e => e.profile_id === activeProfile.id) : exams;
    const upcomingExams = profileExams.filter(exam => {
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
      totalSubjects: profileSubjects.length,
    };
  }, [profileTasks, exams, profileSubjects, activeProfile]);

  // Get all badges with locked/unlocked status
  const allBadgesWithStatus = useMemo(() => {
    return ALL_BADGES.map(badge => ({
      ...badge,
      unlocked: badge.checkUnlocked({ ...stats, totalSubjects: profileSubjects.length })
    }));
  }, [stats, profileSubjects.length]);

  // Get subject-wise analytics
  const subjectAnalytics = useMemo(() => {
    const subjectData = {};

    profileSubjects.forEach(subject => {
      const subjectTasks = profileTasks.filter(t => t.subject === subject.name);
      const completedTasks = subjectTasks.filter(t => t.completed);
      const totalTime = completedTasks.reduce((sum, t) => sum + (t.duration || 0), 0);
      
      // Last 7 days activity
      const recentTasks = subjectTasks.filter(t => {
        const taskDate = new Date(t.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return taskDate >= weekAgo;
      });

      subjectData[subject.name] = {
        name: subject.name,
        totalTasks: subjectTasks.length,
        completedTasks: completedTasks.length,
        totalTime,
        recentActivity: recentTasks.length,
        completionRate: subjectTasks.length > 0 
          ? Math.round((completedTasks.length / subjectTasks.length) * 100) 
          : 0
      };
    });

    return Object.values(subjectData);
  }, [profileTasks, profileSubjects]);

  // Get most active subjects (last 7 days) - show all
  const mostActiveSubjects = useMemo(() => {
    return subjectAnalytics
      .filter(s => s.recentActivity > 0)
      .sort((a, b) => b.recentActivity - a.recentActivity);
  }, [subjectAnalytics]);

  // Get neglected subjects (no activity in last 3 days or never studied) - show all
  const neglectedSubjects = useMemo(() => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    return subjectAnalytics.filter(subject => {
      // Include subjects never studied
      if (subject.totalTasks === 0) return true;
      // Include subjects with no recent activity
      const recentTasks = profileTasks.filter(t => 
        t.subject === subject.name && 
        new Date(t.date) >= threeDaysAgo
      );
      return recentTasks.length === 0;
    });
  }, [profileTasks, subjectAnalytics]);

  // Calculate daily points (only from today's activity)
  const calculateDailyPoints = (profile, tasks) => {
    const today = getTodayDateIST();
    let dailyPoints = 0;
    
    // 1. Today's completed tasks (10 pts each)
    const todayTasks = tasks.filter(t => t.date === today && t.completed);
    dailyPoints += todayTasks.length * 10;
    
    // 2. Today's study time (1 pt per minute)
    const todayStudyMinutes = todayTasks.reduce((sum, t) => sum + (t.duration || 0), 0);
    dailyPoints += todayStudyMinutes;
    
    // Note: Badges, streaks, and milestones are cumulative achievements,
    // so they aren't included in daily points - only task completion and study time for today
    
    return dailyPoints;
  };

  // Calculate leaderboard with real points
  const leaderboard = useMemo(() => {
    return profiles.map(profile => {
      // Get tasks for this profile
      const profileTasks = tasks.filter(t => t.profile_id === profile.id);
      
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
        totalSubjects: subjects.filter(s => s.profile_id === profile.id).length
      };
      
      const unlockedBadges = ALL_BADGES.filter(badge => 
        badge.checkUnlocked(profileStats)
      );
      
      // Get exams for this profile
      const profileExams = exams.filter(e => e.profile_id === profile.id);
      
      // Calculate points based on leaderboard type
      const allTimePoints = calculatePoints(profile, profileTasks, unlockedBadges, profileExams);
      const dailyPoints = calculateDailyPoints(profile, profileTasks);
      const points = leaderboardType === 'daily' ? dailyPoints : allTimePoints;
      
      return {
        ...profile,
        points,
        dailyPoints,
        allTimePoints,
        unlockedBadges: unlockedBadges.length
      };
    })
    .sort((a, b) => b.points - a.points)
    .slice(0, 5);
  }, [profiles, tasks, subjects, exams, leaderboardType]);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="glass-card rounded-2xl p-6 mb-8 shadow-glass">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Dashboard
          </h1>
          <p className="text-gray-700 font-medium">
            Welcome back, {activeProfile?.name || 'Student'}! 👋
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Completion Card */}
              <div className="glass-card rounded-2xl p-6 shadow-glass hover:shadow-glass-lg transition-all transform hover:scale-105">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-indigo-600">Completed</span>
                  <CheckCircleIcon className="w-5 h-5 text-indigo-500" />
                </div>
                <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {stats.completionRate}%
                </div>
                <p className="text-xs text-gray-600 mt-1 font-medium">
                  {stats.completedToday}/{stats.totalToday} tasks today
                </p>
              </div>

              {/* Subjects Card */}
              <div className="glass-card rounded-2xl p-6 shadow-glass hover:shadow-glass-lg transition-all transform hover:scale-105">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-purple-600">Today</span>
                  <Clock className="w-5 h-5 text-purple-500" />
                </div>
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {Math.floor(stats.studyMinutesToday / 60)}<span className="text-2xl">.{Math.floor((stats.studyMinutesToday % 60) / 6)}</span>
                </div>
                <p className="text-xs text-gray-600 mt-1 font-medium">
                  hours studied today
                </p>
              </div>

              {/* Study Hours Card */}
              <div className="glass-card rounded-2xl p-6 shadow-glass hover:shadow-glass-lg transition-all transform hover:scale-105">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-pink-600">This Week</span>
                  <TrendingUp className="w-5 h-5 text-pink-500" />
                </div>
                <div className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                  {Math.floor(stats.studyMinutesWeek / 60)}<span className="text-2xl">h</span>
                </div>
                <p className="text-xs text-gray-600 mt-1 font-medium">
                  {stats.studyMinutesWeek} mins total
                </p>
              </div>
            </div>

            {/* Study Streak Section - Enhanced with Activity */}
            <div className="glass-card rounded-2xl p-6 shadow-glass">
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
                  <div className="text-6xl font-semibold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
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
                  <p className="text-sm bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent font-semibold">
                    👑 You're a Study Champion! Keep this legendary streak alive!
                  </p>
                )}
              </div>
              
              {/* Enhanced Calendar - Current Week with Activity */}
              <div className="mb-4">
                <div className="text-xs font-semibold text-gray-600 mb-3">This Week's Activity</div>
                <div className="grid grid-cols-7 gap-2">
                  {streakCalendar.map((day, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1">
                      <div className="text-xs text-gray-500 font-medium">{day.dayName}</div>
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center text-xs font-semibold transition-all hover:scale-105 ${
                          day.hasActivity
                            ? day.isToday
                              ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-lg ring-2 ring-orange-300'
                              : 'bg-gradient-to-br from-orange-300 to-red-400 text-white shadow-md'
                            : day.isToday
                            ? 'bg-gray-200 text-gray-500 ring-2 ring-gray-300'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                        title={`${day.date}: ${day.completedTime}m study time, ${day.taskCount} task${day.taskCount !== 1 ? 's' : ''}`}
                      >
                        {day.isToday ? '•' : day.hasActivity ? '✓' : day.day}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Study Hours Below - Subtle */}
                <div className="mt-2 grid grid-cols-7 gap-2">
                  {streakCalendar.map((day, idx) => {
                    const hours = day.completedTime / 60;
                    return (
                      <div key={idx} className="text-center">
                        <div className="text-[10px] text-gray-400">
                          {day.completedTime > 0 ? (
                            hours >= 1 
                              ? `${hours.toFixed(1)}h`
                              : `${day.completedTime}m`
                          ) : '—'}
                        </div>
                      </div>
                    );
                  })}
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
                      <div className={`text-xs font-semibold ${
                        currentStreak >= milestone.days ? 'text-orange-600' : 'text-gray-500'
                      }`}>
                        {milestone.label}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">+{milestone.bonus}</div>
                      {currentStreak >= milestone.days && (
                        <div className="text-xs text-green-600 font-semibold mt-1">✓</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Subject Insights - Compact */}
            <div className="glass-card rounded-2xl shadow-glass overflow-hidden">
              <div 
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/20 transition-colors"
                onClick={() => setShowSubjectInsights(!showSubjectInsights)}
              >
                <h2 className="text-lg font-bold text-gray-800">Subject Insights</h2>
                {showSubjectInsights ? 
                  <ChevronUp className="w-5 h-5 text-gray-600" /> : 
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                }
              </div>
              
              {showSubjectInsights && (
                <div className="px-4 pb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Most Active Subjects */}
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2 text-sm">
                        <Target className="w-4 h-4 text-green-600" />
                        Most Active (Last 7 Days)
                      </h3>
                      {mostActiveSubjects.length === 0 ? (
                        <p className="text-gray-500 text-sm">No activity yet</p>
                      ) : (
                        <div className="space-y-2">
                          {mostActiveSubjects.map((subject, i) => (
                            <div key={i} className="glass-white flex items-center justify-between p-3 rounded-xl shadow-soft">
                              <span className="text-sm font-semibold text-gray-700">{subject.name}</span>
                              <span className="text-xs text-green-700 font-bold">
                                {subject.recentActivity} tasks
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Neglected Subjects */}
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2 text-sm">
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                        Needs Attention
                      </h3>
                      {neglectedSubjects.length === 0 ? (
                        <p className="text-gray-500 text-sm">All subjects active!</p>
                      ) : (
                        <div className="space-y-2">
                          {neglectedSubjects.map((subject, i) => (
                            <div key={i} className="glass-white flex items-center justify-between p-3 rounded-xl shadow-soft border-l-4 border-rose-400">
                              <span className="text-sm font-semibold text-gray-700">{subject.name}</span>
                              <span className="text-xs text-rose-600 font-bold">
                                {subject.totalTasks === 0 ? 'Never studied' : 'No activity (3+ days)'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Today's Progress */}
            <div className="glass-card rounded-2xl p-6 shadow-glass">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">Today's Progress</h2>
                <button className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold hover:underline">
                  View all
                </button>
              </div>
              
              {/* Simple bar chart */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="text-sm font-semibold text-gray-700 w-24">Completed</div>
                  <div className="flex-1 glass-white rounded-full h-3 overflow-hidden shadow-inner">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-green-500 h-full rounded-full transition-all shadow-sm"
                      style={{ width: `${Math.min((stats.completedToday / Math.max(stats.totalToday, 1)) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-700 w-16 text-right">
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
                  <span className="text-sm font-semibold text-gray-500 w-16 text-right">
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
                  <span className="text-sm font-semibold text-gray-500 w-16 text-right">
                    {Math.floor(stats.studyMinutesWeek / 60)}h
                  </span>
                </div>
              </div>
            </div>

            {/* Badges Section */}
            <div className="glass-card rounded-2xl p-6 shadow-glass">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-800">Badge Collection</h2>
                  <span className="glass-white px-2 py-1 rounded-full text-xs font-bold text-indigo-700 shadow-sm">
                    {allBadgesWithStatus.filter(b => b.unlocked).length}/{allBadgesWithStatus.length}
                  </span>
                </div>
                <button
                  onClick={() => setShowBadgeInfo(!showBadgeInfo)}
                  className="p-1 hover:bg-white/40 rounded-full transition-colors"
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
                  <h3 className="font-semibold text-gray-500 mb-3 text-sm flex items-center gap-2">
                    🏅 How Badges Work
                  </h3>
                  <div className="space-y-3 text-xs text-gray-500">
                    <div>
                      <p className="font-semibold text-gray-500 mb-1">🎯 How to Unlock Badges:</p>
                      <p className="text-gray-600 leading-relaxed">
                        Complete tasks, study regularly, and reach milestones to unlock badges! Each badge has specific requirements - check what you need to do when hovering over locked badges.
                      </p>
                    </div>
                    
                    <div className="border-t border-purple-200 pt-2">
                      <p className="font-semibold text-gray-500 mb-2">🌟 Badge Tiers & Rewards:</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white rounded-lg p-2">
                          <div className="flex items-center gap-1 mb-1">
                            <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                            <span className="font-semibold text-gray-500">Common</span>
                          </div>
                          <p className="text-gray-600 text-[10px]">Easy to get</p>
                          <p className="font-semibold text-blue-600 text-xs">+50 points</p>
                        </div>
                        <div className="bg-white rounded-lg p-2">
                          <div className="flex items-center gap-1 mb-1">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span className="font-semibold text-blue-700">Rare</span>
                          </div>
                          <p className="text-gray-600 text-[10px]">Takes effort</p>
                          <p className="font-semibold text-blue-600 text-xs">+100 points</p>
                        </div>
                        <div className="bg-white rounded-lg p-2">
                          <div className="flex items-center gap-1 mb-1">
                            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                            <span className="font-semibold text-purple-700">Epic</span>
                          </div>
                          <p className="text-gray-600 text-[10px]">Challenging!</p>
                          <p className="font-semibold text-purple-600 text-xs">+200 points</p>
                        </div>
                        <div className="bg-white rounded-lg p-2">
                          <div className="flex items-center gap-1 mb-1">
                            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                            <span className="font-semibold text-orange-700">Legendary</span>
                          </div>
                          <p className="text-gray-600 text-[10px]">Super hard!</p>
                          <p className="font-semibold text-orange-600 text-xs">+500 points</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t border-purple-200 pt-2">
                      <p className="font-semibold text-gray-500 mb-1">💡 Pro Tips:</p>
                      <ul className="space-y-1 text-gray-600 text-[11px] list-disc list-inside">
                        <li>Start with <strong>Common</strong> badges - they're easier to unlock!</li>
                        <li>Focus on <strong>Daily</strong> badges first for quick wins</li>
                        <li><strong>Weekly</strong> badges give more points but need consistency</li>
                        <li>Collect all badges to become the ultimate champion! 🏆</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-2 mt-2">
                      <p className="font-semibold text-orange-800 text-xs mb-1">✨ Why Collect Badges?</p>
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
                      <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10 ${tier.color} text-white text-[8px] font-semibold px-2 py-0.5 rounded-full uppercase shadow-sm`}>
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
                      
                      <div className={`text-[10px] font-semibold mb-0.5 ${
                        badge.unlocked ? 'text-gray-500' : 'text-gray-500'
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
                <div className="text-xs font-semibold text-gray-500 mb-2">Badge Tiers:</div>
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
            <div className="glass-card rounded-2xl p-6 shadow-glass sticky top-6 z-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">Leaderboard</h2>
                <button
                  onClick={() => setShowPointsInfo(!showPointsInfo)}
                  className="p-1 hover:bg-white/40 rounded-full transition-colors"
                  title="How points are calculated"
                >
                  <Info className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              
              {/* Toggle between All-Time and Daily */}
              <div className="flex gap-2 mb-4 p-1 glass-white rounded-xl shadow-inner">
                <button
                  onClick={() => setLeaderboardType('all-time')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                    leaderboardType === 'all-time'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  🏆 All-Time
                </button>
                <button
                  onClick={() => setLeaderboardType('daily')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                    leaderboardType === 'daily'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📅 Today
                </button>
              </div>
              
              {/* Daily mode info */}
              {leaderboardType === 'daily' && (
                <div className="mb-3 px-3 py-2 glass-white border border-green-300 rounded-xl text-xs text-green-700 font-medium shadow-sm">
                  <strong>Today's Leaderboard:</strong> Only counts tasks completed & study time from today
                </div>
              )}
              
              {/* Points Info Tooltip - Compact */}
              {showPointsInfo && (
                <div className="mb-4 glass-card rounded-xl p-3 border-2 border-indigo-300 relative max-h-96 overflow-y-auto shadow-glass">
                  <button
                    onClick={() => setShowPointsInfo(false)}
                    className="absolute top-2 right-2 p-1 hover:bg-white/40 rounded-full transition-colors z-10"
                  >
                    <X className="w-3 h-3 text-gray-600" />
                  </button>
                  <h3 className="font-bold text-gray-700 mb-2 text-xs flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-yellow-500" />
                    How to Earn Points
                  </h3>
                  <div className="space-y-1.5 text-xs text-gray-500">
                    {/* Basic Points - 2 column */}
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 pb-1.5 border-b border-blue-200">
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1">
                          <span className="text-blue-600">✓</span>
                          <span className="text-[11px]">Task</span>
                        </span>
                        <span className="font-semibold text-blue-600 text-[11px]">10</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1">
                          <span className="text-purple-600">⏱</span>
                          <span className="text-[11px]">Study</span>
                        </span>
                        <span className="font-semibold text-purple-600 text-[11px]">1/min</span>
                      </div>
                    </div>
                    
                    {/* Badges - 2 column grid */}
                    <div className="pt-1">
                      <div className="font-semibold text-gray-500 mb-1 text-[11px]">🏅 Badges</div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px]">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Common</span>
                          <span className="font-semibold">50</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Rare</span>
                          <span className="font-semibold">100</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Epic</span>
                          <span className="font-semibold">200</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Legendary</span>
                          <span className="font-semibold text-orange-600">500</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Streaks - 2 column grid */}
                    <div className="pt-1.5 border-t border-blue-200">
                      <div className="font-semibold text-gray-500 mb-1 text-[11px] flex items-center gap-1">
                        🔥 Streaks
                        <span className="text-[9px] font-normal text-gray-400">(Bonuses stack!)</span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px]">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Daily</span>
                          <span className="font-semibold">25/day</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">7-day</span>
                          <span className="font-semibold text-orange-600">+200</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">14-day</span>
                          <span className="font-semibold text-orange-600">+400</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">30-day</span>
                          <span className="font-semibold text-orange-600">+1000</span>
                        </div>
                      </div>
                      <div className="mt-1 text-[9px] text-gray-400 italic">
                        * 30-day streak = (30×25) + 200 + 400 + 1000 = 2,350 pts!
                      </div>
                    </div>
                    
                    {/* Completion - 2 column grid */}
                    <div className="pt-1.5 border-t border-blue-200">
                      <div className="font-semibold text-gray-500 mb-1 text-[11px] flex items-center gap-1">
                        📊 Completion
                        <span className="text-[9px] font-normal text-gray-400">(Min 10 tasks)</span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px]">
                        <div className="flex justify-between">
                          <span className="text-gray-600">50%</span>
                          <span className="font-semibold">50</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">75%</span>
                          <span className="font-semibold">100</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">90%</span>
                          <span className="font-semibold">200</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">100%</span>
                          <span className="font-semibold text-green-600">500</span>
                        </div>
                      </div>
                      <div className="mt-1 text-[9px] text-gray-400 italic">
                        * Only counts tasks up to today
                      </div>
                    </div>
                    
                    {/* Exam Scores - 1 column (fewer items) */}
                    <div className="pt-1.5 border-t border-blue-200">
                      <div className="font-semibold text-gray-500 mb-1 text-[11px] flex items-center gap-1">
                        🎯 Exam Scores
                        <span className="text-[9px] font-normal text-gray-400">(Per subject)</span>
                      </div>
                      <div className="space-y-0.5 text-[10px]">
                        <div className="flex justify-between">
                          <span className="text-gray-600">90-94%</span>
                          <span className="font-semibold">100 pts</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">95-99%</span>
                          <span className="font-semibold text-orange-600">200 pts</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">100%</span>
                          <span className="font-semibold text-green-600">300 pts</span>
                        </div>
                      </div>
                      <div className="mt-1 text-[9px] text-gray-400 italic">
                        * 5 subjects at 100% = 1,500 pts total!
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
                      <div className={`text-2xl font-semibold ${rankColors[idx] || 'text-gray-400'} w-8`}>
                        #{idx + 1}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {profile.name[0]}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-500">
                          {profile.name}
                        </div>
                        <div className="text-xs text-gray-600">
                          {profile.class}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`flex items-center gap-1 ${
                          leaderboardType === 'daily' ? 'text-green-600' : 'text-accent-blue'
                        }`}>
                          <Zap className="w-4 h-4" />
                          <span className="text-sm font-semibold">{profile.points}</span>
                        </div>
                        {/* Show opposite score as subtitle */}
                        {leaderboardType === 'daily' ? (
                          <div className="text-[10px] text-gray-500 text-right mt-0.5">
                            🏆 {profile.allTimePoints} all-time
                          </div>
                        ) : (
                          <div className="text-[10px] text-gray-500 text-right mt-0.5">
                            📅 {profile.dailyPoints} today
                          </div>
                        )}
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
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-90">Upcoming Exams</span>
                  <span className="font-semibold text-lg">{stats.upcomingExams}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-90">Active Subjects</span>
                  <span className="font-semibold text-lg">{stats.totalSubjects}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-90">Today's Tasks</span>
                  <span className="font-semibold text-lg">{stats.totalToday}</span>
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
