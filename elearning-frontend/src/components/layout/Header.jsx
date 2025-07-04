import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from './Navbar';

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [announcementHeight, setAnnouncementHeight] = useState(0);
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      // Use announcement height as threshold, or 50px if no announcement
      const threshold = showAnnouncement ? announcementHeight : 50;
      setIsScrolled(window.scrollY > threshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showAnnouncement, announcementHeight]);

  // Measure announcement height
  useEffect(() => {
    if (showAnnouncement) {
      setAnnouncementHeight(48); // Approximate height of announcement bar
    } else {
      setAnnouncementHeight(0);
    }
  }, [showAnnouncement]);

  // Check if we're on the homepage
  const isHomePage = location.pathname === '/';

  const dismissAnnouncement = () => {
    setShowAnnouncement(false);
    // Store in localStorage to remember user preference
    localStorage.setItem('announcementDismissed', 'true');
  };

  // Check if announcement was previously dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem('announcementDismissed');
    if (dismissed === 'true') {
      setShowAnnouncement(false);
    }
  }, []);

  return (
    <>
      {/* Announcement Banner */}
      {showAnnouncement && (
        <div className={`bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white relative overflow-hidden transition-all duration-300 ${
          isScrolled ? 'opacity-0 -translate-y-full pointer-events-none' : 'opacity-100 translate-y-0'
        }`} style={{ zIndex: isScrolled ? 40 : 60 }}>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
              <defs>
                <pattern id="announcement-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="10" cy="10" r="1" fill="currentColor" />
                </pattern>
              </defs>
              <rect width="100" height="20" fill="url(#announcement-pattern)" />
            </svg>
          </div>

          <div className="relative z-10 flex items-center justify-between py-3 px-4 max-w-7xl mx-auto">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  🎉 <span className="font-bold">New AI-Powered Courses Available!</span>
                  <span className="hidden sm:inline"> Join thousands of learners advancing their careers with cutting-edge technology.</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                to="/courses/available"
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 backdrop-blur-sm"
              >
                Explore Now
              </Link>
              <button
                onClick={dismissAnnouncement}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Dismiss announcement"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Header */}
      <header
        className={`fixed left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'top-0 bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200 dark:bg-gray-900/95 dark:border-gray-700'
            : isHomePage
              ? 'bg-transparent'
              : 'bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800'
        }`}
        style={{
          top: isScrolled ? '0px' : (showAnnouncement ? `${announcementHeight}px` : '0px'),
          transition: 'top 0.3s ease-in-out, background-color 0.3s ease-in-out'
        }}
      >
        {/* Enhanced Navbar with scroll effects */}
        <div className={`transition-all duration-300 ${isScrolled ? 'py-1' : 'py-0'}`}>
          <Navbar isScrolled={isScrolled} />
        </div>
      </header>

      {/* Spacer to prevent content from hiding behind fixed header */}
      <div
        className="transition-all duration-300"
        style={{
          height: `${(showAnnouncement && !isScrolled ? announcementHeight : 0) + (isScrolled ? 40 : 48)}px`
        }}
      />
    </>
  );
}

export default Header;


