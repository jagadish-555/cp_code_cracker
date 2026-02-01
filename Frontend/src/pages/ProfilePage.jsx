import React from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';

export const ProfilePage = () => {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <p className="text-xs text-white/50 uppercase tracking-wider mb-2">Account</p>
        <h1 className="text-4xl md:text-5xl font-bold text-white font-mono">Profile</h1>
      </div>

      <div className="flex justify-center items-center py-24">
        <div className="text-center">
          <p className="text-white/50 text-lg mb-2">Coming Soon</p>
          <p className="text-white/40 text-sm">Profile settings will be available soon</p>
        </div>
      </div>
    </DashboardLayout>
  );
};
