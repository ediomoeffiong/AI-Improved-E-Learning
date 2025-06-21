import React from 'react';
import { useScrollLock } from '../../hooks/useScrollLock';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonClass = "bg-red-600 hover:bg-red-700 text-white",
  cancelButtonClass = "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200",
  icon = null,
  iconClass = "text-red-600 dark:text-red-400",
  children
}) => {
  // Use the scroll lock hook to manage body overflow
  useScrollLock(isOpen);

  React.useEffect(() => {
    const handleKeyDownWrapper = (e) => {
      if (isOpen && e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDownWrapper);
    return () => {
      document.removeEventListener('keydown', handleKeyDownWrapper);
    };
  }, [isOpen, onClose]);

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
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-2xl mx-4 transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center mb-4">
          {icon && (
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4 ${iconClass.includes('bg-') ? iconClass : `bg-${iconClass.split('-')[1]}-100 dark:bg-${iconClass.split('-')[1]}-900`}`}>
              {typeof icon === 'string' ? (
                <span className="text-2xl">{icon}</span>
              ) : (
                <div className={iconClass}>
                  {icon}
                </div>
              )}
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          {children ? (
            children
          ) : (
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {message}
            </p>
          )}
        </div>

        <div className="flex space-x-3 justify-end">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 ${cancelButtonClass}`}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 ${confirmButtonClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
