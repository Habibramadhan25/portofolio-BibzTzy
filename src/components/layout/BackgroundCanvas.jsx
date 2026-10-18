import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';

const SAVED_TIME_KEY = 'bibtzy_video_wallpaper_time';
const SAVED_TS_KEY = 'bibtzy_video_wallpaper_timestamp';

export default function BackgroundCanvas() {
  const {
    bgType,
    bgEnabled,
    bgOverlay,
    bgBlur,
    customWallpaper,
    isReducedMotion,
    theme
  } = useTheme();

  const videoRef = useRef(null);
  const [videoError, setVideoError] = useState(false);
  const hiddenTimestampRef = useRef(null);
  const lastCurrentTimeRef = useRef(0);

  // Reset video error when wallpaper changes
  useEffect(() => {
    setVideoError(false);
  }, [customWallpaper]);

  // Determine active wallpaper source and type
  let wallpaperSrc = null;
  let wallpaperType = 'image';
  let wallpaperOpacity = 0.85;

  if (bgType === 'anime') {
    wallpaperSrc = '/images/anime-wallpaper.jpg';
    wallpaperType = 'image';
    wallpaperOpacity = 0.55;
  } else if (customWallpaper && bgType === 'custom') {
    if (typeof customWallpaper === 'string') {
      wallpaperSrc = customWallpaper;
      wallpaperType = 'image';
      wallpaperOpacity = 0.55;
    } else {
      wallpaperSrc = customWallpaper.url;
      wallpaperType = customWallpaper.type || 'image';
      wallpaperOpacity = wallpaperType === 'video' ? 0.9 : 0.55;
    }
  }

  // Safe play helper function ensuring muted & playsInline
  const safePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video || wallpaperType !== 'video' || isReducedMotion) return;

    // Strict audio muting required for autoplay/background policy
    video.muted = true;
    video.defaultMuted = true;

    if (video.paused || video.ended) {
      const promise = video.play();
      if (promise !== undefined) {
        promise.catch((err) => {
          // Autoplay could be waiting for user gesture or tab visibility
          console.debug('[BackgroundCanvas] Play tertunda oleh browser:', err);
        });
      }
    }
  }, [wallpaperType, isReducedMotion]);

  // Restore saved playback time when video metadata is loaded
  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      const savedTime = parseFloat(sessionStorage.getItem(SAVED_TIME_KEY) || '0');
      const savedTs = parseInt(sessionStorage.getItem(SAVED_TS_KEY) || '0', 10);

      if (savedTime && savedTs && video.duration && !isNaN(video.duration) && video.duration > 0) {
        const elapsed = (Date.now() - savedTs) / 1000;
        // Resume from progressed time so it feels like it never stopped
        const newTime = (savedTime + Math.max(0, elapsed)) % video.duration;
        video.currentTime = newTime;
      }
    } catch (_) {}

    safePlay();
  };

  // Keep track of current time for seamless restore on refresh/exit
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    lastCurrentTimeRef.current = video.currentTime;

    // Throttle storage write every 1.5 seconds
    const now = Date.now();
    if (!video._lastSave || now - video._lastSave > 1500) {
      video._lastSave = now;
      try {
        sessionStorage.setItem(SAVED_TIME_KEY, video.currentTime.toString());
        sessionStorage.setItem(SAVED_TS_KEY, now.toString());
      } catch (_) {}
    }
  };

  // Video looping fallback: if browser loop stalls, immediately replay
  const handleEnded = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    safePlay();
  };

  // Handle visibility change, window focus/blur, and page restoration (BF Cache)
  useEffect(() => {
    if (wallpaperType !== 'video') return;

    const handleVisibilityChange = () => {
      const video = videoRef.current;
      if (!video) return;

      if (document.hidden) {
        // User left tab or minimized browser ("keluar")
        hiddenTimestampRef.current = Date.now();
        lastCurrentTimeRef.current = video.currentTime;
        try {
          sessionStorage.setItem(SAVED_TIME_KEY, video.currentTime.toString());
          sessionStorage.setItem(SAVED_TS_KEY, Date.now().toString());
        } catch (_) {}
      } else {
        // User came back ("ketika masuk lagi")
        if (hiddenTimestampRef.current && video.duration && !isNaN(video.duration) && video.duration > 0) {
          const elapsed = (Date.now() - hiddenTimestampRef.current) / 1000;
          if (elapsed > 0) {
            // Advance video position by elapsed time so it never felt stopped
            const targetTime = (lastCurrentTimeRef.current + elapsed) % video.duration;
            video.currentTime = targetTime;
          }
        }
        hiddenTimestampRef.current = null;
        safePlay();
      }
    };

    const handleFocus = () => {
      // Regaining window focus -> ensure video is playing
      safePlay();
    };

    const handlePageShow = () => {
      // Returning via back/forward cache or re-opening
      safePlay();
    };

    const handleUserInteraction = () => {
      // If browser blocked play until first gesture, immediately resume on interaction
      const video = videoRef.current;
      if (video && video.paused && !isReducedMotion) {
        safePlay();
      }
    };

    const handleBeforeUnload = () => {
      const video = videoRef.current;
      if (video) {
        try {
          sessionStorage.setItem(SAVED_TIME_KEY, video.currentTime.toString());
          sessionStorage.setItem(SAVED_TS_KEY, Date.now().toString());
        } catch (_) {}
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);
    document.addEventListener('pointerdown', handleUserInteraction, { passive: true });
    document.addEventListener('keydown', handleUserInteraction, { passive: true });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
      document.removeEventListener('pointerdown', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, [wallpaperType, isReducedMotion, safePlay]);

  // Handle prefers-reduced-motion for video
  useEffect(() => {
    if (!videoRef.current || wallpaperType !== 'video') return;
    if (isReducedMotion) {
      videoRef.current.pause();
    } else {
      safePlay();
    }
  }, [isReducedMotion, wallpaperType, wallpaperSrc, safePlay]);

  // Ensure video is strictly muted
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.defaultMuted = true;
      videoRef.current.volume = 0;
    }
  }, [wallpaperSrc, wallpaperType]);

  if (!bgEnabled || bgType === 'none') {
    return null;
  }

  // Overlay calculation: respects user slider (0-90%), ensures minimum 0.35 dark tint so text is readable
  const overlayAlpha = Math.max((bgOverlay ?? 45) / 100, 0.35);
  const overlayColor = theme === 'light'
    ? `rgba(240, 246, 252, ${overlayAlpha})`
    : `rgba(7, 11, 20, ${overlayAlpha})`;

  return (
    <div className="bg-canvas-container" aria-hidden="true">
      {/* Background Video Layer */}
      {wallpaperSrc && wallpaperType === 'video' && !videoError && (
        <video
          ref={videoRef}
          key={wallpaperSrc}
          src={wallpaperSrc}
          autoPlay
          loop
          muted
          playsInline
          webkit-playsinline="true"
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          controls={false}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onPause={() => {
            // If paused unexpectedly while document is visible, immediately resume
            if (!document.hidden && !isReducedMotion) {
              setTimeout(safePlay, 50);
            }
          }}
          onError={(e) => {
            console.warn('[BackgroundCanvas] Gagal memutar video background, beralih ke fallback gambar:', e);
            setVideoError(true);
          }}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            filter: bgBlur > 0 ? `blur(${bgBlur}px)` : 'none',
            opacity: wallpaperOpacity,
            pointerEvents: 'none',
            userSelect: 'none',
            zIndex: 0,
            transition: 'opacity 0.4s ease, filter 0.3s ease'
          }}
        />
      )}

      {/* Background Image Layer (or fallback if video failed) */}
      {wallpaperSrc && (wallpaperType === 'image' || (wallpaperType === 'video' && videoError)) && (
        <img
          src={wallpaperType === 'image' ? wallpaperSrc : '/images/anime-wallpaper.jpg'}
          alt=""
          className="bg-canvas-image-tag"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            filter: bgBlur > 0 ? `blur(${bgBlur}px)` : 'none',
            opacity: wallpaperType === 'video' && videoError ? 0.45 : wallpaperOpacity,
            pointerEvents: 'none',
            userSelect: 'none',
            zIndex: 0,
            transition: 'opacity 0.4s ease, filter 0.3s ease'
          }}
        />
      )}

      {/* Default & Minimal ambient glow orbs (only active when no image/video wallpaper is shown) */}
      {!wallpaperSrc && (bgType === 'default' || bgType === 'minimal') && (
        <>
          <div
            className="bg-ambient-glow"
            style={{
              top: '5%',
              left: '10%',
              animationPlayState: isReducedMotion ? 'paused' : 'running',
              opacity: bgType === 'minimal' ? 0.3 : 0.75
            }}
          />
          <div
            className="bg-ambient-glow"
            style={{
              bottom: '10%',
              right: '5%',
              width: '500px',
              height: '500px',
              animationDelay: '-7s',
              animationPlayState: isReducedMotion ? 'paused' : 'running',
              opacity: bgType === 'minimal' ? 0.2 : 0.6
            }}
          />
        </>
      )}

      {/* Dynamic Overlay & Blur Layer */}
      <div
        className="bg-canvas-overlay"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: overlayColor,
          backdropFilter: bgBlur > 0 ? `blur(${bgBlur}px)` : 'none',
          WebkitBackdropFilter: bgBlur > 0 ? `blur(${bgBlur}px)` : 'none',
          pointerEvents: 'none',
          zIndex: 1,
          transition: 'background-color 0.3s ease, backdrop-filter 0.3s ease'
        }}
      />
    </div>
  );
}
