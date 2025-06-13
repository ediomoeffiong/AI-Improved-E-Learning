import React from 'react';
import { ROLE_COLORS, ROLE_ICONS } from '../../constants/roles';

/**
 * RoleBadge component for displaying user roles with consistent styling
 * @param {string} role - The user role (Student, Instructor, Admin)
 * @param {string} size - Size variant (sm, md, lg)
 * @param {boolean} showIcon - Whether to show the role icon
 * @param {string} className - Additional CSS classes
 */
const RoleBadge = ({ 
  role, 
  size = 'md', 
  showIcon = true, 
  className = '' 
}) => {
  if (!role) return null;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const roleColor = ROLE_COLORS[role] || 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
  const roleIcon = ROLE_ICONS[role] || '';

  return (
    <span 
      className={`
        inline-flex items-center rounded-full font-medium
        ${sizeClasses[size]}
        ${roleColor}
        ${className}
      `}
    >
      {showIcon && roleIcon && (
        <span className="mr-1">{roleIcon}</span>
      )}
      {role}
    </span>
  );
};

export default RoleBadge;
