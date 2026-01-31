import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PlatformProtectedRoute } from './components/PlatformProtectedRoute';
import { SignupPage } from './pages/SignupPage';
import { LoginPage } from './pages/LoginPage';
import { LinkPlatformsPage } from './pages/LinkPlatformsPage';
import { DashboardPage } from './pages/DashboardPage';
import './index.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/link-platforms"
            element={
              <ProtectedRoute>
                <LinkPlatformsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PlatformProtectedRoute>
                <DashboardPage />
              </PlatformProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/link-platforms" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
