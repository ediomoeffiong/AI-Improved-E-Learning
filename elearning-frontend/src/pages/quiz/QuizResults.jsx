import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useGamification } from '../../contexts/GamificationContext';
import { quizAPI, handleAPIError } from '../../services/api';

const QuizResults = () => {
  const { id, attemptId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addPoints } = useGamification();

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetailedResults, setShowDetailedResults] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (!isAuthenticated()) {
        navigate('/auth/signin');
        return;
      }

      try {
        setLoading(true);

        // Fetch quiz results
        const resultsData = await quizAPI.getQuizResults(id, attemptId);
        setResults(resultsData);

      } catch (err) {
        console.error('Error fetching quiz results:', err);
        setError(handleAPIError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [id, attemptId, isAuthenticated, navigate]);

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A+':
      case 'A':
      case 'A-':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'B+':
      case 'B':
      case 'B-':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
      case 'C+':
      case 'C':
      case 'C-':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'D+':
      case 'D':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300';
      case 'F':
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getPerformanceMessage = (percentage) => {
    if (percentage >= 95) return { message: "Outstanding! Perfect performance! 🎉", color: "text-green-600" };
    if (percentage >= 90) return { message: "Excellent work! You've mastered this topic! 🌟", color: "text-green-600" };
    if (percentage >= 80) return { message: "Great job! You have a solid understanding! 👏", color: "text-blue-600" };
    if (percentage >= 70) return { message: "Good work! You passed the quiz! ✅", color: "text-blue-600" };
    if (percentage >= 60) return { message: "Not bad, but there's room for improvement. 📚", color: "text-yellow-600" };
    return { message: "Keep studying and try again. You can do it! 💪", color: "text-red-600" };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => navigate('/quiz/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!results) return null;

  const { quiz, attempt } = results;
  const performance = getPerformanceMessage(attempt.percentage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Quiz Results</h1>
          <p className="text-gray-600 dark:text-gray-400">{quiz.title}</p>
        </div>

        {/* Results Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <div className="text-center mb-8">
            {/* Score Circle */}
            <div className="relative inline-flex items-center justify-center w-32 h-32 mb-6">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - attempt.percentage / 100)}`}
                  className={attempt.passed ? "text-green-500" : "text-red-500"}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-800 dark:text-white">
                  {attempt.percentage}%
                </span>
              </div>
            </div>

            {/* Grade */}
            <div className={`inline-block px-4 py-2 rounded-full text-lg font-bold mb-4 ${getGradeColor(attempt.grade)}`}>
              Grade: {attempt.grade}
            </div>

            {/* Performance Message */}
            <p className={`text-lg font-medium mb-6 ${performance.color}`}>
              {performance.message}
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800 dark:text-white">{attempt.score}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Points Earned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800 dark:text-white">{attempt.correctAnswers}/{attempt.totalQuestions}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Correct Answers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800 dark:text-white">{attempt.timeSpent}m</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Time Spent</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${attempt.passed ? 'text-green-600' : 'text-red-600'}`}>
                  {attempt.passed ? 'PASSED' : 'FAILED'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Status</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/quiz/dashboard"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Back to Dashboard
            </Link>
            <button
              onClick={() => setShowDetailedResults(!showDetailedResults)}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              {showDetailedResults ? 'Hide' : 'Show'} Detailed Results
            </button>
            <Link
              to={`/quiz/${id}`}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Retake Quiz
            </Link>
          </div>
        </div>

        {/* Detailed Results */}
        {showDetailedResults && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Detailed Results</h2>
            
            <div className="space-y-6">
              {results.results.map((result, index) => (
                <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex-1">
                      Question {index + 1}: {result.question}
                    </h3>
                    <div className={`ml-4 px-3 py-1 rounded-full text-sm font-medium ${
                      result.isCorrect 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {result.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {result.options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className={`p-3 rounded-lg border ${
                          option.isCorrect
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                            : result.selectedOption === option.text && !option.isCorrect
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                            : 'border-gray-200 dark:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center">
                          <span className="text-gray-700 dark:text-gray-300">{option.text}</span>
                          {option.isCorrect && (
                            <span className="ml-2 text-green-600 font-medium">✓ Correct Answer</span>
                          )}
                          {result.selectedOption === option.text && !option.isCorrect && (
                            <span className="ml-2 text-red-600 font-medium">✗ Your Answer</span>
                          )}
                          {result.selectedOption === option.text && option.isCorrect && (
                            <span className="ml-2 text-green-600 font-medium">✓ Your Answer</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {result.explanation && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Explanation:</h4>
                      <p className="text-blue-700 dark:text-blue-300">{result.explanation}</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>Points: {result.pointsEarned}/{result.pointsEarned + (result.isCorrect ? 0 : 1)}</span>
                    <span>Time spent: {result.timeSpent}s</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizResults;
