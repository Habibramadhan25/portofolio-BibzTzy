import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, KeyRound, Sparkles } from 'lucide-react';
import Modal from './Modal';
import { useOwner } from '../../context/OwnerContext';

export default function OwnerAuthModal() {
  const { isAuthModalOpen, closeAuthModal, loginOwner, defaultPin } = useOwner();
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isAuthModalOpen) {
      setPin('');
      setError('');
      setShowPin(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isAuthModalOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!pin.trim()) {
      setError('Harap masukkan PIN pemilik.');
      return;
    }

    const res = loginOwner(pin);
    if (!res.success) {
      setError(res.error || 'PIN tidak valid.');
    }
  };

  return (
    <Modal
      isOpen={isAuthModalOpen}
      onClose={closeAuthModal}
      title="Verifikasi Akses Pemilik"
      icon={ShieldCheck}
      maxWidth="460px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'flex-start'
        }}>
          <Lock size={18} className="text-ice flex-shrink-0" style={{ marginTop: '2px' }} />
          <div>
            <strong style={{ color: '#FFFFFF', display: 'block', marginBottom: '0.2rem' }}>
              Proteksi Data Pribadi & Portofolio
            </strong>
            Fitur edit profil, tambah proyek, keahlian, sertifikat, dan pengaturan data dikunci khusus untuk <strong>Habib Ramadhan</strong> agar tidak dapat diubah oleh pengunjung umum.
          </div>
        </div>

        <div>
          <label
            htmlFor="owner-pin-input"
            style={{
              display: 'block',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              marginBottom: '0.5rem'
            }}
          >
            Masukkan PIN / Sandi Pemilik
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="owner-pin-input"
              ref={inputRef}
              type={showPin ? 'text' : 'password'}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                if (error) setError('');
              }}
              placeholder="Ketik PIN pemilik..."
              className={`form-input ${error ? 'error' : ''}`}
              style={{
                letterSpacing: showPin ? 'normal' : '0.25em',
                fontSize: '1.05rem',
                fontFamily: showPin ? 'inherit' : 'var(--font-mono)',
                paddingRight: '2.5rem'
              }}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px'
              }}
              aria-label={showPin ? 'Sembunyikan PIN' : 'Tampilkan PIN'}
            >
              {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error ? (
            <div style={{ color: 'var(--color-error)', fontSize: '0.78rem', marginTop: '0.4rem', fontWeight: 500 }}>
              {error}
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.4rem' }}>
              Masukkan PIN keamanan Anda untuk membuka hak akses edit portofolio.
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button
            type="button"
            className="btn btn-glass"
            onClick={closeAuthModal}
          >
            Batal
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ gap: '0.5rem' }}
          >
            <KeyRound size={15} />
            <span>Buka Mode Pemilik</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
