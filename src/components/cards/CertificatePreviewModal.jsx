import React from 'react';
import Modal from '../common/Modal';
import { Award, ExternalLink, Calendar } from 'lucide-react';

export default function CertificatePreviewModal({
  isOpen,
  onClose,
  certificate,
  mediaSrc
}) {
  if (!certificate) return null;

  const { title, issuer, issueDate, category, description, verificationUrl } = certificate;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={Award}
      maxWidth="720px"
      footer={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          {verificationUrl ? (
            <a
              href={verificationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm"
            >
              <ExternalLink size={15} />
              <span>Verifikasi Resmi di Website Penerbit</span>
            </a>
          ) : <div />}
          <button
            type="button"
            className="btn btn-glass btn-sm"
            onClick={onClose}
          >
            Tutup
          </button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Certificate Full Image Preview */}
        <div style={{
          width: '100%',
          maxHeight: '420px',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          background: '#04070D',
          border: '1px solid var(--border-glass-bright)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)'
        }}>
          <img
            src={mediaSrc || certificate.imageUrl || '/images/avatar.jpg'}
            alt={title}
            style={{ maxWidth: '100%', maxHeight: '420px', objectFit: 'contain' }}
          />
        </div>

        {/* Certificate Meta Details */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span className="badge badge-ice">
            {category || 'Sertifikat'}
          </span>
          <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-secondary)' }}>
            <Calendar size={13} style={{ marginRight: '4px' }} />
            {issueDate}
          </span>
          <span style={{ fontSize: '0.9rem', color: 'var(--ice-blue)', fontWeight: 600 }}>
            Penerbit: {issuer}
          </span>
        </div>

        {description && (
          <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '0.75rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Deskripsi & Cakupan Materi
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              {description}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
