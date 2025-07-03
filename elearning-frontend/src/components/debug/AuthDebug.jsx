import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const AuthDebug = () => {
  const { user, isAuthenticated } = useAuth();
  
  // Check localStorage
  const superAdminToken = localStorage.getItem('superAdminToken');
  const superAdminUser = localStorage.getItem('superAdminUser');
  const regularToken = localStorage.getItem('token');
  const regularUser = localStorage.getItem('user');
  
  const debugInfo = {
    isAuthenticated: isAuthenticated(),
    user: user,
    regularToken: !!regularToken,
    regularUser: !!regularUser,
    superAdminToken: !!superAdminToken,
    superAdminUser: !!superAdminUser,
    localStorage: {
      token: regularToken,
      user: regularUser,
      superAdminToken: superAdminToken,
      superAdminUser: superAdminUser
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs max-w-md z-50">
      <h3 className="font-bold mb-2">Auth Debug Info</h3>
      <pre className="whitespace-pre-wrap">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
      <button 
        onClick={() => {
          localStorage.clear();
          window.location.reload();
        }}
        className="mt-2 bg-red-600 text-white px-2 py-1 rounded text-xs"
      >
        Clear All & Reload
      </button>
    </div>
  );
};

export default AuthDebug;
