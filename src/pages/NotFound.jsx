import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Sparkles, Compass } from 'lucide-react';
import GlassCard from '../components/common/GlassCard';
import { PageTransition, MotionCard } from '../components/common/MotionWrapper';

export default function NotFound() {
  return (
    <PageTransition style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem'
    }}>
      <MotionCard className="glass-card glass-card-glow" style={{
        maxWidth: '560px',
        width: '100%',
        padding: '3rem 2rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        borderRadius: 'var(--radius-xl)'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(var(--accent-rgb), 0.15)',
          border: '1px solid var(--border-glass-bright)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent-color)',
          marginBottom: '1.5rem',
          boxShadow: '0 0 25px rgba(var(--accent-rgb), 0.35)'
        }}>
          <Compass size={32} />
        </div>

        <div style={{
          fontSize: 'clamp(4rem, 10vw, 6.5rem)',
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: '-0.04em',
          marginBottom: '0.75rem',
          fontFamily: 'var(--font-mono)'
        }} className="text-gradient glow-text">
          404
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.6rem', color: '#FFFFFF' }}>
          Halaman Tidak Ditemukan
        </h2>

        <p style={{
          fontSize: '0.95rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          maxWidth: '440px',
          marginBottom: '2rem'
        }}>
          Rute atau halaman yang Anda tuju tidak ditemukan dalam struktur navigasi website BibTzy.
        </p>

        <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/" className="btn btn-primary" id="btn-404-home">
            <Home size={16} />
            <span>Kembali ke Beranda</span>
          </Link>

          <Link to="/projects" className="btn btn-glass">
            <Sparkles size={16} />
            <span>Jelajahi Proyek</span>
          </Link>
        </div>
      </MotionCard>
    </PageTransition>
  );
}
