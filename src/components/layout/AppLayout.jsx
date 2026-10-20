import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff } from 'lucide-react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import MobileNavigation from './MobileNavigation';
import Footer from './Footer';
import CommandPalette from '../common/CommandPalette';
import BackgroundCanvas from './BackgroundCanvas';
import EntranceAnimation from '../common/EntranceAnimation';
import OwnerAuthModal from '../common/OwnerAuthModal';
import RealtimeLiveWidget from '../common/RealtimeLiveWidget';
import ChibiMascot from '../common/ChibiMascot';
import FloatingMusicBar from '../common/FloatingMusicBar';
import NovaAIChatModal from '../nova-ai/NovaAIChatModal';
import { profileService } from '../../services/profileService';
import { onlineSyncService } from '../../services/onlineSyncService';
import { useTheme } from '../../context/ThemeContext';

export default function AppLayout() {
  const [profile, setProfile] = useState(() => profileService.getProfile());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState(false);
  const [isNovaAIOpen, setIsNovaAIOpen] = useState(false);
  const [novaAiInitialMode, setNovaAiInitialMode] = useState('general');
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));

  const location = useLocation();
  const navigate = useNavigate();
  const { playSound, isReducedMotion } = useTheme();

  // Pantau status penyelesaian loading entrance agar halaman utama muncul secara halus
  const [isEntranceComplete, setIsEntranceComplete] = useState(false);

  const handleEntranceComplete = useCallback(() => {
    setIsEntranceComplete(true);
  }, []);


  // Otomatis menutup navigasi sidebar/drawer & scroll ke paling atas saat rute berpindah
  useEffect(() => {
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.pathname]);

  useEffect(() => {
    const handleStorageUpdate = (e) => {
      if (!e.detail || e.detail.key === 'profile') {
        setProfile(profileService.getProfile());
      }
    };

    const handleStorageReset = () => {
      setProfile(profileService.getProfile());
    };

    window.addEventListener('nova-glass-storage-updated', handleStorageUpdate);
    window.addEventListener('nova-glass-storage-reset', handleStorageReset);

    // Online / Offline Detection
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Global Shortcut Listener:
    // Ctrl+K -> Command Palette
    // Ctrl+J or Alt+A -> NOVA AI Assistant
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCmdPaletteOpen(prev => !prev);
      } else if (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j') || (e.altKey && e.key.toLowerCase() === 'a')) {
        e.preventDefault();
        setIsNovaAIOpen(prev => !prev);
      }
    };

    const handleOpenNovaAI = (e) => {
      if (e?.detail?.mode) {
        setNovaAiInitialMode(e.detail.mode);
      }
      setIsNovaAIOpen(true);
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    window.addEventListener('nova-ai-open', handleOpenNovaAI);

    // Inisialisasi langganan real-time cloud Supabase (jika terkonfigurasi)
    const realtimeSub = onlineSyncService.initRealtimeSubscription();

    return () => {
      window.removeEventListener('nova-glass-storage-updated', handleStorageUpdate);
      window.removeEventListener('nova-glass-storage-reset', handleStorageReset);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('keydown', handleGlobalKeyDown);
      window.removeEventListener('nova-ai-open', handleOpenNovaAI);
      realtimeSub.unsubscribe();
    };
  }, []);

  const handleCloseNavigation = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="app-container">
      {/* Animasi Masuk Website (Splash Screen) */}
      <EntranceAnimation onComplete={handleEntranceComplete} />

      {/* Dynamic Background Canvas & Wallpaper */}
      <BackgroundCanvas />

      {/* Offline Status Warning Pill */}
      {!isOnline && (
        <div className="pwa-offline-pill animate-bounce-subtle" role="status">
          <WifiOff size={14} />
          <span>Mode Offline — Menyajikan data lokal perangkat</span>
        </div>
      )}

      {/* Desktop Sidebar */}
      <Sidebar profile={profile} onItemClick={handleCloseNavigation} />

      {/* Mobile Drawer Navigation (Sidebar Mobile) */}
      <MobileNavigation
        isOpen={isMobileMenuOpen}
        onClose={handleCloseNavigation}
        profile={profile}
      />

      {/* Main Content Wrapper dengan transisi fade-in dan gerakan naik halus */}
      <motion.div
        className="main-wrapper"
        initial={!isEntranceComplete && !isReducedMotion ? { opacity: 0, y: 16 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        <Navbar
          onOpenMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
          onOpenCommandPalette={() => setIsCmdPaletteOpen(true)}
          profile={profile}
        />

        <main className={`page-container ${location.pathname === '/' ? 'page-container-home' : ''}`}>
          <Outlet context={{ profile, setProfile }} />
        </main>

        <Footer profile={profile} />
      </motion.div>

      {/* Global Command Palette Modal */}
      <CommandPalette
        isOpen={isCmdPaletteOpen}
        onClose={() => setIsCmdPaletteOpen(false)}
        onTriggerEntrance={() => {
          setIsCmdPaletteOpen(false);
          setIsEntranceComplete(false);
          window.dispatchEvent(new CustomEvent('nova-glass-trigger-entrance'));
        }}
      />

      {/* Global Owner Authentication PIN Modal */}
      <OwnerAuthModal />

      {/* Floating Real-Time Live Contact & WhatsApp Widget */}
      <RealtimeLiveWidget profile={profile} />

      {/* Maskot Chibi Interaktif Pendamping Halaman */}
      <ChibiMascot />

      {/* Floating Music Bar (Spotify Track: The One That Got Away - Katy Perry) */}
      <FloatingMusicBar />

      {/* NOVA AI Voice & Owner Assistant Modal */}
      <NovaAIChatModal
        isOpen={isNovaAIOpen}
        initialMode={novaAiInitialMode}
        onClose={() => setIsNovaAIOpen(false)}
      />
    </div>
  );
}
