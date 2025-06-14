import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const TakeAssessment = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [assessments] = useState([
    {
      id: 1,
      title: 'Mathematics Final Examination',
      subject: 'Mathematics',
      category: 'Final Exam',
      date: '2024-01-25',
      time: '10:00 AM',
      duration: 120,
      questions: 50,
      totalMarks: 100,
      status: 'scheduled',
      description: 'Comprehensive mathematics examination covering all topics from the semester.',
      instructions: [
        'Ensure stable internet connection',
        'Use only approved calculator',
        'No external materials allowed',
        'Submit before time expires'
      ],
      requirements: ['Calculator', 'Stable Internet', 'Quiet Environment']
    },
    {
      id: 2,
      title: 'Computer Science Midterm',
      subject: 'Computer Science',
      category: 'Midterm',
      date: '2024-01-28',
      time: '2:00 PM',
      duration: 90,
      questions: 40,
      totalMarks: 80,
      status: 'scheduled',
      description: 'Midterm examination covering programming fundamentals and data structures.',
      instructions: [
        'Code compilation will be tested',
        'Provide well-commented code',
        'Follow naming conventions',
        'Test your solutions'
      ],
      requirements: ['Programming Environment', 'Stable Internet']
    },
    {
      id: 3,
      title: 'Physics Quiz 3',
      subject: 'Physics',
      category: 'Quiz',
      date: '2024-01-22',
      time: '11:30 AM',
      duration: 45,
      questions: 20,
      totalMarks: 40,
      status: 'available',
      description: 'Quiz on thermodynamics and wave mechanics.',
      instructions: [
        'Formula sheet provided',
        'Show all calculations',
        'Round to 2 decimal places',
        'Units are important'
      ],
      requirements: ['Calculator', 'Formula Sheet Access']
    },
    {
      id: 4,
      title: 'Chemistry Lab Assessment',
      subject: 'Chemistry',
      category: 'Lab Test',
      date: '2024-01-30',
      time: '9:00 AM',
      duration: 60,
      questions: 25,
      totalMarks: 50,
      status: 'scheduled',
      description: 'Practical assessment of laboratory techniques and chemical analysis.',
      instructions: [
        'Review safety protocols',
        'Identify chemical compounds',
        'Explain procedures clearly',
        'Include observations'
      ],
      requirements: ['Lab Manual Access', 'Periodic Table']
    },
    {
      id: 5,
      title: 'English Literature Essay',
      subject: 'English',
      category: 'Assignment',
      date: '2024-02-01',
      time: '1:00 PM',
      duration: 180,
      questions: 3,
      totalMarks: 100,
      status: 'scheduled',
      description: 'Analytical essay on modern literature themes and techniques.',
      instructions: [
        'Minimum 1500 words',
        'Cite at least 5 sources',
        'Use MLA format',
        'Original work only'
      ],
      requirements: ['Text References', 'Citation Guide']
    }
  ]);

  const categories = ['all', 'Final Exam', 'Midterm', 'Quiz', 'Lab Test', 'Assignment'];

  const filteredAssessments = assessments.filter(assessment => {
    return selectedCategory === 'all' || assessment.category === selectedCategory;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'missed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Final Exam': return 'bg-red-100 text-red-800';
      case 'Midterm': return 'bg-orange-100 text-orange-800';
      case 'Quiz': return 'bg-yellow-100 text-yellow-800';
      case 'Lab Test': return 'bg-purple-100 text-purple-800';
      case 'Assignment': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isAssessmentAvailable = (assessment) => {
    return assessment.status === 'available' || assessment.status === 'scheduled';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Take Assessment</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Official examinations and assessments for your courses
        </p>
      </div>

      {/* Important Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-yellow-800 mb-1">Important Assessment Guidelines</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Ensure stable internet connection before starting</li>
              <li>• Read all instructions carefully before beginning</li>
              <li>• Once started, assessments cannot be paused</li>
              <li>• Submit before the time limit expires</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Filter Assessments</h2>
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Assessments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredAssessments.map((assessment) => (
          <div key={assessment.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                    {assessment.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{assessment.subject}</p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(assessment.category)}`}>
                    {assessment.category}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assessment.status)}`}>
                    {assessment.status.charAt(0).toUpperCase() + assessment.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {assessment.description}
              </p>

              {/* Assessment Details */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Date & Time:</span>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {assessment.date}
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {assessment.time}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {assessment.duration} minutes
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Questions:</span>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {assessment.questions}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Total Marks:</span>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {assessment.totalMarks}
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Requirements:</h4>
                <div className="flex flex-wrap gap-1">
                  {assessment.requirements.map((req, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {req}
                    </span>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Instructions:</h4>
                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  {assessment.instructions.map((instruction, index) => (
                    <li key={index}>• {instruction}</li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="flex space-x-2">
                {isAssessmentAvailable(assessment) ? (
                  <Link
                    to={`/cbt/assessment/${assessment.id}`}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 text-center"
                  >
                    {assessment.status === 'available' ? 'Start Assessment' : 'View Details'}
                  </Link>
                ) : (
                  <button
                    disabled
                    className="flex-1 bg-gray-300 text-gray-500 font-medium py-2 px-4 rounded-md cursor-not-allowed"
                  >
                    Not Available
                  </button>
                )}
                <button className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors duration-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredAssessments.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No assessments found</h3>
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

export default TakeAssessment;
