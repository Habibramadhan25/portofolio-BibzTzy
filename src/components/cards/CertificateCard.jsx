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
    <GlassCard interactive style={{ padding: '1rem', display: 'flex', flexDirection: 'column', height: '100%', maxWidth: '360px' }}>
      {/* Thumbnail */}
      <div
        style={{
          width: '100%',
          height: '135px',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          background: '#090F1C',
          position: 'relative',
          cursor: 'pointer',
          marginBottom: '0.75rem',
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
          top: '0.5rem',
          left: '0.5rem'
        }}>
          <span className="badge badge-ice" style={{ backdropFilter: 'blur(8px)', background: 'rgba(7, 11, 20, 0.75)', fontSize: '0.72rem', padding: '2px 7px' }}>
            <Award size={11} style={{ marginRight: '3px' }} />
            {category || 'Sertifikasi'}
          </span>
        </div>

        <div style={{
          position: 'absolute',
          bottom: '0.5rem',
          right: '0.5rem'
        }}>
          <span className="badge" style={{ background: 'rgba(0, 0, 0, 0.65)', color: 'var(--text-secondary)', fontSize: '0.7rem', padding: '2px 6px' }}>
            <Calendar size={10} style={{ marginRight: '3px' }} />
            {issueDate}
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.35 }}>
            {title}
          </h4>
          {isSample && (
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', border: '1px solid var(--border-glass)', padding: '1px 5px', borderRadius: '4px', flexShrink: 0 }}>
              Contoh
            </span>
          )}
        </div>

        <div style={{ fontSize: '0.78rem', color: 'var(--ice-blue)', fontWeight: 600 }}>
          {issuer}
        </div>

        {description && (
          <p style={{
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
            lineHeight: '1.45',
            marginTop: '0.15rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {description}
          </p>
        )}
      </div>

      {/* Action Footer */}
      <div style={{
        marginTop: '0.75rem',
        paddingTop: '0.6rem',
        borderTop: '1px solid var(--border-glass)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.4rem'
      }}>
        {/* Row 1: Tombol Aksi Publik (Lihat & Verifikasi) */}
        <div style={{ display: 'flex', gap: '0.4rem', width: '100%' }}>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => onPreview(certificate, mediaSrc)}
            style={{ flex: 1, justifyContent: 'center', minHeight: '30px', padding: '0.3rem 0.5rem', fontSize: '0.78rem' }}
          >
            <Eye size={13} />
            <span>Lihat</span>
          </button>

          {verificationUrl && (
            <a
              href={verificationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-glass btn-sm"
              title="Buka tautan verifikasi sertifikat"
              style={{ flex: 1, justifyContent: 'center', minHeight: '30px', padding: '0.3rem 0.5rem', fontSize: '0.78rem' }}
            >
              <ExternalLink size={13} />
              <span>Verifikasi</span>
            </a>
          )}
        </div>

        {/* Row 2: Tombol Manajemen Pemilik (Edit & Hapus) */}
        {(onEdit || onDelete) && (
          <div style={{ display: 'flex', gap: '0.4rem', width: '100%' }}>
            {onEdit && (
              <button
                type="button"
                className="btn btn-glass btn-sm"
                onClick={() => onEdit(certificate)}
                title="Edit sertifikat"
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  padding: '0.3rem 0.5rem',
                  fontSize: '0.76rem',
                  gap: '0.3rem',
                  color: 'var(--ice-blue)',
                  borderColor: 'rgba(69, 207, 255, 0.35)',
                  background: 'rgba(69, 207, 255, 0.08)',
                  minHeight: '28px'
                }}
              >
                <Edit3 size={12} />
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
                  padding: '0.3rem 0.5rem',
                  fontSize: '0.76rem',
                  gap: '0.3rem',
                  color: '#f87171',
                  borderColor: 'rgba(239, 68, 68, 0.35)',
                  background: 'rgba(239, 68, 68, 0.08)',
                  minHeight: '28px'
                }}
              >
                <Trash2 size={12} />
                <span>Hapus</span>
              </button>
            )}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
