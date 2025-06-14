import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing authentication on app load
  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData, authToken) => {
    try {
      setUser(userData);
      setToken(authToken);
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  const logout = () => {
    try {
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const isAuthenticated = () => {
    return !!(user && token);
  };

  const getUserRole = () => {
    return user?.role || null;
  };

  const getUserName = () => {
    return user?.name || null;
  };

  const getUserEmail = () => {
    return user?.email || null;
  };

  const hasRole = (requiredRole) => {
    return user?.role === requiredRole;
  };

  const hasAnyRole = (allowedRoles) => {
    return allowedRoles.includes(user?.role);
  };

  const hasInstitutionFunctions = () => {
    // Check if user has institution functions enabled
    // This would typically come from user settings stored in the backend
    // For now, we'll check localStorage for the setting
    try {
      const settings = localStorage.getItem('userSettings');
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        return parsedSettings.institutionFunctionsEnabled === true;
      }
    } catch (error) {
      console.error('Error checking institution functions:', error);
    }
    return false;
  };

  const getInstitutionData = () => {
    try {
      const settings = localStorage.getItem('userSettings');
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        return {
          institutionName: parsedSettings.institutionName || '',
          studentId: parsedSettings.studentId || '',
          department: parsedSettings.department || '',
          academicYear: parsedSettings.academicYear || '',
          enrollmentDate: parsedSettings.enrollmentDate || '',
          studentLevel: parsedSettings.studentLevel || 'undergraduate'
        };
      }
    } catch (error) {
      console.error('Error getting institution data:', error);
    }
    return null;
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    logout,
    isAuthenticated,
    getUserRole,
    getUserName,
    getUserEmail,
    hasRole,
    hasAnyRole,
    hasInstitutionFunctions,
    getInstitutionData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
