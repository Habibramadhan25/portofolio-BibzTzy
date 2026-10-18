import React, { useState, useRef, useEffect, memo } from 'react';
import { ExternalLink, X, ChevronUp } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import '../../styles/music-bar.css';

// SVG Spotify Official Logo Icon
function SpotifyIcon({ size = 14, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.498 17.306c-.218.358-.684.472-1.042.254-2.857-1.745-6.455-2.14-10.693-1.173-.41.093-.815-.164-.908-.573-.093-.41.164-.816.574-.909 4.636-1.06 8.605-.615 11.815 1.348.358.218.472.684.254 1.042zm1.468-3.264c-.274.446-.86.588-1.306.314-3.27-2.01-8.254-2.593-12.12-1.419-.502.152-1.037-.134-1.19-.636-.151-.502.135-1.037.636-1.19 4.417-1.34 9.91-.689 13.666 1.624.446.275.588.861.314 1.307zm.126-3.41c-3.921-2.328-10.38-2.543-14.12-1.407-.601.182-1.24-.16-1.422-.762-.182-.601.16-1.24.762-1.422 4.298-1.305 11.429-1.054 15.936 1.621.54.32.716 1.025.395 1.565-.32.54-1.025.716-1.565.395l.014.01z" />
    </svg>
  );
}

const TRACK_INFO = {
  title: 'The One That Got Away',
  artist: 'Katy Perry',
  spotifyUrl: 'https://open.spotify.com/track/3oL3XRtkP1WVbMxf7dtTdu',
  embedUrl: 'https://open.spotify.com/embed/track/3oL3XRtkP1WVbMxf7dtTdu'
};

// Memoized iframe so it never remounts or leaks memory while audio is playing
const SpotifyEmbedFrame = memo(function SpotifyEmbedFrame() {
  return (
    <div className="music-bar-iframe-wrap">
      <iframe
        src={TRACK_INFO.embedUrl}
        width="100%"
        height="80"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        title="Spotify Embed - The One That Got Away by Katy Perry"
        className="music-bar-spotify-iframe"
      />
    </div>
  );
});

export default function FloatingMusicBar({ className = '', style = {} }) {
  const { playSound } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // 1. Auto-collapse when user clicks Play inside Spotify iframe (window loses focus to iframe)
  useEffect(() => {
    let timer = null;
    const handleWindowBlur = () => {
      if (isOpen) {
        // User clicked inside the Spotify iframe to press Play or interact
        // Automatically collapse back down after 1.5s so they see the playback begin
        timer = setTimeout(() => {
          setIsOpen(false);
        }, 1500);
      }
    };

    window.addEventListener('blur', handleWindowBlur);
    return () => {
      window.removeEventListener('blur', handleWindowBlur);
      if (timer) clearTimeout(timer);
    };
  }, [isOpen]);

  // 2. Auto-collapse when user scrolls anywhere on the page
  useEffect(() => {
    if (!isOpen) return;
    const handleScroll = () => {
      setIsOpen(false);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isOpen]);

  // 3. Auto-collapse safety timer (after 8 seconds of being open without activity, fold back automatically)
  useEffect(() => {
    if (!isOpen) return;
    const autoCloseTimer = setTimeout(() => {
      setIsOpen(false);
    }, 8000);
    return () => clearTimeout(autoCloseTimer);
  }, [isOpen]);

  // 4. Close popover when clicking anywhere outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (isOpen && containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  const toggleOpen = (e) => {
    e.stopPropagation();
    playSound?.('click');
    setIsOpen(prev => !prev);
  };

  return (
    <div
      ref={containerRef}
      className={`floating-music-container ${className}`}
      style={style}
    >
      {/* Floating Popover: Sits cleanly above the mini pill without obstructing page content */}
      <div className={`music-bar-popover ${isOpen ? 'is-open' : 'is-hidden'}`}>
        <div className="music-bar-popover-header">
          <div className="music-bar-popover-title">
            <span className="spotify-green-dot" />
            <span>Spotify Player</span>
          </div>
          <div className="music-bar-popover-actions">
            <a
              href={TRACK_INFO.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="music-bar-mini-action"
              title="Buka di Spotify"
              aria-label="Buka di Spotify"
            >
              <ExternalLink size={12} />
            </a>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="music-bar-mini-action"
              title="Tutup pemutar"
              aria-label="Tutup"
            >
              <X size={13} />
            </button>
          </div>
        </div>

        {/* Persistent iframe in DOM: continuous playback */}
        <SpotifyEmbedFrame />
      </div>

      {/* Mini Bottom Capsule Pill (Takes only 28px height, never blocks content on laptop or HP) */}
      <button
        type="button"
        className={`music-bar-mini-pill ${isOpen ? 'active' : ''}`}
        onClick={toggleOpen}
        title={isOpen ? 'Sembunyikan Pemutar Spotify' : 'Buka Pemutar Spotify (The One That Got Away)'}
        aria-label="Toggle Pemutar Musik Spotify"
      >
        <span className="music-bar-icon-pulse">
          <SpotifyIcon size={14} />
        </span>
        <span className="music-bar-pill-track">
          {TRACK_INFO.title}
        </span>
        <ChevronUp size={12} className={`music-bar-pill-chevron ${isOpen ? 'rotate' : ''}`} />
      </button>
    </div>
  );
}
