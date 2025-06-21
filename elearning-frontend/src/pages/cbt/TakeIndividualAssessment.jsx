import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useGamification } from '../../contexts/GamificationContext';
import { assessmentAPI, handleAPIError } from '../../services/api';

const TakeIndividualAssessment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addPoints } = useGamification();

  const [assessment, setAssessment] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  // Start assessment
  useEffect(() => {
    const startAssessment = async () => {
      if (!isAuthenticated()) {
        navigate('/auth/signin');
        return;
      }

      try {
        setLoading(true);

        // Get assessment details first
        const assessmentDetails = await assessmentAPI.getAssessment(id);
        
        // Check if assessment is available
        if (!assessmentDetails.canTakeAssessment) {
          setError('You have reached the maximum number of attempts for this assessment.');
          return;
        }

        if (assessmentDetails.status !== 'available' && assessmentDetails.status !== 'scheduled') {
          setError('This assessment is not currently available.');
          return;
        }

        setAssessment(assessmentDetails);

      } catch (err) {
        console.error('Error loading assessment:', err);
        setError(handleAPIError(err));
      } finally {
        setLoading(false);
      }
    };

    startAssessment();
  }, [id, isAuthenticated, navigate]);

  // Start the actual assessment attempt
  const handleStartAssessment = async () => {
    try {
      setLoading(true);
      
      // Start the assessment attempt
      const response = await assessmentAPI.startAssessment(id);

      setAssessment(response.assessment);
      setAttemptId(response.attemptId);
      setTimeRemaining(response.timeLimit * 60); // Convert to seconds
      setQuestionStartTime(Date.now());
      setShowInstructions(false);

    } catch (err) {
      console.error('Error starting assessment:', err);
      setError(handleAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  // Timer countdown
  useEffect(() => {
    if (timeRemaining > 0 && !submitting && !showInstructions) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && assessment && !submitting && !showInstructions) {
      // Time's up - auto submit
      handleSubmitAssessment(true);
    }
  }, [timeRemaining, submitting, assessment, showInstructions]);

  // Handle answer selection
  const handleAnswerSelect = (questionId, selectedOption, selectedAnswer) => {
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        questionId,
        selectedOption,
        selectedAnswer,
        timeSpent
      }
    }));
  };

  // Navigate to next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < assessment.questions.length - 1) {
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

  // Submit assessment
  const handleSubmitAssessment = async (timeExpired = false) => {
    try {
      setSubmitting(true);

      // Calculate total time spent
      const totalTimeSpent = Math.floor((assessment.timeLimit * 60 - timeRemaining) / 60);

      // Prepare answers array
      const answersArray = Object.values(answers);

      // Submit assessment
      const response = await assessmentAPI.submitAssessment(id, {
        attemptId,
        answers: answersArray,
        timeSpent: totalTimeSpent,
        timeExpired
      });

      // Add gamification points based on performance (less than practice tests)
      if (response.passed) {
        if (response.percentage >= 90) {
          addPoints(100, 'Excellent Assessment Performance!');
        } else if (response.percentage >= 80) {
          addPoints(75, 'Great Assessment Performance!');
        } else {
          addPoints(50, 'Good Assessment Performance!');
        }
      } else {
        addPoints(25, 'Assessment Completed');
      }

      // Navigate to results
      navigate(`/cbt/assessment/${id}/results/${response.attemptId}`);

    } catch (err) {
      console.error('Error submitting assessment:', err);
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

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
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
          <h2 className="text-xl font-bold text-red-800 mb-2">Error Loading Assessment</h2>
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

  if (!assessment) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-yellow-800 mb-2">Assessment Not Found</h2>
          <p className="text-yellow-600 mb-4">The requested assessment could not be found.</p>
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

  // Show instructions before starting
  if (showInstructions) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              {assessment.title}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">{assessment.subject}</p>
            <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {assessment.category}
            </div>
          </div>

          {/* Assessment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Assessment Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Date:</span>
                  <span className="font-medium">{formatDate(assessment.scheduledDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Time:</span>
                  <span className="font-medium">{assessment.scheduledTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                  <span className="font-medium">{assessment.timeLimit} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Questions:</span>
                  <span className="font-medium">{assessment.questions?.length || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Points:</span>
                  <span className="font-medium">{assessment.totalPoints}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Requirements</h3>
              <ul className="space-y-1 text-sm">
                {assessment.requirements?.map((req, index) => (
                  <li key={index} className="flex items-center text-gray-600 dark:text-gray-400">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Instructions</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <ul className="space-y-2 text-sm text-yellow-800">
                {assessment.instructions?.map((instruction, index) => (
                  <li key={index} className="flex items-start">
                    <span className="font-bold mr-2">{index + 1}.</span>
                    {instruction}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Start Button */}
          <div className="text-center">
            <button
              onClick={handleStartAssessment}
              disabled={loading}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? 'Starting Assessment...' : 'Start Assessment'}
            </button>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Once you start, the timer will begin and cannot be paused.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = assessment.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / assessment.questions.length) * 100;
  const answeredQuestions = Object.keys(answers).length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              {assessment.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">{assessment.subject} - {assessment.category}</p>
          </div>
          <div className={`text-2xl font-bold ${getTimeColor()}`}>
            {formatTime(timeRemaining)}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Question {currentQuestionIndex + 1} of {assessment.questions.length}</span>
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Question {currentQuestionIndex + 1}
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}
            </span>
          </div>
          
          <p className="text-lg text-gray-800 dark:text-white mb-6">
            {currentQuestion.question}
          </p>

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

          {/* Fill in the Blank */}
          {currentQuestion.type === 'fill-in-blank' && (
            <div>
              <input
                type="text"
                value={answers[currentQuestion._id]?.selectedAnswer || ''}
                onChange={(e) => handleAnswerSelect(currentQuestion._id, null, e.target.value)}
                placeholder="Enter your answer..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          )}

          {/* True/False */}
          {currentQuestion.type === 'true-false' && (
            <div className="space-y-3">
              {['True', 'False'].map((option) => (
                <label
                  key={option}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors duration-200 ${
                    answers[currentQuestion._id]?.selectedOption === option
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion._id}`}
                    value={option}
                    checked={answers[currentQuestion._id]?.selectedOption === option}
                    onChange={() => handleAnswerSelect(currentQuestion._id, option)}
                    className="mr-3 text-blue-600"
                  />
                  <span className="text-gray-800 dark:text-white">{option}</span>
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
          {currentQuestionIndex < assessment.questions.length - 1 ? (
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
              {submitting ? 'Submitting...' : 'Submit Assessment'}
            </button>
          )}
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Submit Assessment?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You have answered {answeredQuestions} out of {assessment.questions.length} questions. 
              Once submitted, you cannot make changes. Are you sure you want to submit your assessment?
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium rounded-md transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSubmitAssessment(false)}
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

export default TakeIndividualAssessment;
