import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { assessmentAPI, handleAPIError } from '../../services/api';

const AssessmentResults = () => {
  const { id, attemptId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!isAuthenticated()) {
        navigate('/auth/signin');
        return;
      }

      try {
        setLoading(true);
        const response = await assessmentAPI.getAssessmentResults(id, attemptId);
        setResults(response);
        setError(null);
      } catch (err) {
        console.error('Error fetching assessment results:', err);
        setError(handleAPIError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [id, attemptId, isAuthenticated, navigate]);

  // Format time display
  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  };

  // Get grade color
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

  // Get score color
  const getScoreColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
            to="/cbt/take-assessment"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200"
          >
            Back to Assessments
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
          <p className="text-yellow-600 mb-4">The requested assessment results could not be found.</p>
          <Link
            to="/cbt/take-assessment"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200"
          >
            Back to Assessments
          </Link>
        </div>
      </div>
    );
  }

  const { assessment, attempt, results: questionResults } = results;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-6">
        <div className="text-center">
          <div className="mb-4">
            {attempt.passed ? (
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Assessment {attempt.passed ? 'Completed' : 'Not Passed'}
          </h1>
          <h2 className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            {assessment.title}
          </h2>
          
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
            <span>{assessment.subject}</span>
            <span>•</span>
            <span>{assessment.category}</span>
            <span>•</span>
            <span>Submitted: {formatDate(attempt.submittedAt)}</span>
          </div>
        </div>
      </div>

      {/* Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
          <div className={`text-3xl font-bold mb-2 ${getScoreColor(attempt.percentage)}`}>
            {attempt.score}/{assessment.totalPoints}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Score</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
          <div className={`text-3xl font-bold mb-2 ${getScoreColor(attempt.percentage)}`}>
            {attempt.percentage}%
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Percentage</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-lg font-semibold ${getGradeColor(attempt.grade)}`}>
            {attempt.grade}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Grade</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
          <div className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            {formatTime(attempt.timeSpent)}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Time Spent</p>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Performance Summary</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Correct Answers:</span>
            <div className="font-medium text-gray-900 dark:text-white">
              {attempt.correctAnswers}/{attempt.totalQuestions}
            </div>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Grading Status:</span>
            <div className="font-medium text-gray-900 dark:text-white capitalize">
              {attempt.gradingStatus?.replace('-', ' ')}
            </div>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Result:</span>
            <div className={`font-medium ${attempt.passed ? 'text-green-600' : 'text-red-600'}`}>
              {attempt.passed ? 'Passed' : 'Not Passed'}
            </div>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Points Earned:</span>
            <div className="font-medium text-gray-900 dark:text-white">
              {attempt.score} / {assessment.totalPoints}
            </div>
          </div>
        </div>
      </div>

      {/* Question-by-Question Results */}
      {questionResults && questionResults.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Question Results</h3>
          
          <div className="space-y-4">
            {questionResults.map((result, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-800 dark:text-white">
                    Question {index + 1}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium ${result.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                      {result.pointsEarned}/{result.totalPoints} points
                    </span>
                    {result.isCorrect ? (
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-700 dark:text-gray-300 mb-3">{result.question}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Your Answer:</span>
                    <div className={`font-medium ${result.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                      {result.userAnswer || 'No answer provided'}
                    </div>
                  </div>
                  {result.correctAnswer && (
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Correct Answer:</span>
                      <div className="font-medium text-green-600">
                        {result.correctAnswer}
                      </div>
                    </div>
                  )}
                </div>
                
                {result.explanation && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Explanation:</strong> {result.explanation}
                    </p>
                  </div>
                )}

                {result.needsManualGrading && (
                  <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Note:</strong> This question requires manual grading and will be reviewed by an instructor.
                    </p>
                  </div>
                )}

                {result.graderComments && (
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Instructor Comments:</strong> {result.graderComments}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-center space-x-4">
        <Link
          to="/cbt/take-assessment"
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200"
        >
          Back to Assessments
        </Link>
        <Link
          to="/cbt/view-results"
          className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md transition-colors duration-200"
        >
          View All Results
        </Link>
      </div>
    </div>
  );
};

export default AssessmentResults;
