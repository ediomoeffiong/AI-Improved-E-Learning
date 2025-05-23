import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleDropdown = (menu) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    // Close any open dropdowns when toggling mobile menu
    setOpenDropdown(null);
  };

  return (
    <nav style={{ backgroundColor: '#3b82f6', color: 'white', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', textDecoration: 'none' }}>E-Learning</Link>
        
        {/* Desktop Menu */}
        <div className="desktop-menu" style={{ display: 'none' }}>
          <Link to="/" style={{ color: 'white', marginRight: '1.5rem', textDecoration: 'none' }}>Home</Link>
          <Link to="/dashboard" style={{ color: 'white', marginRight: '1.5rem', textDecoration: 'none' }}>Dashboard</Link>
          
          {/* Quiz Dropdown */}
          <div style={{ position: 'relative', marginRight: '1.5rem', display: 'inline-block' }}>
            <button 
              onClick={() => toggleDropdown('quiz')} 
              style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              Quiz
              <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '1rem', width: '1rem', marginLeft: '0.25rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openDropdown === 'quiz' && (
              <div style={{ position: 'absolute', zIndex: 10, marginTop: '0.5rem', width: '12rem', backgroundColor: 'white', borderRadius: '0.375rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '0.25rem 0', color: '#4b5563' }}>
                <Link to="/quiz/dashboard" style={{ display: 'block', padding: '0.5rem 1rem', color: '#4b5563', textDecoration: 'none' }}>Dashboard</Link>
                <Link to="/quiz/badges" style={{ display: 'block', padding: '0.5rem 1rem', color: '#4b5563', textDecoration: 'none' }}>Badges</Link>
                <Link to="/quiz/achievements" style={{ display: 'block', padding: '0.5rem 1rem', color: '#4b5563', textDecoration: 'none' }}>Achievements</Link>
                <Link to="/quiz/leaderboard" style={{ display: 'block', padding: '0.5rem 1rem', color: '#4b5563', textDecoration: 'none' }}>Leaderboard</Link>
              </div>
            )}
          </div>
          
          {/* Classroom Dropdown */}
          <div style={{ position: 'relative', marginRight: '1.5rem', display: 'inline-block' }}>
            <button 
              onClick={() => toggleDropdown('classroom')} 
              style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              Classroom
              <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '1rem', width: '1rem', marginLeft: '0.25rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openDropdown === 'classroom' && (
              <div style={{ position: 'absolute', zIndex: 10, marginTop: '0.5rem', width: '12rem', backgroundColor: 'white', borderRadius: '0.375rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '0.25rem 0', color: '#4b5563' }}>
                <Link to="/classroom/dashboard" style={{ display: 'block', padding: '0.5rem 1rem', color: '#4b5563', textDecoration: 'none' }}>Dashboard</Link>
                <Link to="/classroom/materials" style={{ display: 'block', padding: '0.5rem 1rem', color: '#4b5563', textDecoration: 'none' }}>Course Materials</Link>
                <Link to="/classroom/chat" style={{ display: 'block', padding: '0.5rem 1rem', color: '#4b5563', textDecoration: 'none' }}>Chat Feature</Link>
                <Link to="/classroom/recordings" style={{ display: 'block', padding: '0.5rem 1rem', color: '#4b5563', textDecoration: 'none' }}>Session Recordings</Link>
              </div>
            )}
          </div>
          
          {/* Progress Dropdown */}
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <button 
              onClick={() => toggleDropdown('progress')} 
              style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              Progress
              <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '1rem', width: '1rem', marginLeft: '0.25rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openDropdown === 'progress' && (
              <div style={{ position: 'absolute', zIndex: 10, marginTop: '0.5rem', width: '12rem', backgroundColor: 'white', borderRadius: '0.375rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '0.25rem 0', color: '#4b5563' }}>
                <Link to="/progress/dashboard" style={{ display: 'block', padding: '0.5rem 1rem', color: '#4b5563', textDecoration: 'none' }}>Dashboard</Link>
                <Link to="/progress/reports" style={{ display: 'block', padding: '0.5rem 1rem', color: '#4b5563', textDecoration: 'none' }}>Performance Reports</Link>
                <Link to="/progress/activity" style={{ display: 'block', padding: '0.5rem 1rem', color: '#4b5563', textDecoration: 'none' }}>Activity Logs</Link>
                <Link to="/progress/recommendations" style={{ display: 'block', padding: '0.5rem 1rem', color: '#4b5563', textDecoration: 'none' }}>Personalized Recommendations</Link>
              </div>
            )}
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button style={{ backgroundColor: 'white', color: '#3b82f6', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontWeight: '500', marginRight: '1rem', border: 'none' }}>
            Sign In
          </button>
          <button 
            onClick={toggleMobileMenu}
            className="mobile-menu-button"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '1.5rem', width: '1.5rem', color: 'white' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div style={{ backgroundColor: '#3b82f6', padding: '1rem' }}>
          <Link to="/" style={{ display: 'block', color: 'white', padding: '0.5rem 0', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Home</Link>
          <Link to="/dashboard" style={{ display: 'block', color: 'white', padding: '0.5rem 0', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Dashboard</Link>
          
          {/* Mobile Quiz Dropdown */}
          <div>
            <button 
              onClick={() => toggleDropdown('mobile-quiz')} 
              style={{ width: '100%', textAlign: 'left', color: 'white', background: 'none', border: 'none', padding: '0.5rem 0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
            >
              Quiz
              <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '1rem', width: '1rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openDropdown === 'mobile-quiz' && (
              <div style={{ paddingLeft: '1rem', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <Link to="/quiz/dashboard" style={{ display: 'block', padding: '0.5rem 0', color: 'white', textDecoration: 'none' }}>Dashboard</Link>
                <Link to="/quiz/badges" style={{ display: 'block', padding: '0.5rem 0', color: 'white', textDecoration: 'none' }}>Badges</Link>
                <Link to="/quiz/achievements" style={{ display: 'block', padding: '0.5rem 0', color: 'white', textDecoration: 'none' }}>Achievements</Link>
                <Link to="/quiz/leaderboard" style={{ display: 'block', padding: '0.5rem 0', color: 'white', textDecoration: 'none' }}>Leaderboard</Link>
              </div>
            )}
          </div>
          
          {/* Mobile Classroom Dropdown */}
          <div>
            <button 
              onClick={() => toggleDropdown('mobile-classroom')} 
              style={{ width: '100%', textAlign: 'left', color: 'white', background: 'none', border: 'none', padding: '0.5rem 0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
            >
              Classroom
              <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '1rem', width: '1rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openDropdown === 'mobile-classroom' && (
              <div style={{ paddingLeft: '1rem', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <Link to="/classroom/dashboard" style={{ display: 'block', padding: '0.5rem 0', color: 'white', textDecoration: 'none' }}>Dashboard</Link>
                <Link to="/classroom/materials" style={{ display: 'block', padding: '0.5rem 0', color: 'white', textDecoration: 'none' }}>Course Materials</Link>
                <Link to="/classroom/chat" style={{ display: 'block', padding: '0.5rem 0', color: 'white', textDecoration: 'none' }}>Chat Feature</Link>
                <Link to="/classroom/recordings" style={{ display: 'block', padding: '0.5rem 0', color: 'white', textDecoration: 'none' }}>Session Recordings</Link>
              </div>
            )}
          </div>
          
          {/* Mobile Progress Dropdown */}
          <div>
            <button 
              onClick={() => toggleDropdown('mobile-progress')} 
              style={{ width: '100%', textAlign: 'left', color: 'white', background: 'none', border: 'none', padding: '0.5rem 0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
            >
              Progress
              <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '1rem', width: '1rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openDropdown === 'mobile-progress' && (
              <div style={{ paddingLeft: '1rem', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <Link to="/progress/dashboard" style={{ display: 'block', padding: '0.5rem 0', color: 'white', textDecoration: 'none' }}>Dashboard</Link>
                <Link to="/progress/reports" style={{ display: 'block', padding: '0.5rem 0', color: 'white', textDecoration: 'none' }}>Performance Reports</Link>
                <Link to="/progress/activity" style={{ display: 'block', padding: '0.5rem 0', color: 'white', textDecoration: 'none' }}>Activity Logs</Link>
                <Link to="/progress/recommendations" style={{ display: 'block', padding: '0.5rem 0', color: 'white', textDecoration: 'none' }}>Personalized Recommendations</Link>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* CSS for responsive design */}
      <style jsx>{`
        @media (min-width: 768px) {
          .desktop-menu {
            display: flex !important;
          }
          .mobile-menu-button {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;


