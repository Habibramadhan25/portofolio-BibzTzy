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
    message: 'Ganti wallpaper latar belakang menggunakan gambar atau video favoritmu.',
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

export default function ChibiMascot() {
  const location = useLocation();
  const { playSound, isReducedMotion } = useTheme();

  // State panduan chibi disinkronkan dengan rute saat ini
  const [guideState, setGuideState] = useState(() => {
    const initialKey = pathToMenuKey(typeof window !== 'undefined' ? window.location.pathname : '/');
    return SIDEBAR_GUIDE_DATA[initialKey] || SIDEBAR_GUIDE_DATA.home;
  });

  const [isVisible, setIsVisible] = useState(true);
  const [isBubbleOpen, setIsBubbleOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const autoDismissTimerRef = useRef(null);

  // Jadwalkan penutupan bubble otomatis setelah 5 detik
  const scheduleAutoDismiss = useCallback((duration = 5000) => {
    if (autoDismissTimerRef.current) {
      clearTimeout(autoDismissTimerRef.current);
    }
    autoDismissTimerRef.current = setTimeout(() => {
      setIsBubbleOpen(false);
    }, duration);
  }, []);

  // Bersihkan timer auto-dismiss saat unmount
  useEffect(() => {
    return () => {
      if (autoDismissTimerRef.current) clearTimeout(autoDismissTimerRef.current);
    };
  }, []);

  // Sinkronisasi data panduan saat lokasi halaman berpindah (tanpa membuka balon secara paksa)
  useEffect(() => {
    const key = pathToMenuKey(location.pathname);
    const guideItem = SIDEBAR_GUIDE_DATA[key] || SIDEBAR_GUIDE_DATA.home;
    setGuideState(guideItem);
    setImgError(false);
  }, [location.pathname]);

  // Klik tombol "x" pada balon teks
  const handleCloseBubble = (e) => {
    e.stopPropagation();
    playSound?.('click');
    setIsBubbleOpen(false);
    if (autoDismissTimerRef.current) {
      clearTimeout(autoDismissTimerRef.current);
      autoDismissTimerRef.current = null;
    }
  };

  // Klik pada maskot: buka/tutup balon panduan interaktif
  const handleMascotClick = (e) => {
    e.stopPropagation();
    playSound?.('bubble');

    if (!isBubbleOpen) {
      setIsBubbleOpen(true);
      scheduleAutoDismiss(5000);
    } else {
      setIsBubbleOpen(false);
      if (autoDismissTimerRef.current) {
        clearTimeout(autoDismissTimerRef.current);
        autoDismissTimerRef.current = null;
      }
    }
  };

  const currentChibiSrc = imgError
    ? '/images/bibtzy-frost-logo.png'
    : (CHIBI_EXPRESSIONS[guideState.expression] || CHIBI_EXPRESSIONS.welcome);

  if (!isVisible) return null;

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
      aria-label="Maskot Panduan BibTzy"
    >
      <AnimatePresence>
        {/* BALON TEKS PANDUAN (Hanya muncul jika diklik, tidak menutupi konten halaman) */}
        {isBubbleOpen && (
          <motion.div
            key={guideState.title}
            initial={!isReducedMotion ? { opacity: 0, y: 10, scale: 0.92 } : { opacity: 0 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={!isReducedMotion ? { opacity: 0, y: 8, scale: 0.92 } : { opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'relative',
              pointerEvents: 'auto',
              width: 'min(260px, calc(100vw - 2.5rem))',
              padding: '0.75rem 0.95rem',
              borderRadius: '14px',
              background: 'rgba(6, 14, 28, 0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.7), 0 0 20px rgba(56, 189, 248, 0.2)',
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
                <Sparkles size={13} className="text-ice" />
                <span
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: '#8DDCFF'
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
                aria-label="Tutup panduan"
              >
                <X size={12} />
              </button>
            </div>

            {/* Isi Pesan Singkat */}
            <p
              style={{
                margin: 0,
                fontSize: '0.8rem',
                lineHeight: '1.45',
                color: '#E0F2FE',
                fontWeight: 500
              }}
            >
              {guideState.message}
            </p>

            {/* Ekor Balon Icy Blue ke Arah Maskot */}
            <div
              style={{
                position: 'absolute',
                bottom: '-6px',
                right: '24px',
                width: '10px',
                height: '10px',
                background: 'rgba(6, 14, 28, 0.95)',
                borderRight: '1px solid rgba(56, 189, 248, 0.35)',
                borderBottom: '1px solid rgba(56, 189, 248, 0.35)',
                transform: 'rotate(45deg)',
                zIndex: 1
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ICON BADGE MASKOT CHIBI BULAT (Rapi, mewah, tidak menutupi isi kartu) */}
      <motion.div
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={handleMascotClick}
        style={{
          width: '58px',
          height: '58px',
          borderRadius: '50%',
          background: 'rgba(6, 14, 28, 0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1.5px solid rgba(56, 189, 248, 0.45)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.65), 0 0 16px rgba(56, 189, 248, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          pointerEvents: 'auto',
          position: 'relative',
          overflow: 'hidden',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
        }}
        title="Maskot BibTzy — Ketuk untuk bantuan & info halaman!"
      >
        {/* Glow ambient di belakang maskot */}
        <div
          style={{
            position: 'absolute',
            inset: '4px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, transparent 75%)',
            pointerEvents: 'none'
          }}
        />

        {/* Gambar Maskot Chibi dengan fallback aman anti-broken image (100% bebas icon error) */}
        {imgError ? (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, transparent 70%)'
            }}
          >
            <Sparkles size={24} style={{ color: '#38BDF8', filter: 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.8))' }} />
          </div>
        ) : (
          <img
            src={currentChibiSrc}
            alt="Maskot BibTzy"
            onError={() => {
              setImgError(true);
            }}
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
