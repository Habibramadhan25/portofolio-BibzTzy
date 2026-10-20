import React from 'react';
import { NavLink } from 'react-router-dom';
import {
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
  { path: '/feed', label: 'Activity Feed', icon: Activity, badge: 'New' },
  { path: '/skills', label: 'Skills', icon: Sparkles },
  { path: '/education', label: 'Education', icon: GraduationCap },
  { path: '/certificates', label: 'Certificates', icon: Award },
  { path: '/cv', label: 'CV Builder', icon: FileText },
  { path: '/contact', label: 'Contact', icon: Mail },
  { path: '/settings', label: 'Settings', icon: Settings }
];

export default function Sidebar({ profile, onItemClick }) {
  return (
    <aside className="sidebar" aria-label="Navigasi Utama BibTzy">
      {/* Brand Header */}
      <NavLink
        to="/"
        className="sidebar-header"
        style={{ textDecoration: 'none', cursor: 'pointer' }}
        onClick={(e) => {
          onItemClick?.(e);
          window.dispatchEvent(new CustomEvent('bibtzy-chibi-guide-trigger', {
            detail: { path: '/', label: 'Home' }
          }));
        }}
      >
        <div className="sidebar-brand-icon">
          <img
            src="/images/bibtzy-frost-logo.png"
            alt="BibTzy Logo"
            className="brand-logo-img"
          />
        </div>
        <div className="sidebar-brand-text">
          <span className="brand-title">BibTzy</span>
          <span className="brand-subtitle">SMK PPLG Portfolio</span>
        </div>
      </NavLink>

      {/* Navigation List */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={(e) => {
                onItemClick?.(e);
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                document.documentElement.scrollTop = 0;
                document.body.scrollTop = 0;

                // Picu Chibi Interactive Sidebar Guide
                window.dispatchEvent(new CustomEvent('bibtzy-chibi-guide-trigger', {
                  detail: { path: item.path, label: item.label }
                }));
              }}
            >
              <Icon className="nav-icon" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        {/* NOVA AI Floating Launcher in Sidebar */}
        <button
          type="button"
          onClick={() => {
            onItemClick?.();
            window.dispatchEvent(new CustomEvent('nova-ai-open'));
          }}
          className="nav-item"
          style={{
            marginTop: '0.5rem',
            background: 'linear-gradient(135deg, rgba(69, 207, 255, 0.2) 0%, rgba(14, 28, 52, 0.5) 100%)',
            border: '1px solid rgba(69, 207, 255, 0.4)',
            color: '#45CFFF',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.7rem 0.85rem',
            borderRadius: '12px',
            cursor: 'pointer',
            textAlign: 'left',
            fontWeight: 700
          }}
          title="Buka NOVA AI Assistant (Ctrl + J)"
        >
          <Sparkles className="nav-icon" style={{ color: '#45CFFF' }} />
          <span>NOVA AI</span>
          <span style={{
            marginLeft: 'auto',
            fontSize: '0.62rem',
            padding: '0.15rem 0.4rem',
            borderRadius: '999px',
            background: 'rgba(69, 207, 255, 0.25)',
            color: '#FFFFFF'
          }}>
            Voice
          </span>
        </button>
      </nav>

      {/* User Mini Card Footer */}
      <div className="sidebar-footer">
        <NavLink
          to="/about"
          className="user-mini-card"
          onClick={(e) => {
            onItemClick?.(e);
            window.dispatchEvent(new CustomEvent('bibtzy-chibi-guide-trigger', {
              detail: { path: '/about', label: 'About' }
            }));
          }}
          style={{ textDecoration: 'none' }}
        >
          <img
            src={profile?.avatar || '/images/avatar.jpg'}
            alt={profile?.name || 'Habib Ramadhan'}
            className="user-mini-avatar"
          />
          <div className="user-mini-info">
            <span className="user-mini-name">{profile?.name || 'Habib Ramadhan'}</span>
            <span className="user-mini-status">{profile?.class || 'XI PPLG 3'}</span>
          </div>
        </NavLink>
      </div>
    </aside>
  );
}
