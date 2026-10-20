import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, MessageSquare, Volume2, Mic, AlertCircle, Brain } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { storageService } from '../../services/storageService';
import { ownerKnowledgeService } from '../../services/ownerKnowledgeService';

// Aset gambar chibi transparan asli BibTzy dengan tema icy blue
const CHIBI_EXPRESSIONS = {
  welcome: '/images/chibi/welcome.png',
  happy: '/images/chibi/happy.png',
  curious: '/images/chibi/curious.png',
  excited: '/images/chibi/excited.png',
  sleepy: '/images/chibi/sleepy.png',
  pleading: '/images/chibi/pleading.png',
  shy: '/images/chibi/shy.png',
  proud: '/images/chibi/proud.png',
  pouting: '/images/chibi/pouting.png',
  music: '/images/chibi/music.png',
  surprised: '/images/chibi/surprised.png',
  backview: '/images/chibi/backview.png'
};

// Penjelasan panduan setiap menu sidebar yang tersedia di proyek
const SIDEBAR_GUIDE_DATA = {
  home: {
    title: 'Home',
    message: 'Selamat datang! Ini halaman utama portfolio BibTzy. Ada asisten NOVA AI yang siap mengobrol.',
    expression: 'welcome'
  },
  dashboard: {
    title: 'Dashboard',
    message: 'Halo! Di sini kamu bisa melihat ringkasan informasi utama.',
    expression: 'welcome'
  },
  about: {
    title: 'About',
    message: 'Kenali lebih jauh tentang profil, jurusan PPLG, dan minat saya.',
    expression: 'curious'
  },
  projects: {
    title: 'Projects',
    message: 'Di sini kamu bisa melihat berbagai project yang pernah dibuat.',
    expression: 'proud'
  },
  roadmap: {
    title: 'Roadmap',
    message: 'Jelajahi alur dan target pembelajaran keahlian pemrograman.',
    expression: 'curious'
  },
  feed: {
    title: 'Activity Feed',
    message: 'Pantau aktivitas terbaru dan pembaruan proyek BibTzy.',
    expression: 'excited'
  },
  skills: {
    title: 'Skills',
    message: 'Ini daftar kemampuan dan teknologi yang sedang dikuasai.',
    expression: 'happy'
  },
  education: {
    title: 'Education',
    message: 'Lihat riwayat pendidikan dan kompetensi kejuruan PPLG.',
    expression: 'proud'
  },
  certificates: {
    title: 'Certificates',
    message: 'Lihat sertifikat dan pencapaian yang sudah dikumpulkan.',
    expression: 'proud'
  },
  cv: {
    title: 'CV Builder',
    message: 'Lihat dan unduh berkas Curriculum Vitae (CV) BibTzy.',
    expression: 'happy'
  },
  contact: {
    title: 'Contact',
    message: 'Ingin menghubungi BibTzy? Kamu bisa melalui halaman ini atau lewat NOVA AI.',
    expression: 'pleading'
  },
  settings: {
    title: 'Settings',
    message: 'Atur tema, suara, wallpaper, dan preferensi maskot di sini.',
    expression: 'shy'
  },
  wallpaper: {
    title: 'Custom Wallpaper',
    message: 'Ganti wallpaper latar belakang menggunakan gambar atau video favoritmu.',
    expression: 'surprised'
  }
};

const pathToMenuKey = (path = '/') => {
  const clean = path.replace(/^\//, '').toLowerCase();
  if (!clean || clean === 'home') return 'home';
  if (clean === 'about' || clean === 'profile' || clean === 'tentang') return 'about';
  if (clean === 'projects' || clean === 'proyek' || clean === 'portfolio') return 'projects';
  if (clean === 'roadmap') return 'roadmap';
  if (clean === 'feed' || clean === 'activity') return 'feed';
  if (clean === 'skills' || clean === 'skill' || clean === 'keahlian') return 'skills';
  if (clean === 'education' || clean === 'pendidikan') return 'education';
  if (clean === 'certificates' || clean === 'sertifikat') return 'certificates';
  if (clean === 'cv') return 'cv';
  if (clean === 'contact' || clean === 'kontak') return 'contact';
  if (clean === 'settings' || clean === 'pengaturan') return 'settings';
  if (clean.includes('wallpaper')) return 'wallpaper';
  return 'home';
};

export default function ChibiMascot() {
  const location = useLocation();
  const { playSound, isReducedMotion } = useTheme();

  // Settings State: Enabled & Animations
  const [mascotEnabled, setMascotEnabled] = useState(() => storageService.get('nova_mascot_enabled', true));
  const [animEnabled, setAnimEnabled] = useState(() => storageService.get('nova_mascot_anim_enabled', true));

  // State panduan chibi disinkronkan dengan rute saat ini
  const [guideState, setGuideState] = useState(() => {
    const initialKey = pathToMenuKey(typeof window !== 'undefined' ? window.location.pathname : '/');
    return SIDEBAR_GUIDE_DATA[initialKey] || SIDEBAR_GUIDE_DATA.home;
  });

  // AI Connection State
  const [aiStatus, setAiStatus] = useState('idle'); // 'idle' | 'listening' | 'thinking' | 'speaking' | 'error' | 'success'
  const [aiExpression, setAiExpression] = useState(null);
  const [isBubbleOpen, setIsBubbleOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const autoDismissTimerRef = useRef(null);

  const scheduleAutoDismiss = useCallback((duration = 6000) => {
    if (autoDismissTimerRef.current) clearTimeout(autoDismissTimerRef.current);
    autoDismissTimerRef.current = setTimeout(() => {
      setIsBubbleOpen(false);
    }, duration);
  }, []);

  // Sync settings when storage changes
  useEffect(() => {
    const handleSettingsUpdate = () => {
      setMascotEnabled(storageService.get('nova_mascot_enabled', true));
      setAnimEnabled(storageService.get('nova_mascot_anim_enabled', true));
    };

    window.addEventListener('nova-mascot-settings-changed', handleSettingsUpdate);
    window.addEventListener('storage', handleSettingsUpdate);
    return () => {
      window.removeEventListener('nova-mascot-settings-changed', handleSettingsUpdate);
      window.removeEventListener('storage', handleSettingsUpdate);
    };
  }, []);

  // Listen to NOVA AI status updates
  useEffect(() => {
    const handleAiStatus = (e) => {
      const { status, expression } = e.detail || {};
      setAiStatus(status || 'idle');
      if (expression && CHIBI_EXPRESSIONS[expression]) {
        setAiExpression(expression);
      } else {
        setAiExpression(null);
      }

      // If AI encounters error, pop open bubble with retry hint
      if (status === 'error') {
        setIsBubbleOpen(true);
        scheduleAutoDismiss(7000);
      }
    };

    window.addEventListener('nova-ai-status-change', handleAiStatus);
    return () => {
      window.removeEventListener('nova-ai-status-change', handleAiStatus);
    };
  }, [scheduleAutoDismiss]);

  // Route synchronization
  useEffect(() => {
    const key = pathToMenuKey(location.pathname);
    const guideItem = SIDEBAR_GUIDE_DATA[key] || SIDEBAR_GUIDE_DATA.home;
    setGuideState(guideItem);
    setImgError(false);
  }, [location.pathname]);

  const handleCloseBubble = (e) => {
    e.stopPropagation();
    playSound?.('click');
    setIsBubbleOpen(false);
    if (autoDismissTimerRef.current) {
      clearTimeout(autoDismissTimerRef.current);
      autoDismissTimerRef.current = null;
    }
  };

  // Click on mascot: Open NOVA AI or toggle bubble
  const handleMascotClick = (e) => {
    e.stopPropagation();
    playSound?.('bubble');

    // Trigger opening of NOVA AI chat modal
    window.dispatchEvent(new CustomEvent('nova-ai-open'));
  };

  const handleBubbleToggle = (e) => {
    e.stopPropagation();
    setIsBubbleOpen((prev) => !prev);
  };

  // Determine current image expression
  const currentExpressionKey = aiExpression || guideState.expression || 'welcome';
  const currentChibiSrc = imgError
    ? '/images/bibtzy-frost-logo.png'
    : (CHIBI_EXPRESSIONS[currentExpressionKey] || CHIBI_EXPRESSIONS.welcome);

  // If mascot is disabled by user in settings, do not render
  if (!mascotEnabled) return null;

  return (
    <div
      id="bibtzy-chibi-guide-container"
      style={{
        position: 'fixed',
        bottom: 'calc(4.25rem + env(safe-area-inset-bottom, 0px))',
        right: '1.25rem',
        zIndex: 960,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        userSelect: 'none'
      }}
      aria-label="Maskot NOVA & Panduan BibTzy"
    >
      <AnimatePresence>
        {isBubbleOpen && (
          <motion.div
            key={aiStatus === 'error' ? 'ai-error' : guideState.title}
            initial={!isReducedMotion ? { opacity: 0, y: 10, scale: 0.92 } : { opacity: 0 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={!isReducedMotion ? { opacity: 0, y: 8, scale: 0.92 } : { opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'relative',
              pointerEvents: 'auto',
              width: 'min(280px, calc(100vw - 2.5rem))',
              padding: '0.85rem 1rem',
              borderRadius: '16px',
              background: 'rgba(6, 14, 28, 0.96)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: aiStatus === 'error' ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(56, 189, 248, 0.35)',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.75), 0 0 20px rgba(56, 189, 248, 0.2)',
              marginBottom: '0.65rem',
              color: '#F4F8FF',
              transformOrigin: 'bottom right'
            }}
          >
            {/* Header Balon */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.4rem',
                borderBottom: '1px solid rgba(56, 189, 248, 0.15)',
                paddingBottom: '0.35rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                {aiStatus === 'error' ? (
                  <AlertCircle size={14} style={{ color: '#EF4444' }} />
                ) : (
                  <Sparkles size={13} style={{ color: '#38BDF8' }} />
                )}
                <span
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: aiStatus === 'error' ? '#FCA5A5' : '#8DDCFF'
                  }}
                >
                  {aiStatus === 'error' ? 'NOVA AI • Kendala' : `Panduan • ${guideState.title}`}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCloseBubble}
                style={{
                  background: 'rgba(56, 189, 248, 0.12)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  color: 'rgba(224, 242, 254, 0.95)',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease'
                }}
                className="chibi-close-btn"
                title="Tutup (×)"
                aria-label="Tutup pesan"
              >
                <X size={12} />
              </button>
            </div>

            {/* Isi Pesan */}
            <p
              style={{
                margin: 0,
                fontSize: '0.82rem',
                lineHeight: '1.45',
                color: '#E0F2FE',
                fontWeight: 500
              }}
            >
              {aiStatus === 'error'
                ? 'Waduh, terjadi sedikit kendala saat memproses pertanyaan! Klik maskot untuk coba lagi atau tanya topik lain ya.'
                : guideState.message}
            </p>

            {/* Quick Action inside Bubble */}
            <div style={{ marginTop: '0.6rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleMascotClick}
                style={{
                  flex: 1,
                  padding: '0.35rem 0.6rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.3) 0%, rgba(14, 28, 52, 0.8) 100%)',
                  border: '1px solid #38BDF8',
                  color: '#BAE6FD',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem'
                }}
              >
                <MessageSquare size={12} />
                <span>Buka NOVA AI</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playSound?.('click');
                  window.dispatchEvent(new CustomEvent('nova-ai-open', {
                    detail: { mode: 'owner' }
                  }));
                }}
                style={{
                  padding: '0.35rem 0.6rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: '8px',
                  background: 'rgba(56, 189, 248, 0.12)',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  color: '#BAE6FD',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem'
                }}
                title="Tanya informasi dan preferensi owner"
              >
                <Brain size={12} />
                <span>Fakta Owner</span>
              </button>
            </div>

            {/* Ekor Balon */}
            <div
              style={{
                position: 'absolute',
                bottom: '-6px',
                right: '24px',
                width: '10px',
                height: '10px',
                background: 'rgba(6, 14, 28, 0.96)',
                borderRight: '1px solid rgba(56, 189, 248, 0.35)',
                borderBottom: '1px solid rgba(56, 189, 248, 0.35)',
                transform: 'rotate(45deg)',
                zIndex: 1
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ICON BADGE MASKOT CHIBI */}
      <motion.div
        whileHover={animEnabled && !isReducedMotion ? { scale: 1.08 } : {}}
        whileTap={animEnabled && !isReducedMotion ? { scale: 0.94 } : {}}
        onClick={handleMascotClick}
        style={{
          width: '58px',
          height: '58px',
          borderRadius: '50%',
          background: 'rgba(6, 14, 28, 0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border:
            aiStatus === 'listening'
              ? '2px solid #38BDF8'
              : aiStatus === 'thinking'
              ? '2px solid #A855F7'
              : aiStatus === 'speaking'
              ? '2px solid #00F0FF'
              : aiStatus === 'error'
              ? '2px solid #EF4444'
              : '1.5px solid rgba(56, 189, 248, 0.45)',
          boxShadow:
            aiStatus === 'listening'
              ? '0 0 25px rgba(56, 189, 248, 0.7)'
              : aiStatus === 'speaking'
              ? '0 0 25px rgba(0, 240, 255, 0.7)'
              : '0 8px 24px rgba(0, 0, 0, 0.65), 0 0 16px rgba(56, 189, 248, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          pointerEvents: 'auto',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.25s ease'
        }}
        title="Klik untuk buka NOVA AI (Voice & Owner Assistant)!"
      >
        {/* Glow ambient di belakang maskot */}
        <div
          style={{
            position: 'absolute',
            inset: '3px',
            borderRadius: '50%',
            background:
              aiStatus === 'listening'
                ? 'radial-gradient(circle, rgba(56, 189, 248, 0.4) 0%, transparent 75%)'
                : aiStatus === 'thinking'
                ? 'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 75%)'
                : 'radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, transparent 75%)',
            pointerEvents: 'none'
          }}
        />

        {/* Gambar Maskot Chibi */}
        {imgError ? (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Sparkles size={24} style={{ color: '#38BDF8', filter: 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.8))' }} />
          </div>
        ) : (
          <img
            src={currentChibiSrc}
            alt="Maskot BibTzy & NOVA AI"
            onError={() => setImgError(true)}
            style={{
              width: '84%',
              height: '84%',
              objectFit: 'contain',
              display: 'block',
              filter: 'contrast(1.05) brightness(1.04) drop-shadow(0 2px 6px rgba(0,0,0,0.4))',
              userSelect: 'none'
            }}
            draggable={false}
          />
        )}

        {/* Floating Mini Mic / Audio Icon Badge */}
        {aiStatus === 'listening' && (
          <div
            style={{
              position: 'absolute',
              bottom: '2px',
              right: '2px',
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: '#0284C7',
              border: '1.5px solid #FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 8px #38BDF8'
            }}
          >
            <Mic size={10} color="#FFFFFF" />
          </div>
        )}
        {aiStatus === 'speaking' && (
          <div
            style={{
              position: 'absolute',
              bottom: '2px',
              right: '2px',
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: '#00F0FF',
              border: '1.5px solid #030712',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 8px #00F0FF'
            }}
          >
            <Volume2 size={10} color="#030712" />
          </div>
        )}
      </motion.div>

      <style>{`
        .chibi-close-btn:hover {
          background: rgba(56, 189, 248, 0.25) !important;
          color: #FFFFFF !important;
          transform: scale(1.1);
        }
        @media (max-width: 640px) {
          #bibtzy-chibi-guide-container {
            bottom: calc(3.8rem + env(safe-area-inset-bottom, 0px)) !important;
            right: 0.85rem !important;
          }
          #bibtzy-chibi-guide-container > div:last-child {
            width: 48px !important;
            height: 48px !important;
          }
        }
      `}</style>
    </div>
  );
}
