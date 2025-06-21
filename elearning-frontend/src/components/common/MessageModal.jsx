import React from 'react';
import { useScrollLock } from '../../hooks/useScrollLock';

const MessageModal = ({
  isOpen,
  onClose,
  title = "Message",
  message = "",
  buttonText = "OK",
  buttonClass = "bg-blue-600 hover:bg-blue-700 text-white",
  icon = null,
  iconClass = "text-blue-600 dark:text-blue-400",
  autoClose = false,
  autoCloseDelay = 3000
}) => {
  // Use the scroll lock hook to manage body overflow
  useScrollLock(isOpen);

  React.useEffect(() => {
    const handleKeyDownWrapper = (e) => {
      if (isOpen && (e.key === 'Escape' || e.key === 'Enter')) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDownWrapper);

    // Auto close if enabled and modal is open
    let timer;
    if (isOpen && autoClose) {
      timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDownWrapper);
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-md mx-4 transform transition-all duration-200 scale-100">
        <div className="text-center">
          {icon && (
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${iconClass.includes('bg-') ? iconClass : `bg-${iconClass.split('-')[1]}-100 dark:bg-${iconClass.split('-')[1]}-900`}`}>
              {typeof icon === 'string' ? (
                <span className="text-3xl">{icon}</span>
              ) : (
                <div className={iconClass}>
                  {icon}
                </div>
              )}
            </div>
          )}

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {title}
          </h3>

          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
              {message}
            </p>
          </div>

          <button
            onClick={onClose}
            className={`w-full px-4 py-2 rounded-md font-medium transition-colors duration-200 ${buttonClass}`}
          >
            {buttonText}
          </button>

          {autoClose && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              This message will close automatically in {autoCloseDelay / 1000} seconds
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageModal;
