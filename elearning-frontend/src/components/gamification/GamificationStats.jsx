import React from 'react';
import { useGamification } from '../../contexts/GamificationContext';

const GamificationStats = () => {
  const { userStats } = useGamification();

  const getStreakColor = (streak) => {
    if (streak >= 30) return 'text-red-500';
    if (streak >= 14) return 'text-orange-500';
    if (streak >= 7) return 'text-yellow-500';
    return 'text-blue-500';
  };

  const getStreakIcon = (streak) => {
    if (streak >= 30) return '🔥🔥🔥';
    if (streak >= 14) return '🔥🔥';
    if (streak >= 7) return '🔥';
    return '⚡';
  };

  const getLevelProgress = () => {
    const currentLevelXP = (userStats.level - 1) * 100;
    const nextLevelXP = userStats.level * 100;
    const progress = ((userStats.totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
    return Math.min(progress, 100);
  };

  const getDailyProgressPercentage = () => {
    return (userStats.dailyProgress / userStats.dailyGoal) * 100;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Points Card */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="bg-white/20 rounded-lg p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <span className="text-2xl font-bold">{userStats.points.toLocaleString()}</span>
        </div>
        <div>
          <h3 className="font-semibold text-lg">Points</h3>
          <p className="text-blue-100 text-sm">Level {userStats.level}</p>
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1">
            <span>Level Progress</span>
            <span>{Math.round(getLevelProgress())}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${getLevelProgress()}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Diamonds Card */}
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="bg-white/20 rounded-lg p-2">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 2l3 6v14l-3-6V2zm5 0l3 6-3 6-3-6 3-6zm5 0v14l-3 6V8l3-6z"/>
            </svg>
          </div>
          <span className="text-2xl font-bold">{userStats.diamonds}</span>
        </div>
        <div>
          <h3 className="font-semibold text-lg">Diamonds</h3>
          <p className="text-purple-100 text-sm">Premium currency</p>
        </div>
        <div className="mt-3">
          <div className="flex items-center space-x-1">
            <span className="text-xs">💎</span>
            <span className="text-xs">Earn through achievements</span>
          </div>
        </div>
      </div>

      {/* Streak Card */}
      <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="bg-white/20 rounded-lg p-2">
            <span className="text-xl">{getStreakIcon(userStats.currentStreak)}</span>
          </div>
          <span className={`text-2xl font-bold ${getStreakColor(userStats.currentStreak)}`}>
            {userStats.currentStreak}
          </span>
        </div>
        <div>
          <h3 className="font-semibold text-lg">Day Streak</h3>
          <p className="text-orange-100 text-sm">Best: {userStats.longestStreak} days</p>
        </div>
        <div className="mt-3">
          <div className="flex items-center space-x-1">
            <span className="text-xs">🏆</span>
            <span className="text-xs">Keep learning daily!</span>
          </div>
        </div>
      </div>

      {/* Daily Goal Card */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="bg-white/20 rounded-lg p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-2xl font-bold">{userStats.dailyProgress}</span>
        </div>
        <div>
          <h3 className="font-semibold text-lg">Daily Goal</h3>
          <p className="text-green-100 text-sm">{userStats.dailyGoal} min target</p>
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1">
            <span>Progress</span>
            <span>{Math.round(getDailyProgressPercentage())}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(getDailyProgressPercentage(), 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamificationStats;
