import React from 'react';

const AvatarUpload = ({ onChange, label = "Avatar (opcional)" }) => {
  // Generates a unique ID
  const inputId = "avatar-upload-input";

  return (
    <div className="input-group">
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files ? e.target.files[0] : null;
          onChange(file);
        }}
      />
    </div>
  );
};

export default AvatarUpload;