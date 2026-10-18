import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Volume2, VolumeX, FastForward, Loader2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { profileService } from '../../services/profileService';
import { projectService } from '../../services/projectService';
import { educationService } from '../../services/educationService';
import { certificateService } from '../../services/certificateService';

// Partikel es kristal melayang halus dengan variasi posisi, ukuran, dan durasi
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

  // State untuk Video Intro (10 Detik)
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

  // Preload data secara hening di background selama intro 10 detik berjalan
  useEffect(() => {
    if (!isVisible) return;
    try {
      profileService.getProfile();
      projectService.getProjects();
      educationService.getEducations();
      certificateService.getCertificates();
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.catch(() => {});
      }
    } catch (_) {}
  }, [isVisible]);

  // Fungsi untuk mengaktifkan suara penuh dan melanjutkan pemutaran
  const unmuteAndPlaySound = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.volume = 1;
      setIsMuted(false);
      videoRef.current.play().catch(() => {});
    }
  }, []);

  // Event listener untuk replay manual dari Settings atau Command Palette
  useEffect(() => {
    const handleReplay = () => {
      setIsVisible(true);
      setIsPlaying(false);
      setIsAutoplayBlocked(false);
      setHasVideoError(false);
      setIsMuted(false);

      if (videoRef.current) {
        try {
          videoRef.current.currentTime = 0;
          videoRef.current.muted = false;
          videoRef.current.volume = 1;
          videoRef.current.play()
            .then(() => {
              setIsPlaying(true);
              setIsAutoplayBlocked(false);
              setIsMuted(false);
            })
            .catch(() => {
              if (videoRef.current) {
                videoRef.current.muted = true;
                setIsMuted(true);
                videoRef.current.play().catch(() => setIsAutoplayBlocked(true));
              }
            });
        } catch (_) {}
      }
    };

    window.addEventListener('nova-glass-trigger-entrance', handleReplay);
    return () => {
      window.removeEventListener('nova-glass-trigger-entrance', handleReplay);
    };
  }, []);

  // Manajemen pemutaran video intro & safety watchdog
  useEffect(() => {
    if (!isVisible) return;

    // Jika pengguna mengaktifkan prefers-reduced-motion, langsung masuk ke Home
    if (isReducedMotion) {
      const timer = setTimeout(completeAndExit, 100);
      return () => clearTimeout(timer);
    }

    const videoEl = videoRef.current;
    let cleanupListeners = null;

    if (videoEl) {
      videoEl.currentTime = 0;
      videoEl.volume = 1;
      videoEl.muted = false;

      const attemptPlay = async () => {
        try {
          videoEl.muted = false;
          videoEl.volume = 1;
          await videoEl.play();
          setIsPlaying(true);
          setIsAutoplayBlocked(false);
          setIsMuted(false);
        } catch (unmutedErr) {
          console.log('[EntranceAnimation] Autoplay dengan audio dibatasi browser sebelum interaksi. Memutar video muted:', unmutedErr);
          videoEl.muted = true;
          setIsMuted(true);
          try {
            await videoEl.play();
            setIsPlaying(true);
            setIsAutoplayBlocked(false);
          } catch (mutedErr) {
            setIsAutoplayBlocked(true);
          }

          // Bunyikan suara begitu pengguna menyentuh/klik layar
          const handleFirstInteraction = () => {
            unmuteAndPlaySound();
            removeListeners();
          };

          const removeListeners = () => {
            window.removeEventListener('click', handleFirstInteraction, true);
            window.removeEventListener('keydown', handleFirstInteraction, true);
            window.removeEventListener('touchstart', handleFirstInteraction, true);
            window.removeEventListener('pointerdown', handleFirstInteraction, true);
          };

          cleanupListeners = removeListeners;
          window.addEventListener('click', handleFirstInteraction, true);
          window.addEventListener('keydown', handleFirstInteraction, true);
          window.addEventListener('touchstart', handleFirstInteraction, true);
          window.addEventListener('pointerdown', handleFirstInteraction, true);
        }
      };

      attemptPlay();
    }

    // Safety watchdog: Jika video tidak selesai dalam 12 detik, langsung transisi ke Home
    const watchdog = setTimeout(() => {
      completeAndExit();
    }, 12000);

    return () => {
      clearTimeout(watchdog);
      if (cleanupListeners) cleanupListeners();
    };
  }, [isVisible, isReducedMotion, completeAndExit, unmuteAndPlaySound]);

  // Saat video 10 detik selesai berputar, langsung transisi ke Home tanpa jeda kosong
  const handleVideoEnded = () => {
    completeAndExit();
  };

  const handleVideoError = () => {
    setHasVideoError(true);
    completeAndExit();
  };

  const handleManualPlay = () => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.volume = 1;
      setIsMuted(false);
      videoRef.current.play()
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
        onPointerDown={() => {
          if (videoRef.current && videoRef.current.muted) {
            videoRef.current.muted = false;
            videoRef.current.volume = 1;
            setIsMuted(false);
          }
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
        {/* Ambient Glow Biru Es di Tengah */}
        <div
          style={{
            position: 'absolute',
            width: 'min(90vw, 860px)',
            height: 'min(55vw, 520px)',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.2) 0%, rgba(2, 132, 199, 0.06) 50%, transparent 75%)',
            filter: 'blur(75px)',
            pointerEvents: 'none',
            transform: 'translate(-50%, -50%)',
            left: '50%',
            top: '50%',
            zIndex: 1
          }}
        />

        {/* Partikel Es Melayang Halus */}
        {ICE_PARTICLES.map((p) => (
          <motion.div
            key={p.id}
            initial={{ y: 0, opacity: p.opacity * 0.5 }}
            animate={{
              y: [-14, 14, -14],
              opacity: [p.opacity * 0.35, p.opacity, p.opacity * 0.35],
              scale: [0.9, 1.15, 0.9]
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            style={{
              position: 'absolute',
              top: p.top,
              left: p.left,
              right: p.right,
              width: `${p.size}px`,
              height: `${p.size}px`,
              borderRadius: '50%',
              background: 'radial-gradient(circle, #E0F2FE 0%, #38BDF8 65%, transparent 100%)',
              boxShadow: '0 0 10px rgba(56, 189, 248, 0.75)',
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
            zIndex: 10
          }}
        >
          {/* Video Box Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'relative',
              width: '100%',
              borderRadius: '16px',
              overflow: 'hidden',
              background: '#01040A',
              boxShadow: '0 16px 50px rgba(0, 0, 0, 0.8), 0 0 35px rgba(56, 189, 248, 0.22)',
              border: '1px solid rgba(56, 189, 248, 0.28)'
            }}
          >
            <video
              ref={videoRef}
              src="/videos/bibtzy-intro.mp4"
              autoPlay
              muted={isMuted}
              playsInline
              preload="auto"
              onEnded={handleVideoEnded}
              onError={handleVideoError}
              style={{
                display: 'block',
                width: '100%',
                height: 'auto',
                maxHeight: '76vh',
                aspectRatio: '16/9',
                objectFit: 'contain',
                backgroundColor: '#01040A'
              }}
            />

            {/* Autoplay blocked fallback */}
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
                  Klik tombol untuk memutar video dengan audio jernih
                </span>
              </div>
            )}
            {/* Tombol Aktifkan Suara / Toggle Audio */}
            {isPlaying && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isMuted) {
                    unmuteAndPlaySound();
                  } else if (videoRef.current) {
                    videoRef.current.muted = true;
                    setIsMuted(true);
                  }
                }}
                style={{
                  position: 'absolute',
                  bottom: '0.85rem',
                  right: '0.85rem',
                  zIndex: 25,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.4rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  background: isMuted ? 'rgba(239, 68, 68, 0.88)' : 'rgba(14, 165, 233, 0.85)',
                  color: '#FFFFFF',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: isMuted ? '0 0 16px rgba(239, 68, 68, 0.65)' : '0 4px 15px rgba(0, 0, 0, 0.5)',
                  cursor: 'pointer',
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.2s ease'
                }}
                title={isMuted ? 'Klik untuk Mengaktifkan Suara Video' : 'Matikan Suara Video'}
              >
                {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                <span>{isMuted ? 'Aktifkan Suara' : 'Suara Aktif'}</span>
              </button>
            )}
          </motion.div>

          {/* Status Menyiapkan Website & Tombol Lewati */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            marginTop: '0.85rem',
            padding: '0 0.25rem',
            gap: '1rem',
            flexWrap: 'wrap'
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

            <button
              type="button"
              onClick={completeAndExit}
              className="btn btn-glass btn-sm"
              style={{
                fontSize: '0.78rem',
                padding: '0.35rem 0.75rem',
                gap: '0.35rem',
                borderRadius: 'var(--radius-full)'
              }}
              title="Lewati video intro dan langsung masuk ke beranda"
            >
              <span>Lewati Intro</span>
              <FastForward size={13} />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
