import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { practiceTestAPI, handleAPIError } from '../../services/api';

const Practice = () => {
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [practiceTests, setPracticeTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch practice tests from API
  useEffect(() => {
    const fetchPracticeTests = async () => {
      try {
        setLoading(true);
        const tests = await practiceTestAPI.getPracticeTests();
        setPracticeTests(tests);
        setError(null);
      } catch (err) {
        console.error('Error fetching practice tests:', err);
        setError(handleAPIError(err));
        // Fallback to hardcoded data if API fails
        setPracticeTests([
          {
            _id: '1',
            title: 'Basic Mathematics',
            subject: 'Mathematics',
            difficulty: 'Easy',
            questions: 3, // Actual number from backend
            timeLimit: 30,
            attempts: 0,
            bestScore: null,
            description: 'Practice basic arithmetic, algebra, and geometry concepts.',
            topics: ['Arithmetic', 'Basic Algebra', 'Geometry'],
            lastAttempt: null
          },
          {
            _id: '2',
            title: 'Advanced Calculus',
            subject: 'Mathematics',
            difficulty: 'Hard',
            questions: 2, // Actual number from backend
            timeLimit: 45,
            attempts: 0,
            bestScore: null,
            description: 'Advanced calculus problems including derivatives and integrals.',
            topics: ['Derivatives', 'Integrals', 'Limits'],
            lastAttempt: null
          },
          {
            _id: '3',
            title: 'Programming Fundamentals',
            subject: 'Computer Science',
            difficulty: 'Medium',
            questions: 2, // Actual number from backend
            timeLimit: 40,
            attempts: 0,
            bestScore: null,
            description: 'Basic programming concepts and problem-solving.',
            topics: ['Variables', 'Loops', 'Functions'],
            lastAttempt: null
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPracticeTests();
  }, []);

  // Extract unique subjects and difficulties from the fetched data
  const subjects = ['all', ...new Set(practiceTests.map(test => test.subject))];
  const difficulties = ['all', ...new Set(practiceTests.map(test => test.difficulty))];

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

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading practice tests...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-800 font-medium">Error loading practice tests</span>
          </div>
          <p className="text-red-600 mt-2">{error}</p>
        </div>
      )}

      {/* Practice Tests Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.map((test) => (
            <div key={test._id || test.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
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
                  <span className="ml-1 font-medium text-gray-900 dark:text-white">
                    {test.questions?.length || test.questions || 0}
                  </span>
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
                to={`/cbt/practice/${test._id || test.id}`}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 text-center block"
              >
                {test.attempts > 0 ? 'Retake Practice Test' : 'Start Practice Test'}
              </Link>
            </div>
          </div>
        ))}
        </div>
      )}

      {/* No Results */}
      {!loading && filteredTests.length === 0 && (
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
