import React, { useState } from 'react';
import { useGamification } from '../../contexts/GamificationContext';

const Leaderboard = () => {
  const { leaderboard, userStats } = useGamification();
  const [timeframe, setTimeframe] = useState('all'); // all, week, month

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank, isCurrentUser) => {
    if (isCurrentUser) return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700';
    switch (rank) {
      case 1: return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700';
      case 2: return 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-600';
      case 3: return 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-700';
      default: return 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700';
    }
  };

  const topUsers = leaderboard.slice(0, 10);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
          <span className="mr-2">🏆</span>
          Leaderboard
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeframe('all')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              timeframe === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => setTimeframe('month')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              timeframe === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setTimeframe('week')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              timeframe === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            This Week
          </button>
        </div>
      </div>

      {/* Current User Rank Highlight */}
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {userStats.rank}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Your Rank</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{userStats.points} points</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">Level {userStats.level}</p>
            <p className="text-xs text-blue-600 dark:text-blue-400">Keep learning to climb!</p>
          </div>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {topUsers.slice(0, 3).map((user, index) => {
          const positions = [1, 0, 2]; // Second place, First place, Third place
          const actualIndex = positions[index];
          const actualUser = topUsers[actualIndex];
          
          return (
            <div
              key={actualUser.id}
              className={`text-center ${index === 1 ? 'order-1' : index === 0 ? 'order-2' : 'order-3'}`}
            >
              <div className={`relative ${index === 1 ? 'transform scale-110' : ''}`}>
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl mb-2 ${
                  actualUser.rank === 1 ? 'bg-yellow-100 border-4 border-yellow-400' :
                  actualUser.rank === 2 ? 'bg-gray-100 border-4 border-gray-400' :
                  'bg-orange-100 border-4 border-orange-400'
                }`}>
                  {actualUser.avatar}
                </div>
                <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-lg ${
                  actualUser.rank === 1 ? 'bg-yellow-400' :
                  actualUser.rank === 2 ? 'bg-gray-400' :
                  'bg-orange-400'
                }`}>
                  {getRankIcon(actualUser.rank)}
                </div>
              </div>
              <h3 className={`font-semibold text-sm ${actualUser.isCurrentUser ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                {actualUser.name}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">{actualUser.points} pts</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">Level {actualUser.level}</p>
            </div>
          );
        })}
      </div>

      {/* Full Leaderboard */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Top Learners</h3>
        {topUsers.map((user) => (
          <div
            key={user.id}
            className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 hover:shadow-md ${getRankColor(user.rank, user.isCurrentUser)}`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                user.rank <= 3 ? 'text-white' : 'text-gray-600 dark:text-gray-300'
              } ${
                user.rank === 1 ? 'bg-yellow-500' :
                user.rank === 2 ? 'bg-gray-500' :
                user.rank === 3 ? 'bg-orange-500' :
                'bg-gray-200 dark:bg-gray-600'
              }`}>
                {user.rank <= 3 ? getRankIcon(user.rank) : user.rank}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg">{user.avatar}</span>
                <div>
                  <p className={`font-medium ${user.isCurrentUser ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                    {user.name}
                    {user.isCurrentUser && <span className="ml-1 text-xs">(You)</span>}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Level {user.level}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900 dark:text-white">{user.points.toLocaleString()}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">points</p>
            </div>
          </div>
        ))}
      </div>

      {/* Motivational Message */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
        <div className="flex items-center space-x-2">
          <span className="text-lg">🚀</span>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Keep Learning!</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {userStats.rank <= 3 
                ? "Amazing! You're in the top 3!" 
                : userStats.rank <= 5 
                ? "Great job! You're in the top 5!" 
                : "Keep going! Every lesson counts!"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
