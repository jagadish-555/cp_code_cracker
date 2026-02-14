import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const hasAllPlatforms = (userData) => {
    if (!userData?.platformAccounts) return false;
    const platforms = userData.platformAccounts.map(acc => acc.platform);
    return platforms.includes('cf') && platforms.includes('lc') && platforms.includes('cc');
  };

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const response = await authApi.getCurrentUser();
        setUser(response.data.user);
      } catch (err) {

        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const signup = async (email, password, username) => {
    try {
      setError(null);
      const response = await authApi.signup(email, password, username);
      setUser(response.data.user);
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Signup error:', err.response?.data);
      let errorMessage = 'Signup failed';
      
      if (err.response?.data?.error) {
        if (Array.isArray(err.response.data.error)) {
          errorMessage = err.response.data.error.join(', ');
        } else {
          errorMessage = err.response.data.error;
        }
      } else if (err.response?.data?.errors?.[0]) {
        errorMessage = err.response.data.errors[0];
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await authApi.login(email, password);
      
      const userResponse = await authApi.getCurrentUser();
      setUser(userResponse.data.user);
      
      const needsPlatformSetup = !hasAllPlatforms(userResponse.data.user);
      
      return { 
        success: true, 
        data: response.data,
        needsPlatformSetup 
      };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setUser(null);
      setError(null);
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Logout failed' };
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authApi.getCurrentUser();
      setUser(response.data.user);
      return response.data.user;
    } catch (err) {
      return null;
    }
  };

  const value = {
    user,
    loading,
    error,
    signup,
    login,
    logout,
    refreshUser,
    isAuthenticated: !!user,
    hasAllPlatforms: hasAllPlatforms(user),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
