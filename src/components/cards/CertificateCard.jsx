import React, { useState, useEffect } from 'react';
import GlassCard from '../common/GlassCard';
import { Award, ExternalLink, Eye, Edit3, Trash2, Calendar } from 'lucide-react';
import { certificateService } from '../../services/certificateService';

export default function CertificateCard({
  certificate,
  onPreview,
  onEdit,
  onDelete
}) {
  const { title, issuer, issueDate, category, description, verificationUrl, isSample } = certificate;
  const [mediaSrc, setMediaSrc] = useState(certificate.imageUrl || '/images/avatar.jpg');

  useEffect(() => {
    let isMounted = true;
    certificateService.getCertificateMedia(certificate).then(src => {
      if (isMounted && src) {
        setMediaSrc(src);
      }
    });
    return () => { isMounted = false; };
  }, [certificate]);

  return (
    <GlassCard interactive style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', height: '100%', maxWidth: '520px', width: '100%' }}>
      {/* Thumbnail */}
      <div
        style={{
          width: '100%',
          aspectRatio: '16 / 10',
          minHeight: '200px',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          background: '#090F1C',
          position: 'relative',
          cursor: 'pointer',
          marginBottom: '1rem',
          border: '1px solid var(--border-glass)'
        }}
        onClick={() => onPreview(certificate, mediaSrc)}
      >
        <img
          src={mediaSrc}
          alt={title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform var(--transition-normal)' }}
          className="project-thumb-img"
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, transparent 40%, rgba(7, 11, 20, 0.8) 100%)'
        }} />

        <div style={{
          position: 'absolute',
          top: '0.65rem',
          left: '0.65rem'
        }}>
          <span className="badge badge-ice" style={{ backdropFilter: 'blur(8px)', background: 'rgba(7, 11, 20, 0.75)', fontSize: '0.75rem', padding: '3px 9px' }}>
            <Award size={12} style={{ marginRight: '4px' }} />
            {category || 'Sertifikasi'}
          </span>
        </div>

        <div style={{
          position: 'absolute',
          bottom: '0.65rem',
          right: '0.65rem'
        }}>
          <span className="badge" style={{ background: 'rgba(0, 0, 0, 0.75)', color: 'var(--text-secondary)', fontSize: '0.74rem', padding: '3px 8px' }}>
            <Calendar size={11} style={{ marginRight: '4px' }} />
            {issueDate}
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4 }}>
            {title}
          </h4>
        </div>

        <div style={{ fontSize: '0.86rem', color: 'var(--ice-blue)', fontWeight: 600 }}>
          {issuer}
        </div>

        {description && (
          <p style={{
            fontSize: '0.84rem',
            color: 'var(--text-secondary)',
            lineHeight: '1.55',
            marginTop: '0.2rem',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {description}
          </p>
        )}
      </div>

      {/* Action Footer */}
      <div style={{
        marginTop: '1.1rem',
        paddingTop: '0.85rem',
        borderTop: '1px solid var(--border-glass)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.55rem'
      }}>
        {/* Row 1: Tombol Aksi Publik (Lihat & Verifikasi) */}
        <div style={{ display: 'flex', gap: '0.55rem', width: '100%' }}>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => onPreview(certificate, mediaSrc)}
            style={{ flex: 1, justifyContent: 'center', minHeight: '36px', padding: '0.45rem 0.85rem', fontSize: '0.82rem', gap: '0.4rem' }}
          >
            <Eye size={14} />
            <span>Lihat</span>
          </button>

          {verificationUrl && (
            <a
              href={verificationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-glass btn-sm"
              title="Buka tautan verifikasi sertifikat"
              style={{ flex: 1, justifyContent: 'center', minHeight: '36px', padding: '0.45rem 0.85rem', fontSize: '0.82rem', gap: '0.4rem' }}
            >
              <ExternalLink size={14} />
              <span>Verifikasi</span>
            </a>
          )}
        </div>

        {/* Row 2: Tombol Manajemen Pemilik (Edit & Hapus) */}
        {(onEdit || onDelete) && (
          <div style={{ display: 'flex', gap: '0.55rem', width: '100%' }}>
            {onEdit && (
              <button
                type="button"
                className="btn btn-glass btn-sm"
                onClick={() => onEdit(certificate)}
                title="Edit sertifikat"
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.8rem',
                  gap: '0.4rem',
                  color: 'var(--ice-blue)',
                  borderColor: 'rgba(69, 207, 255, 0.35)',
                  background: 'rgba(69, 207, 255, 0.08)',
                  minHeight: '34px'
                }}
              >
                <Edit3 size={13} />
                <span>Edit</span>
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                className="btn btn-glass btn-sm"
                onClick={() => onDelete(certificate)}
                title="Hapus sertifikat"
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.8rem',
                  gap: '0.4rem',
                  color: '#f87171',
                  borderColor: 'rgba(239, 68, 68, 0.35)',
                  background: 'rgba(239, 68, 68, 0.08)',
                  minHeight: '34px'
                }}
              >
                <Trash2 size={13} />
                <span>Hapus</span>
              </button>
            )}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
