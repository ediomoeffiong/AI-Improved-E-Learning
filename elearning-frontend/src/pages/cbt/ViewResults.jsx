import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ViewResults = () => {
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  const [results] = useState([
    {
      id: 1,
      title: 'Mathematics Final Exam',
      subject: 'Mathematics',
      category: 'Final Exam',
      date: '2024-01-15',
      score: 92,
      maxScore: 100,
      percentage: 92,
      grade: 'A',
      duration: 120,
      questionsCorrect: 46,
      totalQuestions: 50,
      timeSpent: 115,
      status: 'passed',
      feedback: 'Excellent performance! Strong understanding of calculus and algebra concepts.',
      breakdown: {
        'Algebra': { score: 18, max: 20, percentage: 90 },
        'Calculus': { score: 19, max: 20, percentage: 95 },
        'Geometry': { score: 9, max: 10, percentage: 90 }
      }
    },
    {
      id: 2,
      title: 'Computer Science Midterm',
      subject: 'Computer Science',
      category: 'Midterm',
      date: '2024-01-10',
      score: 88,
      maxScore: 100,
      percentage: 88,
      grade: 'B+',
      duration: 90,
      questionsCorrect: 35,
      totalQuestions: 40,
      timeSpent: 85,
      status: 'passed',
      feedback: 'Good understanding of programming concepts. Focus more on data structures.',
      breakdown: {
        'Programming Basics': { score: 20, max: 20, percentage: 100 },
        'Data Structures': { score: 15, max: 20, percentage: 75 },
        'Algorithms': { score: 18, max: 20, percentage: 90 }
      }
    },
    {
      id: 3,
      title: 'Physics Quiz 2',
      subject: 'Physics',
      category: 'Quiz',
      date: '2024-01-08',
      score: 76,
      maxScore: 100,
      percentage: 76,
      grade: 'B',
      duration: 45,
      questionsCorrect: 15,
      totalQuestions: 20,
      timeSpent: 42,
      status: 'passed',
      feedback: 'Satisfactory performance. Review wave mechanics and thermodynamics.',
      breakdown: {
        'Mechanics': { score: 8, max: 10, percentage: 80 },
        'Thermodynamics': { score: 4, max: 10, percentage: 40 },
        'Waves': { score: 7, max: 10, percentage: 70 }
      }
    },
    {
      id: 4,
      title: 'Chemistry Lab Test',
      subject: 'Chemistry',
      category: 'Lab Test',
      date: '2024-01-05',
      score: 94,
      maxScore: 100,
      percentage: 94,
      grade: 'A',
      duration: 60,
      questionsCorrect: 23,
      totalQuestions: 25,
      timeSpent: 55,
      status: 'passed',
      feedback: 'Outstanding lab work! Excellent understanding of chemical processes.',
      breakdown: {
        'Safety Protocols': { score: 10, max: 10, percentage: 100 },
        'Chemical Analysis': { score: 9, max: 10, percentage: 90 },
        'Lab Techniques': { score: 10, max: 10, percentage: 100 }
      }
    },
    {
      id: 5,
      title: 'English Literature Quiz',
      subject: 'English',
      category: 'Quiz',
      date: '2024-01-03',
      score: 68,
      maxScore: 100,
      percentage: 68,
      grade: 'C+',
      duration: 30,
      questionsCorrect: 13,
      totalQuestions: 20,
      timeSpent: 28,
      status: 'passed',
      feedback: 'Need improvement in literary analysis. Focus on themes and symbolism.',
      breakdown: {
        'Poetry Analysis': { score: 6, max: 10, percentage: 60 },
        'Prose Understanding': { score: 7, max: 10, percentage: 70 },
        'Literary Devices': { score: 5, max: 10, percentage: 50 }
      }
    }
  ]);

  const subjects = ['all', 'Mathematics', 'Computer Science', 'Physics', 'Chemistry', 'English'];
  const periods = ['all', 'Last Week', 'Last Month', 'Last 3 Months'];

  const filteredResults = results.filter(result => {
    const subjectMatch = selectedSubject === 'all' || result.subject === selectedSubject;
    // For simplicity, we'll just filter by subject for now
    return subjectMatch;
  });

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-800';
      case 'B+': case 'B': return 'bg-blue-100 text-blue-800';
      case 'C+': case 'C': return 'bg-yellow-100 text-yellow-800';
      case 'D': case 'F': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const calculateOverallStats = () => {
    const totalScore = filteredResults.reduce((sum, result) => sum + result.score, 0);
    const totalMaxScore = filteredResults.reduce((sum, result) => sum + result.maxScore, 0);
    const averagePercentage = filteredResults.length > 0 ? (totalScore / totalMaxScore) * 100 : 0;
    
    return {
      totalTests: filteredResults.length,
      averageScore: averagePercentage.toFixed(1),
      highestScore: Math.max(...filteredResults.map(r => r.percentage)),
      lowestScore: Math.min(...filteredResults.map(r => r.percentage))
    };
  };

  const stats = calculateOverallStats();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">View Results</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Review your assessment scores and performance analytics
        </p>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tests</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalTests}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.averageScore}%</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Highest Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.highestScore}%</p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Lowest Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.lowestScore}%</p>
            </div>
            <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-full">
              <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Filter Results</h2>
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
              Time Period
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {periods.map(period => (
                <option key={period} value={period}>
                  {period === 'all' ? 'All Time' : period}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-6">
        {filteredResults.map((result) => (
          <div key={result.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                    {result.title}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>{result.subject}</span>
                    <span>•</span>
                    <span>{result.category}</span>
                    <span>•</span>
                    <span>{result.date}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(result.grade)}`}>
                    Grade: {result.grade}
                  </span>
                  <span className={`text-2xl font-bold ${getScoreColor(result.percentage)}`}>
                    {result.score}/{result.maxScore}
                  </span>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Percentage:</span>
                  <div className={`font-medium ${getScoreColor(result.percentage)}`}>
                    {result.percentage}%
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Correct Answers:</span>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {result.questionsCorrect}/{result.totalQuestions}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Time Spent:</span>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {result.timeSpent}/{result.duration} min
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Status:</span>
                  <div className="font-medium text-green-600">
                    {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                  </div>
                </div>
              </div>

              {/* Feedback */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Feedback:</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                  {result.feedback}
                </p>
              </div>

              {/* Topic Breakdown */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Topic Breakdown:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {Object.entries(result.breakdown).map(([topic, data]) => (
                    <div key={topic} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{topic}</span>
                        <span className={`text-sm font-bold ${getScoreColor(data.percentage)}`}>
                          {data.percentage}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {data.score}/{data.max} points
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
                        <div
                          className={`h-2 rounded-full ${data.percentage >= 80 ? 'bg-green-500' : data.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${data.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredResults.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No results found</h3>
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

export default ViewResults;
