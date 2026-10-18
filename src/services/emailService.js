import emailjs from '@emailjs/browser';
import { storageService } from './storageService';

/**
 * Service integrasi pengiriman email langsung ke Gmail menggunakan @emailjs/browser resmi.
 * 
 * Konfigurasi dapat disetel melalui:
 * 1. File .env.local:
 *    - VITE_EMAILJS_SERVICE_ID
 *    - VITE_EMAILJS_TEMPLATE_ID
 *    - VITE_EMAILJS_PUBLIC_KEY
 *    - VITE_EMAILJS_TO_EMAIL (default penerima: habibtzyeeh25@gmail.com)
 * 2. Atau melalui storageService ('bibtzy_emailjs_config') untuk kemudahan pengaturan langsung dari UI.
 */

const STORAGE_KEY = 'bibtzy_emailjs_config';

export const emailService = {
  getServiceId() {
    const stored = storageService.get(STORAGE_KEY, {});
    return stored.serviceId || import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
  },

  getTemplateId() {
    const stored = storageService.get(STORAGE_KEY, {});
    return stored.templateId || import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
  },

  getPublicKey() {
    const stored = storageService.get(STORAGE_KEY, {});
    return stored.publicKey || import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';
  },

  getRecipientEmail() {
    const stored = storageService.get(STORAGE_KEY, {});
    return stored.recipientEmail || import.meta.env.VITE_EMAILJS_TO_EMAIL || 'habibtzyeeh25@gmail.com';
  },

  /**
   * Cek apakah kredensial EmailJS sudah dikonfigurasi (bukan placeholder kosong).
   */
  isConfigured() {
    const isPlaceholder = (val) => {
      if (!val || typeof val !== 'string') return true;
      const lower = val.trim().toLowerCase();
      return (
        !lower ||
        lower.includes('your_') ||
        lower.includes('service_xxx') ||
        lower.includes('template_xxx') ||
        lower.includes('public_key_here') ||
        lower.includes('xxx')
      );
    };

    const sId = this.getServiceId();
    const tId = this.getTemplateId();
    const pKey = this.getPublicKey();

    return Boolean(
      sId &&
      tId &&
      pKey &&
      !isPlaceholder(sId) &&
      !isPlaceholder(tId) &&
      !isPlaceholder(pKey)
    );
  },

  /**
   * Mengambil status konfigurasi untuk ditampilkan di UI / Panduan Setup.
   */
  getConfigStatus() {
    const sId = this.getServiceId();
    const tId = this.getTemplateId();
    const pKey = this.getPublicKey();
    const toEmail = this.getRecipientEmail();
    const stored = storageService.get(STORAGE_KEY, {});
    const isCustomStored = Boolean(stored.serviceId && stored.templateId && stored.publicKey);

    return {
      isConfigured: this.isConfigured(),
      hasServiceId: Boolean(sId),
      hasTemplateId: Boolean(tId),
      hasPublicKey: Boolean(pKey),
      serviceId: sId,
      templateId: tId,
      publicKey: pKey,
      recipientEmail: toEmail,
      isCustomStored
    };
  },

  /**
   * Simpan kredensial EmailJS ke storage lokal (jika user mengatur via modal UI).
   */
  saveCustomConfig({ serviceId, templateId, publicKey, recipientEmail }) {
    storageService.set(STORAGE_KEY, {
      serviceId: (serviceId || '').trim(),
      templateId: (templateId || '').trim(),
      publicKey: (publicKey || '').trim(),
      recipientEmail: (recipientEmail || '').trim() || 'habibtzyeeh25@gmail.com'
    });
  },

  /**
   * Hapus kredensial custom dari storage lokal.
   */
  clearCustomConfig() {
    storageService.remove(STORAGE_KEY);
  },

  /**
   * Mengirim pesan kontak / kerja sama langsung ke Gmail melalui EmailJS (@emailjs/browser).
   * 
   * @param {Object} params
   * @param {string} params.name - Nama lengkap pengirim
   * @param {string} params.email - Alamat email pengirim (untuk Reply-To)
   * @param {string} params.subject - Subjek pesan / kerja sama
   * @param {string} params.message - Isi lengkap pesan
   */
  async sendContactEmail({ name, email, subject, message }) {
    const serviceId = this.getServiceId();
    const templateId = this.getTemplateId();
    const publicKey = this.getPublicKey();
    const recipientEmail = this.getRecipientEmail();

    if (!this.isConfigured()) {
      return {
        success: false,
        notConfigured: true,
        error: 'Layanan EmailJS belum dikonfigurasi. Masukkan VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, dan VITE_EMAILJS_PUBLIC_KEY di .env.local atau melalui menu Panduan Setup.'
      };
    }

    const trimmedName = (name || '').trim();
    const trimmedEmail = (email || '').trim();
    const trimmedSubject = (subject || '').trim() || 'Tawaran Kerja Sama / Pesan Portofolio';
    const trimmedMessage = (message || '').trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      return {
        success: false,
        error: 'Nama lengkap, email, dan isi pesan wajib diisi.'
      };
    }

    // Variabel template disiapkan lengkap agar kompatibel dengan template EmailJS standar
    // Menyediakan {{email}} sesuai template user, serta variasi alias umum lainnya
    const templateParams = {
      // Nama Pengirim
      from_name: trimmedName,
      name: trimmedName,
      user_name: trimmedName,

      // Email Pengirim (target Reply-To pada EmailJS)
      email: trimmedEmail,
      reply_to: trimmedEmail,
      replyTo: trimmedEmail,
      from_email: trimmedEmail,
      user_email: trimmedEmail,
      visitor_email: trimmedEmail,

      // Detail Pesan
      subject: trimmedSubject,
      message: trimmedMessage,

      // Penerima
      to_email: recipientEmail,
      to_name: 'Habib Ramadhan',
      sent_at: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
    };

    if (import.meta.env.DEV) {
      console.info('[emailService] Mengirim email melalui EmailJS:', {
        serviceId,
        templateId,
        visitorEmail: templateParams.email,
        replyTo: templateParams.reply_to,
        toEmail: templateParams.to_email
      });
    }

    try {
      const response = await emailjs.send(
        serviceId,
        templateId,
        templateParams,
        { publicKey }
      );

      if (response && (response.status === 200 || response.text === 'OK')) {
        return {
          success: true,
          status: response.status,
          message: `Pesan kerja sama berhasil dikirim langsung ke Gmail (${recipientEmail})!`
        };
      }

      return {
        success: false,
        error: `Pengiriman gagal (Status: ${response?.status || 'Unknown'}). Periksa template atau kuota EmailJS Anda.`
      };
    } catch (err) {
      console.error('[emailService] EmailJS Error:', err);
      let errorMessage = 'Gagal mengirim pesan melalui EmailJS.';
      if (err?.text) {
        errorMessage = `EmailJS Error: ${err.text}`;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      return {
        success: false,
        error: errorMessage
      };
    }
  }
};
