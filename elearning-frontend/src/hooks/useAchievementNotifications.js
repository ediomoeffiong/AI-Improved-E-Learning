import { useState, useCallback } from 'react';

const useAchievementNotifications = () => {
  const [activeNotifications, setActiveNotifications] = useState([]);

  const showAchievement = useCallback((achievement, options = {}) => {
    const notification = {
      id: Date.now() + Math.random(),
      achievement,
      position: options.position || 'left',
      autoHide: options.autoHide !== false,
      hideDelay: options.hideDelay || 5000,
      isVisible: true,
      ...options
    };

    setActiveNotifications(prev => [...prev, notification]);

    // Auto-remove if autoHide is enabled
    if (notification.autoHide) {
      setTimeout(() => {
        dismissAchievement(notification.id);
      }, notification.hideDelay);
    }

    return notification.id;
  }, []);

  const dismissAchievement = useCallback((notificationId) => {
    setActiveNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isVisible: false }
          : notification
      )
    );

    // Remove from array after animation completes
    setTimeout(() => {
      setActiveNotifications(prev => 
        prev.filter(notification => notification.id !== notificationId)
      );
    }, 300);
  }, []);

  const dismissAll = useCallback(() => {
    setActiveNotifications(prev => 
      prev.map(notification => ({ ...notification, isVisible: false }))
    );

    setTimeout(() => {
      setActiveNotifications([]);
    }, 300);
  }, []);

  const getSmartPosition = useCallback(() => {
    // Check if there are floating action buttons or other elements
    // that might block the achievement popup
    const hasFloatingButtons = document.querySelector('[class*="fixed"][class*="bottom"][class*="right"]');
    const hasInstallPrompt = document.querySelector('[class*="fixed"][class*="bottom"][class*="right"]');
    
    // Default to left to avoid most common blocking scenarios
    return 'left';
  }, []);

  return {
    activeNotifications,
    showAchievement,
    dismissAchievement,
    dismissAll,
    getSmartPosition
  };
};

export default useAchievementNotifications;
