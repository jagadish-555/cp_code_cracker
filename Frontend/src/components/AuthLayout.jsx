import React from 'react';

export const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-[#0b0b0f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-grotesk font-bold text-[#f0f0f0] mb-2">CodeCrakr</h1>
          <p className="text-[#a0a0a0]">Track. Compete. Improve.</p>
        </div>

        {children}
      </div>
    </div>
  );
};
