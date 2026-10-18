import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useToast } from './ToastContext';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    // Check active session on startup
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured) {
      return {
        success: false,
        error: 'Supabase belum terkonfigurasi. Pastikan VITE_SUPABASE_URL dan VITE_SUPABASE_PUBLISHABLE_KEY telah diisi pada .env.local.'
      };
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      setSession(data.session);
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message || 'Gagal melakukan autentikasi' };
    } finally {
      setIsLoading(false);
    }
  };

  const signInDemo = () => {
    const demoUser = {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'admin.habib@novaglass.local',
      role: 'authenticated',
      user_metadata: { name: 'Habib Ramadhan (Admin Demo)' }
    };
    setSession({ user: demoUser, access_token: 'demo-token' });
    setUser(demoUser);
    toast.success('Masuk sebagai Admin (Mode Pengujian Lokal)');
    return { success: true, user: demoUser };
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
      setSession(null);
      setUser(null);
      toast.info('Sesi admin telah ditutup.');
    } catch (err) {
      console.warn('[AuthContext] Sign out error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      session,
      user,
      isAdmin: Boolean(user),
      isLoading,
      isConfigured: isSupabaseConfigured,
      signIn,
      signInDemo,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
