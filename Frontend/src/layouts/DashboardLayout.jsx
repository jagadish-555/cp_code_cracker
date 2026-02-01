import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Menu, X } from 'lucide-react';

export const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#0a0a0a]">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-40 md:hidden p-2 rounded border border-neutral-700/30 bg-black/40 backdrop-blur-sm hover:border-neutral-600/50 transition"
      >
        {sidebarOpen ? (
          <X size={20} className="text-white/90" />
        ) : (
          <Menu size={20} className="text-white/90" />
        )}
      </button>

      <div
        className={`fixed md:static inset-y-0 left-0 z-30 w-64 border-r border-neutral-700/30 bg-black/60 backdrop-blur-sm transition-transform duration-300 ease-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex-1 overflow-auto">
        <div className="md:p-8 p-4 pt-16 md:pt-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
