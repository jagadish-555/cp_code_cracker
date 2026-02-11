import React from 'react';

export const FormInput = ({ label, error, ...inputProps }) => {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-white mb-2">
          {label}
        </label>
      )}
      <input
        {...inputProps}
        className={`neo-input w-full ${error ? 'border-red-500' : ''} ${inputProps.className || ''}`}
      />
      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
    </div>
  );
};
