import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  Info,
  MessageSquare,
  MessageCircle,
  Zap,
  Loader2,
  Settings as SettingsIcon,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { Github, Instagram } from '../components/common/BrandIcons';
import PageHeader from '../components/common/PageHeader';
import GlassCard from '../components/common/GlassCard';
import FormField from '../components/forms/FormField';
import EmailSetupModal from '../components/common/EmailSetupModal';
import { isValidEmail } from '../utils/validation';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { PageTransition, MotionItem, MotionCard } from '../components/common/MotionWrapper';

import { contactService } from '../services/contactService';
import { emailService } from '../services/emailService';
import confetti from 'canvas-confetti';

export default function Contact() {
  const { profile } = useOutletContext();
  const toast = useToast();
  const { playSound } = useTheme();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState('');
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [emailConfig, setEmailConfig] = useState(() => emailService.getConfigStatus());

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Nama lengkap wajib diisi';
    if (!formData.email.trim()) {
      errs.email = 'Alamat email wajib diisi';
    } else if (!isValidEmail(formData.email)) {
      errs.email = 'Format email tidak valid (contoh: nama@domain.com)';
    }
    if (!formData.subject.trim()) errs.subject = 'Subjek pesan wajib diisi';
    if (!formData.message.trim()) errs.message = 'Isi pesan wajib diisi';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // 1. Pengiriman Instan Real-Time via WhatsApp
  const handleSendWhatsApp = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validate()) {
      playSound?.('notification');
      toast.error('Harap lengkapi formulir dengan benar.');
      return;
    }

    setIsSubmitting(true);
    // Simpan salinan ke inbox lokal secara otomatis di latar belakang
    try {
      contactService.saveLocalMessage({
        ...formData,
        created_at: new Date().toISOString()
      });
    } catch (_) {}

    const waNumber = (profile?.whatsapp || '+62 812-8404-6378').replace(/[^0-9]/g, '');
    const waText = `Halo Habib Ramadhan (BibTzy),\n\n*Nama:* ${formData.name}\n*Email:* ${formData.email}\n*Subjek:* ${formData.subject}\n\n*Pesan:*\n${formData.message}\n\n---\n_Dikirim via Formulir Portofolio BibTzy_`;
    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`;

    window.open(waUrl, '_blank', 'noopener,noreferrer');

    setIsSubmitting(false);
    setIsSubmitted(true);
    setSubmissionFeedback('Membuka WhatsApp secara langsung dengan draf pesan siap kirim.');
    playSound?.('success');
    toast.success('Membuka WhatsApp langsung ke pemilik portofolio...');
    confetti({ particleCount: 35, spread: 60, origin: { y: 0.8 } });
  };

  // 2. Pengiriman Nyata Langsung ke Gmail via EmailJS (@emailjs/browser)
  const handleSendEmailDirect = async (e) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    if (!validate()) {
      playSound?.('notification');
      toast.error('Harap lengkapi formulir dengan benar.');
      return;
    }

    setIsSubmitting(true);
    setSubmissionFeedback('');

    try {
      const result = await contactService.sendMessage(formData);
      setIsSubmitting(false);

      if (result.success) {
        setIsSubmitted(true);
        setSubmissionFeedback(result.message || 'Pesan kerja sama Anda berhasil dikirim langsung ke Gmail!');
        playSound?.('success');
        toast.success('Pesan kerja sama berhasil dikirim langsung ke Gmail!');
        confetti({ particleCount: 50, spread: 75, origin: { y: 0.75 } });
        // Hanya reset formulir jika pengiriman benar-benar sukses dikonfirmasi EmailJS
        setFormData({ name: '', email: '', subject: '', message: '' });
        setErrors({});
      } else {
        playSound?.('notification');
        toast.error(result.error || 'Gagal mengirim pesan ke Gmail.');
        // JANGAN MENGHAPUS ISI FORM jika pengiriman gagal (Persyaratan 9)
        if (result.notConfigured) {
          setIsSetupModalOpen(true);
        }
      }
    } catch (err) {
      setIsSubmitting(false);
      playSound?.('notification');
      toast.error(err.message || 'Terjadi kesalahan sistem saat mengirim pesan.');
      // JANGAN MENGHAPUS ISI FORM jika terjadi error
    }
  };

  // 3. Pengiriman Alternatif Draf via Email Client Bawaan (Mailto)
  const handleSendViaMailto = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validate()) {
      playSound?.('notification');
      toast.error('Harap lengkapi formulir dengan benar.');
      return;
    }

    try {
      contactService.saveLocalMessage({
        ...formData,
        created_at: new Date().toISOString()
      });
    } catch (_) {}

    const targetEmail = emailConfig.recipientEmail || profile?.email || 'habibtzyeeh25@gmail.com';
    const emailSubject = encodeURIComponent(`[Portofolio BibTzy] ${formData.subject}`);
    const emailBody = encodeURIComponent(
      `Halo Habib Ramadhan,\n\nNama Pengirim: ${formData.name}\nEmail Pengirim: ${formData.email}\n\nPesan:\n${formData.message}\n\n---\nDikirim melalui Formulir Portofolio BibTzy`
    );

    const mailtoUrl = `mailto:${targetEmail}?subject=${emailSubject}&body=${emailBody}`;
    window.location.href = mailtoUrl;

    setIsSubmitted(true);
    setSubmissionFeedback('Draf pesan telah disiapkan dan dikirim ke aplikasi email bawaan Anda.');
    toast.success('Membuka aplikasi email bawaan Anda...');
  };

  const handleResetForm = () => {
    setFormData({ name: '', email: '', subject: '', message: '' });
    setErrors({});
    setIsSubmitted(false);
    setSubmissionFeedback('');
  };

  return (
    <PageTransition style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <PageHeader
        badge="KOMUNIKASI"
        title="Hubungi Saya"
        subtitle="Kirimkan pertanyaan, tawaran kolaborasi proyek teknologi, atau informasi kesempatan Praktik Kerja Lapangan (PKL)."
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
        gap: '2rem',
        alignItems: 'start'
      }}>
        {/* Left Column: Direct Contacts & Status */}
        <MotionCard style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <GlassCard style={{ padding: 'clamp(1.25rem, 4vw, 2rem)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(var(--accent-rgb), 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-color)'
              }}>
                <MessageSquare size={18} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                Informasi Kontak
              </h3>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Saya sangat senang menerima masukan atau peluang belajar baru. Silakan hubungi saya melalui jalur komunikasi berikut:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Email */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(69, 207, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--ice-blue)',
                  flexShrink: 0
                }}>
                  <Mail size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Alamat Email</div>
                  <a
                    href={`mailto:${profile?.email || 'habibtzyeeh25@gmail.com'}`}
                    style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}
                  >
                    {profile?.email || 'habibtzyeeh25@gmail.com'}
                  </a>
                </div>
              </div>

              {/* WhatsApp */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(52, 211, 153, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-success)',
                  flexShrink: 0
                }}>
                  <Phone size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>WhatsApp / Telepon</div>
                  <a
                    href={`https://wa.me/${(profile?.whatsapp || '').replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}
                  >
                    {profile?.whatsapp || '+62 812-8404-6378'}
                  </a>
                </div>
              </div>

              {/* Location */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(192, 132, 252, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#C084FC',
                  flexShrink: 0
                }}>
                  <MapPin size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Domisili & Wilayah</div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
                    {profile?.location || 'Bogor, Jawa Barat, Indonesia'}
                  </div>
                </div>
              </div>
            </div>

            {/* Social media links */}
            <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1.25rem', marginTop: '1.5rem' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: 600 }}>
                JARINGAN SOSIAL:
              </div>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                {profile?.github && (
                  <a href={profile.github} target="_blank" rel="noopener noreferrer" className="btn btn-glass btn-sm">
                    <Github size={15} />
                    <span>GitHub</span>
                  </a>
                )}

                {profile?.instagram && (
                  <a href={profile.instagram} target="_blank" rel="noopener noreferrer" className="btn btn-glass btn-sm">
                    <Instagram size={15} />
                    <span>Instagram</span>
                  </a>
                )}
              </div>
            </div>
          </GlassCard>

          {/* Availability Card */}
          <GlassCard style={{ padding: '1.5rem', background: 'rgba(52, 211, 153, 0.06)', border: '1px solid rgba(52, 211, 153, 0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <CheckCircle2 size={18} style={{ color: 'var(--color-success)' }} />
              <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#FFFFFF' }}>
                Status Ketersediaan Siswa
              </h4>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Aktif bersekolah di jenjang kelas {profile?.class || 'XI PPLG 3'}. Terbuka untuk program Praktik Kerja Lapangan (PKL) / Magang Industri serta kolaborasi proyek tugas akhir.
            </p>
          </GlassCard>
        </MotionCard>

        {/* Right Column: Contact Form */}
        <MotionCard>
          <GlassCard style={{ padding: 'clamp(1.25rem, 4vw, 2rem)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Kirim Pesan Kerja Sama
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Kirim pesan langsung ke Gmail <strong>{emailConfig.recipientEmail}</strong> melalui EmailJS resmi.
                </p>
              </div>

              <button
                type="button"
                className="btn btn-glass btn-sm"
                onClick={() => setIsSetupModalOpen(true)}
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                id="btn-open-email-setup"
                title="Buka panduan atau pengaturan kredensial EmailJS"
              >
                <SettingsIcon size={14} className="text-ice" />
                <span>Panduan Setup EmailJS</span>
              </button>
            </div>

            {/* EmailJS Status Banner */}
            {emailConfig.isConfigured ? (
              <div style={{
                padding: '0.65rem 0.9rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(52, 211, 153, 0.08)',
                border: '1px solid rgba(52, 211, 153, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.5rem',
                marginBottom: '1.25rem',
                fontSize: '0.8rem'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34D399' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#34D399', boxShadow: '0 0 6px #34D399' }} />
                  Layanan Gmail Aktif &bull; Penerima: <strong>{emailConfig.recipientEmail}</strong>
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  EmailJS Siap
                </span>
              </div>
            ) : (
              <div style={{
                padding: '0.75rem 0.9rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                marginBottom: '1.25rem',
                fontSize: '0.8rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#FBBF24' }}>
                  <Info size={16} className="flex-shrink-0" />
                  <span>
                    Kredensial EmailJS belum dikonfigurasi. Pesan akan diarahkan dengan panduan setup.
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-glass btn-sm"
                  style={{
                    fontSize: '0.72rem',
                    padding: '0.25rem 0.6rem',
                    color: '#FBBF24',
                    borderColor: 'rgba(245, 158, 11, 0.4)',
                    flexShrink: 0
                  }}
                  onClick={() => setIsSetupModalOpen(true)}
                >
                  Lihat Cara Setup
                </button>
              </div>
            )}

            <form onSubmit={handleSendEmailDirect} noValidate>
              <FormField
                label="Nama Lengkap Anda"
                required
                error={errors.name}
              >
                <input
                  type="text"
                  id="contact-form-name"
                  name="name"
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  disabled={isSubmitting}
                />
              </FormField>

              <FormField
                label="Alamat Email Anda"
                required
                error={errors.email}
              >
                <input
                  type="email"
                  id="contact-form-email"
                  name="email"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="Contoh: budi@gmail.com"
                  disabled={isSubmitting}
                />
              </FormField>

              <FormField
                label="Subjek Pesan / Kerja Sama"
                required
                error={errors.subject}
              >
                <input
                  type="text"
                  id="contact-form-subject"
                  name="subject"
                  className={`form-input ${errors.subject ? 'error' : ''}`}
                  value={formData.subject}
                  onChange={(e) => handleChange('subject', e.target.value)}
                  placeholder="Contoh: Tawaran Magang Frontend / Diskusi Proyek Web"
                  disabled={isSubmitting}
                />
              </FormField>

              <FormField
                label="Isi Pesan Lengkap"
                required
                error={errors.message}
              >
                <textarea
                  id="contact-form-message"
                  name="message"
                  className={`form-textarea ${errors.message ? 'error' : ''}`}
                  rows={5}
                  maxLength={4000}
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  placeholder="Tuliskan pesan, rincian penawaran kerja sama, atau pertanyaan Anda di sini..."
                  disabled={isSubmitting}
                />
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.74rem',
                  color: 'var(--text-muted)',
                  marginTop: '0.35rem'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-success)' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34D399', display: 'inline-block', boxShadow: '0 0 6px #34D399' }} />
                    Integrasi SDK @emailjs/browser
                  </span>
                  <span style={{ color: formData.message.length > 3800 ? '#F87171' : 'var(--text-muted)' }}>
                    {formData.message.length} / 4000 karakter
                  </span>
                </div>
              </FormField>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    flex: '1 1 220px',
                    background: 'linear-gradient(135deg, var(--accent-color) 0%, #0284c7 100%)',
                    boxShadow: '0 0 16px rgba(var(--accent-rgb), 0.35)'
                  }}
                  id="btn-send-email-direct"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Mengirim ke Gmail...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Kirim Pesan ke Gmail</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="btn btn-glass"
                  style={{ flex: '1 1 180px' }}
                  id="btn-send-whatsapp"
                  onClick={handleSendWhatsApp}
                  disabled={isSubmitting}
                  title="Kirim pesan langsung via WhatsApp Chat"
                >
                  <MessageCircle size={16} style={{ color: '#34D399' }} />
                  <span>Chat WhatsApp (Instan)</span>
                </button>

                <button
                  type="button"
                  className="btn btn-glass"
                  id="btn-send-email-client"
                  onClick={handleSendViaMailto}
                  disabled={isSubmitting}
                  title="Buka draf pesan di aplikasi email default Anda"
                >
                  <Mail size={15} />
                  <span>Draf Mailto</span>
                </button>

                <button
                  type="button"
                  className="btn btn-glass"
                  onClick={handleResetForm}
                  disabled={isSubmitting}
                >
                  Reset
                </button>
              </div>

              {isSubmitted && (
                <div style={{
                  marginTop: '1.25rem',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(52, 211, 153, 0.12)',
                  border: '1px solid rgba(52, 211, 153, 0.35)',
                  fontSize: '0.84rem',
                  color: 'var(--color-success)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.6rem'
                }}>
                  <CheckCircle2 size={18} className="flex-shrink-0" style={{ marginTop: '2px' }} />
                  <div>
                    <strong>Pesan Berhasil Diproses!</strong>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2px' }}>
                      {submissionFeedback}
                    </div>
                  </div>
                </div>
              )}
            </form>
          </GlassCard>
        </MotionCard>
      </div>

      {/* Setup Guide Modal */}
      <EmailSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        onConfigSaved={() => setEmailConfig(emailService.getConfigStatus())}
      />
    </PageTransition>
  );
}
