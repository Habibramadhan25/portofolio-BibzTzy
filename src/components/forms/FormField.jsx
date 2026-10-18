import React from 'react';

export default function FormField({
  label,
  required = false,
  error,
  hint,
  id,
  children
}) {
  return (
    <div className="form-group">
      {label && (
        <label htmlFor={id} className="form-label">
          <span>{label} {required && <span className="required">*</span>}</span>
        </label>
      )}
      {children}
      {error && <span className="form-error">{error}</span>}
      {!error && hint && <span className="form-hint">{hint}</span>}
    </div>
  );
}
