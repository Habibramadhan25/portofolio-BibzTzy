import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Loader2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { profileService } from '../../services/profileService';
import { projectService } from '../../services/projectService';
import { educationService } from '../../services/educationService';
import { certificateService } from '../../services/certificateService';

// Partikel es kristal melayang menggunakan CSS murni (GPU compositor) agar video 100% mulus tanpa lag
const ICE_PARTICLES = [
  { id: 1, top: '15%', left: '12%', size: 4, duration: 6.2, delay: 0.2, opacity: 0.55 },
  { id: 2, top: '22%', right: '14%', size: 5, duration: 7.4, delay: 1.1, opacity: 0.65 },
  { id: 3, top: '75%', left: '16%', size: 3, duration: 5.8, delay: 0.8, opacity: 0.5 },
  { id: 4, top: '68%', right: '18%', size: 6, duration: 8.1, delay: 1.5, opacity: 0.7 },
  { id: 5, top: '40%', left: '8%', size: 3, duration: 6.9, delay: 2.1, opacity: 0.4 },
  { id: 6, top: '50%', right: '9%', size: 4, duration: 5.5, delay: 0.5, opacity: 0.6 },
  { id: 7, top: '85%', left: '28%', size: 5, duration: 7.0, delay: 1.9, opacity: 0.45 },
  { id: 8, top: '12%', right: '25%', size: 3, duration: 6.5, delay: 2.4, opacity: 0.5 },
  { id: 9, top: '30%', left: '22%', size: 4, duration: 8.5, delay: 0.3, opacity: 0.35 },
  { id: 10, top: '80%', right: '30%', size: 4, duration: 6.8, delay: 1.7, opacity: 0.6 },
  { id: 11, top: '8%', left: '45%', size: 3, duration: 7.2, delay: 2.7, opacity: 0.5 },
  { id: 12, top: '92%', right: '45%', size: 5, duration: 6.4, delay: 0.9, opacity: 0.55 }
];

export default function EntranceAnimation({ forceShow = false, onComplete }) {
  const { isReducedMotion } = useTheme();

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const videoRef = useRef(null);

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

  // Otomatis suara aktif (muted = false) sesuai permintaan pengguna
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAutoplayBlocked, setIsAutoplayBlocked] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);

  // Penanganan penyelesaian intro dan transisi langsung ke Home
  const completeAndExit = useCallback(() => {
    setIsVisible(false);
    try {
      sessionStorage.setItem('bibtzy_video_intro_seen', 'true');
    } catch (_) {}
    if (typeof onCompleteRef.current === 'function') {
      onCompleteRef.current();
    }
  }, []);

  // Preload data secara bertahap setelah video mulai berputar agar tidak berebut CPU/bandwidth
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
    }, 1500);

    return () => clearTimeout(preloadTimer);
  }, [isVisible]);

  // Event listener untuk replay manual dari Settings atau Command Palette
  useEffect(() => {
    const handleReplay = () => {
      setIsVisible(true);
      setIsPlaying(false);
      setIsAutoplayBlocked(false);
      setHasVideoError(false);
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
              setIsAutoplayBlocked(false);
              setIsMuted(false);
            })
            .catch(() => {
              // Jika audio diblokir, putar muted dulu lalu otomatis unmute pada klik
              video.muted = true;
              setIsMuted(true);
              video.play().catch(() => setIsAutoplayBlocked(true));
            });
        } catch (_) {}
      }
    };

    window.addEventListener('nova-glass-trigger-entrance', handleReplay);
    return () => {
      window.removeEventListener('nova-glass-trigger-entrance', handleReplay);
    };
  }, []);

  // Manajemen pemutaran video intro otomatis bersuara & safety watchdog
  useEffect(() => {
    if (!isVisible) return;

    // Jika pengguna mengaktifkan prefers-reduced-motion, langsung masuk ke Home
    if (isReducedMotion) {
      const timer = setTimeout(completeAndExit, 100);
      return () => clearTimeout(timer);
    }

    const videoEl = videoRef.current;
    if (!videoEl) return;

    videoEl.currentTime = 0;
    videoEl.volume = 1;
    videoEl.muted = false;

    let cleanupListeners = null;

    const startPlayback = async () => {
      try {
        // Coba putar langsung dengan suara aktif (unmuted)
        videoEl.muted = false;
        videoEl.volume = 1;
        await videoEl.play();
        setIsPlaying(true);
        setIsMuted(false);
        setIsAutoplayBlocked(false);
      } catch (unmutedErr) {
        // Jika browser HP mencekal audio autoplay sebelum gestur, putar muted sementara
        // dan pasang pendengar gestur pertama untuk langsung menyalakan audio secara otomatis
        console.log('[EntranceAnimation] Browser mobile membatasi audio sebelum interaksi. Memutar dan otomatis bersuara saat disentuh/diklik:', unmutedErr);
        videoEl.muted = true;
        setIsMuted(true);

        try {
          await videoEl.play();
          setIsPlaying(true);
          setIsAutoplayBlocked(false);
        } catch (mutedErr) {
          setIsAutoplayBlocked(true);
        }

        const handleAutoUnmute = () => {
          if (videoEl && !videoEl.ended) {
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
          window.removeEventListener('touchstart', handleAutoUnmute, true);
          window.removeEventListener('pointerdown', handleAutoUnmute, true);
          window.removeEventListener('keydown', handleAutoUnmute, true);
        };

        cleanupListeners = removeGestureListeners;
        window.addEventListener('click', handleAutoUnmute, true);
        window.addEventListener('touchstart', handleAutoUnmute, true);
        window.addEventListener('pointerdown', handleAutoUnmute, true);
        window.addEventListener('keydown', handleAutoUnmute, true);
      }
    };

    if (videoEl.readyState >= 2) {
      startPlayback();
    } else {
      videoEl.addEventListener('canplay', startPlayback, { once: true });
      videoEl.addEventListener('loadeddata', startPlayback, { once: true });
    }

    // Safety watchdog: Jika video mengalami buffering lama atau macet, transisi otomatis setelah 16 detik
    const watchdog = setTimeout(() => {
      completeAndExit();
    }, 16000);

    return () => {
      clearTimeout(watchdog);
      if (videoEl) {
        videoEl.removeEventListener('canplay', startPlayback);
        videoEl.removeEventListener('loadeddata', startPlayback);
      }
      if (cleanupListeners) {
        cleanupListeners();
      }
    };
  }, [isVisible, isReducedMotion, completeAndExit]);

  // Saat video 10 detik selesai berputar, langsung transisi ke Home tanpa jeda kosong
  const handleVideoEnded = () => {
    completeAndExit();
  };

  const handleVideoError = () => {
    setHasVideoError(true);
    completeAndExit();
  };

  // Jika video ter-pause secara tak terduga (misal interupsi OS mobile), langsung lanjutkan kembali
  const handleVideoPause = () => {
    const video = videoRef.current;
    if (video && !video.ended && isVisible) {
      video.play().catch(() => {});
    }
  };

  const handleManualPlay = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = false;
      video.volume = 1;
      setIsMuted(false);
      video.play()
        .then(() => {
          setIsPlaying(true);
          setIsAutoplayBlocked(false);
        })
        .catch(() => {
          completeAndExit();
        });
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        key="bibtzy-entrance-overlay"
        id="bibtzy-video-intro-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{
          opacity: 0,
          filter: 'blur(8px)',
          scale: 1.01,
          transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
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
        {/* Style Keyframes untuk partikel es murni CSS (0% JS overhead pada GPU mobile) */}
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
            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.2) 0%, rgba(2, 132, 199, 0.06) 50%, transparent 75%)',
            pointerEvents: 'none',
            transform: 'translate(-50%, -50%)',
            left: '50%',
            top: '50%',
            zIndex: 1
          }}
        />

        {/* Partikel Es Melayang Halus (Menggunakan CSS GPU Composited) */}
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

        {/* VIDEO INTRO RESMI BIBTZY (DURASI 10 DETIK) */}
        <motion.div
          key="stage-video-intro"
          initial={{ opacity: 1, scale: 1 }}
          exit={{
            opacity: 0,
            scale: 0.94,
            filter: 'blur(6px)',
            transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
          }}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '960px',
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
            style={{
              position: 'relative',
              width: '100%',
              borderRadius: '16px',
              overflow: 'hidden',
              background: '#01040A',
              boxShadow: '0 16px 50px rgba(0, 0, 0, 0.8), 0 0 35px rgba(56, 189, 248, 0.22)',
              border: '1px solid rgba(56, 189, 248, 0.28)',
              transform: 'translateZ(0)'
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
              onEnded={handleVideoEnded}
              onError={handleVideoError}
              onPause={handleVideoPause}
              style={{
                display: 'block',
                width: '100%',
                height: 'auto',
                maxHeight: '76vh',
                aspectRatio: '16/9',
                objectFit: 'contain',
                backgroundColor: '#01040A',
                willChange: 'transform'
              }}
            />

            {/* Autoplay blocked fallback jika browser memblokir video total */}
            {isAutoplayBlocked && !isPlaying && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(2, 5, 14, 0.88)',
                  backdropFilter: 'blur(8px)',
                  zIndex: 20,
                  gap: '1rem',
                  padding: '1.5rem',
                  textAlign: 'center'
                }}
              >
                <button
                  type="button"
                  onClick={handleManualPlay}
                  className="btn btn-primary"
                  style={{
                    padding: '0.9rem 1.8rem',
                    fontSize: '0.95rem',
                    boxShadow: '0 0 25px rgba(56, 189, 248, 0.6)'
                  }}
                >
                  <Play size={18} fill="currentColor" />
                  <span>Mulai Video Intro BibTzy</span>
                </button>
                <span style={{ color: 'rgba(224, 242, 254, 0.75)', fontSize: '0.8rem' }}>
                  Ketuk tombol untuk memutar video dengan audio
                </span>
              </div>
            )}
          </div>

          {/* Status Menyiapkan Website (Tombol Aktifkan Suara dan Lewati Intro telah dihapus) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            marginTop: '0.85rem',
            padding: '0 0.25rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem',
              color: 'var(--ice-blue)',
              fontSize: '0.85rem',
              fontWeight: 500
            }}>
              <Loader2 size={15} className="animate-spin" />
              <span>Mohon tunggu, sedang menyiapkan website...</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
