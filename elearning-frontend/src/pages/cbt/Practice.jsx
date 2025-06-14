import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Practice = () => {
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  const [practiceTests] = useState([
    {
      id: 1,
      title: 'Basic Mathematics',
      subject: 'Mathematics',
      difficulty: 'Easy',
      questions: 20,
      timeLimit: 30,
      attempts: 3,
      bestScore: 85,
      description: 'Practice basic arithmetic, algebra, and geometry concepts.',
      topics: ['Arithmetic', 'Basic Algebra', 'Geometry'],
      lastAttempt: '2024-01-10'
    },
    {
      id: 2,
      title: 'Advanced Calculus',
      subject: 'Mathematics',
      difficulty: 'Hard',
      questions: 15,
      timeLimit: 45,
      attempts: 1,
      bestScore: 72,
      description: 'Advanced calculus problems including derivatives and integrals.',
      topics: ['Derivatives', 'Integrals', 'Limits'],
      lastAttempt: '2024-01-08'
    },
    {
      id: 3,
      title: 'Programming Fundamentals',
      subject: 'Computer Science',
      difficulty: 'Medium',
      questions: 25,
      timeLimit: 40,
      attempts: 2,
      bestScore: 90,
      description: 'Basic programming concepts and problem-solving.',
      topics: ['Variables', 'Loops', 'Functions'],
      lastAttempt: '2024-01-12'
    },
    {
      id: 4,
      title: 'Data Structures',
      subject: 'Computer Science',
      difficulty: 'Hard',
      questions: 20,
      timeLimit: 50,
      attempts: 0,
      bestScore: null,
      description: 'Arrays, linked lists, stacks, queues, and trees.',
      topics: ['Arrays', 'Linked Lists', 'Trees'],
      lastAttempt: null
    },
    {
      id: 5,
      title: 'Basic Physics',
      subject: 'Physics',
      difficulty: 'Easy',
      questions: 18,
      timeLimit: 35,
      attempts: 4,
      bestScore: 78,
      description: 'Fundamental physics concepts and formulas.',
      topics: ['Mechanics', 'Thermodynamics', 'Waves'],
      lastAttempt: '2024-01-09'
    },
    {
      id: 6,
      title: 'Organic Chemistry',
      subject: 'Chemistry',
      difficulty: 'Medium',
      questions: 22,
      timeLimit: 45,
      attempts: 1,
      bestScore: 82,
      description: 'Organic compounds, reactions, and mechanisms.',
      topics: ['Hydrocarbons', 'Functional Groups', 'Reactions'],
      lastAttempt: '2024-01-11'
    }
  ]);

  const subjects = ['all', 'Mathematics', 'Computer Science', 'Physics', 'Chemistry'];
  const difficulties = ['all', 'Easy', 'Medium', 'Hard'];

  const filteredTests = practiceTests.filter(test => {
    const subjectMatch = selectedSubject === 'all' || test.subject === selectedSubject;
    const difficultyMatch = selectedDifficulty === 'all' || test.difficulty === selectedDifficulty;
    return subjectMatch && difficultyMatch;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score) => {
    if (!score) return 'text-gray-500';
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Practice Tests</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Improve your skills with practice tests before taking official assessments
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Filter Tests</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {subjects.map(subject => (
                <option key={subject} value={subject}>
                  {subject === 'all' ? 'All Subjects' : subject}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Difficulty
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {difficulties.map(difficulty => (
                <option key={difficulty} value={difficulty}>
                  {difficulty === 'all' ? 'All Difficulties' : difficulty}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Practice Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTests.map((test) => (
          <div key={test.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                    {test.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{test.subject}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(test.difficulty)}`}>
                  {test.difficulty}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {test.description}
              </p>

              {/* Topics */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {test.topics.map((topic, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              {/* Test Info */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Questions:</span>
                  <span className="ml-1 font-medium text-gray-900 dark:text-white">{test.questions}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Time:</span>
                  <span className="ml-1 font-medium text-gray-900 dark:text-white">{test.timeLimit} min</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Attempts:</span>
                  <span className="ml-1 font-medium text-gray-900 dark:text-white">{test.attempts}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Best Score:</span>
                  <span className={`ml-1 font-medium ${getScoreColor(test.bestScore)}`}>
                    {test.bestScore ? `${test.bestScore}%` : 'Not attempted'}
                  </span>
                </div>
              </div>

              {/* Last Attempt */}
              {test.lastAttempt && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  Last attempt: {test.lastAttempt}
                </div>
              )}

              {/* Action Button */}
              <Link
                to={`/cbt/practice/${test.id}`}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 text-center block"
              >
                {test.attempts > 0 ? 'Retake Practice Test' : 'Start Practice Test'}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredTests.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No practice tests found</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters to see more results.</p>
        </div>
      )}

      {/* Back to Dashboard */}
      <div className="mt-8 text-center">
        <Link
          to="/cbt/dashboard"
          className="inline-flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-md transition-colors duration-200"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to CBT Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Practice;
