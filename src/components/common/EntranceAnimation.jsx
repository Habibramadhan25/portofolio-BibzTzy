import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Volume2, VolumeX } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { profileService } from '../../services/profileService';
import { projectService } from '../../services/projectService';
import { educationService } from '../../services/educationService';
import { certificateService } from '../../services/certificateService';

// Durasi intro disesuaikan dengan durasi video penuh (~10 detik) dengan batas pengaman 10.5 detik
const DEFAULT_MAX_INTRO_DURATION_MS = 10500;

// Partikel es kristal melayang menggunakan CSS murni (GPU compositor) agar animasi 100% mulus tanpa lag
const ICE_PARTICLES = [
  { id: 1, top: '15%', left: '12%', size: 4, duration: 6.2, delay: 0.2 },
  { id: 2, top: '22%', right: '14%', size: 5, duration: 7.4, delay: 1.1 },
  { id: 3, top: '75%', left: '16%', size: 3, duration: 5.8, delay: 0.8 },
  { id: 4, top: '68%', right: '18%', size: 6, duration: 8.1, delay: 1.5 },
  { id: 5, top: '40%', left: '8%', size: 3, duration: 6.9, delay: 2.1 },
  { id: 6, top: '50%', right: '9%', size: 4, duration: 5.5, delay: 0.5 },
  { id: 7, top: '85%', left: '28%', size: 5, duration: 7.0, delay: 1.9 },
  { id: 8, top: '12%', right: '25%', size: 3, duration: 6.5, delay: 2.4 },
  { id: 9, top: '30%', left: '22%', size: 4, duration: 8.5, delay: 0.3 },
  { id: 10, top: '80%', right: '30%', size: 4, duration: 6.8, delay: 1.7 },
  { id: 11, top: '8%', left: '45%', size: 3, duration: 7.2, delay: 2.7 },
  { id: 12, top: '92%', right: '45%', size: 5, duration: 6.4, delay: 0.9 }
];

export default function EntranceAnimation({ forceShow = false, onComplete }) {
  const { isReducedMotion } = useTheme();

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const videoRef = useRef(null);
  const hasCompletedRef = useRef(false);

  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    if (forceShow) return true;
    try {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('intro') === 'true' || searchParams.get('splash') === 'true') {
        return true;
      }
      return !sessionStorage.getItem('bibtzy_video_intro_seen');
    } catch (_) {
      return false;
    }
  });

  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [maxDurationMs, setMaxDurationMs] = useState(DEFAULT_MAX_INTRO_DURATION_MS);

  // Penanganan penyelesaian intro dan transisi otomatis ke halaman utama
  const completeAndExit = useCallback(() => {
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;

    // Hentikan video dan suara seketika agar tidak bocor atau diputar berulang
    const video = videoRef.current;
    if (video) {
      try {
        video.pause();
        video.currentTime = 0;
        video.muted = true;
      } catch (_) {}
    }

    setIsVisible(false);
    try {
      sessionStorage.setItem('bibtzy_video_intro_seen', 'true');
    } catch (_) {}

    if (typeof onCompleteRef.current === 'function') {
      onCompleteRef.current();
    }
  }, []);

  // Adaptasi batas waktu intro berdasarkan durasi video aktual
  const handleLoadedMetadata = useCallback((e) => {
    const video = e.currentTarget;
    if (video && video.duration && !isNaN(video.duration) && video.duration > 0) {
      setMaxDurationMs(Math.max(DEFAULT_MAX_INTRO_DURATION_MS, Math.ceil(video.duration * 1000) + 500));
    }
  }, []);

  // Halaman utama otomatis terbuka setelah intro selesai diputar penuh atau batas pengaman tercapai
  useEffect(() => {
    if (!isVisible) return;
    hasCompletedRef.current = false;

    // Jika pengguna mengaktifkan prefers-reduced-motion, langsung buka halaman utama
    if (isReducedMotion) {
      const timer = setTimeout(completeAndExit, 100);
      return () => clearTimeout(timer);
    }

    const maxTimer = setTimeout(() => {
      completeAndExit();
    }, maxDurationMs);

    return () => clearTimeout(maxTimer);
  }, [isVisible, isReducedMotion, completeAndExit, maxDurationMs]);

  // Preload data website di latar belakang selagi intro berjalan
  useEffect(() => {
    if (!isVisible) return;
    const preloadTimer = setTimeout(() => {
      try {
        profileService.getProfile();
        projectService.getProjects();
        educationService.getEducations();
        certificateService.getCertificates();
        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.catch(() => {});
        }
      } catch (_) {}
    }, 1200);

    return () => clearTimeout(preloadTimer);
  }, [isVisible]);

  // Event listener untuk replay manual dari Settings atau Command Palette
  useEffect(() => {
    const handleReplay = () => {
      hasCompletedRef.current = false;
      setIsVisible(true);
      setIsPlaying(false);
      setIsMuted(false);

      const video = videoRef.current;
      if (video) {
        try {
          video.currentTime = 0;
          video.muted = false;
          video.volume = 1;
          video.play()
            .then(() => {
              setIsPlaying(true);
              setIsMuted(false);
            })
            .catch(() => {
              video.muted = true;
              setIsMuted(true);
              video.play().catch(() => {});
            });
        } catch (_) {}
      }
    };

    window.addEventListener('nova-glass-trigger-entrance', handleReplay);
    return () => {
      window.removeEventListener('nova-glass-trigger-entrance', handleReplay);
    };
  }, []);

  // Pemutaran video intro otomatis dengan suara & penanganan autoplay browser
  useEffect(() => {
    if (!isVisible) return;

    const videoEl = videoRef.current;
    if (!videoEl) return;

    videoEl.currentTime = 0;
    videoEl.volume = 1;
    videoEl.muted = false;

    let cleanupListeners = null;

    const startPlayback = async () => {
      if (hasCompletedRef.current) return;
      try {
        videoEl.muted = false;
        videoEl.volume = 1;
        await videoEl.play();
        if (!hasCompletedRef.current) {
          setIsPlaying(true);
          setIsMuted(false);
        }
      } catch (unmutedErr) {
        // Autoplay audio ditolak kebijakan browser: putar dalam mode muted
        // dan otomatis bunyikan suara seketika pengguna menyentuh/mengklik layar
        if (hasCompletedRef.current) return;
        videoEl.muted = true;
        setIsMuted(true);

        try {
          await videoEl.play();
          if (!hasCompletedRef.current) {
            setIsPlaying(true);
          }
        } catch (_) {
          // Jika video pun gagal autoplay, intro tidak akan macet:
          // Timer maxDurationMs akan membuka halaman utama secara otomatis
        }

        const handleAutoUnmute = () => {
          if (videoEl && !videoEl.ended && !hasCompletedRef.current) {
            videoEl.muted = false;
            videoEl.volume = 1;
            setIsMuted(false);
            if (videoEl.paused) {
              videoEl.play().catch(() => {});
            }
          }
          removeGestureListeners();
        };

        const removeGestureListeners = () => {
          window.removeEventListener('click', handleAutoUnmute, true);
          window.removeEventListener('touchend', handleAutoUnmute, true);
          window.removeEventListener('pointerup', handleAutoUnmute, true);
          window.removeEventListener('keydown', handleAutoUnmute, true);
        };

        cleanupListeners = removeGestureListeners;
        window.addEventListener('click', handleAutoUnmute, true);
        window.addEventListener('touchend', handleAutoUnmute, true);
        window.addEventListener('pointerup', handleAutoUnmute, true);
        window.addEventListener('keydown', handleAutoUnmute, true);
      }
    };

    if (videoEl.readyState >= 2) {
      startPlayback();
    } else {
      videoEl.addEventListener('canplay', startPlayback, { once: true });
      videoEl.addEventListener('loadeddata', startPlayback, { once: true });
    }

    return () => {
      if (videoEl) {
        videoEl.removeEventListener('canplay', startPlayback);
        videoEl.removeEventListener('loadeddata', startPlayback);
        try {
          videoEl.pause();
          videoEl.muted = true;
        } catch (_) {}
      }
      if (cleanupListeners) {
        cleanupListeners();
      }
    };
  }, [isVisible]);

  // Saat video selesai sebelum batas waktu, langsung masuk ke halaman utama
  const handleVideoEnded = () => {
    completeAndExit();
  };

  // Jika video/audio gagal dimuat, jangan biarkan intro macet
  const handleVideoError = () => {
    completeAndExit();
  };

  const handleVideoPause = () => {
    const video = videoRef.current;
    if (video && !video.ended && isVisible && !hasCompletedRef.current) {
      video.play().catch(() => {});
    }
  };

  const handleToggleAudio = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.muted = false;
      video.volume = 1;
      setIsMuted(false);
      if (video.paused) {
        video.play().catch(() => {});
      }
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  };

  const handleUnmuteOnly = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.muted = false;
      video.volume = 1;
      setIsMuted(false);
      if (video.paused) {
        video.play().catch(() => {});
      }
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="bibtzy-entrance-overlay"
        id="bibtzy-video-intro-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{
          opacity: 0,
          filter: 'blur(10px)',
          scale: 1.02,
          transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
        }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#02050E',
          backgroundImage: 'radial-gradient(circle at 50% 50%, #061124 0%, #020610 65%, #010308 100%)',
          overflow: 'hidden',
          padding: '1.25rem',
          userSelect: 'none'
        }}
        aria-label="Animasi Pembuka Portfolio BibTzy"
        role="region"
      >
        {/* Style Keyframes untuk partikel es murni CSS */}
        <style>{`
          @keyframes iceParticlePulse {
            0%, 100% {
              transform: translate3d(0, -10px, 0) scale(0.9);
              opacity: 0.4;
            }
            50% {
              transform: translate3d(0, 10px, 0) scale(1.1);
              opacity: 0.85;
            }
          }
          .ice-pure-particle {
            animation: iceParticlePulse var(--duration) ease-in-out infinite;
            animation-delay: var(--delay);
            will-change: transform, opacity;
          }
        `}</style>

        {/* Ambient Glow Biru Es di Tengah */}
        <div
          style={{
            position: 'absolute',
            width: 'min(90vw, 860px)',
            height: 'min(55vw, 520px)',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.22) 0%, rgba(2, 132, 199, 0.08) 50%, transparent 75%)',
            pointerEvents: 'none',
            transform: 'translate(-50%, -50%)',
            left: '50%',
            top: '50%',
            zIndex: 1
          }}
        />

        {/* Partikel Es Melayang Halus (CSS GPU Composited) */}
        {ICE_PARTICLES.map((p) => (
          <div
            key={p.id}
            className="ice-pure-particle"
            style={{
              '--duration': `${p.duration}s`,
              '--delay': `${p.delay}s`,
              position: 'absolute',
              top: p.top,
              left: p.left,
              right: p.right,
              width: `${p.size}px`,
              height: `${p.size}px`,
              borderRadius: '50%',
              background: 'radial-gradient(circle, #E0F2FE 0%, #38BDF8 65%, transparent 100%)',
              boxShadow: '0 0 8px rgba(56, 189, 248, 0.65)',
              pointerEvents: 'none',
              zIndex: 3
            }}
          />
        ))}

        {/* KONTEN UTAMA: PEMUTARAN VIDEO INTRO RESMI NOVA GLASS (MAKSIMAL 3–5 DETIK) */}
        <motion.div
          key="stage-video-intro"
          initial={{ opacity: 1, scale: 1 }}
          exit={{
            opacity: 0,
            scale: 0.96,
            filter: 'blur(8px)',
            transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
          }}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '920px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            willChange: 'transform',
            transform: 'translateZ(0)'
          }}
        >
          {/* Video Box Container */}
          <div
            onClick={handleUnmuteOnly}
            style={{
              position: 'relative',
              width: '100%',
              borderRadius: '16px',
              overflow: 'hidden',
              background: '#01040A',
              boxShadow: '0 16px 50px rgba(0, 0, 0, 0.8), 0 0 35px rgba(56, 189, 248, 0.22)',
              border: '1px solid rgba(56, 189, 248, 0.28)',
              transform: 'translateZ(0)',
              cursor: isMuted ? 'pointer' : 'default'
            }}
          >
            <video
              ref={videoRef}
              src="/videos/bibtzy-intro.mp4"
              autoPlay
              muted={isMuted}
              playsInline
              webkit-playsinline="true"
              x5-playsinline="true"
              preload="auto"
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={handleVideoEnded}
              onError={handleVideoError}
              onPause={handleVideoPause}
              style={{
                display: 'block',
                width: '100%',
                height: 'auto',
                maxHeight: '72vh',
                aspectRatio: '16/9',
                objectFit: 'contain',
                backgroundColor: '#01040A',
                willChange: 'transform'
              }}
            />

            {/* Floating Banner Ketuk Layar untuk Aktifkan Suara saat Muted */}
            {isMuted && isPlaying && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleUnmuteOnly}
                style={{
                  position: 'absolute',
                  top: '0.85rem',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 25,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.4rem 0.95rem',
                  borderRadius: '999px',
                  background: 'rgba(5, 12, 26, 0.85)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1.5px solid rgba(56, 189, 248, 0.55)',
                  color: '#BAE6FD',
                  fontSize: 'clamp(0.72rem, 2.5vw, 0.78rem)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.6), 0 0 16px rgba(56, 189, 248, 0.35)',
                  pointerEvents: 'auto',
                  whiteSpace: 'nowrap'
                }}
              >
                <VolumeX size={15} style={{ color: '#F87171' }} />
                <span>Ketuk layar untuk mengaktifkan suara</span>
              </motion.div>
            )}

            {/* Kontrol Suara Bersuara di pojok kanan bawah video (Fitur Skip Intro telah DIHAPUS SEPENUHNYA) */}
            {isPlaying && (
              <motion.button
                type="button"
                onClick={handleToggleAudio}
                animate={isMuted ? {
                  scale: [1, 1.05, 1],
                  boxShadow: [
                    '0 0 12px rgba(239, 68, 68, 0.65)',
                    '0 0 24px rgba(239, 68, 68, 0.95)',
                    '0 0 12px rgba(239, 68, 68, 0.65)'
                  ]
                } : { scale: 1 }}
                transition={isMuted ? { repeat: Infinity, duration: 1.5, ease: 'easeInOut' } : {}}
                style={{
                  position: 'absolute',
                  bottom: '0.85rem',
                  right: '0.85rem',
                  zIndex: 25,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '999px',
                  background: isMuted
                    ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.92), rgba(185, 28, 28, 0.92))'
                    : 'linear-gradient(135deg, rgba(14, 165, 233, 0.9), rgba(2, 132, 199, 0.9))',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  color: '#FFFFFF',
                  fontSize: 'clamp(0.75rem, 2.5vw, 0.82rem)',
                  fontWeight: 700,
                  border: isMuted
                    ? '1.5px solid rgba(254, 202, 202, 0.7)'
                    : '1.5px solid rgba(186, 230, 253, 0.7)',
                  cursor: 'pointer',
                  boxShadow: isMuted
                    ? '0 0 20px rgba(239, 68, 68, 0.75)'
                    : '0 0 18px rgba(56, 189, 248, 0.6)',
                  transition: 'all 0.2s ease'
                }}
                title={isMuted ? 'Ketuk untuk Mengaktifkan Suara Video' : 'Suara Aktif'}
                id="intro-btn-audio-toggle"
              >
                {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                <span>{isMuted ? 'Aktifkan Suara' : 'Suara Aktif'}</span>
              </motion.button>
            )}
          </div>

          {/* Tulisan di bawah video: Welcome to Website Habib & Mohon tunggu sebentar */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            marginTop: '1rem',
            gap: '0.35rem',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: 'clamp(0.95rem, 3.5vw, 1.15rem)',
              fontWeight: 700,
              letterSpacing: '0.03em',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #BAE6FD 50%, #38BDF8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 16px rgba(56, 189, 248, 0.4))'
            }}>
              Welcome to Website Habib
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#BAE6FD',
              fontSize: '0.82rem',
              fontWeight: 500
            }}>
              <Loader2 size={14} className="animate-spin text-ice" />
              <span>Memuat halaman utama...</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
