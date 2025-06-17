import React from 'react';
import AchievementPopup from './AchievementPopup';
import useAchievementNotifications from '../../hooks/useAchievementNotifications';

const AchievementNotificationManager = () => {
  const { activeNotifications, dismissAchievement } = useAchievementNotifications();

  return (
    <>
      {activeNotifications.map((notification) => (
        <AchievementPopup
          key={notification.id}
          achievement={notification.achievement}
          isVisible={notification.isVisible}
          position={notification.position}
          autoHide={notification.autoHide}
          hideDelay={notification.hideDelay}
          onDismiss={() => dismissAchievement(notification.id)}
        />
      ))}
    </>
  );
};

export default AchievementNotificationManager;
