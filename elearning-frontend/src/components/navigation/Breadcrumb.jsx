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
                {item.icon && <div className="flex items-center">{item.icon}</div>}
                <span>{item.label}</span>
              </Link>
            ) : (
              <span className={`flex items-center space-x-1 ${
                index === items.length - 1
                  ? 'text-gray-900 dark:text-white font-medium'
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                {item.icon && <div className="flex items-center">{item.icon}</div>}
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
      {
        label: 'Dashboard',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        ),
        href: '/dashboard'
      }
    ];

    const tabItems = {
      overview: [
        ...baseItems,
        {
          label: 'Overview',
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
            </svg>
          )
        }
      ],
      courses: [
        ...baseItems,
        {
          label: 'My Courses',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          )
        }
      ],
      calendar: [
        ...baseItems,
        {
          label: 'Calendar',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )
        }
      ],
      gamification: [
        ...baseItems,
        {
          label: 'Achievements',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          )
        }
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
