import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { resultsAPI, handleAPIError } from '../../services/api';

const ViewResults = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all results on component mount
  useEffect(() => {
    const fetchResults = async () => {
      if (!isAuthenticated()) {
        navigate('/auth/signin');
        return;
      }

      try {
        setLoading(true);
        const data = await resultsAPI.getAllResults();

        // Combine all results into a single array with consistent format
        const combinedResults = [
          // Quiz attempts
          ...data.quizAttempts.map(attempt => ({
            id: attempt._id,
            title: attempt.quiz?.title || 'Unknown Quiz',
            subject: attempt.quiz?.subject || 'Unknown',
            category: attempt.quiz?.category || 'Quiz',
            type: 'Quiz',
            date: attempt.submittedAt,
            score: attempt.score,
            maxScore: attempt.totalQuestions * 5, // Assuming 5 points per question
            percentage: attempt.percentage,
            grade: attempt.grade,
            duration: attempt.quiz?.timeLimit || 30,
            questionsCorrect: attempt.correctAnswers,
            totalQuestions: attempt.totalQuestions,
            timeSpent: attempt.timeSpent,
            status: attempt.passed ? 'passed' : 'failed',
            feedback: attempt.passed ? 'Good performance on quiz!' : 'Review the topics and try again.',
            difficulty: attempt.quiz?.difficulty || 'Unknown',
            course: attempt.quiz?.course || 'Unknown',
            resultUrl: `/quiz/${attempt.quiz?._id}/results/${attempt._id}`
          })),

          // Practice test attempts
          ...data.practiceAttempts.map(attempt => ({
            id: attempt._id,
            title: attempt.practiceTest?.title || 'Unknown Practice Test',
            subject: attempt.practiceTest?.subject || 'Unknown',
            category: 'Practice Test',
            type: 'Practice Test',
            date: attempt.submittedAt,
            score: attempt.score,
            maxScore: attempt.totalQuestions * 5, // Assuming 5 points per question
            percentage: attempt.percentage,
            grade: attempt.grade,
            duration: 30, // Default duration for practice tests
            questionsCorrect: attempt.correctAnswers,
            totalQuestions: attempt.totalQuestions,
            timeSpent: attempt.timeSpent,
            status: attempt.passed ? 'passed' : 'failed',
            feedback: attempt.passed ? 'Great practice session!' : 'Keep practicing to improve.',
            difficulty: attempt.practiceTest?.difficulty || 'Unknown',
            course: 'Practice',
            topics: attempt.practiceTest?.topics || [],
            resultUrl: `/cbt/practice/${attempt.practiceTest?._id}/results/${attempt._id}`
          })),

          // Assessment attempts
          ...data.assessmentAttempts.map(attempt => ({
            id: attempt._id,
            title: attempt.assessment?.title || 'Unknown Assessment',
            subject: attempt.assessment?.subject || 'Unknown',
            category: attempt.assessment?.category || 'Assessment',
            type: 'Assessment',
            date: attempt.submittedAt,
            score: attempt.score,
            maxScore: attempt.assessment?.totalPoints || 100,
            percentage: attempt.percentage,
            grade: attempt.grade,
            duration: attempt.assessment?.timeLimit || 120,
            questionsCorrect: attempt.correctAnswers,
            totalQuestions: attempt.totalQuestions,
            timeSpent: attempt.timeSpent,
            status: attempt.passed ? 'passed' : 'failed',
            feedback: attempt.gradingStatus === 'pending-manual' ? 'Results pending manual review.' :
                     attempt.passed ? 'Excellent performance on formal assessment!' : 'Assessment not passed. Review and retake if allowed.',
            difficulty: attempt.assessment?.difficulty || 'Unknown',
            course: attempt.assessment?.course || 'Unknown',
            institution: attempt.assessment?.institution,
            gradingStatus: attempt.gradingStatus,
            resultUrl: `/cbt/assessment/${attempt.assessment?._id}/results/${attempt._id}`
          }))
        ];

        // Sort by date (most recent first)
        combinedResults.sort((a, b) => new Date(b.date) - new Date(a.date));

        setResults(combinedResults);
        setError(null);
      } catch (err) {
        console.error('Error fetching results:', err);
        setError(handleAPIError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [isAuthenticated, navigate]);

  // Get unique subjects and types from results
  const subjects = ['all', ...new Set(results.map(r => r.subject).filter(Boolean))];
  const types = ['all', 'Quiz', 'Practice Test', 'Assessment'];
  const periods = ['all', 'Last Week', 'Last Month', 'Last 3 Months'];

  // Filter results based on selected criteria
  const filteredResults = results.filter(result => {
    const subjectMatch = selectedSubject === 'all' || result.subject === selectedSubject;
    const typeMatch = selectedType === 'all' || result.type === selectedType;

    let periodMatch = true;
    if (selectedPeriod !== 'all') {
      const resultDate = new Date(result.date);
      const now = new Date();
      const daysDiff = Math.floor((now - resultDate) / (1000 * 60 * 60 * 24));

      switch (selectedPeriod) {
        case 'Last Week':
          periodMatch = daysDiff <= 7;
          break;
        case 'Last Month':
          periodMatch = daysDiff <= 30;
          break;
        case 'Last 3 Months':
          periodMatch = daysDiff <= 90;
          break;
        default:
          periodMatch = true;
      }
    }

    return subjectMatch && typeMatch && periodMatch;
  });

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A+': case 'A': case 'A-': return 'bg-green-100 text-green-800';
      case 'B+': case 'B': case 'B-': return 'bg-blue-100 text-blue-800';
      case 'C+': case 'C': case 'C-': return 'bg-yellow-100 text-yellow-800';
      case 'D+': case 'D': return 'bg-orange-100 text-orange-800';
      case 'F': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time display
  const formatTime = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  };

  const calculateOverallStats = () => {
    if (filteredResults.length === 0) {
      return {
        totalTests: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0
      };
    }

    const totalScore = filteredResults.reduce((sum, result) => sum + result.score, 0);
    const totalMaxScore = filteredResults.reduce((sum, result) => sum + result.maxScore, 0);
    const averagePercentage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;

    return {
      totalTests: filteredResults.length,
      averageScore: averagePercentage.toFixed(1),
      highestScore: filteredResults.length > 0 ? Math.max(...filteredResults.map(r => r.percentage)) : 0,
      lowestScore: filteredResults.length > 0 ? Math.min(...filteredResults.map(r => r.percentage)) : 0
    };
  };

  const stats = calculateOverallStats();

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading your results...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-red-800 mb-2">Error Loading Results</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">View Results</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Review your test scores and performance analytics across quizzes, practice tests, and assessments
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {types.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type}
                </option>
              ))}
            </select>
          </div>
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
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      result.type === 'Quiz' ? 'bg-blue-100 text-blue-800' :
                      result.type === 'Practice Test' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {result.type}
                    </span>
                    <span>{result.subject}</span>
                    <span>•</span>
                    <span>{result.category}</span>
                    <span>•</span>
                    <span>{formatDate(result.date)}</span>
                    {result.difficulty && (
                      <>
                        <span>•</span>
                        <span className="capitalize">{result.difficulty}</span>
                      </>
                    )}
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
                    {formatTime(result.timeSpent)}/{formatTime(result.duration)}
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
                {result.gradingStatus && result.gradingStatus === 'pending-manual' && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> This assessment contains questions requiring manual grading. Final results will be available after instructor review.
                    </p>
                  </div>
                )}
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Course/Institution Info */}
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Details:</h4>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <div><strong>Course:</strong> {result.course}</div>
                    {result.institution && <div><strong>Institution:</strong> {result.institution}</div>}
                    {result.difficulty && <div><strong>Difficulty:</strong> {result.difficulty}</div>}
                  </div>
                </div>

                {/* Topics (for practice tests) */}
                {result.topics && result.topics.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Topics Covered:</h4>
                    <div className="flex flex-wrap gap-1">
                      {result.topics.map((topic, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              {result.resultUrl && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <Link
                    to={result.resultUrl}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors duration-200"
                  >
                    View Detailed Results
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              )}
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
