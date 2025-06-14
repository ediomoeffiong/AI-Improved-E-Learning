import { useState, useEffect } from 'react';
import { useScrollToTop } from '../../hooks/useScrollToTop';

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollToTop } = useScrollToTop();

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const handleScrollToTop = () => {
    scrollToTop({
      behavior: 'smooth',
      delay: 0
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={handleScrollToTop}
      className={`
        fixed bottom-24 right-4 sm:right-8 z-50
        bg-gradient-to-r from-blue-600 to-purple-600
        hover:from-blue-700 hover:to-purple-700
        text-white p-3 rounded-full shadow-lg
        transition-all duration-300 ease-in-out
        hover:scale-110 hover:shadow-xl
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        group
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
      aria-label="Scroll to top"
      title="Scroll to top"
    >
      <svg
        className="w-6 h-6 transition-transform duration-200 group-hover:-translate-y-1"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
      
      {/* Ripple effect */}
      <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
      
      {/* Pulse animation */}
      <div className="absolute inset-0 rounded-full bg-blue-400 opacity-75 animate-ping"></div>
    </button>
  );
};

export default ScrollToTopButton;
