import React from 'react';

export const FormCard = ({ children, title, label }) => {
  return (
    <div className="relative">
      <div className="border border-neutral-700/30 rounded-lg bg-white/5 backdrop-blur-sm p-8 mb-6">
        {(label || title) && (
          <div className="mb-8">
            {label && (
              <p className="text-[10px] text-white/40 uppercase tracking-wider mb-3">{label}</p>
            )}
            {title && (
              <h2 className="text-3xl font-mono font-bold text-white">
                {title}
              </h2>
            )}
          </div>
        )}
        {children}
      </div>
      <div className="absolute top-0 left-0 w-1 h-16 bg-yellow-300 rounded-l-lg" />
    </div>
  );
};
