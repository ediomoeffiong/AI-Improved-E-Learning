import React, { useState, useEffect } from 'react';

const QuizResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterQuiz, setFilterQuiz] = useState('all');

  useEffect(() => {
    // Simulate loading quiz results data
    setTimeout(() => {
      setResults([
        {
          id: 1,
          studentName: 'John Doe',
          studentEmail: 'john@example.com',
          quizTitle: 'React Fundamentals Quiz',
          score: 85,
          totalQuestions: 15,
          correctAnswers: 13,
          timeSpent: 25,
          completedAt: '2024-03-15 14:30',
          status: 'Passed'
        },
        {
          id: 2,
          studentName: 'Jane Smith',
          studentEmail: 'jane@example.com',
          quizTitle: 'JavaScript ES6+ Assessment',
          score: 92,
          totalQuestions: 20,
          correctAnswers: 18,
          timeSpent: 38,
          completedAt: '2024-03-15 16:45',
          status: 'Passed'
        },
        {
          id: 3,
          studentName: 'Mike Johnson',
          studentEmail: 'mike@example.com',
          quizTitle: 'Data Analysis Practice Test',
          score: 68,
          totalQuestions: 25,
          correctAnswers: 17,
          timeSpent: 55,
          completedAt: '2024-03-16 10:15',
          status: 'Failed'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredResults = results.filter(result => {
    const matchesSearch = result.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.quizTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesQuiz = filterQuiz === 'all' || result.quizTitle.includes(filterQuiz);
    return matchesSearch && matchesQuiz;
  });

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Passed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'Failed': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status]}`}>
        {status}
      </span>
    );
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-300 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                📈 Quiz Results
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                View and analyze quiz performance data
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search students or quizzes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={filterQuiz}
                onChange={(e) => setFilterQuiz(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Quizzes</option>
                <option value="React">React Quizzes</option>
                <option value="JavaScript">JavaScript Quizzes</option>
                <option value="Data">Data Science Quizzes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Quiz
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Time Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Completed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredResults.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {result.studentName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {result.studentEmail}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {result.quizTitle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className={`text-sm font-medium ${getScoreColor(result.score)}`}>
                          {result.score}%
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {result.correctAnswers}/{result.totalQuestions} correct
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {result.timeSpent} min
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(result.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {result.completedAt}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                          View Details
                        </button>
                        <button className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
                          Export
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {results.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Attempts</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {results.filter(r => r.status === 'Passed').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Passed</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {results.filter(r => r.status === 'Failed').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Failed</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Average Score</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;
