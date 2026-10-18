import React, { useState } from 'react';
import Modal from './Modal';
import {
  Mail,
  Key,
  FileCode,
  Check,
  Copy,
  ExternalLink,
  Info,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { emailService } from '../../services/emailService';
import { useToast } from '../../context/ToastContext';

export default function EmailSetupModal({ isOpen, onClose, onConfigSaved }) {
  const toast = useToast();
  const currentStatus = emailService.getConfigStatus();

  const [formConfig, setFormConfig] = useState({
    serviceId: currentStatus.serviceId || '',
    templateId: currentStatus.templateId || '',
    publicKey: currentStatus.publicKey || '',
    recipientEmail: currentStatus.recipientEmail || 'habibtzyeeh25@gmail.com'
  });

  const [copiedEnv, setCopiedEnv] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  const envSnippet = `# Konfigurasi Resmi EmailJS BibTzy Portofolio
VITE_EMAILJS_SERVICE_ID=${formConfig.serviceId || 'service_xxxxxxx'}
VITE_EMAILJS_TEMPLATE_ID=${formConfig.templateId || 'template_xxxxxxx'}
VITE_EMAILJS_PUBLIC_KEY=${formConfig.publicKey || 'your_public_key'}
VITE_EMAILJS_TO_EMAIL=${formConfig.recipientEmail || 'habibtzyeeh25@gmail.com'}`;

  const templateContentSnippet = `Halo Habib Ramadhan,
Anda menerima pesan kerja sama baru dari Formulir Portofolio BibTzy:

Nama Pengirim  : {{name}}
Email Pengirim : {{email}}
Subjek         : {{subject}}

Isi Pesan:
{{message}}

---
Waktu Pengiriman: {{sent_at}}
Balas langsung ke: {{reply_to}}`;

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(envSnippet);
    setCopiedEnv(true);
    toast.success('Snippet .env.local disalin ke clipboard!');
    setTimeout(() => setCopiedEnv(false), 2500);
  };

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(templateContentSnippet);
    setCopiedTemplate(true);
    toast.success('Format template disalin ke clipboard!');
    setTimeout(() => setCopiedTemplate(false), 2500);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formConfig.serviceId.trim() || !formConfig.templateId.trim() || !formConfig.publicKey.trim()) {
      toast.error('Harap isi Service ID, Template ID, dan Public Key.');
      return;
    }

    emailService.saveCustomConfig(formConfig);
    toast.success('Konfigurasi EmailJS berhasil disimpan ke browser!');
    if (onConfigSaved) onConfigSaved();
    onClose();
  };

  const handleReset = () => {
    emailService.clearCustomConfig();
    const fresh = emailService.getConfigStatus();
    setFormConfig({
      serviceId: fresh.serviceId || '',
      templateId: fresh.templateId || '',
      publicKey: fresh.publicKey || '',
      recipientEmail: fresh.recipientEmail || 'habibtzyeeh25@gmail.com'
    });
    toast.info('Konfigurasi storage lokal telah direset.');
    if (onConfigSaved) onConfigSaved();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Panduan & Pengaturan Pengiriman Email (EmailJS)"
      icon={Mail}
      maxWidth="680px"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-glass btn-sm"
            onClick={handleReset}
            title="Hapus pengaturan tersimpan di browser"
          >
            <RotateCcw size={14} />
            <span>Reset Kredensial Browser</span>
          </button>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button
              type="button"
              className="btn btn-glass btn-sm"
              onClick={onClose}
            >
              Tutup
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleSave}
            >
              <Check size={15} />
              <span>Simpan & Terapkan</span>
            </button>
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.88rem' }}>
        
        {/* Security & Architecture Highlight */}
        <div style={{
          padding: '0.85rem 1rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(52, 211, 153, 0.08)',
          border: '1px solid rgba(52, 211, 153, 0.25)',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'flex-start'
        }}>
          <ShieldCheck size={20} style={{ color: 'var(--color-success)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ color: '#FFFFFF', display: 'block', marginBottom: '2px' }}>
              Keamanan Terjamin (Tanpa Password & Tanpa Secret Key)
            </strong>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.5 }}>
              Website ini menggunakan SDK resmi <code>@emailjs/browser</code>. Anda <strong>tidak perlu</strong> memasukkan password akun Gmail pribadi Anda. EmailJS terhubung ke Gmail via OAuth resmi, dan frontend hanya menggunakan Public Key yang aman untuk browser.
            </span>
          </div>
        </div>

        {/* Status Indicator */}
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          background: currentStatus.isConfigured ? 'rgba(52, 211, 153, 0.1)' : 'rgba(245, 158, 11, 0.1)',
          border: `1px solid ${currentStatus.isConfigured ? 'rgba(52, 211, 153, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: currentStatus.isConfigured ? '#34D399' : '#F59E0B',
              boxShadow: `0 0 8px ${currentStatus.isConfigured ? '#34D399' : '#F59E0B'}`
            }} />
            <span style={{ fontWeight: 600, color: currentStatus.isConfigured ? '#34D399' : '#F59E0B' }}>
              Status: {currentStatus.isConfigured ? 'EmailJS Aktif & Terhubung' : 'Kredensial Belum Dikonfigurasi'}
            </span>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Tujuan: <strong>{currentStatus.recipientEmail}</strong>
          </span>
        </div>

        {/* 4 Steps Tutorial */}
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={16} className="text-ice" />
            <span>Cara Mendapatkan Kredensial EmailJS Gratis:</span>
          </h4>

          <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            <li>
              <strong>Buka EmailJS:</strong> Kunjungi{' '}
              <a href="https://dashboard.emailjs.com/sign-up" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ice-blue)', textDecoration: 'underline' }}>
                dashboard.emailjs.com
                <ExternalLink size={12} style={{ display: 'inline', marginLeft: '3px' }} />
              </a>{' '}
              dan buat akun gratis (gratis 200 email/bulan).
            </li>
            <li>
              <strong>Tambahkan Email Service Gmail:</strong> Masuk ke tab <em>Email Services</em> &rarr; <em>Add New Service</em> &rarr; Pilih <strong>Gmail</strong> &rarr; Hubungkan ke akun <strong>{formConfig.recipientEmail}</strong> &rarr; Klik <em>Create Service</em> &rarr; Salin <strong>Service ID</strong> (contoh: <code>service_xxxxxxx</code>).
            </li>
            <li>
              <strong>Buat Email Template:</strong> Masuk ke tab <em>Email Templates</em> &rarr; <em>Create New Template</em>:
              <ul style={{ paddingLeft: '1rem', marginTop: '0.35rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <li>Subject: <code>[Portofolio BibTzy] {`{{subject}}`}</code></li>
                <li>To Email: <code>{`{{to_email}}`}</code> atau langsung <code>{formConfig.recipientEmail}</code></li>
                <li>Reply-To: <code>{`{{email}}`}</code> atau <code>{`{{reply_to}}`}</code> pada tab <em>Settings</em> template EmailJS (agar saat Anda klik reply di Gmail, langsung mengarah ke email pengunjung)</li>
                <li>
                  <button
                    type="button"
                    className="btn btn-glass btn-sm"
                    style={{ fontSize: '0.74rem', padding: '0.2rem 0.5rem', marginTop: '0.25rem' }}
                    onClick={handleCopyTemplate}
                  >
                    {copiedTemplate ? <Check size={12} style={{ color: '#34D399' }} /> : <Copy size={12} />}
                    <span>{copiedTemplate ? 'Template Disalin!' : 'Salin Contoh Isi Template'}</span>
                  </button>
                </li>
              </ul>
              Simpan template dan salin <strong>Template ID</strong> (contoh: <code>template_xxxxxxx</code>).
            </li>
            <li>
              <strong>Ambil Public Key:</strong> Masuk ke menu <em>Account</em> (ikon profil di kiri bawah) &rarr; tab <em>API Keys</em> &rarr; Salin <strong>Public Key</strong> Anda.
            </li>
          </ol>
        </div>

        {/* Setup Option A: .env.local */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.25)',
          border: '1px solid var(--border-glass)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileCode size={15} className="text-ice" />
              <span>Opsi 1: Pasang di file <code>.env.local</code> (Permanen)</span>
            </span>
            <button
              type="button"
              className="btn btn-glass btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
              onClick={handleCopyEnv}
            >
              {copiedEnv ? <Check size={13} style={{ color: '#34D399' }} /> : <Copy size={13} />}
              <span>{copiedEnv ? 'Tersalin' : 'Salin Format'}</span>
            </button>
          </div>
          <pre style={{
            background: 'rgba(0, 0, 0, 0.4)',
            padding: '0.75rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.78rem',
            color: '#A7F3D0',
            overflowX: 'auto',
            margin: 0
          }}>
            {envSnippet}
          </pre>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Simpan di file <code>.env.local</code> pada folder root proyek portofolio, lalu jalankan ulang terminal <code>npm run dev</code>.
          </div>
        </div>

        {/* Setup Option B: Direct Input via Form */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-glass)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem'
        }}>
          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
            <Key size={15} className="text-ice" />
            <span>Opsi 2: Masukkan Kredensial Langsung ke Browser (Instan)</span>
          </span>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                Service ID (Gmail)
              </label>
              <input
                type="text"
                className="form-input"
                style={{ fontSize: '0.82rem', padding: '0.5rem 0.75rem' }}
                placeholder="Contoh: service_01abcde"
                value={formConfig.serviceId}
                onChange={(e) => setFormConfig({ ...formConfig, serviceId: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                Template ID
              </label>
              <input
                type="text"
                className="form-input"
                style={{ fontSize: '0.82rem', padding: '0.5rem 0.75rem' }}
                placeholder="Contoh: template_98xyz12"
                value={formConfig.templateId}
                onChange={(e) => setFormConfig({ ...formConfig, templateId: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                Public Key (User ID)
              </label>
              <input
                type="text"
                className="form-input"
                style={{ fontSize: '0.82rem', padding: '0.5rem 0.75rem' }}
                placeholder="Contoh: aBcDeF123456"
                value={formConfig.publicKey}
                onChange={(e) => setFormConfig({ ...formConfig, publicKey: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                Gmail Penerima
              </label>
              <input
                type="email"
                className="form-input"
                style={{ fontSize: '0.82rem', padding: '0.5rem 0.75rem' }}
                placeholder="habibtzyeeh25@gmail.com"
                value={formConfig.recipientEmail}
                onChange={(e) => setFormConfig({ ...formConfig, recipientEmail: e.target.value })}
              />
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.65rem' }}>
            Data tersimpan aman di <code>localStorage</code> browser Anda untuk pengujian lokal langsung tanpa perlu restart Vite.
          </div>
        </div>

      </div>
    </Modal>
  );
}
