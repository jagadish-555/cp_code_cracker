import React from 'react';

export const FormError = ({ message }) => {
  if (!message) return null;
  return (
    <div className="mb-4 p-3 bg-red-900/20 border border-red-500 text-red-400 rounded text-sm">
      {message}
    </div>
  );
};
