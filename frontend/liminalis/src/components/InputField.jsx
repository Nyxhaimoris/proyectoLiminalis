import React from 'react';

const InputField = ({ label, type, value, onChange, rows = 3 }) => {
  const inputId = `input-${label.replace(/\s+/g, '-').toLowerCase()}`;

  const handleInputChange = (e) => {
    if (type === 'file') {
      onChange(e); 
    } else {
      onChange(e.target.value);
    }
  };

  return (
    <div className="input-group">
      {/* htmlFor to vinculate it to the id of the input */}
      <label htmlFor={inputId}>{label}</label>
      {type === 'textarea' ? (
        <textarea
          id={inputId}
          value={value}
          onChange={handleInputChange}
          rows={rows}
          className="custom-textarea"
        />
      ) : (
        <input
          id={inputId}
          type={type}
          value={type === 'file' ? undefined : value}
          onChange={handleInputChange}
        />
      )}
    </div>
  );
};

export default InputField;