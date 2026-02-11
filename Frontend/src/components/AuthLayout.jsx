import React from 'react';

export const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-mono font-bold mb-3">
            <span className="text-white">Code</span>
            <span className="text-yellow-300">Crakr</span>
          </h1>
          <p className="text-white/40 text-xs uppercase tracking-wider">Track. Compete. Improve.</p>
        </div>

        {children}
      </div>
    </div>
  );
};
