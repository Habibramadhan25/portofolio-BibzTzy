import React from 'react';

export default function GlassCard({
  children,
  className = '',
  interactive = false,
  glow = false,
  style = {},
  onClick,
  ...props
}) {
  const classes = [
    'glass-card',
    interactive ? 'glass-card-interactive' : '',
    glow ? 'glass-card-glow' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      style={style}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}
