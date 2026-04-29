import React from 'react';

const SubmitButton = ({ label, disabled = false }) => {
  return (
    <button type="submit" disabled={disabled}>
      {label}
    </button>
  );
};

export default SubmitButton;