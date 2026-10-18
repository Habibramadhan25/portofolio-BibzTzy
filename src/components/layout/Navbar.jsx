import React from 'react';
import { Menu, Sparkles, Command, ShieldCheck, Lock } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useOwner } from '../../context/OwnerContext';

const PAGE_TITLES = {
  '/': 'Beranda & Ikhtisar',
  '/about': 'Profil Siswa',
  '/projects': 'Katalog Proyek',
  '/feed': 'Activity Feed',
  '/skills': 'Keahlian & Teknologi',
  '/education': 'Pendidikan & Pengalaman',
  '/certificates': 'Galeri Sertifikat',
  '/cv': 'Pembuat CV (PDF)',
  '/contact': 'Hubungi Saya',
  '/settings': 'Pengaturan Website'
};

export default function Navbar({ onOpenMobileMenu, onOpenCommandPalette, profile }) {
  const location = useLocation();
  const currentTitle = PAGE_TITLES[location.pathname] || 'BibTzy';
  const { isOwner, openAuthModal, logoutOwner } = useOwner();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={onOpenMobileMenu}
          aria-label="Buka menu navigasi"
        >
          <Menu size={20} />
        </button>

        <div className="topbar-page-badge">
          <Sparkles size={14} className="text-ice" />
          <span>{currentTitle}</span>
        </div>
      </div>

      <div className="topbar-right">
        {/* Tombol Status Mode Pemilik / Mode Tamu */}
        {isOwner ? (
          <button
            type="button"
            className="btn btn-glass btn-sm"
            onClick={logoutOwner}
            style={{
              gap: '0.4rem',
              padding: '0.35rem 0.65rem',
              color: '#4ade80',
              borderColor: 'rgba(74, 222, 128, 0.4)',
              background: 'rgba(74, 222, 128, 0.08)',
              minHeight: '36px'
            }}
            title="Mode Pemilik Aktif (Habib) — Klik untuk Kunci / Beralih ke Mode Tamu"
            aria-label="Mode Pemilik Aktif"
          >
            <ShieldCheck size={14} />
            <span className="topbar-btn-text" style={{ fontSize: '0.78rem', fontWeight: 600 }}>Pemilik</span>
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-glass btn-sm"
            onClick={openAuthModal}
            style={{
              gap: '0.4rem',
              padding: '0.35rem 0.65rem',
              color: 'var(--text-secondary)',
              minHeight: '36px'
            }}
            title="Mode Tamu (Read-Only) — Klik untuk Masukkan PIN Pemilik (Habib)"
            aria-label="Mode Tamu"
          >
            <Lock size={13} />
            <span className="topbar-btn-text" style={{ fontSize: '0.78rem' }}>Tamu</span>
          </button>
        )}

        {/* Command Palette Trigger Button */}
        <button
          type="button"
          className="btn btn-glass btn-sm"
          onClick={onOpenCommandPalette}
          style={{ gap: '0.45rem', padding: '0.35rem 0.65rem', minHeight: '36px' }}
          title="Buka Command Palette (Ctrl + K)"
          aria-label="Buka Command Palette"
        >
          <Command size={14} className="text-ice" />
          <span style={{ fontSize: '0.8rem', display: 'none' }} className="desktop-inline">Cari</span>
          <span className="cmd-palette-kbd" style={{ fontSize: '0.68rem', padding: '0.1rem 0.35rem' }}>Ctrl K</span>
        </button>

        {/* Student Status Badge */}
        <div
          className="desktop-flex"
          style={{
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.35rem 0.8rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-glass)',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
            minHeight: '36px'
          }}
          title="Habib Ramadhan — Siswa Kelas XI PPLG 3"
        >
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#4ade80',
            boxShadow: '0 0 8px #4ade80'
          }} />
          <span style={{ fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
            XI PPLG 3
          </span>
        </div>
      </div>
      <style>{`
        @media (max-width: 480px) {
          .topbar-btn-text {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
