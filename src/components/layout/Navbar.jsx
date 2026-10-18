import React, { useState } from 'react';
import {
  Menu,
  Sparkles,
  Command,
  ShieldCheck,
  Lock,
  User,
  FolderGit2,
  Award,
  Zap,
  GraduationCap,
  Settings as SettingsIcon,
  LogOut,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useOwner } from '../../context/OwnerContext';
import Modal from '../common/Modal';

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
  const navigate = useNavigate();
  const currentTitle = PAGE_TITLES[location.pathname] || 'BibTzy';
  const { isOwner, openAuthModal, logoutOwner } = useOwner();
  const [isOwnerMenuOpen, setIsOwnerMenuOpen] = useState(false);

  const handleMenuNavigate = (path) => {
    setIsOwnerMenuOpen(false);
    navigate(path);
  };

  const handleConfirmLogout = () => {
    setIsOwnerMenuOpen(false);
    logoutOwner();
  };

  return (
    <>
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
              onClick={() => setIsOwnerMenuOpen(true)}
              style={{
                gap: '0.4rem',
                padding: '0.35rem 0.75rem',
                color: '#4ade80',
                borderColor: 'rgba(74, 222, 128, 0.45)',
                background: 'rgba(74, 222, 128, 0.1)',
                minHeight: '36px',
                cursor: 'pointer'
              }}
              title="Mode Pemilik Aktif — Klik untuk buka Pusat Kontrol Edit Konten"
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

      {/* MODAL PUSAT KONTROL MODE PEMILIK (PANDUAN LENGKAP & EDIT CEPAT) */}
      <Modal
        isOpen={isOwnerMenuOpen}
        onClose={() => setIsOwnerMenuOpen(false)}
        title="Pusat Kontrol Mode Pemilik"
        icon={ShieldCheck}
        maxWidth="560px"
        footer={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleConfirmLogout}
              style={{
                color: '#f87171',
                borderColor: 'rgba(239, 68, 68, 0.4)',
                background: 'rgba(239, 68, 68, 0.08)',
                gap: '0.45rem'
              }}
              title="Kunci kembali portofolio ke mode hanya-lihat"
            >
              <LogOut size={14} />
              <span>Kunci / Keluar Mode Pemilik</span>
            </button>

            <button
              type="button"
              className="btn btn-glass btn-sm"
              onClick={() => setIsOwnerMenuOpen(false)}
            >
              Tutup
            </button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Status Header Box */}
          <div style={{
            padding: '0.9rem 1.1rem',
            borderRadius: '12px',
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(34, 197, 94, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#4ade80',
              flexShrink: 0
            }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#86efac' }}>
                Mode Pemilik Aktif (Habib Ramadhan)
              </div>
              <div style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.8)', marginTop: '2px' }}>
                Hak akses edit, tambah, dan hapus data portofolio terbuka penuh.
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Pilih bagian yang ingin Anda kelola atau edit:
          </div>

          {/* Quick Management Actions Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '0.65rem' }}>
            <button
              type="button"
              onClick={() => handleMenuNavigate('/about')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-glass)',
                color: '#FFFFFF',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
              className="owner-menu-item"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <User size={18} className="text-ice" />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Edit Profil Siswa</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Nama, Bio, Foto & Sekolah</div>
                </div>
              </div>
              <ChevronRight size={15} className="text-muted" />
            </button>

            <button
              type="button"
              onClick={() => handleMenuNavigate('/projects')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-glass)',
                color: '#FFFFFF',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
              className="owner-menu-item"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <FolderGit2 size={18} className="text-ice" />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Kelola Proyek & Karya</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Tambah, Edit & Hapus Proyek</div>
                </div>
              </div>
              <ChevronRight size={15} className="text-muted" />
            </button>

            <button
              type="button"
              onClick={() => handleMenuNavigate('/certificates')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-glass)',
                color: '#FFFFFF',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
              className="owner-menu-item"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Award size={18} className="text-ice" />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Kelola Sertifikat</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Unggah & Atur Sertifikat</div>
                </div>
              </div>
              <ChevronRight size={15} className="text-muted" />
            </button>

            <button
              type="button"
              onClick={() => handleMenuNavigate('/skills')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-glass)',
                color: '#FFFFFF',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
              className="owner-menu-item"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Zap size={18} className="text-ice" />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Kelola Keahlian (Skills)</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Tambah & Edit Persentase</div>
                </div>
              </div>
              <ChevronRight size={15} className="text-muted" />
            </button>

            <button
              type="button"
              onClick={() => handleMenuNavigate('/education')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-glass)',
                color: '#FFFFFF',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
              className="owner-menu-item"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <GraduationCap size={18} className="text-ice" />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Kelola Pendidikan</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Riwayat Sekolah & PPLG</div>
                </div>
              </div>
              <ChevronRight size={15} className="text-muted" />
            </button>

            <button
              type="button"
              onClick={() => handleMenuNavigate('/settings')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-glass)',
                color: '#FFFFFF',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
              className="owner-menu-item"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <SettingsIcon size={18} className="text-ice" />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Pengaturan & Ganti PIN</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Ganti Wallpaper & PIN Baru</div>
                </div>
              </div>
              <ChevronRight size={15} className="text-muted" />
            </button>
          </div>
        </div>

        <style>{`
          .owner-menu-item:hover {
            background: rgba(69, 207, 255, 0.12) !important;
            border-color: rgba(69, 207, 255, 0.4) !important;
            transform: translateY(-1px);
          }
        `}</style>
      </Modal>
    </>
  );
}
