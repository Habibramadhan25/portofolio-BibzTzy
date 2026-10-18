import React from 'react';

export default function StatCard({
  icon: Icon,
  number,
  label,
  sublabel,
  className = '',
  onClick
}) {
  return (
    <div
      className={`stat-card ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {Icon && (
        <div className="stat-icon-wrapper">
          <Icon size={24} />
        </div>
      )}
      <div className="stat-info">
        <span className="stat-number">{number}</span>
        <span className="stat-label">{label}</span>
        {sublabel && (
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
