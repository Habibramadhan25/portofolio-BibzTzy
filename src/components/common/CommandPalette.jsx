import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Home,
  User,
  Briefcase,
  Sparkles,
  GraduationCap,
  Award,
  FileText,
  Mail,
  Settings,
  Plus,
  Moon,
  Sun,
  ArrowRight,
  X,
  Lock,
  Unlock,
  ShieldCheck
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useOwner } from '../../context/OwnerContext';
import { pdfService } from '../../services/pdfService';
import { profileService } from '../../services/profileService';
import { useToast } from '../../context/ToastContext';

export default function CommandPalette({ isOpen, onClose, onOpenNewProjectModal, onTriggerEntrance }) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { isOwner, openAuthModal, logoutOwner } = useOwner();
  const toast = useToast();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Define commands list
  const allCommands = [
    // --- Navigasi Halaman ---
    { id: 'nav-home', title: 'Buka Beranda (Home)', category: 'Navigasi', icon: Home, action: () => navigate('/') },
    { id: 'nav-about', title: 'Buka Profil Siswa (About)', category: 'Navigasi', icon: User, action: () => navigate('/about') },
    { id: 'nav-projects', title: 'Buka Katalog Proyek', category: 'Navigasi', icon: Briefcase, action: () => navigate('/projects') },
    { id: 'nav-feed', title: 'Buka Activity Feed Terbaru', category: 'Navigasi', icon: Sparkles, action: () => navigate('/feed') },
    { id: 'nav-skills', title: 'Buka Keahlian & Teknologi', category: 'Navigasi', icon: Sparkles, action: () => navigate('/skills') },
    { id: 'nav-edu', title: 'Buka Pendidikan & Pengalaman', category: 'Navigasi', icon: GraduationCap, action: () => navigate('/education') },
    { id: 'nav-cert', title: 'Buka Galeri Sertifikat', category: 'Navigasi', icon: Award, action: () => navigate('/certificates') },
    { id: 'nav-cv', title: 'Buka CV Builder (PDF)', category: 'Navigasi', icon: FileText, action: () => navigate('/cv') },
    { id: 'nav-contact', title: 'Buka Hubungi Saya', category: 'Navigasi', icon: Mail, action: () => navigate('/contact') },
    { id: 'nav-settings', title: 'Buka Pengaturan Website', category: 'Navigasi', icon: Settings, action: () => navigate('/settings') },

    // Owner Security Command
    isOwner ? {
      id: 'owner-lock',
      title: 'Kunci Mode Pemilik (Beralih ke Mode Tamu)',
      category: 'Keamanan Pemilik',
      icon: Lock,
      action: () => logoutOwner()
    } : {
      id: 'owner-unlock',
      title: 'Buka Akses Mode Pemilik (Masukkan PIN)',
      category: 'Keamanan Pemilik',
      icon: Unlock,
      action: () => openAuthModal()
    },
    ...(isOwner ? [{
      id: 'quick-add-project',
      title: 'Tambah Proyek Baru ke Portofolio',
      category: 'Tindakan Cepat',
      icon: Plus,
      action: () => {
        if (onOpenNewProjectModal) {
          onOpenNewProjectModal();
        } else {
          navigate('/projects');
        }
      }
    }] : []),
    {
      id: 'quick-entrance',
      title: 'Putar Ulang Animasi Masuk Website (Splash Intro)',
      category: 'Fitur Interaktif',
      icon: Sparkles,
      action: () => {
        if (onTriggerEntrance) {
          onTriggerEntrance();
        } else {
          window.dispatchEvent(new CustomEvent('nova-glass-trigger-entrance'));
        }
      }
    },
    {
      id: 'quick-appearance',
      title: 'Atur Tema Preset & Wallpaper Kustom (Appearance)',
      category: 'Tindakan Cepat',
      icon: Settings,
      action: () => navigate('/settings')
    },
    {
      id: 'quick-download-cv',
      title: 'Unduh CV Resmi (PDF jsPDF)',
      category: 'Tindakan Cepat',
      icon: FileText,
      action: () => {
        const profile = profileService.getProfile();
        pdfService.generateCV({ profile });
        toast.success(`CV ${profile.name} berhasil diunduh!`);
      }
    }
  ];

  // Filter commands by search query
  const filteredCommands = allCommands.filter(cmd =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filteredCommands.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  if (!isOpen) return null;

  // Group filtered commands by category
  const groups = {};
  filteredCommands.forEach(cmd => {
    if (!groups[cmd.category]) groups[cmd.category] = [];
    groups[cmd.category].push(cmd);
  });

  return (
    <div
      className="cmd-palette-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
    >
      <div className="cmd-palette-modal">
        {/* Search Input Box */}
        <div className="cmd-palette-search-box">
          <Search size={20} className="text-ice" />
          <input
            ref={inputRef}
            type="text"
            className="cmd-palette-input"
            placeholder="Ketik perintah atau cari halaman (misal: Sesi Coding, Proyek, CV)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          )}
          <span className="cmd-palette-kbd">ESC</span>
        </div>

        {/* Results List */}
        <div className="cmd-palette-list">
          {filteredCommands.length === 0 ? (
            <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <p style={{ fontSize: '0.92rem' }}>Tidak ada perintah yang sesuai dengan "<strong>{query}</strong>"</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Coba gunakan kata kunci lain seperti "Proyek", "Coding", "Roadmap", atau "Tema".
              </p>
            </div>
          ) : (
            Object.entries(groups).map(([groupName, items]) => (
              <div key={groupName}>
                <div className="cmd-palette-group-title">{groupName}</div>
                {items.map(item => {
                  const globalIdx = filteredCommands.findIndex(c => c.id === item.id);
                  const isSelected = globalIdx === selectedIndex;
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.id}
                      className={`cmd-palette-item ${isSelected ? 'active' : ''}`}
                      onClick={() => {
                        item.action();
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(globalIdx)}
                    >
                      <div className="cmd-palette-item-left">
                        <Icon size={18} className={isSelected ? 'text-ice' : ''} />
                        <span>{item.title}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {item.badge && (
                          <span className="badge badge-cyan" style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}>
                            {item.badge}
                          </span>
                        )}
                        {isSelected && <ArrowRight size={14} className="text-ice" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="cmd-palette-footer">
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span><span className="cmd-palette-kbd">↑</span> <span className="cmd-palette-kbd">↓</span> navigasi</span>
            <span><span className="cmd-palette-kbd">↵</span> pilih</span>
            <span><span className="cmd-palette-kbd">ESC</span> tutup</span>
          </div>
          <span style={{ color: 'var(--ice-blue)', fontWeight: 600 }}>BibTzy Command</span>
        </div>
      </div>
    </div>
  );
}
