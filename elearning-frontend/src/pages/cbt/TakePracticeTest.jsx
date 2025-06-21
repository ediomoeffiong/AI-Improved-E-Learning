import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useGamification } from '../../contexts/GamificationContext';
import { practiceTestAPI, handleAPIError } from '../../services/api';

const TakePracticeTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addPoints } = useGamification();

  const [practiceTest, setPracticeTest] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // Start practice test
  useEffect(() => {
    const startPracticeTest = async () => {
      if (!isAuthenticated()) {
        navigate('/auth/signin');
        return;
      }

      try {
        setLoading(true);

        // Start the practice test attempt
        const response = await practiceTestAPI.startPracticeTest(id);

        setPracticeTest(response.practiceTest);
        setAttemptId(response.attemptId);
        setTimeRemaining(response.timeLimit * 60); // Convert to seconds
        setQuestionStartTime(Date.now());

      } catch (err) {
        console.error('Error starting practice test:', err);
        setError(handleAPIError(err));
      } finally {
        setLoading(false);
      }
    };

    startPracticeTest();
  }, [id, isAuthenticated, navigate]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining > 0 && !submitting) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && practiceTest && !submitting) {
      // Time's up - auto submit
      handleSubmitPracticeTest(true);
    }
  }, [timeRemaining, submitting, practiceTest]);

  // Handle answer selection
  const handleAnswerSelect = (questionId, selectedOption) => {
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        questionId,
        selectedOption,
        timeSpent
      }
    }));
  };

  // Navigate to next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < practiceTest.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setQuestionStartTime(Date.now());
    }
  };

  // Navigate to previous question
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setQuestionStartTime(Date.now());
    }
  };

  // Submit practice test
  const handleSubmitPracticeTest = async (timeExpired = false) => {
    try {
      setSubmitting(true);

      // Calculate total time spent
      const totalTimeSpent = Math.floor((practiceTest.timeLimit * 60 - timeRemaining) / 60);

      // Prepare answers array
      const answersArray = Object.values(answers);

      // Submit practice test
      const response = await practiceTestAPI.submitPracticeTest(id, {
        attemptId,
        answers: answersArray,
        timeSpent: totalTimeSpent,
        timeExpired
      });

      // Add gamification points based on performance
      if (response.passed) {
        if (response.percentage >= 90) {
          addPoints(75, 'Excellent Practice Test Performance!');
        } else if (response.percentage >= 80) {
          addPoints(50, 'Great Practice Test Performance!');
        } else {
          addPoints(25, 'Good Practice Test Performance!');
        }
      } else {
        addPoints(15, 'Practice Test Completed');
      }

      // Navigate to results
      navigate(`/cbt/practice/${id}/results/${response.attemptId}`);

    } catch (err) {
      console.error('Error submitting practice test:', err);
      setError(handleAPIError(err));
    } finally {
      setSubmitting(false);
      setShowConfirmSubmit(false);
    }
  };

  // Format time display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Get time color based on remaining time
  const getTimeColor = () => {
    if (timeRemaining <= 300) return 'text-red-600'; // Last 5 minutes
    if (timeRemaining <= 600) return 'text-yellow-600'; // Last 10 minutes
    return 'text-green-600';
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
          <h2 className="text-xl font-bold text-red-800 mb-2">Error Loading Practice Test</h2>
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

  if (!practiceTest) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-yellow-800 mb-2">Practice Test Not Found</h2>
          <p className="text-yellow-600 mb-4">The requested practice test could not be found.</p>
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

  const currentQuestion = practiceTest.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / practiceTest.questions.length) * 100;
  const answeredQuestions = Object.keys(answers).length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              {practiceTest.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">{practiceTest.subject}</p>
          </div>
          <div className={`text-2xl font-bold ${getTimeColor()}`}>
            {formatTime(timeRemaining)}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Question {currentQuestionIndex + 1} of {practiceTest.questions.length}</span>
            <span>{answeredQuestions} answered</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            {currentQuestion.question}
          </h2>

          {/* Multiple Choice Options */}
          {currentQuestion.type === 'multiple-choice' && (
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <label
                  key={index}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors duration-200 ${
                    answers[currentQuestion._id]?.selectedOption === option.text
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion._id}`}
                    value={option.text}
                    checked={answers[currentQuestion._id]?.selectedOption === option.text}
                    onChange={() => handleAnswerSelect(currentQuestion._id, option.text)}
                    className="mr-3 text-blue-600"
                  />
                  <span className="text-gray-800 dark:text-white">{option.text}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
          className={`px-6 py-2 rounded-md font-medium transition-colors duration-200 ${
            currentQuestionIndex === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gray-600 hover:bg-gray-700 text-white'
          }`}
        >
          Previous
        </button>

        <div className="flex space-x-4">
          {currentQuestionIndex < practiceTest.questions.length - 1 ? (
            <button
              onClick={handleNextQuestion}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200"
            >
              Next
            </button>
          ) : (
            <button
              onClick={() => setShowConfirmSubmit(true)}
              disabled={submitting}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors duration-200 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Practice Test'}
            </button>
          )}
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Submit Practice Test?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You have answered {answeredQuestions} out of {practiceTest.questions.length} questions. 
              Are you sure you want to submit your practice test?
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium rounded-md transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSubmitPracticeTest(false)}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors duration-200 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TakePracticeTest;
