import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { practiceTestAPI, handleAPIError } from '../../services/api';

const PracticeTestResults = () => {
  const { id, attemptId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (!isAuthenticated()) {
        navigate('/auth/signin');
        return;
      }

      try {
        setLoading(true);
        const resultsData = await practiceTestAPI.getPracticeTestResults(id, attemptId);
        setResults(resultsData);
      } catch (err) {
        console.error('Error fetching practice test results:', err);
        setError(handleAPIError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [id, attemptId, isAuthenticated, navigate]);

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeBgColor = (percentage) => {
    if (percentage >= 90) return 'bg-green-100 border-green-200';
    if (percentage >= 80) return 'bg-blue-100 border-blue-200';
    if (percentage >= 70) return 'bg-yellow-100 border-yellow-200';
    return 'bg-red-100 border-red-200';
  };

  const formatTime = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-red-800 mb-2">Error Loading Results</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Link
            to="/cbt/practice"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200"
          >
            Back to Practice Tests
          </Link>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-yellow-800 mb-2">Results Not Found</h2>
          <p className="text-yellow-600 mb-4">The requested practice test results could not be found.</p>
          <Link
            to="/cbt/practice"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200"
          >
            Back to Practice Tests
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Practice Test Results
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {results.practiceTest?.title} - {results.practiceTest?.subject}
        </p>
      </div>

      {/* Score Card */}
      <div className={`rounded-lg border-2 p-8 mb-8 text-center ${getGradeBgColor(results.percentage)}`}>
        <div className="mb-4">
          <div className={`text-6xl font-bold ${getGradeColor(results.percentage)} mb-2`}>
            {results.percentage}%
          </div>
          <div className={`text-2xl font-semibold ${getGradeColor(results.percentage)}`}>
            {results.grade}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div>
            <div className="text-2xl font-bold text-gray-800 dark:text-white">
              {results.score}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Correct Answers
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-800 dark:text-white">
              {results.totalQuestions}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Questions
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-800 dark:text-white">
              {formatTime(results.timeSpent)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Time Spent
            </div>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Performance Summary
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Difficulty Level</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              results.practiceTest?.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
              results.practiceTest?.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {results.practiceTest?.difficulty}
            </span>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Status</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              results.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {results.passed ? 'Passed' : 'Failed'}
            </span>
          </div>
        </div>

        {results.practiceTest?.topics && (
          <div className="mt-4">
            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Topics Covered</h3>
            <div className="flex flex-wrap gap-2">
              {results.practiceTest.topics.map((topic, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Review Answers */}
      {results.answers && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Review Answers
            </h2>
            <button
              onClick={() => setShowAnswers(!showAnswers)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200"
            >
              {showAnswers ? 'Hide Answers' : 'Show Answers'}
            </button>
          </div>

          {showAnswers && (
            <div className="space-y-6">
              {results.answers.map((answer, index) => (
                <div key={index} className="border-b border-gray-200 dark:border-gray-600 pb-4 last:border-b-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-800 dark:text-white">
                      Question {index + 1}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      answer.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {answer.isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    {answer.question}
                  </p>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Your Answer: </span>
                      <span className={answer.isCorrect ? 'text-green-600' : 'text-red-600'}>
                        {answer.selectedAnswer}
                      </span>
                    </div>
                    
                    {!answer.isCorrect && answer.correctAnswer && (
                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Correct Answer: </span>
                        <span className="text-green-600">{answer.correctAnswer}</span>
                      </div>
                    )}
                    
                    {answer.explanation && (
                      <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Explanation: </span>
                        <span className="text-blue-700 dark:text-blue-400">{answer.explanation}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          to={`/cbt/practice/${id}`}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200 text-center"
        >
          Retake Practice Test
        </Link>
        
        <Link
          to="/cbt/practice"
          className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md transition-colors duration-200 text-center"
        >
          Back to Practice Tests
        </Link>
        
        <Link
          to="/cbt/dashboard"
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors duration-200 text-center"
        >
          CBT Dashboard
        </Link>
      </div>
    </div>
  );
};

export default PracticeTestResults;
