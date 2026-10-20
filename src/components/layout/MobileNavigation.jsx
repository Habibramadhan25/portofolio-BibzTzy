import React, { useEffect, useRef, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import {
  X,
  Home,
  User,
  Briefcase,
  Activity,
  Sparkles,
  GraduationCap,
  Award,
  FileText,
  Mail,
  Settings
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/about', label: 'About', icon: User },
  { path: '/projects', label: 'Projects', icon: Briefcase },
  { path: '/feed', label: 'Activity Feed', icon: Activity },
  { path: '/skills', label: 'Skills', icon: Sparkles },
  { path: '/education', label: 'Education', icon: GraduationCap },
  { path: '/certificates', label: 'Certificates', icon: Award },
  { path: '/cv', label: 'CV Builder', icon: FileText },
  { path: '/contact', label: 'Contact', icon: Mail },
  { path: '/settings', label: 'Settings', icon: Settings }
];

export default function MobileNavigation({ isOpen, onClose, profile }) {
  const drawerRef = useRef(null);
  const timerRef = useRef(null);

  // Fungsi untuk memulai / me-reset timer auto-close 5 detik
  const resetAutoCloseTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (isOpen) {
      timerRef.current = setTimeout(() => {
        onClose?.();
      }, 5000);
    }
  }, [isOpen, onClose]);

  // Kelola lifecycle timer dan pantau interaksi pengguna
  useEffect(() => {
    if (!isOpen) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // 1. Setelah menu dibuka, mulai hitung waktu 5 detik
    resetAutoCloseTimer();

    const drawerEl = drawerRef.current;
    if (!drawerEl) return;

    // 3. Reset timer jika pengguna menggerakkan mouse, menyentuh menu, atau berinteraksi
    const activityEvents = [
      'mousemove',
      'mouseenter',
      'mousedown',
      'pointerdown',
      'pointermove',
      'touchstart',
      'touchmove',
      'scroll',
      'keydown'
    ];

    const handleUserActivity = () => {
      resetAutoCloseTimer();
    };

    activityEvents.forEach((ev) => {
      drawerEl.addEventListener(ev, handleUserActivity, { passive: true });
    });

    return () => {
      // 6. Bersihkan timer ketika komponen unmount atau menu tertutup untuk mencegah memory leak
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      activityEvents.forEach((ev) => {
        drawerEl.removeEventListener(ev, handleUserActivity);
      });
    };
  }, [isOpen, resetAutoCloseTimer]);

  const handleNavClick = (path, label) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    onClose?.();
    window.dispatchEvent(new CustomEvent('bibtzy-chibi-guide-trigger', {
      detail: { path, label }
    }));
  };

  return (
    <>
      {/* Overlay Backdrop */}
      <div
        className={`mobile-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      {/* Drawer Menu */}
      <div
        ref={drawerRef}
        className={`mobile-drawer ${isOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu Mobile"
        onMouseMove={resetAutoCloseTimer}
        onTouchStart={resetAutoCloseTimer}
        onTouchMove={resetAutoCloseTimer}
        onScroll={resetAutoCloseTimer}
      >
        <div style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-glass)'
        }}>
          <NavLink
            to="/"
            onClick={() => handleNavClick('/', 'Home')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              textDecoration: 'none'
            }}
          >
            <div className="sidebar-brand-icon" style={{ width: '34px', height: '34px' }}>
              <img
                src="/images/bibtzy-frost-logo.png"
                alt="BibTzy Logo"
                className="brand-logo-img"
              />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#FFFFFF' }}>BibTzy</span>
          </NavLink>

          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Tutup navigasi"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Mini Profile in Drawer - clickable to close and navigate */}
        <NavLink
          to="/about"
          onClick={() => handleNavClick('/about', 'About')}
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-glass)',
            textDecoration: 'none',
            display: 'block',
            transition: 'background var(--transition-fast)'
          }}
          className="nav-drawer-user-card"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img
              src={profile?.avatar || '/images/avatar.jpg'}
              alt={profile?.name}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                objectFit: 'cover',
                border: '1.5px solid var(--border-glass-bright)'
              }}
            />
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {profile?.name || 'Habib Ramadhan'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ice-blue)' }}>
                {profile?.class || 'XI PPLG 3'}
              </div>
            </div>
          </div>
        </NavLink>

        {/* Links with auto-close */}
        <nav style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1, overflowY: 'auto' }}>
          {/* NOVA AI Button */}
          <button
            type="button"
            className="nav-item"
            onClick={() => {
              onClose?.();
              window.dispatchEvent(new CustomEvent('nova-ai-open'));
            }}
            style={{
              background: 'linear-gradient(135deg, rgba(69, 207, 255, 0.22) 0%, rgba(14, 28, 52, 0.6) 100%)',
              border: '1px solid rgba(69, 207, 255, 0.45)',
              color: '#45CFFF',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              cursor: 'pointer',
              marginBottom: '0.35rem',
              borderRadius: '12px',
              padding: '0.75rem 1rem',
              fontWeight: 700
            }}
          >
            <Sparkles className="nav-icon" style={{ color: '#45CFFF' }} />
            <span>NOVA AI Assistant</span>
            <span style={{
              marginLeft: 'auto',
              fontSize: '0.65rem',
              padding: '0.15rem 0.45rem',
              borderRadius: '999px',
              background: 'rgba(69, 207, 255, 0.25)',
              color: '#FFFFFF'
            }}>
              Voice & Chat
            </span>
          </button>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNavClick(item.path, item.label)}
              >
                <Icon className="nav-icon" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </>
  );
}
