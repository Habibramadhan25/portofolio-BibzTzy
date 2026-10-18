import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

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
    message: 'Selamat datang! Ini halaman utama portfolio BibTzy.',
    expression: 'welcome'
  },
  dashboard: {
    title: 'Dashboard',
    message: 'Halo! Di sini kamu bisa melihat ringkasan informasi utama.',
    expression: 'welcome'
  },
  about: {
    title: 'About',
    message: 'Yuk, kenali lebih jauh tentang pemilik portfolio ini.',
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
    message: 'Ingin menghubungi BibTzy? Kamu bisa melalui halaman ini.',
    expression: 'pleading'
  },
  settings: {
    title: 'Settings',
    message: 'Atur tampilan website sesuai keinginanmu.',
    expression: 'shy'
  },
  wallpaper: {
    title: 'Custom Wallpaper',
    message: 'Kamu bisa mengganti background menggunakan gambar atau video dari perangkatmu.',
    expression: 'surprised'
  }
};

// Konversi path URL ke identifier menu
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

let isChibiPreloaded = false;

export default function ChibiMascot() {
  const location = useLocation();
  const { playSound, isReducedMotion } = useTheme();

  // State panduan chibi
  const [guideState, setGuideState] = useState(() => {
    const initialKey = pathToMenuKey(typeof window !== 'undefined' ? window.location.pathname : '/');
    return SIDEBAR_GUIDE_DATA[initialKey] || SIDEBAR_GUIDE_DATA.home;
  });

  const [isVisible, setIsVisible] = useState(true);
  const [isBubbleOpen, setIsBubbleOpen] = useState(true);
  const [isManualClosed, setIsManualClosed] = useState(false);

  const autoDismissTimerRef = useRef(null);
  const isHoveredRef = useRef(false);

  // Preload semua 12 aset ekspresi satu kali saja secara global agar tidak boros memori
  useEffect(() => {
    if (isChibiPreloaded) return;
    isChibiPreloaded = true;
    Object.values(CHIBI_EXPRESSIONS).forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Mulai hitung mundur auto-dismiss (6.5 detik tanpa interaksi)
  const scheduleAutoDismiss = useCallback((duration = 6500) => {
    if (autoDismissTimerRef.current) {
      clearTimeout(autoDismissTimerRef.current);
      autoDismissTimerRef.current = null;
    }

    autoDismissTimerRef.current = setTimeout(() => {
      if (!isHoveredRef.current) {
        setIsBubbleOpen(false);
        setIsVisible(false);
      }
    }, duration);
  }, []);

  // Tampilkan panduan menu dengan ekspresi dan teks yang sesuai
  const triggerGuide = useCallback((menuKey) => {
    const key = menuKey?.toLowerCase() || 'home';
    const guideItem = SIDEBAR_GUIDE_DATA[key] || SIDEBAR_GUIDE_DATA.home;

    setGuideState(guideItem);
    setIsVisible(true);
    setIsBubbleOpen(true);
    setIsManualClosed(false);

    // Reset dan jadwalkan timer menghilang otomatis
    scheduleAutoDismiss(6500);
  }, [scheduleAutoDismiss]);

  // Bersihkan timer auto-dismiss saat unmount
  useEffect(() => {
    return () => {
      if (autoDismissTimerRef.current) clearTimeout(autoDismissTimerRef.current);
    };
  }, []);

  // Tangkap event klik menu sidebar dari Sidebar & MobileNavigation
  useEffect(() => {
    const handleGuideEvent = (e) => {
      const { path, key, label } = e.detail || {};
      const resolvedKey = key || pathToMenuKey(path || label || '');
      triggerGuide(resolvedKey);
    };

    window.addEventListener('bibtzy-chibi-guide-trigger', handleGuideEvent);
    return () => window.removeEventListener('bibtzy-chibi-guide-trigger', handleGuideEvent);
  }, [triggerGuide]);

  // Pantau perubahan URL (jika navigasi via link internal tanpa klik langsung pada sidebar)
  useEffect(() => {
    if (!isManualClosed) {
      const key = pathToMenuKey(location.pathname);
      triggerGuide(key);
    }
  }, [location.pathname, triggerGuide, isManualClosed]);

  // Penanganan tombol "×" untuk menutup bubble panduan
  const handleCloseBubble = (e) => {
    e.stopPropagation();
    playSound?.('click');
    setIsBubbleOpen(false);
    setIsVisible(false);
    setIsManualClosed(true);

    if (autoDismissTimerRef.current) {
      clearTimeout(autoDismissTimerRef.current);
      autoDismissTimerRef.current = null;
    }
  };

  // Klik langsung pada karakter chibi untuk memunculkan kembali panduan atau berinteraksi
  const handleChibiClick = (e) => {
    e.stopPropagation();
    playSound?.('bubble');

    if (!isBubbleOpen || !isVisible) {
      setIsVisible(true);
      setIsBubbleOpen(true);
      setIsManualClosed(false);
      scheduleAutoDismiss(6500);
    } else {
      // Jika bubble sudah terbuka, perbarui timer dan mainkan animasi ceria
      scheduleAutoDismiss(6500);
    }
  };

  const handleMouseEnter = () => {
    isHoveredRef.current = true;
    if (autoDismissTimerRef.current) {
      clearTimeout(autoDismissTimerRef.current);
      autoDismissTimerRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
    // Lanjutkan hitung mundur saat kursor meninggalkan area chibi/bubble
    if (isVisible) {
      scheduleAutoDismiss(3800);
    }
  };

  const currentChibiSrc = CHIBI_EXPRESSIONS[guideState.expression] || CHIBI_EXPRESSIONS.welcome;

  return (
    <div
      id="bibtzy-chibi-guide-container"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'fixed',
        bottom: '5.2rem',
        right: '1.5rem',
        zIndex: 980,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        userSelect: 'none'
      }}
      aria-label="Chibi Interactive Sidebar Guide"
    >
      <AnimatePresence>
        {isVisible && (
          <motion.div
            key="chibi-guide-wrapper"
            initial={!isReducedMotion ? { opacity: 0, x: 42, y: 24, scale: 0.88 } : { opacity: 0 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={!isReducedMotion ? { opacity: 0, x: 38, y: 20, scale: 0.88 } : { opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              position: 'relative'
            }}
          >
            {/* SPEECH BUBBLE PANDUAN MENU */}
            <AnimatePresence mode="wait">
              {isBubbleOpen && (
                <motion.div
                  key={guideState.title}
                  initial={!isReducedMotion ? { opacity: 0, y: 10, scale: 0.92 } : { opacity: 0 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={!isReducedMotion ? { opacity: 0, y: 8, scale: 0.92 } : { opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    position: 'relative',
                    pointerEvents: 'auto',
                    width: 'min(290px, calc(100vw - 3.5rem))',
                    padding: '0.85rem 1rem 0.9rem 1rem',
                    borderRadius: '16px',
                    background: 'rgba(6, 14, 28, 0.94)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(56, 189, 248, 0.38)',
                    boxShadow: '0 12px 35px rgba(0, 0, 0, 0.7), 0 0 20px rgba(56, 189, 248, 0.18)',
                    marginBottom: '0.75rem',
                    color: '#F4F8FF',
                    transformOrigin: 'bottom right'
                  }}
                >
                  {/* Header Bubble: Tag & Tombol Close (×) */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.35rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Sparkles size={13} style={{ color: '#38BDF8' }} />
                      <span
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          color: '#38BDF8',
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase'
                        }}
                      >
                        Panduan • {guideState.title}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleCloseBubble}
                      style={{
                        background: 'rgba(56, 189, 248, 0.12)',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        color: 'rgba(224, 242, 254, 0.95)',
                        width: '32px',
                        height: '32px',
                        minWidth: '32px',
                        minHeight: '32px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease',
                        touchAction: 'manipulation'
                      }}
                      className="chibi-close-btn"
                      title="Tutup penjelasan (×)"
                      aria-label="Tutup penjelasan"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* Isi Penjelasan Menu Singkat */}
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.84rem',
                      lineHeight: '1.45',
                      color: '#E0F2FE',
                      fontWeight: 500,
                      letterSpacing: '0.01em'
                    }}
                  >
                    {guideState.message}
                  </p>

                  {/* Speech Bubble Pointer / Ekor Icy Blue ke Karakter Chibi */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-7px',
                      right: '34px',
                      width: '12px',
                      height: '12px',
                      background: 'rgba(6, 14, 28, 0.94)',
                      borderRight: '1px solid rgba(56, 189, 248, 0.38)',
                      borderBottom: '1px solid rgba(56, 189, 248, 0.38)',
                      transform: 'rotate(45deg)',
                      zIndex: 1
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* KARAKTER MASKOT CHIBI ASLI */}
            <motion.div
              animate={{
                y: isReducedMotion ? 0 : [0, -5, 0]
              }}
              transition={{
                duration: 3.2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              whileHover={!isReducedMotion ? { scale: 1.08, y: -6 } : {}}
              whileTap={!isReducedMotion ? { scale: 0.94 } : {}}
              onClick={handleChibiClick}
              style={{
                position: 'relative',
                cursor: 'pointer',
                pointerEvents: 'auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                filter: 'drop-shadow(0 8px 20px rgba(56, 189, 248, 0.35))'
              }}
              title="Maskot BibTzy — Klik untuk menampilkan penjelasan menu!"
            >
              {/* Efek Cahaya Lingkaran Ambient Halus di Belakang Maskot */}
              <div
                style={{
                  position: 'absolute',
                  top: '40%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '78px',
                  height: '78px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(56, 189, 248, 0.35) 0%, transparent 70%)',
                  filter: 'blur(14px)',
                  pointerEvents: 'none',
                  zIndex: -1
                }}
              />

              {/* Gambar Maskot Chibi dengan Transisi Ekspresi Halus */}
              <AnimatePresence mode="wait">
                <motion.img
                  key={guideState.expression}
                  src={currentChibiSrc}
                  alt={`Maskot Chibi BibTzy - ${guideState.expression}`}
                  initial={{ opacity: 0.8, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0.8, scale: 0.94 }}
                  transition={{ duration: 0.18 }}
                  style={{
                    width: 'clamp(72px, 8.5vw, 90px)',
                    height: 'auto',
                    aspectRatio: '1/1',
                    objectFit: 'contain',
                    display: 'block',
                    filter: 'contrast(1.03) brightness(1.02)'
                  }}
                  draggable={false}
                />
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .chibi-close-btn:hover {
          background: rgba(56, 189, 248, 0.25) !important;
          color: #FFFFFF !important;
          transform: scale(1.1);
        }
        @media (max-width: 640px) {
          #bibtzy-chibi-guide-container {
            bottom: calc(4.6rem + env(safe-area-inset-bottom, 0px)) !important;
            right: 0.75rem !important;
          }
        }
      `}</style>
    </div>
  );
}
