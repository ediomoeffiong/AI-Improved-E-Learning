import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useGamification } from '../../contexts/GamificationContext';
import { quizAPI, handleAPIError } from '../../services/api';

const TakeQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addPoints } = useGamification();

  const [quiz, setQuiz] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  // Timer effect
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleTimeExpired();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining]);

  // Format time display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Handle time expired
  const handleTimeExpired = useCallback(async () => {
    if (!submitting) {
      await handleSubmitQuiz(true);
    }
  }, [submitting]);

  // Start quiz
  useEffect(() => {
    const startQuiz = async () => {
      if (!isAuthenticated()) {
        navigate('/auth/signin');
        return;
      }

      try {
        setLoading(true);

        // Start the quiz attempt
        const response = await quizAPI.startQuiz(id);

        setQuiz(response.quiz);
        setAttemptId(response.attemptId);
        setTimeRemaining(response.timeLimit * 60); // Convert to seconds
        setQuestionStartTime(Date.now());

      } catch (err) {
        console.error('Error starting quiz:', err);
        setError(handleAPIError(err));
      } finally {
        setLoading(false);
      }
    };

    startQuiz();
  }, [id, isAuthenticated, navigate]);

  // Handle answer selection
  const handleAnswerSelect = (questionId, answer) => {
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        questionId,
        selectedOption: answer,
        timeSpent
      }
    }));
  };

  // Navigate to next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setQuestionStartTime(Date.now());
    }
  };

  // Navigate to previous question
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setQuestionStartTime(Date.now());
    }
  };

  // Jump to specific question
  const handleQuestionJump = (index) => {
    setCurrentQuestionIndex(index);
    setQuestionStartTime(Date.now());
  };

  // Submit quiz
  const handleSubmitQuiz = async (timeExpired = false) => {
    try {
      setSubmitting(true);

      // Calculate total time spent
      const totalTimeSpent = Math.floor((quiz.timeLimit * 60 - timeRemaining) / 60);

      // Prepare answers array
      const answersArray = Object.values(answers);

      // Submit quiz
      const response = await quizAPI.submitQuiz(id, {
        attemptId,
        answers: answersArray,
        timeSpent: totalTimeSpent,
        timeExpired
      });

      // Add gamification points based on performance
      if (response.passed) {
        if (response.percentage >= 90) {
          addPoints(100, 'Excellent Quiz Performance!');
        } else if (response.percentage >= 80) {
          addPoints(75, 'Great Quiz Performance!');
        } else {
          addPoints(50, 'Good Quiz Performance!');
        }
      } else {
        addPoints(25, 'Quiz Completed');
      }

      // Navigate to results
      navigate(`/quiz/${id}/results/${attemptId}`);

    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError(handleAPIError(err));
    } finally {
      setSubmitting(false);
      setShowConfirmSubmit(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading quiz...</p>
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

  if (!quiz) return null;

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const answeredQuestions = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{quiz.title}</h1>
              <p className="text-gray-600 dark:text-gray-400">Question {currentQuestionIndex + 1} of {quiz.questions.length}</p>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${timeRemaining < 300 ? 'text-red-500' : 'text-blue-600'}`}>
                {formatTime(timeRemaining)}
              </div>
              <p className="text-sm text-gray-500">Time Remaining</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Questions</h3>
              <div className="grid grid-cols-5 lg:grid-cols-3 gap-2">
                {quiz.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuestionJump(index)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      index === currentQuestionIndex
                        ? 'bg-blue-600 text-white'
                        : answers[quiz.questions[index]._id]
                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                <p>Answered: {answeredQuestions}/{quiz.questions.length}</p>
              </div>
            </div>
          </div>

          {/* Main Question Area */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                  {currentQuestion.question}
                </h2>
                
                {/* Answer Options */}
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <label
                      key={index}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        answers[currentQuestion._id]?.selectedOption === option.text
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion._id}`}
                        value={option.text}
                        checked={answers[currentQuestion._id]?.selectedOption === option.text}
                        onChange={() => handleAnswerSelect(currentQuestion._id, option.text)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                        answers[currentQuestion._id]?.selectedOption === option.text
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {answers[currentQuestion._id]?.selectedOption === option.text && (
                          <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                        )}
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">{option.text}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center">
                <button
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Previous
                </button>

                <div className="flex space-x-3">
                  {currentQuestionIndex === quiz.questions.length - 1 ? (
                    <button
                      onClick={() => setShowConfirmSubmit(true)}
                      className="px-8 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Submit Quiz
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Next
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Submit Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Submit Quiz?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You have answered {answeredQuestions} out of {quiz.questions.length} questions. 
              Are you sure you want to submit your quiz?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSubmitQuiz()}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
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

export default TakeQuiz;
