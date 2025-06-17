import React, { useState, useEffect } from 'react';

const AchievementPopup = ({ 
  achievement, 
  isVisible, 
  onDismiss, 
  position = 'left',
  autoHide = true,
  hideDelay = 5000 
}) => {
  const [show, setShow] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      // Trigger animation after a small delay for smooth entrance
      setTimeout(() => setAnimate(true), 100);
      
      if (autoHide) {
        const timer = setTimeout(() => {
          handleDismiss();
        }, hideDelay);
        
        return () => clearTimeout(timer);
      }
    } else {
      setAnimate(false);
      setTimeout(() => setShow(false), 300);
    }
  }, [isVisible, autoHide, hideDelay]);

  const handleDismiss = () => {
    setAnimate(false);
    setTimeout(() => {
      setShow(false);
      if (onDismiss) onDismiss();
    }, 300);
  };

  if (!show || !achievement) return null;

  const getPositionClasses = () => {
    switch (position) {
      case 'left':
        return 'bottom-4 left-4';
      case 'right':
        return 'bottom-4 right-4';
      case 'center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      case 'top-left':
        return 'top-20 left-4';
      case 'top-right':
        return 'top-20 right-4';
      default:
        return 'bottom-4 left-4';
    }
  };

  const getAnimationClasses = () => {
    if (!animate) {
      switch (position) {
        case 'left':
          return 'translate-x-[-120%] opacity-0';
        case 'right':
          return 'translate-x-[120%] opacity-0';
        case 'center':
          return 'translate-y-[120%] opacity-0';
        case 'top-left':
          return 'translate-x-[-120%] opacity-0';
        case 'top-right':
          return 'translate-x-[120%] opacity-0';
        default:
          return 'translate-x-[-120%] opacity-0';
      }
    }
    return 'translate-x-0 translate-y-0 opacity-100';
  };

  return (
    <div 
      className={`fixed ${getPositionClasses()} z-50 max-w-sm transition-all duration-300 ease-out ${getAnimationClasses()}`}
    >
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white p-4 rounded-xl shadow-2xl border border-yellow-300">
        {/* Sparkle Animation Background */}
        <div className="absolute inset-0 overflow-hidden rounded-xl">
          <div className="absolute top-1 left-2 w-1 h-1 bg-white rounded-full animate-ping"></div>
          <div className="absolute top-3 right-3 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-2 left-4 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-3 right-2 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-start space-x-3">
            {/* Achievement Icon */}
            <div className="flex-shrink-0">
              <div className="text-3xl animate-bounce">
                {achievement.icon || '🏆'}
              </div>
            </div>

            {/* Achievement Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold text-lg leading-tight">
                    Achievement Unlocked!
                  </div>
                  <div className="text-sm font-semibold mt-1 text-yellow-100">
                    {achievement.name || achievement.title}
                  </div>
                  {achievement.description && (
                    <div className="text-xs mt-1 text-yellow-50 opacity-90">
                      {achievement.description}
                    </div>
                  )}
                  
                  {/* Rewards */}
                  <div className="flex items-center space-x-3 mt-2">
                    {achievement.points && (
                      <div className="flex items-center space-x-1 bg-white/20 rounded-full px-2 py-1">
                        <svg className="w-3 h-3 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span className="text-xs font-medium">+{achievement.points}</span>
                      </div>
                    )}
                    {achievement.diamonds && (
                      <div className="flex items-center space-x-1 bg-white/20 rounded-full px-2 py-1">
                        <svg className="w-3 h-3 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12z" />
                        </svg>
                        <span className="text-xs font-medium">+{achievement.diamonds}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dismiss Button */}
                <button 
                  className="flex-shrink-0 ml-2 text-white hover:text-yellow-200 transition-colors duration-200 p-1 rounded-full hover:bg-white/10"
                  onClick={handleDismiss}
                  aria-label="Dismiss achievement notification"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Progress Bar Animation (if applicable) */}
          {achievement.showProgress && (
            <div className="mt-3 bg-white/20 rounded-full h-1 overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
                style={{ width: '100%' }}
              ></div>
            </div>
          )}
        </div>

        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-500/20 to-red-500/20 rounded-xl blur-xl -z-10"></div>
      </div>
    </div>
  );
};

export default AchievementPopup;
