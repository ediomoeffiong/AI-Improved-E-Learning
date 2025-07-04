import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useGamification } from '../../contexts/GamificationContext';
import { USER_ROLES } from '../../constants/roles';

// Enhanced mock data for recommendations
const recommendedCourses = [
  {
    id: 1,
    title: 'React Native Fundamentals',
    description: 'Learn to build mobile apps using React Native',
    level: 'Intermediate',
    duration: '8 weeks',
    match: '95%',
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80',
    instructor: 'Sarah Johnson',
    rating: 4.8,
    students: 2847,
    price: 149.99,
    originalPrice: 199.99,
    skills: ['React Native', 'Mobile Development', 'JavaScript', 'iOS', 'Android'],
    aiReason: 'Based on your React.js expertise and mobile development interest',
    pointsReward: 100
  },
  {
    id: 2,
    title: 'Advanced Data Visualization',
    description: 'Master D3.js and create interactive data visualizations',
    level: 'Advanced',
    duration: '6 weeks',
    match: '90%',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    instructor: 'Dr. Emily Rodriguez',
    rating: 4.9,
    students: 1523,
    price: 179.99,
    originalPrice: 249.99,
    skills: ['D3.js', 'Data Visualization', 'JavaScript', 'SVG', 'Analytics'],
    aiReason: 'Perfect match for your data science background',
    pointsReward: 120
  },
  {
    id: 3,
    title: 'Node.js Backend Development',
    description: 'Build scalable backend services with Node.js',
    level: 'Intermediate',
    duration: '10 weeks',
    match: '85%',
    image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?auto=format&fit=crop&w=800&q=80',
    instructor: 'Michael Chen',
    rating: 4.7,
    students: 3421,
    price: 129.99,
    originalPrice: 179.99,
    skills: ['Node.js', 'Express', 'MongoDB', 'REST APIs', 'Authentication'],
    aiReason: 'Complements your frontend skills perfectly',
    pointsReward: 90
  }
];

const recommendedResources = [
  {
    id: 1,
    title: 'JavaScript: The Hard Parts',
    type: 'Video Series',
    description: 'Deep dive into closures, asynchronous JavaScript, and more',
    reason: 'Based on your performance in Advanced JavaScript Concepts',
    link: '#',
    duration: '4.5 hours',
    difficulty: 'Advanced',
    rating: 4.8,
    pointsReward: 25,
    icon: '🎥'
  },
  {
    id: 2,
    title: 'Python for Data Science Handbook',
    type: 'E-Book',
    description: 'Comprehensive guide to using Python for data analysis',
    reason: 'Based on your interest in Data Science Fundamentals',
    link: '#',
    duration: '320 pages',
    difficulty: 'Intermediate',
    rating: 4.9,
    pointsReward: 30,
    icon: '📚'
  },
  {
    id: 3,
    title: 'CSS Grid Workshop',
    type: 'Interactive Tutorial',
    description: 'Master CSS Grid layout through hands-on exercises',
    reason: 'Complements your Web Development skills',
    link: '#',
    duration: '2 hours',
    difficulty: 'Beginner',
    rating: 4.7,
    pointsReward: 20,
    icon: '🎯'
  },
  {
    id: 4,
    title: 'AI & Machine Learning Fundamentals',
    type: 'Podcast Series',
    description: 'Weekly episodes covering AI trends and practical applications',
    reason: 'Trending topic in your field',
    link: '#',
    duration: '12 episodes',
    difficulty: 'Beginner',
    rating: 4.6,
    pointsReward: 15,
    icon: '🎧'
  }
];

const skillGaps = [
  {
    id: 1,
    skill: 'Data Structures & Algorithms',
    description: 'Improve your problem-solving skills with fundamental CS concepts',
    recommendedAction: 'Take the "Algorithms & Data Structures" course',
    importance: 'high',
    currentLevel: 2,
    targetLevel: 5,
    estimatedTime: '6-8 weeks',
    pointsReward: 150,
    icon: '🧠',
    relatedCourses: 3
  },
  {
    id: 2,
    skill: 'SQL Database Management',
    description: 'Learn to design and query relational databases effectively',
    recommendedAction: 'Complete the "SQL Fundamentals" tutorial series',
    importance: 'medium',
    currentLevel: 3,
    targetLevel: 5,
    estimatedTime: '4-5 weeks',
    pointsReward: 100,
    icon: '🗄️',
    relatedCourses: 2
  },
  {
    id: 3,
    skill: 'Testing & Test-Driven Development',
    description: 'Write better code through automated testing practices',
    recommendedAction: 'Join the "JavaScript Testing Patterns" workshop',
    importance: 'medium',
    currentLevel: 1,
    targetLevel: 4,
    estimatedTime: '3-4 weeks',
    pointsReward: 80,
    icon: '🧪',
    relatedCourses: 2
  },
  {
    id: 4,
    skill: 'Cloud Computing & DevOps',
    description: 'Master modern deployment and infrastructure management',
    recommendedAction: 'Start with "AWS Fundamentals" certification path',
    importance: 'high',
    currentLevel: 1,
    targetLevel: 5,
    estimatedTime: '8-10 weeks',
    pointsReward: 200,
    icon: '☁️',
    relatedCourses: 4
  }
];

function PersonalizedRecommendations() {
  const { isAuthenticated, getUserName, getUserRole } = useAuth();
  const { userStats, addPoints } = useGamification();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showAIInsights, setShowAIInsights] = useState(true);

  // Fallback check for Super Admin role directly from localStorage
  const isSuperAdminFromStorage = () => {
    try {
      const superAdminUser = localStorage.getItem('superAdminUser');
      if (superAdminUser) {
        const userData = JSON.parse(superAdminUser);
        return userData.role === USER_ROLES.SUPER_ADMIN || userData.role === USER_ROLES.SUPER_MODERATOR;
      }
    } catch (error) {
      console.error('Error checking super admin from storage:', error);
    }
    return false;
  };

  // Get appropriate gradient based on user role
  const getButtonGradient = () => {
    if (getUserRole() === USER_ROLES.SUPER_ADMIN || getUserRole() === USER_ROLES.SUPER_MODERATOR || isSuperAdminFromStorage()) {
      return 'bg-gradient-to-r from-blue-600 via-blue-700 to-red-500 hover:from-blue-700 hover:via-blue-800 hover:to-red-600';
    }
    return 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700';
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRefreshing(false);
    if (isAuthenticated()) {
      addPoints(10, 'Refreshed AI recommendations');
    }
  };

  const handleEnrollCourse = (course) => {
    if (isAuthenticated()) {
      addPoints(course.pointsReward, `Enrolled in ${course.title}`);
    }
  };

  const handleAccessResource = (resource) => {
    if (isAuthenticated()) {
      addPoints(resource.pointsReward, `Accessed ${resource.title}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Enhanced Header with AI Insights */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">🤖 AI-Powered Recommendations</h1>
              {isAuthenticated() && (
                <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white px-3 py-1 rounded-full text-sm">
                  <span>💎 {userStats.diamonds}</span>
                  <span>⭐ {userStats.points}</span>
                  <span>🔥 {userStats.currentStreak}</span>
                </div>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {isAuthenticated()
                ? `Personalized learning path for ${getUserName()}, based on your progress and goals`
                : 'Discover courses and resources tailored to your learning journey'
              }
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <button
              onClick={() => setShowAIInsights(!showAIInsights)}
              className={`inline-flex items-center px-4 py-2 ${getButtonGradient()} text-white text-sm font-medium rounded-lg transition-all duration-200`}
            >
              <span className="mr-2">🧠</span>
              {showAIInsights ? 'Hide' : 'Show'} AI Insights
            </button>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50"
            >
              <svg className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              {isRefreshing ? 'Analyzing...' : 'Refresh AI (+10 pts)'}
            </button>
          </div>
        </div>

        {/* AI Insights Panel */}
        {showAIInsights && isAuthenticated() && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 mb-6 border border-indigo-200 dark:border-gray-600">
            <div className="flex items-start space-x-4">
              <div className={`w-12 h-12 ${getButtonGradient()} rounded-xl flex items-center justify-center`}>
                <span className="text-2xl">🤖</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">AI Learning Assistant</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-purple-600 dark:text-purple-400 font-semibold">Learning Style</div>
                    <div className="text-gray-700 dark:text-gray-300">Visual & Hands-on</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-blue-600 dark:text-blue-400 font-semibold">Optimal Study Time</div>
                    <div className="text-gray-700 dark:text-gray-300">2-3 hours/day</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-green-600 dark:text-green-400 font-semibold">Next Milestone</div>
                    <div className="text-gray-700 dark:text-gray-300">Level {userStats.level + 1} in 5 days</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: '🎯 All Recommendations', count: recommendedCourses.length + skillGaps.length },
            { id: 'courses', label: '📚 Courses', count: recommendedCourses.length },
            { id: 'skills', label: '🚀 Skill Gaps', count: skillGaps.length },
            { id: 'resources', label: '📖 Resources', count: recommendedResources.length }
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedFilter === filter.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>
      </div>

      {/* Recommended Courses */}
      {(selectedFilter === 'all' || selectedFilter === 'courses') && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
              <span className="mr-3">📚</span>
              AI-Recommended Courses
              <span className="ml-3 bg-gradient-to-r from-green-500 to-blue-500 text-white text-xs px-2 py-1 rounded-full">
                {recommendedCourses.length} matches
              </span>
            </h2>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              🎯 Personalized for your learning path
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedCourses.map((course) => (
              <div key={course.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="relative">
                  <img src={course.image} alt={course.title} className="w-full h-48 object-cover" />
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-blue-500 text-white px-3 py-1 text-sm font-bold rounded-full shadow-lg">
                    {course.match} Match
                  </div>
                  <div className="absolute top-3 left-3 bg-black/50 text-white px-2 py-1 text-xs rounded-full">
                    {course.level}
                  </div>
                  <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-white px-2 py-1 text-xs rounded-full">
                    ⏱️ {course.duration}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white leading-tight">{course.title}</h3>
                    <div className="flex items-center ml-2">
                      <span className="text-yellow-400 text-sm">⭐</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">{course.rating}</span>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm leading-relaxed">{course.description}</p>

                  <div className="mb-4">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">👨‍🏫 {course.instructor}</div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 italic">{course.aiReason}</div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {course.skills.slice(0, 3).map((skill, index) => (
                      <span key={index} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs">
                        {skill}
                      </span>
                    ))}
                    {course.skills.length > 3 && (
                      <span className="text-gray-500 dark:text-gray-400 text-xs px-2 py-1">
                        +{course.skills.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-gray-800 dark:text-white">${course.price}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 line-through">${course.originalPrice}</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">👥 {course.students.toLocaleString()}</div>
                  </div>

                  <button
                    onClick={() => handleEnrollCourse(course)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    <span className="flex items-center justify-center">
                      <span className="mr-2">🚀</span>
                      Enroll Now
                      {isAuthenticated() && (
                        <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                          +{course.pointsReward} pts
                        </span>
                      )}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skill Gaps */}
      {(selectedFilter === 'all' || selectedFilter === 'skills') && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
              <span className="mr-3">🚀</span>
              Skill Development Opportunities
              <span className="ml-3 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-2 py-1 rounded-full">
                {skillGaps.length} areas identified
              </span>
            </h2>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              🎯 AI-analyzed skill gaps
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {skillGaps.map((skill) => (
              <div
                key={skill.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mr-4 text-2xl ${
                      skill.importance === 'high'
                        ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                        : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                    }`}>
                      {skill.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">{skill.skill}</h3>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        skill.importance === 'high'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {skill.importance.charAt(0).toUpperCase() + skill.importance.slice(1)} Priority
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Potential Reward</div>
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">+{skill.pointsReward} pts</div>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">{skill.description}</p>

                {/* Skill Level Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>Current Level: {skill.currentLevel}/5</span>
                    <span>Target: {skill.targetLevel}/5</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(skill.currentLevel / 5) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>⏱️ Est. time: {skill.estimatedTime}</span>
                    <span>📚 {skill.relatedCourses} related courses</span>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">Recommended Action</div>
                      <div className="text-sm text-blue-700 dark:text-blue-300">{skill.recommendedAction}</div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200">
                    Start Learning
                  </button>
                  <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    View Courses
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recommended Resources */}
      {(selectedFilter === 'all' || selectedFilter === 'resources') && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
              <span className="mr-3">📖</span>
              Curated Learning Resources
              <span className="ml-3 bg-gradient-to-r from-green-500 to-teal-500 text-white text-xs px-2 py-1 rounded-full">
                {recommendedResources.length} resources
              </span>
            </h2>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              🎯 Handpicked by AI
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedResources.map((resource) => (
              <div key={resource.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-2xl">
                    {resource.icon}
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-400 text-sm">⭐</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{resource.rating}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">{resource.title}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">{resource.type}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      resource.difficulty === 'Beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      resource.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {resource.difficulty}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm leading-relaxed">{resource.description}</p>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">AI Recommendation</div>
                  <div className="text-sm text-gray-700 dark:text-gray-300 italic">{resource.reason}</div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <span>📊 {resource.duration}</span>
                  {isAuthenticated() && (
                    <span className="text-purple-600 dark:text-purple-400 font-medium">+{resource.pointsReward} pts</span>
                  )}
                </div>

                <button
                  onClick={() => handleAccessResource(resource)}
                  className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  <span className="flex items-center justify-center">
                    <span className="mr-2">🚀</span>
                    Access Resource
                  </span>
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Floating AI Assistant Button */}
      {isAuthenticated() && (
        <div className="fixed bottom-56 right-8 z-50">
          <button
            onClick={() => setShowAIInsights(!showAIInsights)}
            className={`${getButtonGradient()} text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110`}
            title="Toggle AI Insights"
          >
            <span className="text-xl">🧠</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default PersonalizedRecommendations;

