import React from 'react';

export default function LoadingState({ count = 3, message = 'Memuat data...' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', padding: '1rem 0' }}>
      <div style={{ textAlign: 'center', color: 'var(--ice-blue)', fontSize: '0.88rem', fontWeight: 600 }}>
        {message}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="glass-card"
            style={{
              height: '180px',
              animation: 'pulseGlow 2s infinite',
              opacity: 0.6
            }}
          />
        ))}
      </div>
    </div>
  );
}
