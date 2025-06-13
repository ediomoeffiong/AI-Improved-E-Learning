import React, { useState } from 'react';
import { useGamification } from '../../contexts/GamificationContext';

const Achievements = () => {
  const { getUnlockedAchievements, getLockedAchievements } = useGamification();
  const [showAll, setShowAll] = useState(false);

  const unlockedAchievements = getUnlockedAchievements();
  const lockedAchievements = getLockedAchievements();

  const AchievementCard = ({ achievement, isUnlocked }) => (
    <div className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
      isUnlocked 
        ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 shadow-lg hover:shadow-xl' 
        : 'bg-gray-50 border-gray-200 opacity-60 dark:bg-gray-800 dark:border-gray-600'
    }`}>
      {isUnlocked && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
      
      <div className="flex items-start space-x-3">
        <div className={`text-3xl ${isUnlocked ? '' : 'grayscale'}`}>
          {achievement.icon}
        </div>
        <div className="flex-1">
          <h3 className={`font-semibold ${isUnlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
            {achievement.name}
          </h3>
          <p className={`text-sm ${isUnlocked ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>
            {achievement.description}
          </p>
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{achievement.points}</span>
            </div>
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 2l3 6v14l-3-6V2zm5 0l3 6-3 6-3-6 3-6zm5 0v14l-3 6V8l3-6z"/>
              </svg>
              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">{achievement.diamonds}</span>
            </div>
          </div>
        </div>
      </div>
      
      {!isUnlocked && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 opacity-20 rounded-xl"></div>
      )}
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
          <span className="mr-2">🏆</span>
          Achievements
        </h2>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {unlockedAchievements.length} of {unlockedAchievements.length + lockedAchievements.length} unlocked
          </div>
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium"
          >
            {showAll ? 'Show Less' : 'Show All'}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600 dark:text-gray-400">Achievement Progress</span>
          <span className="text-gray-900 dark:text-white font-medium">
            {Math.round((unlockedAchievements.length / (unlockedAchievements.length + lockedAchievements.length)) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
            style={{ 
              width: `${(unlockedAchievements.length / (unlockedAchievements.length + lockedAchievements.length)) * 100}%` 
            }}
          ></div>
        </div>
      </div>

      {/* Recently Unlocked */}
      {unlockedAchievements.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <span className="mr-2">✨</span>
            Recently Unlocked
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {unlockedAchievements.slice(-2).map((achievement) => (
              <AchievementCard 
                key={achievement.id} 
                achievement={achievement} 
                isUnlocked={true} 
              />
            ))}
          </div>
        </div>
      )}

      {/* All Achievements */}
      {showAll && (
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <span className="mr-2">🎯</span>
            All Achievements
          </h3>
          
          {/* Unlocked Achievements */}
          {unlockedAchievements.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-green-600 dark:text-green-400 mb-3 uppercase tracking-wide">
                Unlocked ({unlockedAchievements.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {unlockedAchievements.map((achievement) => (
                  <AchievementCard 
                    key={achievement.id} 
                    achievement={achievement} 
                    isUnlocked={true} 
                  />
                ))}
              </div>
            </div>
          )}

          {/* Locked Achievements */}
          {lockedAchievements.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
                Locked ({lockedAchievements.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lockedAchievements.map((achievement) => (
                  <AchievementCard 
                    key={achievement.id} 
                    achievement={achievement} 
                    isUnlocked={false} 
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Next Achievement Hint */}
      {lockedAchievements.length > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="flex items-start space-x-3">
            <span className="text-lg">🎯</span>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Next Achievement</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Work towards "{lockedAchievements[0].name}" - {lockedAchievements[0].description}
              </p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  Reward: {lockedAchievements[0].points} points + {lockedAchievements[0].diamonds} diamonds
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Achievements;
