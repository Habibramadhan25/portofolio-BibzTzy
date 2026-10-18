import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { storageService } from './storageService';
import { emailService } from './emailService';

const LOCAL_CONTACTS_KEY = 'contact_submissions_local';
const LAST_SENT_KEY = 'last_contact_sent_timestamp';
const MIN_SEND_INTERVAL_MS = 15000; // 15 seconds anti-spam

export const contactService = {
  async sendMessage({ name, email, subject, message }) {
    // 1. Client-side validation
    const trimmedName = (name || '').trim();
    const trimmedEmail = (email || '').trim();
    const trimmedSubject = (subject || '').trim() || 'Tawaran Kerja Sama / Pesan Portofolio';
    const trimmedMessage = (message || '').trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      return { success: false, error: 'Nama, email, dan pesan wajib diisi.' };
    }

    if (trimmedMessage.length > 4000) {
      return { success: false, error: 'Pesan terlalu panjang (maksimal 4000 karakter).' };
    }

    // 2. Anti-spam throttle
    const lastSent = storageService.get(LAST_SENT_KEY, 0);
    const now = Date.now();
    if (now - lastSent < MIN_SEND_INTERVAL_MS) {
      const waitSec = Math.ceil((MIN_SEND_INTERVAL_MS - (now - lastSent)) / 1000);
      return { success: false, error: `Harap tunggu ${waitSec} detik sebelum mengirim pesan berikutnya.` };
    }

    const payload = {
      name: trimmedName,
      email: trimmedEmail,
      subject: trimmedSubject,
      message: trimmedMessage,
      created_at: new Date().toISOString()
    };

    // 3. Kirim email nyata ke Gmail melalui EmailJS (@emailjs/browser)
    const emailResult = await emailService.sendContactEmail(payload);

    if (!emailResult.success) {
      return {
        success: false,
        notConfigured: emailResult.notConfigured || false,
        error: emailResult.error
      };
    }

    // 4. Jika pengiriman email ke Gmail berhasil, catat salinan ke penyimpanan lokal dan Supabase (jika aktif)
    storageService.set(LAST_SENT_KEY, now);
    this.saveLocalMessage(payload);

    if (isSupabaseConfigured && navigator.onLine) {
      try {
        await supabase.from('contact_messages').insert([payload]);
      } catch (err) {
        console.warn('[contactService] Supabase secondary log notice:', err);
      }
    }

    return {
      success: true,
      message: emailResult.message
    };
  },

  saveLocalMessage(item) {
    const list = storageService.get(LOCAL_CONTACTS_KEY, []);
    list.unshift({ ...item, id: `local_msg_${Date.now()}`, status: 'unread' });
    storageService.set(LOCAL_CONTACTS_KEY, list.slice(0, 50));
  },

  getLocalMessages() {
    return storageService.get(LOCAL_CONTACTS_KEY, []);
  },

  // Admin Methods (requires authenticated session)
  async getOnlineMessages() {
    if (!isSupabaseConfigured) {
      return { data: this.getLocalMessages(), isLocal: true };
    }

    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[contactService] Fetch messages error:', error);
        return { data: this.getLocalMessages(), isLocal: true, error: error.message };
      }

      return { data: data || [], isLocal: false };
    } catch (err) {
      return { data: this.getLocalMessages(), isLocal: true, error: err.message };
    }
  },

  async updateStatus(id, newStatus) {
    if (!isSupabaseConfigured || id.startsWith('local_')) {
      const list = this.getLocalMessages();
      const updated = list.map(m => m.id === id ? { ...m, status: newStatus } : m);
      storageService.set(LOCAL_CONTACTS_KEY, updated);
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async deleteMessage(id) {
    if (!isSupabaseConfigured || id.startsWith('local_')) {
      const list = this.getLocalMessages().filter(m => m.id !== id);
      storageService.set(LOCAL_CONTACTS_KEY, list);
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
};
