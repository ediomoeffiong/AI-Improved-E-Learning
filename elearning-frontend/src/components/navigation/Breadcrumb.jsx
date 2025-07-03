import React from 'react';
import { Link } from 'react-router-dom';

const Breadcrumb = ({ items, className = '' }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <svg 
                className="w-4 h-4 text-gray-400 dark:text-gray-500 mx-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
            
            {item.href && index < items.length - 1 ? (
              <Link
                to={item.href}
                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 flex items-center space-x-1"
              >
                {item.icon && <span className="text-base">{item.icon}</span>}
                <span>{item.label}</span>
              </Link>
            ) : (
              <span className={`flex items-center space-x-1 ${
                index === items.length - 1 
                  ? 'text-gray-900 dark:text-white font-medium' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                {item.icon && <span className="text-base">{item.icon}</span>}
                <span>{item.label}</span>
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

const DashboardBreadcrumb = ({ activeTab }) => {
  const getBreadcrumbItems = (tabId) => {
    const baseItems = [
      { label: 'Dashboard', icon: '🏠', href: '/dashboard' }
    ];

    const tabItems = {
      overview: [
        ...baseItems,
        { label: 'Overview', icon: '📊' }
      ],
      courses: [
        ...baseItems,
        { label: 'My Courses', icon: '📚' }
      ],
      calendar: [
        ...baseItems,
        { label: 'Calendar', icon: '📅' }
      ],
      gamification: [
        ...baseItems,
        { label: 'Achievements', icon: '🏆' }
      ]
    };

    return tabItems[tabId] || baseItems;
  };

  return (
    <div className="mb-4">
      <Breadcrumb 
        items={getBreadcrumbItems(activeTab)} 
        className="px-1"
      />
    </div>
  );
};

export default Breadcrumb;
export { DashboardBreadcrumb };
