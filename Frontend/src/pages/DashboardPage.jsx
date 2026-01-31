import React from 'react';
import { useAuth } from '../context/AuthContext';

export const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#0b0b0f] p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-grotesk font-bold text-[#f0f0f0] mb-2">Dashboard</h1>
        <p className="text-[#a0a0a0] mb-8">Welcome back, {user?.username}!</p>

        <div className="grid gap-6">
          <div className="neo-card">
            <h2 className="text-xl font-grotesk font-bold text-[#f0f0f0] mb-4">Profile</h2>
            <div className="space-y-2">
              <p className="text-[#a0a0a0]">
                <span className="font-medium text-[#f0f0f0]">Email:</span> {user?.email}
              </p>
              <p className="text-[#a0a0a0]">
                <span className="font-medium text-[#f0f0f0]">Username:</span> {user?.username}
              </p>
            </div>
          </div>

          <div className="neo-card">
            <h2 className="text-xl font-grotesk font-bold text-[#f0f0f0] mb-4">Coming Soon</h2>
            <p className="text-[#a0a0a0]">Dashboard features will be added here</p>
          </div>
        </div>
      </div>
    </div>
  );
};
