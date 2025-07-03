import React from 'react';

const LearningPaths = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                🛤️ Learning Paths
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Monitor learning path progress and manage structured learning journeys
              </p>
            </div>
          </div>
        </div>

        {/* Coming Soon Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-6">🚧</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Coming Soon
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Learning Paths management is currently under development. This feature will allow you to create and monitor structured learning journeys for students.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
                Planned Features:
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                <li>• Create custom learning paths</li>
                <li>• Track student progress through paths</li>
                <li>• Set prerequisites and dependencies</li>
                <li>• Monitor completion rates</li>
                <li>• Generate path analytics</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPaths;
