import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const PlatformProtectedRoute = ({ children }) => {
  const { isAuthenticated, hasAllPlatforms, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b0f] flex items-center justify-center">
        <div className="text-[#4cc9f0] text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasAllPlatforms) {
    return <Navigate to="/link-platforms" replace />;
  }

  return children;
};
