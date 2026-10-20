import { createClient } from '@supabase/supabase-js';

// Read environment variables safely
const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_URL : '') || '';
const supabaseKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY) || (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_PUBLISHABLE_KEY : '') || '';

// Check if credentials are valid and not dummy placeholders
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('YOUR_PROJECT_ID') &&
  !supabaseKey.includes('YOUR_SUPABASE')
);

// Graceful fallback dummy query builder if unconfigured
const createUnconfiguredHandler = () => {
  return new Proxy({}, {
    get: (target, prop) => {
      if (prop === 'auth') {
        return {
          getSession: async () => ({ data: { session: null }, error: null }),
          getUser: async () => ({ data: { user: null }, error: null }),
          signInWithPassword: async () => ({ data: { user: null, session: null }, error: new Error('Supabase belum dikonfigurasi. Harap lengkapi VITE_SUPABASE_URL dan VITE_SUPABASE_PUBLISHABLE_KEY di .env.local.') }),
          signOut: async () => ({ error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
        };
      }
      if (prop === 'from') {
        return () => ({
          select: () => ({
            order: () => Promise.resolve({ data: [], error: null }),
            eq: () => Promise.resolve({ data: [], error: null }),
            single: () => Promise.resolve({ data: null, error: null }),
            then: (resolve) => resolve({ data: [], error: null })
          }),
          insert: () => Promise.resolve({ data: null, error: new Error('Supabase belum dikonfigurasi.') }),
          update: () => Promise.resolve({ data: null, error: new Error('Supabase belum dikonfigurasi.') }),
          upsert: () => Promise.resolve({ data: null, error: new Error('Supabase belum dikonfigurasi.') }),
          delete: () => Promise.resolve({ data: null, error: new Error('Supabase belum dikonfigurasi.') })
        });
      }
      if (prop === 'storage') {
        return {
          from: () => ({
            upload: () => Promise.resolve({ data: null, error: new Error('Supabase Storage belum dikonfigurasi.') }),
            getPublicUrl: (path) => ({ data: { publicUrl: path } })
          })
        };
      }
      return () => Promise.resolve({ data: null, error: null });
    }
  });
};

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : createUnconfiguredHandler();
