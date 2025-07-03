import React from 'react';
import RoleBasedHeader from './RoleBasedHeader';

const SmartHeader = () => {
  // Use unified RoleBasedHeader for all users (authenticated and non-authenticated)
  // The RoleBasedHeader now handles different content based on authentication status and user type
  return <RoleBasedHeader />;
};

export default SmartHeader;
