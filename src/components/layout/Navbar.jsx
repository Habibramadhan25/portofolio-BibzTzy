import React, { useState } from 'react';
import {
  Menu,
  Sparkles,
  Search,
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
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useOwner } from '../../context/OwnerContext';
import Modal from '../common/Modal';
import '../../styles/nova-home.css';

const NAV_LINKS = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About' },
  { path: '/projects', label: 'Projects' },
  { path: '/skills', label: 'Skills' },
  { path: '/education', label: 'Education' },
  { path: '/certificates', label: 'Certificates' },
  { path: '/cv', label: 'CV' },
  { path: '/contact', label: 'Contact' },
];

export default function Navbar({ onOpenMobileMenu, onOpenCommandPalette, profile }) {
  const location = useLocation();
  const navigate = useNavigate();
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
          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={onOpenMobileMenu}
            aria-label="Buka menu navigasi"
          >
            <Menu size={20} />
          </button>

          {/* NOVA GLASS Brand */}
          <NavLink to="/" className="nova-brand-link" title="NOVA GLASS — Portofolio Habib Ramadhan">
            <div className="nova-brand-icon-wrap">
              <Sparkles size={20} />
            </div>
            <span className="nova-brand-text">NOVA GLASS</span>
          </NavLink>
        </div>

        {/* Desktop Horizontal Navigation Links */}
        <nav className="nova-nav-menu" aria-label="Navigasi Utama">
          {NAV_LINKS.map((item) => (
            <div key={item.path} className="nova-nav-item">
              <NavLink
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => `nova-nav-anchor ${isActive ? 'active' : ''}`}
              >
                {({ isActive }) => (
                  <>
                    <span>{item.label}</span>
                    {isActive && <span className="nova-active-indicator" />}
                  </>
                )}
              </NavLink>
            </div>
          ))}
        </nav>

        {/* Right Action Buttons */}
        <div className="nova-topbar-actions">
          {/* NOVA AI Voice & Chat Assistant Button */}
          <button
            type="button"
            className="nova-icon-btn"
            onClick={() => window.dispatchEvent(new CustomEvent('nova-ai-open'))}
            title="NOVA AI — Voice AI & Smart Owner Assistant (Ctrl + J)"
            aria-label="Buka NOVA AI"
            style={{
              background: 'linear-gradient(135deg, rgba(69, 207, 255, 0.22) 0%, rgba(14, 28, 52, 0.6) 100%)',
              borderColor: 'rgba(69, 207, 255, 0.5)',
              color: '#45CFFF',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0 0.75rem',
              width: 'auto'
            }}
          >
            <Sparkles size={16} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700 }} className="desktop-inline">NOVA AI</span>
          </button>

          <button
            type="button"
            className="nova-icon-btn"
            onClick={onOpenCommandPalette}
            title="Cari & Command Palette (Ctrl + K)"
            aria-label="Cari"
          >
            <Search size={18} />
          </button>

          <NavLink
            to="/settings"
            className="nova-icon-btn"
            title="Pengaturan Website"
            aria-label="Pengaturan"
          >
            <SettingsIcon size={18} />
          </NavLink>

          {/* Owner / Tamu Status Badge */}
          {isOwner ? (
            <button
              type="button"
              className="nova-owner-btn owner"
              onClick={() => setIsOwnerMenuOpen(true)}
              title="Mode Pemilik Aktif — Klik untuk buka Pusat Kontrol Edit Konten"
              aria-label="Mode Pemilik Aktif"
            >
              <ShieldCheck size={14} />
              <span className="desktop-inline">Pemilik</span>
            </button>
          ) : (
            <button
              type="button"
              className="nova-owner-btn guest"
              onClick={openAuthModal}
              title="Mode Tamu (Read-Only) — Klik untuk Masukkan PIN Pemilik (Habib)"
              aria-label="Mode Tamu"
            >
              <Lock size={13} />
              <span className="desktop-inline">Tamu</span>
            </button>
          )}
        </div>
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
