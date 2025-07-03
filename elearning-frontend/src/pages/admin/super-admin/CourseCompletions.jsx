import React, { useState, useEffect } from 'react';

const CourseCompletions = () => {
  const [completions, setCompletions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    // Simulate loading course completions data
    setTimeout(() => {
      setCompletions([
        {
          id: 1,
          studentName: 'John Doe',
          studentEmail: 'john@example.com',
          courseTitle: 'Introduction to React',
          progress: 100,
          completedAt: '2024-03-15',
          timeSpent: 45,
          status: 'Completed',
          grade: 'A'
        },
        {
          id: 2,
          studentName: 'Jane Smith',
          studentEmail: 'jane@example.com',
          courseTitle: 'Advanced JavaScript',
          progress: 75,
          completedAt: null,
          timeSpent: 32,
          status: 'In Progress',
          grade: null
        },
        {
          id: 3,
          studentName: 'Mike Johnson',
          studentEmail: 'mike@example.com',
          courseTitle: 'Data Science Fundamentals',
          progress: 100,
          completedAt: '2024-03-10',
          timeSpent: 67,
          status: 'Completed',
          grade: 'B+'
        },
        {
          id: 4,
          studentName: 'Sarah Wilson',
          studentEmail: 'sarah@example.com',
          courseTitle: 'Introduction to React',
          progress: 45,
          completedAt: null,
          timeSpent: 18,
          status: 'In Progress',
          grade: null
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredCompletions = completions.filter(completion => {
    const matchesSearch = completion.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         completion.courseTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = filterCourse === 'all' || completion.courseTitle.includes(filterCourse);
    const matchesStatus = filterStatus === 'all' || completion.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesCourse && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'In Progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'Not Started': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status]}`}>
        {status}
      </span>
    );
  };

  const getGradeBadge = (grade) => {
    if (!grade) return <span className="text-gray-400">-</span>;
    
    const gradeClasses = {
      'A': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'A-': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'B+': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'B': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'B-': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'C+': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'C': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'D': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'F': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${gradeClasses[grade] || 'bg-gray-100 text-gray-800'}`}>
        {grade}
      </span>
    );
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
                ✅ Course Completions
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Detailed view of which users have completed which courses
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
                placeholder="Search students or courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Courses</option>
                <option value="React">React Courses</option>
                <option value="JavaScript">JavaScript Courses</option>
                <option value="Data">Data Science Courses</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="in progress">In Progress</option>
                <option value="not started">Not Started</option>
              </select>
            </div>
          </div>
        </div>

        {/* Completions Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Time Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Grade
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
                {filteredCompletions.map((completion) => (
                  <tr key={completion.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {completion.studentName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {completion.studentEmail}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {completion.courseTitle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${completion.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {completion.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {completion.timeSpent}h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(completion.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getGradeBadge(completion.grade)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {completion.completedAt || '-'}
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
              {completions.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Enrollments</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {completions.filter(c => c.status === 'Completed').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {completions.filter(c => c.status === 'In Progress').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {Math.round(completions.reduce((sum, c) => sum + c.progress, 0) / completions.length)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Progress</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCompletions;
