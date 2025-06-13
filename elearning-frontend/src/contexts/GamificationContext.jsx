import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const GamificationContext = createContext();

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};

export const GamificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  
  // User gamification data
  const [userStats, setUserStats] = useState({
    points: 0,
    diamonds: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
    level: 1,
    xpToNextLevel: 100,
    totalXP: 0,
    rank: 0,
    achievements: [],
    dailyGoal: 30, // minutes
    dailyProgress: 0
  });

  // Leaderboard data
  const [leaderboard, setLeaderboard] = useState([]);
  
  // Achievement definitions
  const achievements = [
    {
      id: 'first_course',
      name: 'First Steps',
      description: 'Complete your first course',
      icon: '🎯',
      points: 100,
      diamonds: 5
    },
    {
      id: 'streak_7',
      name: 'Week Warrior',
      description: 'Maintain a 7-day learning streak',
      icon: '🔥',
      points: 200,
      diamonds: 10
    },
    {
      id: 'streak_30',
      name: 'Monthly Master',
      description: 'Maintain a 30-day learning streak',
      icon: '🏆',
      points: 500,
      diamonds: 25
    },
    {
      id: 'points_1000',
      name: 'Point Collector',
      description: 'Earn 1000 points',
      icon: '💎',
      points: 150,
      diamonds: 15
    },
    {
      id: 'quiz_master',
      name: 'Quiz Master',
      description: 'Score 100% on 5 quizzes',
      icon: '🧠',
      points: 300,
      diamonds: 20
    }
  ];

  // Initialize user stats when authenticated
  useEffect(() => {
    if (isAuthenticated() && user) {
      loadUserStats();
      generateLeaderboard();
    }
  }, [user, isAuthenticated]);

  const loadUserStats = () => {
    // In a real app, this would fetch from API
    const savedStats = localStorage.getItem(`gamification_${user.id}`);
    if (savedStats) {
      const parsed = JSON.parse(savedStats);
      setUserStats(parsed);
      updateStreak(parsed);
    } else {
      // Initialize with demo data for new users
      const initialStats = {
        points: Math.floor(Math.random() * 500) + 100,
        diamonds: Math.floor(Math.random() * 20) + 5,
        currentStreak: Math.floor(Math.random() * 10) + 1,
        longestStreak: Math.floor(Math.random() * 15) + 5,
        lastActivityDate: new Date().toISOString().split('T')[0],
        level: Math.floor(Math.random() * 5) + 1,
        xpToNextLevel: 100,
        totalXP: Math.floor(Math.random() * 800) + 200,
        rank: 0,
        achievements: ['first_course'],
        dailyGoal: 30,
        dailyProgress: Math.floor(Math.random() * 45) + 5
      };
      setUserStats(initialStats);
      saveUserStats(initialStats);
    }
  };

  const saveUserStats = (stats) => {
    localStorage.setItem(`gamification_${user.id}`, JSON.stringify(stats));
  };

  const updateStreak = (stats) => {
    const today = new Date().toISOString().split('T')[0];
    const lastActivity = stats.lastActivityDate;
    
    if (lastActivity) {
      const daysDiff = Math.floor((new Date(today) - new Date(lastActivity)) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        // Continue streak
        return;
      } else if (daysDiff > 1) {
        // Streak broken
        const updatedStats = { ...stats, currentStreak: 0 };
        setUserStats(updatedStats);
        saveUserStats(updatedStats);
      }
    }
  };

  const generateLeaderboard = () => {
    // Generate mock leaderboard data
    const mockUsers = [
      { id: 1, name: 'Alex Chen', points: 2450, level: 8, avatar: '👨‍💻' },
      { id: 2, name: 'Sarah Johnson', points: 2380, level: 7, avatar: '👩‍🎓' },
      { id: 3, name: 'Mike Rodriguez', points: 2200, level: 7, avatar: '👨‍🎓' },
      { id: 4, name: 'Emma Wilson', points: 2100, level: 6, avatar: '👩‍💼' },
      { id: 5, name: 'David Kim', points: 1950, level: 6, avatar: '👨‍🔬' },
      { id: 6, name: user?.name || 'You', points: userStats.points, level: userStats.level, avatar: '👤', isCurrentUser: true },
      { id: 7, name: 'Lisa Zhang', points: 1800, level: 5, avatar: '👩‍🏫' },
      { id: 8, name: 'Tom Brown', points: 1650, level: 5, avatar: '👨‍🎨' },
      { id: 9, name: 'Anna Davis', points: 1500, level: 4, avatar: '👩‍💻' },
      { id: 10, name: 'Chris Lee', points: 1350, level: 4, avatar: '👨‍🚀' }
    ];

    // Sort by points and add rank
    const sortedUsers = mockUsers.sort((a, b) => b.points - a.points);
    const rankedUsers = sortedUsers.map((user, index) => ({
      ...user,
      rank: index + 1
    }));

    setLeaderboard(rankedUsers);
    
    // Update current user's rank
    const currentUserRank = rankedUsers.find(u => u.isCurrentUser)?.rank || 0;
    setUserStats(prev => ({ ...prev, rank: currentUserRank }));
  };

  const addPoints = (points, reason = '') => {
    const newStats = {
      ...userStats,
      points: userStats.points + points,
      totalXP: userStats.totalXP + points
    };

    // Check for level up
    if (newStats.totalXP >= userStats.level * 100) {
      newStats.level += 1;
      newStats.xpToNextLevel = newStats.level * 100 - newStats.totalXP;
    }

    setUserStats(newStats);
    saveUserStats(newStats);
    generateLeaderboard();
    
    return newStats;
  };

  const addDiamonds = (diamonds, reason = '') => {
    const newStats = {
      ...userStats,
      diamonds: userStats.diamonds + diamonds
    };

    setUserStats(newStats);
    saveUserStats(newStats);
    
    return newStats;
  };

  const updateDailyProgress = (minutes) => {
    const newProgress = Math.min(userStats.dailyProgress + minutes, userStats.dailyGoal);
    const newStats = {
      ...userStats,
      dailyProgress: newProgress,
      lastActivityDate: new Date().toISOString().split('T')[0]
    };

    // Check if daily goal is reached
    if (newProgress >= userStats.dailyGoal && userStats.dailyProgress < userStats.dailyGoal) {
      // Goal reached! Add bonus
      newStats.points += 50;
      newStats.diamonds += 2;
      newStats.currentStreak += 1;
      newStats.longestStreak = Math.max(newStats.longestStreak, newStats.currentStreak);
    }

    setUserStats(newStats);
    saveUserStats(newStats);
    generateLeaderboard();
    
    return newStats;
  };

  const unlockAchievement = (achievementId) => {
    if (userStats.achievements.includes(achievementId)) {
      return false; // Already unlocked
    }

    const achievement = achievements.find(a => a.id === achievementId);
    if (!achievement) return false;

    const newStats = {
      ...userStats,
      achievements: [...userStats.achievements, achievementId],
      points: userStats.points + achievement.points,
      diamonds: userStats.diamonds + achievement.diamonds
    };

    setUserStats(newStats);
    saveUserStats(newStats);
    generateLeaderboard();
    
    return achievement;
  };

  const getAchievementById = (id) => {
    return achievements.find(a => a.id === id);
  };

  const getUnlockedAchievements = () => {
    return userStats.achievements.map(id => getAchievementById(id)).filter(Boolean);
  };

  const getLockedAchievements = () => {
    return achievements.filter(a => !userStats.achievements.includes(a.id));
  };

  const resetDailyProgress = () => {
    const newStats = {
      ...userStats,
      dailyProgress: 0
    };
    setUserStats(newStats);
    saveUserStats(newStats);
  };

  const value = {
    userStats,
    leaderboard,
    achievements,
    addPoints,
    addDiamonds,
    updateDailyProgress,
    unlockAchievement,
    getAchievementById,
    getUnlockedAchievements,
    getLockedAchievements,
    resetDailyProgress
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
};
