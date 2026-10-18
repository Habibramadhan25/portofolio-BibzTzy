import React, { createContext, useContext, useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { useToast } from './ToastContext';
import { useTheme } from './ThemeContext';

const OWNER_AUTH_KEY = 'bibtzy_owner_authenticated';
const OWNER_PIN_KEY = 'bibtzy_owner_pin';
const DEFAULT_PIN = '21131';

const OwnerContext = createContext();

export function OwnerProvider({ children }) {
  const [isOwner, setIsOwner] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      // Default: Mode Tamu (Read-Only) agar pengunjung lain tidak bisa mengedit data
      return localStorage.getItem(OWNER_AUTH_KEY) === 'true';
    } catch (_) {
      return false;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const toast = useToast();
  const { playSound } = useTheme();

  // Simpan status pemilik di localStorage agar bertahan pada perangkat pemilik
  useEffect(() => {
    try {
      if (isOwner) {
        localStorage.setItem(OWNER_AUTH_KEY, 'true');
      } else {
        localStorage.removeItem(OWNER_AUTH_KEY);
      }
    } catch (_) {}
  }, [isOwner]);

  const getStoredPin = () => {
    const stored = storageService.get(OWNER_PIN_KEY, null);
    if (!stored || stored === '2109') {
      storageService.set(OWNER_PIN_KEY, DEFAULT_PIN);
      return DEFAULT_PIN;
    }
    return stored;
  };

  const loginOwner = (inputPin) => {
    const trimmed = (inputPin || '').trim();
    const currentPin = getStoredPin();

    // Support current stored PIN, 21131, or master emergency PIN
    if (trimmed === currentPin || trimmed === '21131' || trimmed === '2026') {
      setIsOwner(true);
      setIsAuthModalOpen(false);
      try {
        localStorage.setItem(OWNER_AUTH_KEY, 'true');
      } catch (_) {}
      playSound?.('success');
      toast.success('Mode Pemilik Aktif! Seluruh fitur edit sekarang dapat Anda gunakan.');
      return { success: true };
    }

    playSound?.('click');
    return { success: false, error: 'PIN tidak sesuai. Silakan periksa kembali sandi Anda.' };
  };

  const logoutOwner = () => {
    setIsOwner(false);
    try {
      localStorage.removeItem(OWNER_AUTH_KEY);
    } catch (_) {}
    playSound?.('click');
    toast.info('Mode Pemilik ditutup. Portofolio kembali ke Mode Tamu (Read-Only).');
  };

  const changePin = (oldPin, newPin) => {
    const currentPin = getStoredPin();
    if (oldPin !== currentPin && oldPin !== '2026') {
      return { success: false, error: 'PIN lama tidak sesuai.' };
    }

    if (!newPin || newPin.length < 4) {
      return { success: false, error: 'PIN baru minimal harus 4 digit/karakter.' };
    }

    storageService.set(OWNER_PIN_KEY, newPin.trim());
    toast.success('PIN Mode Pemilik berhasil diperbarui!');
    return { success: true };
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  return (
    <OwnerContext.Provider
      value={{
        isOwner,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        loginOwner,
        logoutOwner,
        changePin,
        defaultPin: DEFAULT_PIN
      }}
    >
      {children}
    </OwnerContext.Provider>
  );
}

export function useOwner() {
  const context = useContext(OwnerContext);
  if (!context) {
    throw new Error('useOwner must be used within OwnerProvider');
  }
  return context;
}
