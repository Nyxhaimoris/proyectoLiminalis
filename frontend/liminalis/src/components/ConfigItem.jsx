import React, { useState, useRef, useEffect } from 'react';
import './styles/CustomSelect.css';

const ConfigItem = ({ label, description, options, value, onChange, loading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Find the label of the currently selected option
  const selectedOption = options.find(opt => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (val) => {
    if (loading) return;
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className="config-row">
      <div className="config-info">
        <label className="config-label">{label}</label>
        {description && <p className="config-description">{description}</p>}
      </div>

      <div className={`custom-select-container ${loading ? 'is-loading' : ''}`} ref={dropdownRef}>
        <div 
          className={`select-trigger ${isOpen ? 'active' : ''}`} 
          onClick={() => !loading && setIsOpen(!isOpen)}
        >
          <span>{selectedOption ? selectedOption.label : 'Select...'}</span>
          <span className={`arrow-icon ${isOpen ? 'up' : ''}`}>▼</span>
        </div>

        {isOpen && (
          <div className="select-dropdown">
            {options.map((opt) => (
              <div
                key={opt.value}
                className={`select-option ${opt.value === value ? 'selected' : ''}`}
                onClick={() => handleSelect(opt.value)}
              >
                {opt.label}
                {opt.value === value && <span className="check-icon">✓</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfigItem;