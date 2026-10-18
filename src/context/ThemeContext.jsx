import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { storageService } from '../services/storageService';
import { soundService } from '../services/soundService';
import { indexedDbService } from '../services/indexedDbService';

const ThemeContext = createContext();

export const ACCENT_COLORS = [
  { id: 'cyan', name: 'Cyan Neon', hex: '#45CFFF', bg: 'rgba(69, 207, 255, 0.2)' },
  { id: 'ice-blue', name: 'Ice Blue', hex: '#8DDCFF', bg: 'rgba(141, 220, 255, 0.2)' },
  { id: 'frost-purple', name: 'Frost Purple', hex: '#C084FC', bg: 'rgba(192, 132, 252, 0.2)' },
  { id: 'aurora-green', name: 'Aurora Green', hex: '#34D399', bg: 'rgba(52, 211, 153, 0.2)' },
  { id: 'amber-gold', name: 'Amber Gold', hex: '#FBBF24', bg: 'rgba(251, 191, 36, 0.2)' }
];

export const THEME_PRESETS = [
  {
    id: 'ice-blue',
    name: 'Ice Blue (Default)',
    description: 'Anime Ice Blue Glassmorphism khas BibTzy.',
    hex: '#8DDCFF',
    bg: '#070B14'
  },
  {
    id: 'midnight-cyan',
    name: 'Midnight Cyan',
    description: 'Nuansa malam cyber dengan pendaran cyan elektrik.',
    hex: '#00F0FF',
    bg: '#040D17'
  },
  {
    id: 'violet-nebula',
    name: 'Violet Nebula',
    description: 'Kosmik futuristik dengan aksen ungu kristal.',
    hex: '#C084FC',
    bg: '#090614'
  },
  {
    id: 'aurora',
    name: 'Aurora',
    description: 'Gradasi cahaya utara toska zamrud yang sejuk.',
    hex: '#2DD4BF',
    bg: '#041210'
  },
  {
    id: 'minimal-dark',
    name: 'Minimal Dark',
    description: 'Monokrom gelap bersih tanpa warna menyala.',
    hex: '#E4E4E7',
    bg: '#09090B'
  }
];

export const BACKGROUND_TYPES = [
  { id: 'default', name: 'Default Ice Glow', desc: 'Gradasi ambient cyan-es biru dinamis' },
  { id: 'anime', name: 'Anime Theme', desc: 'Latar ilustrasi anime developer aesthetics' },
  { id: 'minimal', name: 'Minimal Ambient', desc: 'Latar gelap bersih dengan pencahayaan lembut' },
  { id: 'custom', name: 'Custom Wallpaper', desc: 'Wallpaper unggahan dari perangkat Anda' },
  { id: 'none', name: 'Tanpa Dekorasi', desc: 'Warna latar solid murni' }
];

export function ThemeProvider({ children }) {
  // Theme & Preset State (Permanently Dark Mode)
  const theme = 'dark';
  const setTheme = () => {};
  const [accent, setAccent] = useState(() => storageService.get('accent', 'cyan'));
  const [preset, setPreset] = useState(() => {
    const saved = storageService.get('theme_preset', 'ice-blue');
    return saved === 'light-glass' ? 'ice-blue' : saved;
  });

  // Background System State
  const [bgType, setBgType] = useState(() => storageService.get('nova_bg_type', 'default'));
  const [bgEnabled, setBgEnabled] = useState(() => storageService.get('nova_bg_enabled', true));
  const [bgOverlay, setBgOverlay] = useState(() => storageService.get('nova_bg_overlay', 45)); // 0 - 90%
  const [bgBlur, setBgBlur] = useState(() => storageService.get('nova_bg_blur', 0)); // 0 - 20px
  const [customWallpaper, setCustomWallpaper] = useState(null);
  const activeObjectUrlRef = useRef(null);

  // Sound System State (Off by default as required)
  const [soundEnabled, setSoundEnabledState] = useState(() => soundService.isEnabled());
  const [soundVolume, setSoundVolumeState] = useState(() => soundService.getVolume());

  // Reduced Motion System State: 'system' | 'reduced' | 'normal'
  const [motionMode, setMotionMode] = useState(() => storageService.get('nova_motion_mode', 'system'));
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);

  // Helper to normalize wallpaper item from IndexedDB
  const normalizeWallpaper = (item) => {
    if (!item) return null;
    const data = item.data !== undefined ? item.data : item;
    const metadata = item.metadata || {};

    let url = '';
    let type = metadata.mediaType || 'image';
    let mimeType = metadata.mimeType || '';

    if (data instanceof Blob || data instanceof File) {
      url = URL.createObjectURL(data);
      activeObjectUrlRef.current = url;
      mimeType = data.type || mimeType;
      if (mimeType.startsWith('video/')) {
        type = 'video';
      } else {
        type = 'image';
      }
      return {
        url,
        type,
        mimeType,
        name: metadata.name || data.name || (type === 'video' ? 'video-wallpaper.mp4' : 'image-wallpaper'),
        size: data.size || metadata.size || 0,
        isBlob: true,
        updatedAt: item.updatedAt || new Date().toISOString()
      };
    }

    if (typeof data === 'string') {
      const isVideo = data.startsWith('data:video/') || metadata.mediaType === 'video';
      return {
        url: data,
        type: isVideo ? 'video' : 'image',
        mimeType: metadata.mimeType || (isVideo ? 'video/mp4' : 'image/jpeg'),
        name: metadata.name || (isVideo ? 'video-wallpaper.mp4' : 'image-wallpaper'),
        size: metadata.size || 0,
        isBlob: false,
        updatedAt: item.updatedAt || new Date().toISOString()
      };
    }

    if (typeof data === 'object' && data?.url) {
      return data;
    }

    return null;
  };

  // Load custom wallpaper from IndexedDB on startup
  useEffect(() => {
    indexedDbService.getFileItem('custom_wallpaper').then((item) => {
      if (item && item.data) {
        if (activeObjectUrlRef.current) {
          try { URL.revokeObjectURL(activeObjectUrlRef.current); } catch {}
          activeObjectUrlRef.current = null;
        }
        const processed = normalizeWallpaper(item);
        if (processed) {
          setCustomWallpaper(processed);
          const currentSavedType = storageService.get('nova_bg_type', null);
          if (currentSavedType === 'custom') {
            setBgType('custom');
          }
        }
      }
    }).catch(err => {
      console.warn('[ThemeContext] Gagal memuat wallpaper dari IndexedDB:', err);
    });

    return () => {
      if (activeObjectUrlRef.current) {
        try { URL.revokeObjectURL(activeObjectUrlRef.current); } catch {}
        activeObjectUrlRef.current = null;
      }
    };
  }, []);

  // System reduced-motion media query listener
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setSystemReducedMotion(mediaQuery.matches);

    const handler = (e) => setSystemReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Resolved effective reduced motion boolean
  const isReducedMotion = motionMode === 'reduced' ? true : motionMode === 'normal' ? false : systemReducedMotion;

  // Apply Theme Mode (permanently dark)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    storageService.set('theme', 'dark');
  }, []);

  // Apply Accent Color
  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accent);
    storageService.set('accent', accent);
  }, [accent]);

  // Apply Preset
  useEffect(() => {
    document.documentElement.setAttribute('data-preset', preset);
    storageService.set('theme_preset', preset);
  }, [preset]);

  // Apply Reduced Motion class & attribute to <html>
  useEffect(() => {
    if (isReducedMotion) {
      document.documentElement.classList.add('reduce-motion');
      document.documentElement.setAttribute('data-reduced-motion', 'true');
    } else {
      document.documentElement.classList.remove('reduce-motion');
      document.documentElement.removeAttribute('data-reduced-motion');
    }
    storageService.set('nova_motion_mode', motionMode);
    storageService.set('reduce-motion', isReducedMotion);
  }, [isReducedMotion, motionMode]);

  // Background state persistence
  useEffect(() => {
    storageService.set('nova_bg_type', bgType);
  }, [bgType]);

  useEffect(() => {
    storageService.set('nova_bg_enabled', bgEnabled);
  }, [bgEnabled]);

  useEffect(() => {
    storageService.set('nova_bg_overlay', bgOverlay);
  }, [bgOverlay]);

  useEffect(() => {
    storageService.set('nova_bg_blur', bgBlur);
  }, [bgBlur]);

  // Toggle Theme (disabled - permanently Dark Mode)
  const toggleTheme = () => {};

  // Sound Controls
  const setSoundEnabled = (val) => {
    soundService.setEnabled(val);
    setSoundEnabledState(val);
  };

  const setSoundVolume = (vol) => {
    soundService.setVolume(vol);
    setSoundVolumeState(vol);
  };

  const playSound = useCallback((type) => {
    soundService.play(type);
  }, []);

  const testSound = () => {
    return soundService.testSound();
  };

  // Custom Wallpaper handler (supports both Image and Video)
  const saveCustomWallpaper = async (fileOrDataUrl, mediaType = 'image', customMetadata = {}) => {
    try {
      const isVideo = mediaType === 'video' ||
        (fileOrDataUrl instanceof Blob && fileOrDataUrl.type.startsWith('video/')) ||
        (typeof fileOrDataUrl === 'string' && fileOrDataUrl.startsWith('data:video/'));

      const meta = {
        mediaType: isVideo ? 'video' : 'image',
        mimeType: fileOrDataUrl?.type || (isVideo ? 'video/mp4' : 'image/jpeg'),
        name: fileOrDataUrl?.name || (isVideo ? 'video-wallpaper.mp4' : 'image-wallpaper'),
        size: fileOrDataUrl?.size || 0,
        ...customMetadata
      };

      await indexedDbService.saveFile('custom_wallpaper', fileOrDataUrl, meta);

      if (activeObjectUrlRef.current) {
        try { URL.revokeObjectURL(activeObjectUrlRef.current); } catch {}
        activeObjectUrlRef.current = null;
      }

      let url = '';
      const isBlob = fileOrDataUrl instanceof Blob || fileOrDataUrl instanceof File;
      if (isBlob) {
        url = URL.createObjectURL(fileOrDataUrl);
        activeObjectUrlRef.current = url;
      } else {
        url = fileOrDataUrl;
      }

      const wallpaperObj = {
        url,
        type: isVideo ? 'video' : 'image',
        mimeType: meta.mimeType,
        name: meta.name,
        size: meta.size,
        isBlob,
        updatedAt: new Date().toISOString()
      };

      setCustomWallpaper(wallpaperObj);
      setBgType('custom');
      setBgEnabled(true);
      storageService.set('nova_bg_type', 'custom');
      storageService.set('nova_bg_enabled', true);
      return { success: true };
    } catch (e) {
      console.warn('Gagal menyimpan wallpaper:', e);
      return { success: false, error: e.message || 'Penyimpanan penuh atau gagal menyimpan wallpaper.' };
    }
  };

  const removeCustomWallpaper = async () => {
    try {
      if (activeObjectUrlRef.current) {
        try { URL.revokeObjectURL(activeObjectUrlRef.current); } catch {}
        activeObjectUrlRef.current = null;
      }
      await indexedDbService.deleteFile('custom_wallpaper');
      setCustomWallpaper(null);
      if (bgType === 'custom') {
        setBgType('default');
        storageService.set('nova_bg_type', 'default');
      }
      return { success: true };
    } catch (e) {
      console.warn('Gagal menghapus wallpaper:', e);
      return { success: false, error: e.message || 'Gagal menghapus wallpaper.' };
    }
  };

  // Reset Appearance (resets only visual tokens, never touches projects/roadmap/XP)
  const resetAppearance = async () => {
    setTheme('dark');
    setAccent('cyan');
    setPreset('ice-blue');
    setBgType('default');
    setBgEnabled(true);
    setBgOverlay(45);
    setBgBlur(0);
    setMotionMode('system');
    setSoundEnabled(false);
    setSoundVolume(50);
    await removeCustomWallpaper();
  };

  return (
    <ThemeContext.Provider value={{
      // Core themes & accents
      theme,
      setTheme,
      toggleTheme,
      accent,
      setAccent,
      accentColors: ACCENT_COLORS,

      // Presets
      preset,
      setPreset,
      presets: THEME_PRESETS,

      // Background System
      bgType,
      setBgType,
      bgEnabled,
      setBgEnabled,
      bgOverlay,
      setBgOverlay,
      bgBlur,
      setBgBlur,
      backgroundTypes: BACKGROUND_TYPES,
      customWallpaper,
      saveCustomWallpaper,
      removeCustomWallpaper,

      // Sound Effects
      soundEnabled,
      setSoundEnabled,
      soundVolume,
      setSoundVolume,
      playSound,
      testSound,

      // Motion
      motionMode,
      setMotionMode,
      isReducedMotion,
      reduceMotion: isReducedMotion,
      setReduceMotion: (bool) => setMotionMode(bool ? 'reduced' : 'normal'),

      // Reset
      resetAppearance
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
