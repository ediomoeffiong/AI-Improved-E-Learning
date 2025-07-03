import React from 'react';

const SkeletonLoader = ({ className = '', variant = 'default' }) => {
  const baseClasses = "animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg";
  
  const variants = {
    default: "h-4 w-full",
    card: "h-32 w-full",
    avatar: "h-12 w-12 rounded-full",
    button: "h-10 w-24",
    title: "h-6 w-3/4",
    text: "h-4 w-full",
    'text-sm': "h-3 w-2/3"
  };

  return (
    <div 
      className={`${baseClasses} ${variants[variant]} ${className}`}
      style={{
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s ease-in-out infinite'
      }}
    />
  );
};

const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      {/* Header Skeleton */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="space-y-2">
              <SkeletonLoader variant="title" className="w-96" />
              <SkeletonLoader variant="text" className="w-80" />
            </div>
            <div className="flex items-center space-x-3">
              <SkeletonLoader variant="button" />
              <SkeletonLoader variant="button" className="w-32" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation Skeleton */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-2 border border-white/20 dark:border-gray-700/50">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonLoader key={i} variant="button" className="w-32 h-12" />
            ))}
          </div>
        </div>

        {/* Quick Access Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <SkeletonLoader variant="avatar" className="w-12 h-12 rounded-xl" />
                <SkeletonLoader variant="text" className="w-8 h-8" />
              </div>
              <SkeletonLoader variant="title" className="mb-2" />
              <SkeletonLoader variant="text-sm" className="mb-4" />
              <SkeletonLoader variant="text-sm" className="w-24" />
            </div>
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <SkeletonLoader variant="title" className="w-48" />
              <SkeletonLoader variant="avatar" className="w-10 h-10 rounded-xl" />
            </div>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-50/50 dark:bg-gray-700/50 rounded-xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <SkeletonLoader variant="title" className="mb-2" />
                      <SkeletonLoader variant="text-sm" className="w-32" />
                    </div>
                    <SkeletonLoader variant="text" className="w-16" />
                  </div>
                  <SkeletonLoader variant="default" className="h-3 mb-4" />
                  <div className="flex justify-between">
                    <SkeletonLoader variant="text-sm" className="w-32" />
                    <SkeletonLoader variant="text-sm" className="w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <SkeletonLoader variant="title" className="w-32" />
                  <SkeletonLoader variant="avatar" className="w-8 h-8 rounded-lg" />
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="flex items-center space-x-4">
                      <SkeletonLoader variant="avatar" className="w-12 h-12 rounded-xl" />
                      <div className="flex-1">
                        <SkeletonLoader variant="text" className="mb-1" />
                        <SkeletonLoader variant="text-sm" className="w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonLoader;
export { DashboardSkeleton };
