import React, { useState, useEffect, useRef } from 'react';
import { useGamification } from '../../contexts/GamificationContext';

const DashboardTabs = ({ activeTab, onTabChange, dashboardData }) => {
  const { userStats } = useGamification();
  const [focusedTab, setFocusedTab] = useState(null);
  const [tabHistory, setTabHistory] = useState([activeTab]);
  const [isAnimating, setIsAnimating] = useState(false);
  const tabRefs = useRef({});

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      shortLabel: 'Overview',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
        </svg>
      ),
      description: 'Dashboard overview and stats',
      badge: null,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'courses',
      label: 'My Courses',
      shortLabel: 'Courses',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      description: 'Your enrolled courses',
      badge: dashboardData?.stats?.inProgressCourses || null,
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'calendar',
      label: 'Calendar',
      shortLabel: 'Calendar',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      description: 'Schedule and events',
      badge: dashboardData?.upcomingEvents?.length || null,
      color: 'from-purple-500 to-violet-600'
    },
    {
      id: 'gamification',
      label: 'Achievements',
      shortLabel: 'Awards',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      description: 'Your achievements and progress',
      badge: userStats?.achievements?.length || null,
      color: 'from-orange-500 to-red-600'
    }
  ];

  // Helper function to calculate tab position for sliding indicator
  const getTabPosition = (tabId) => {
    const index = tabs.findIndex(tab => tab.id === tabId);
    return index * (100 / tabs.length);
  };

  // Initialize tab from localStorage on mount
  useEffect(() => {
    const savedTab = localStorage.getItem('dashboardActiveTab');
    if (savedTab && tabs.find(tab => tab.id === savedTab) && savedTab !== activeTab) {
      onTabChange(savedTab);
    }
  }, []);

  // Update tab history when activeTab changes
  useEffect(() => {
    setTabHistory(prev => {
      if (prev[prev.length - 1] === activeTab) return prev;
      const newHistory = prev.filter(id => id !== activeTab);
      return [...newHistory, activeTab].slice(-5);
    });
  }, [activeTab]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!focusedTab) return;

      const currentIndex = tabs.findIndex(tab => tab.id === focusedTab);
      let newIndex = currentIndex;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
          break;
        case 'ArrowRight':
          e.preventDefault();
          newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          onTabChange(focusedTab);
          break;
        case 'Escape':
          e.preventDefault();
          setFocusedTab(null);
          break;
        default:
          return;
      }

      if (newIndex !== currentIndex) {
        const newTabId = tabs[newIndex].id;
        setFocusedTab(newTabId);
        tabRefs.current[newTabId]?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [focusedTab, onTabChange, tabs]);

  const handleTabClick = (tabId) => {
    if (tabId === activeTab || isAnimating) return;

    setIsAnimating(true);

    // Update tab history
    setTabHistory(prev => {
      const newHistory = prev.filter(id => id !== tabId);
      return [...newHistory, tabId].slice(-5); // Keep last 5 tabs
    });

    // Save to localStorage for persistence
    localStorage.setItem('dashboardActiveTab', tabId);

    onTabChange(tabId);
    setFocusedTab(tabId);

    // Reset animation state
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleTabFocus = (tabId) => {
    setFocusedTab(tabId);
  };

  const handleTabBlur = () => {
    // Small delay to allow for tab switching
    setTimeout(() => {
      if (!document.activeElement?.closest('[role="tablist"]')) {
        setFocusedTab(null);
      }
    }, 100);
  };

  return (
    <div className="mb-12 sm:mb-16">
      <div className="relative">
        {/* Enhanced Tab Navigation Container */}
        <nav
          className="relative backdrop-blur-xl rounded-3xl p-1.5 shadow-2xl overflow-hidden tab-navigation"
          role="tablist"
          aria-label="Dashboard navigation"
        >
          {/* Animated Background Slider */}
          <div 
            className={`absolute top-1.5 bottom-1.5 bg-gradient-to-r ${tabs.find(tab => tab.id === activeTab)?.color || 'from-blue-500 to-indigo-600'} rounded-2xl shadow-lg transition-all duration-500 ease-out tab-slider`}
            style={{
              left: `${getTabPosition(activeTab)}%`,
              width: `${100 / tabs.length}%`,
            }}
          />
          
          {/* Tab Buttons */}
          <div className="relative flex">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                ref={el => tabRefs.current[tab.id] = el}
                onClick={() => handleTabClick(tab.id)}
                onFocus={() => handleTabFocus(tab.id)}
                onBlur={handleTabBlur}
                className={`relative flex-1 flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 px-2 sm:px-4 py-3 sm:py-4 rounded-2xl font-semibold text-xs sm:text-sm transition-all duration-300 group tab-button ${
                  activeTab === tab.id ? 'active text-white z-10' : 'text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-gray-600/30'
                } ${focusedTab === tab.id ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-transparent' : ''}`}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`tabpanel-${tab.id}`}
                tabIndex={activeTab === tab.id ? 0 : -1}
                title={tab.description}
              >
                {/* Icon with Badge */}
                <div className="relative">
                  <div className={`transition-transform duration-300 ${
                    activeTab === tab.id ? 'scale-110' : 'group-hover:scale-105'
                  }`}>
                    {tab.icon}
                  </div>
                  {tab.badge && tab.badge > 0 && (
                    <span className="tab-badge">
                      {tab.badge > 9 ? '9+' : tab.badge}
                    </span>
                  )}
                </div>
                
                {/* Label */}
                <span
                  className={`hidden sm:inline font-bold ${activeTab === tab.id ? 'text-white drop-shadow-sm' : 'text-gray-700 dark:text-gray-200'}`}
                >
                  {tab.label}
                </span>
                <span
                  className={`sm:hidden text-xs font-bold ${activeTab === tab.id ? 'text-white drop-shadow-sm' : 'text-gray-700 dark:text-gray-200'}`}
                >
                  {tab.shortLabel}
                </span>
                
                {/* Active Indicator Dot for Mobile */}
                {activeTab === tab.id && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full sm:hidden" />
                )}

                {/* Ripple Effect */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-white/20 transform scale-0 group-active:scale-100 transition-transform duration-200 rounded-2xl" />
                </div>
              </button>
            ))}
          </div>
        </nav>
        
        {/* Tab Description with Animation */}
        <div className="mt-3 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium tab-description">
            {tabs.find(tab => tab.id === activeTab)?.description}
          </p>
        </div>

        {/* Keyboard Navigation Hint */}
        {focusedTab && (
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-200/50 dark:border-gray-700/50 shadow-lg z-50">
            Use ← → keys to navigate, Enter to select
          </div>
        )}

        {/* Tab History Navigation */}
        {tabHistory.length > 1 && (
          <div className="mt-3 flex justify-center">
            <div className="flex items-center space-x-1 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-1 border border-gray-200/50 dark:border-gray-700/50">
              <span className="text-xs text-gray-500 dark:text-gray-400 px-2">Recent:</span>
              {tabHistory.slice(-4, -1).map((tabId, index) => {
                const tab = tabs.find(t => t.id === tabId);
                const getTabColor = (tabId) => {
                  switch(tabId) {
                    case 'overview': return 'text-blue-500 hover:text-blue-600';
                    case 'courses': return 'text-green-500 hover:text-green-600';
                    case 'calendar': return 'text-purple-500 hover:text-purple-600';
                    case 'gamification': return 'text-orange-500 hover:text-orange-600';
                    default: return 'text-gray-500 hover:text-gray-600';
                  }
                };
                return tab ? (
                  <button
                    key={`${tabId}-${index}`}
                    onClick={() => handleTabClick(tabId)}
                    className={`p-1 rounded text-xs hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 ${getTabColor(tabId)}`}
                    title={`Switch to ${tab.label}`}
                  >
                    {tab.icon}
                  </button>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* Quick Actions for Active Tab */}
        <div className="mt-4 flex justify-center">
          <div className="flex space-x-2">
            {getQuickActions(activeTab).map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-800 dark:text-gray-100 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-300/60 dark:border-gray-600/60 rounded-lg hover:bg-white dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 shadow-sm hover:shadow-md"
                title={action.description}
              >
                <span className="mr-1">{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Helper function to get quick actions for each tab
  function getQuickActions(tabId) {
    const actions = {
      overview: [
        {
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
            </svg>
          ),
          label: 'View Stats',
          description: 'View detailed statistics',
          onClick: () => {}
        },
        {
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          ),
          label: 'Refresh',
          description: 'Refresh dashboard data',
          onClick: () => window.location.reload()
        }
      ],
      courses: [
        {
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          ),
          label: 'Browse Courses',
          description: 'Find new courses',
          onClick: () => window.location.href = '/courses/available'
        },
        {
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          ),
          label: 'My Courses',
          description: 'View enrolled courses',
          onClick: () => window.location.href = '/courses/my-courses'
        }
      ],
      calendar: [
        {
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          ),
          label: 'Add Event',
          description: 'Create new event',
          onClick: () => {}
        },
        {
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          ),
          label: 'View All',
          description: 'View full calendar',
          onClick: () => {}
        }
      ],
      gamification: [
        {
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          ),
          label: 'Leaderboard',
          description: 'View rankings',
          onClick: () => {}
        },
        {
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          label: 'Goals',
          description: 'Set learning goals',
          onClick: () => {}
        }
      ]
    };

    return actions[tabId] || [];
  }
};

export default DashboardTabs;
