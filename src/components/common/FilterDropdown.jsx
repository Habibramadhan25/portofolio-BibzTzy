import React from 'react';

export default function FilterDropdown({
  label,
  value,
  onChange,
  options = [],
  className = ''
}) {
  return (
    <select
      className={`filter-select ${className}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
    >
      {options.map(opt => (
        <option
          key={opt.value}
          value={opt.value}
          style={{ background: '#0D1524', color: '#F4F8FF' }}
        >
          {opt.label}
        </option>
      ))}
    </select>
  );
}
