import React, { useState, useEffect } from 'react';
import { useGamification } from '../../contexts/GamificationContext';

const AITaskSuggestions = ({ onAddTask, userProgress, upcomingDeadlines }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const { userStats, addPoints } = useGamification();

  // Mock AI suggestions based on user data
  const generateAISuggestions = () => {
    const baseSuggestions = [
      {
        id: 1,
        type: 'study-session',
        title: 'Review React Hooks Concepts',
        description: 'Based on your recent quiz performance, reviewing React Hooks will help solidify your understanding.',
        priority: 'high',
        estimatedTime: 45,
        course: 'Introduction to React',
        aiReason: 'Quiz score below 80% in React Hooks section',
        points: 30,
        difficulty: 'medium',
        suggestedTime: '2:00 PM - 2:45 PM',
        tags: ['review', 'concepts', 'react']
      },
      {
        id: 2,
        type: 'practice',
        title: 'JavaScript Array Methods Practice',
        description: 'Strengthen your JavaScript fundamentals with focused practice on array methods.',
        priority: 'medium',
        estimatedTime: 30,
        course: 'Advanced JavaScript',
        aiReason: 'Identified as prerequisite for upcoming assignment',
        points: 25,
        difficulty: 'easy',
        suggestedTime: '10:00 AM - 10:30 AM',
        tags: ['practice', 'javascript', 'arrays']
      },
      {
        id: 3,
        type: 'preparation',
        title: 'Prepare for UI/UX Design Quiz',
        description: 'Quiz scheduled for tomorrow. Review design principles and color theory.',
        priority: 'high',
        estimatedTime: 60,
        course: 'UI/UX Design Principles',
        aiReason: 'Quiz scheduled within 24 hours',
        points: 40,
        difficulty: 'medium',
        suggestedTime: '7:00 PM - 8:00 PM',
        tags: ['quiz-prep', 'design', 'theory']
      },
      {
        id: 4,
        type: 'break',
        title: 'Take a Learning Break',
        description: 'You\'ve been studying for 2 hours. Take a 15-minute break to maintain focus.',
        priority: 'low',
        estimatedTime: 15,
        aiReason: 'Optimal learning pattern suggests break time',
        points: 5,
        difficulty: 'easy',
        suggestedTime: 'Now',
        tags: ['wellness', 'break', 'productivity']
      },
      {
        id: 5,
        type: 'review',
        title: 'Weekly Progress Review',
        description: 'Analyze your learning progress and adjust study goals for next week.',
        priority: 'medium',
        estimatedTime: 20,
        aiReason: 'Weekly review improves retention by 25%',
        points: 20,
        difficulty: 'easy',
        suggestedTime: 'Sunday 6:00 PM',
        tags: ['review', 'planning', 'goals']
      },
      {
        id: 6,
        type: 'skill-building',
        title: 'Advanced CSS Grid Layout',
        description: 'Expand your frontend skills with advanced CSS Grid techniques.',
        priority: 'low',
        estimatedTime: 90,
        course: 'Frontend Development',
        aiReason: 'Skill gap identified in portfolio projects',
        points: 50,
        difficulty: 'hard',
        suggestedTime: 'Weekend morning',
        tags: ['css', 'layout', 'advanced']
      }
    ];

    // Filter suggestions based on user's current streak and performance
    let filteredSuggestions = baseSuggestions;

    if (userStats.currentStreak < 3) {
      // Add motivation-focused suggestions for low streak users
      filteredSuggestions.unshift({
        id: 7,
        type: 'motivation',
        title: 'Quick Win: 10-Minute Learning Session',
        description: 'Build momentum with a short, focused learning session to restart your streak.',
        priority: 'high',
        estimatedTime: 10,
        aiReason: 'Low streak detected - quick wins boost motivation',
        points: 15,
        difficulty: 'easy',
        suggestedTime: 'Next available slot',
        tags: ['motivation', 'quick-win', 'streak']
      });
    }

    if (userStats.currentStreak >= 7) {
      // Add challenge suggestions for high-streak users
      filteredSuggestions.push({
        id: 8,
        type: 'challenge',
        title: 'Advanced Project Challenge',
        description: 'Take on a complex project to push your skills to the next level.',
        priority: 'medium',
        estimatedTime: 120,
        aiReason: 'High streak indicates readiness for challenges',
        points: 100,
        difficulty: 'hard',
        suggestedTime: 'Weekend project time',
        tags: ['challenge', 'project', 'advanced']
      });
    }

    return filteredSuggestions.slice(0, 4); // Return top 4 suggestions
  };

  useEffect(() => {
    setIsLoading(true);
    // Simulate AI processing time
    setTimeout(() => {
      setSuggestions(generateAISuggestions());
      setIsLoading(false);
    }, 1500);
  }, [userStats.currentStreak]);

  const getPriorityColor = (priority) => {
    const colors = {
      'high': 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300',
      'medium': 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300',
      'low': 'border-green-400 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
    };
    return colors[priority] || 'border-gray-400 bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300';
  };

  const getDifficultyIcon = (difficulty) => {
    const icons = {
      'easy': '🟢',
      'medium': '🟡',
      'hard': '🔴'
    };
    return icons[difficulty] || '⚪';
  };

  const getTypeIcon = (type) => {
    const icons = {
      'study-session': '📚',
      'practice': '💪',
      'preparation': '🎯',
      'break': '☕',
      'review': '🔍',
      'skill-building': '🚀',
      'motivation': '⚡',
      'challenge': '🏆'
    };
    return icons[type] || '📝';
  };

  const handleAcceptSuggestion = (suggestion) => {
    // Add points for accepting AI suggestion
    addPoints(5);
    
    // Convert suggestion to calendar event
    const event = {
      id: Date.now(),
      title: suggestion.title,
      type: suggestion.type,
      date: new Date(), // For now, schedule for today
      duration: suggestion.estimatedTime,
      course: suggestion.course,
      points: suggestion.points,
      completed: false,
      priority: suggestion.priority,
      description: suggestion.description,
      aiGenerated: true
    };

    onAddTask(event);
    
    // Remove accepted suggestion
    setSuggestions(suggestions.filter(s => s.id !== suggestion.id));
  };

  const handleDismissSuggestion = (suggestionId) => {
    setSuggestions(suggestions.filter(s => s.id !== suggestionId));
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            AI is analyzing your learning patterns...
          </h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
          <span className="mr-2">🤖</span>
          AI Study Suggestions
        </h2>
        <div className="flex items-center space-x-2 bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
            AI Active
          </span>
        </div>
      </div>

      {suggestions.length > 0 ? (
        <div className="space-y-4">
          {suggestions.map(suggestion => (
            <div
              key={suggestion.id}
              className={`border-2 rounded-xl p-4 transition-all duration-200 hover:shadow-md ${getPriorityColor(suggestion.priority)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getTypeIcon(suggestion.type)}</span>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">
                      {suggestion.title}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-full">
                        {suggestion.estimatedTime} min
                      </span>
                      <span className="text-xs flex items-center space-x-1">
                        {getDifficultyIcon(suggestion.difficulty)}
                        <span>{suggestion.difficulty}</span>
                      </span>
                      {suggestion.points && (
                        <span className="text-xs px-2 py-1 bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-full">
                          +{suggestion.points} pts
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAcceptSuggestion(suggestion)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleDismissSuggestion(suggestion.id)}
                    className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                {suggestion.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center space-x-1">
                    <span>🧠</span>
                    <span>{suggestion.aiReason}</span>
                  </span>
                  {suggestion.suggestedTime && (
                    <span className="flex items-center space-x-1">
                      <span>⏰</span>
                      <span>{suggestion.suggestedTime}</span>
                    </span>
                  )}
                </div>
                {suggestion.course && (
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    {suggestion.course}
                  </span>
                )}
              </div>

              {suggestion.tags && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {suggestion.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🎉</div>
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
            All caught up!
          </h3>
          <p className="text-gray-500 dark:text-gray-500">
            You're doing great! AI will suggest new tasks as your learning progresses.
          </p>
        </div>
      )}

      {/* AI Insights */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-lg">💡</span>
          <h4 className="font-semibold text-purple-700 dark:text-purple-300">AI Insight</h4>
        </div>
        <p className="text-sm text-purple-600 dark:text-purple-400">
          {userStats.currentStreak >= 7 
            ? "Your consistent learning streak shows excellent discipline! Consider taking on more challenging tasks."
            : userStats.currentStreak >= 3
              ? "You're building good momentum! Keep up the regular study sessions."
              : "Starting small with quick wins can help build a strong learning habit."
          }
        </p>
      </div>
    </div>
  );
};

export default AITaskSuggestions;
