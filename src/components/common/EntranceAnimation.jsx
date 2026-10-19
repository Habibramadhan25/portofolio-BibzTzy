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

  // Tahap animasi: 'video' (pemutaran video intro) -> 'welcome' (layar sambutan transisi)
  const [stage, setStage] = useState('video');

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

  // Saat masuk ke tahap 'welcome', tahan selama 2.2 detik lalu transisi halus ke halaman utama
  useEffect(() => {
    if (stage === 'welcome' && isVisible) {
      const welcomeTimer = setTimeout(() => {
        completeAndExit();
      }, 2200);
      return () => clearTimeout(welcomeTimer);
    }
  }, [stage, isVisible, completeAndExit]);

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
      setStage('video');
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
    if (!isVisible || stage !== 'video') return;

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
        videoEl.muted = false;
        videoEl.volume = 1;
        await videoEl.play();
        setIsPlaying(true);
        setIsMuted(false);
        setIsAutoplayBlocked(false);
      } catch (unmutedErr) {
        console.log('[EntranceAnimation] Autoplay audio butuh gesture. Memutar muted dan otomatis bersuara saat disentuh/diklik:', unmutedErr);
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

    // Safety watchdog: Jika video buffering lama, otomatis lanjut ke tahap welcome
    const watchdog = setTimeout(() => {
      setStage('welcome');
    }, 15000);

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
  }, [isVisible, stage, isReducedMotion, completeAndExit]);

  // Saat video selesai berputar, masuk ke tahap layar sambutan "Welcome to Website Habib"
  const handleVideoEnded = () => {
    setStage('welcome');
  };

  const handleVideoError = () => {
    setHasVideoError(true);
    setStage('welcome');
  };

  const handleVideoPause = () => {
    const video = videoRef.current;
    if (video && !video.ended && isVisible && stage === 'video') {
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
          setStage('welcome');
        });
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
        {/* Style Keyframes untuk partikel es murni CSS & Progress bar */}
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
          @keyframes welcomeProgressFill {
            0% {
              width: 0%;
            }
            45% {
              width: 65%;
            }
            100% {
              width: 100%;
            }
          }
          @keyframes iceRingPulse {
            0%, 100% {
              transform: scale(1);
              opacity: 0.5;
            }
            50% {
              transform: scale(1.12);
              opacity: 0.9;
            }
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

        {/* TAHAP 1: PEMUTARAN VIDEO INTRO RESMI (DURASI 10 DETIK) */}
        {stage === 'video' && (
          <motion.div
            key="stage-video-intro"
            initial={{ opacity: 1, scale: 1 }}
            exit={{
              opacity: 0,
              scale: 0.94,
              filter: 'blur(8px)',
              transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
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
                onEnded={handleVideoEnded}
                onError={handleVideoError}
                onPause={handleVideoPause}
                style={{
                  display: 'block',
                  width: '100%',
                  height: 'auto',
                  maxHeight: '74vh',
                  aspectRatio: '16/9',
                  objectFit: 'contain',
                  backgroundColor: '#01040A',
                  willChange: 'transform'
                }}
              />

              {/* Autoplay blocked fallback jika browser mobile memblokir video total */}
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

            {/* TULISAN DI BAWAH VIDEO: Welcome to Website Habib & Mohon tunggu sebentar */}
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
                <span>Mohon tunggu sebentar...</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAHAP 2: LAYAR SAMBUTAN KHUSUS (SETELAH ANIMASI VIDEO SELESAI) */}
        {stage === 'welcome' && (
          <motion.div
            key="stage-welcome-screen"
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{
              opacity: 0,
              scale: 1.04,
              filter: 'blur(12px)',
              transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
            }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'relative',
              zIndex: 20,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '2.5rem 2rem',
              borderRadius: '24px',
              background: 'rgba(6, 14, 28, 0.88)',
              backdropFilter: 'blur(25px)',
              WebkitBackdropFilter: 'blur(25px)',
              border: '1.5px solid rgba(56, 189, 248, 0.4)',
              boxShadow: '0 24px 70px rgba(0, 0, 0, 0.85), 0 0 45px rgba(56, 189, 248, 0.25)',
              maxWidth: 'min(92vw, 520px)',
              width: '100%'
            }}
          >
            {/* Lingkaran Avatar Profile / Logo Kristal */}
            <div style={{
              position: 'relative',
              width: '88px',
              height: '88px',
              borderRadius: '50%',
              marginBottom: '1.25rem',
              padding: '3px',
              background: 'linear-gradient(135deg, #38BDF8 0%, #0284C7 50%, #0369A1 100%)',
              boxShadow: '0 0 32px rgba(56, 189, 248, 0.65)'
            }}>
              <img
                src="/images/avatar.jpg"
                alt="Habib Ramadhan"
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
              <div style={{
                position: 'absolute',
                inset: '-6px',
                borderRadius: '50%',
                border: '1.5px solid rgba(56, 189, 248, 0.5)',
                animation: 'iceRingPulse 2s ease-in-out infinite'
              }} />
            </div>

            {/* Tulisan Welcome to Website Habib */}
            <h1 style={{
              margin: '0 0 0.5rem 0',
              fontSize: 'clamp(1.5rem, 5.2vw, 2.15rem)',
              fontWeight: 800,
              lineHeight: 1.25,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #BAE6FD 45%, #38BDF8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 25px rgba(56, 189, 248, 0.5))'
            }}>
              Welcome to Website Habib
            </h1>

            {/* Tulisan Mohon tunggu sebentar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem',
              color: '#BAE6FD',
              fontSize: '0.92rem',
              fontWeight: 500,
              marginBottom: '1.5rem'
            }}>
              <Loader2 size={16} className="animate-spin text-ice" />
              <span>Mohon tunggu sebentar...</span>
            </div>

            {/* Glowing Loading Progress Bar */}
            <div style={{
              width: '100%',
              maxWidth: '300px',
              height: '5px',
              background: 'rgba(56, 189, 248, 0.15)',
              borderRadius: '999px',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <div
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #38BDF8 0%, #8DDCFF 50%, #FFFFFF 100%)',
                  borderRadius: '999px',
                  boxShadow: '0 0 12px #38BDF8',
                  animation: 'welcomeProgressFill 2.2s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                }}
              />
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
