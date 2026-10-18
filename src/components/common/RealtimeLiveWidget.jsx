import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, ExternalLink, Zap, ChevronUp, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RealtimeLiveWidget({ profile }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const navigate = useNavigate();

  if (isDismissed) return null;

  const waNumber = (profile?.whatsapp || '+62 812-8404-6378').replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent('Halo Habib Ramadhan (BibTzy), saya mengunjungi website portofolio Anda dan ingin berdiskusi.')}`;

  return (
    <div
      id="bibtzy-realtime-widget"
      style={{
        position: 'fixed',
        bottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))',
        right: '1.25rem',
        zIndex: 990,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        pointerEvents: 'none'
      }}
      aria-label="Widget Kontak Real-Time"
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.94 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: 'min(330px, calc(100vw - 1.75rem))',
              background: 'rgba(6, 14, 28, 0.92)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              borderRadius: '16px',
              padding: '1.25rem',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.65), 0 0 25px rgba(56, 189, 248, 0.2)',
              marginBottom: '0.85rem',
              pointerEvents: 'auto',
              color: '#FFFFFF'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ position: 'relative', display: 'flex' }}>
                  <span
                    style={{
                      width: '9px',
                      height: '9px',
                      borderRadius: '50%',
                      background: '#34D399',
                      boxShadow: '0 0 8px #34D399'
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      inset: '-3px',
                      borderRadius: '50%',
                      border: '1px solid #34D399',
                      animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
                      opacity: 0.75
                    }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#E0F2FE' }}>
                    {profile?.name || 'Habib Ramadhan'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#34D399', fontWeight: 600 }}>
                    Online & Respons Cepat
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.6)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Tutup jendela chat"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content text */}
            <p style={{ fontSize: '0.82rem', color: 'rgba(224, 242, 254, 0.85)', lineHeight: 1.5, marginBottom: '1rem' }}>
              Ada pertanyaan seputar proyek, tawaran magang, atau diskusi teknologi? Hubungi langsung via WhatsApp secara real-time.
            </p>

            {/* Action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  borderColor: '#34D399',
                  boxShadow: '0 0 16px rgba(16, 185, 129, 0.4)',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  padding: '0.55rem 1rem'
                }}
              >
                <MessageCircle size={16} />
                <span>Chat via WhatsApp Langsung</span>
                <ExternalLink size={12} style={{ marginLeft: 'auto' }} />
              </a>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/contact');
                }}
                className="btn btn-glass btn-sm"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  fontSize: '0.78rem',
                  padding: '0.45rem 0.85rem'
                }}
              >
                <Zap size={14} className="text-ice" />
                <span>Buka Formulir Kontak Lengkap</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Pill / Button */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setIsOpen(prev => !prev)}
        style={{
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '0.55rem',
          background: 'rgba(6, 14, 28, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(56, 189, 248, 0.4)',
          borderRadius: '9999px',
          padding: '0.55rem 1.05rem',
          color: '#E0F2FE',
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), 0 0 16px rgba(56, 189, 248, 0.25)',
          fontSize: '0.82rem',
          fontWeight: 600,
          letterSpacing: '0.02em',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
        }}
        title={isOpen ? 'Tutup widget kontak' : 'Hubungi via WhatsApp secara real-time'}
        aria-label="Tombol Kontak Real-Time"
      >
        {/* Pulsing Green/Ice Dot */}
        <span style={{ position: 'relative', display: 'flex', width: '8px', height: '8px' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#34D399',
              boxShadow: '0 0 8px #34D399'
            }}
          />
          <span
            style={{
              position: 'absolute',
              inset: '-2px',
              borderRadius: '50%',
              border: '1px solid #34D399',
              animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
              opacity: 0.8
            }}
          />
        </span>

        <MessageCircle size={16} style={{ color: '#34D399' }} />
        <span>Live Contact</span>
        <ChevronUp
          size={14}
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            opacity: 0.7
          }}
        />
      </motion.button>
      <style>{`
        @media (max-width: 640px) {
          #bibtzy-realtime-widget {
            bottom: calc(0.85rem + env(safe-area-inset-bottom, 0px)) !important;
            right: 0.85rem !important;
          }
        }
      `}</style>
    </div>
  );
}
