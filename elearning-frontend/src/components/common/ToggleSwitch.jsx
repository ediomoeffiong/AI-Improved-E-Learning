import React from 'react';

const ToggleSwitch = ({
  checked = false,
  onChange,
  disabled = false,
  size = 'md',
  color = 'blue',
  label,
  description,
  id,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: {
      switch: 'h-4 w-7',
      thumb: 'h-3 w-3',
      translate: checked ? 'translate-x-3' : 'translate-x-0.5'
    },
    md: {
      switch: 'h-6 w-11',
      thumb: 'h-4 w-4',
      translate: checked ? 'translate-x-6' : 'translate-x-1'
    },
    lg: {
      switch: 'h-8 w-14',
      thumb: 'h-6 w-6',
      translate: checked ? 'translate-x-7' : 'translate-x-1'
    }
  };

  const colorClasses = {
    blue: checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700',
    green: checked ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700',
    purple: checked ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700',
    indigo: checked ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700',
    red: checked ? 'bg-red-600' : 'bg-gray-200 dark:bg-gray-700'
  };

  const currentSize = sizeClasses[size];
  const currentColor = colorClasses[color];

  const handleClick = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.key === ' ' || e.key === 'Enter') && !disabled) {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div className={`flex items-center ${className}`}>
      {label && (
        <div className="flex-1 mr-4">
          <label 
            htmlFor={id} 
            className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
          >
            {label}
          </label>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </div>
      )}
      
      <button
        type="button"
        id={id}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${currentSize.switch}
          ${currentColor}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        role="switch"
        aria-checked={checked}
        aria-labelledby={label ? id : undefined}
        {...props}
      >
        <span
          className={`
            inline-block transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out
            ${currentSize.thumb}
            ${currentSize.translate}
          `}
        />
      </button>
    </div>
  );
};

export default ToggleSwitch;
