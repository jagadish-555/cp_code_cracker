import React from 'react';

export const FormCard = ({ children, title }) => {
  return (
    <div className="neo-card mb-6">
      {title && (
        <h2 className="text-2xl font-grotesk font-bold text-[#f0f0f0] mb-6">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
};
