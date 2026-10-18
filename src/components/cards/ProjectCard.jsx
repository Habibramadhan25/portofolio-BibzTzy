import React, { useState, useRef, useEffect } from 'react';
import { ExternalLink, Heart, Eye, Edit3, Trash2, Maximize2 } from 'lucide-react';
import { Github } from '../common/BrandIcons';
import GlassCard from '../common/GlassCard';
import { useTheme } from '../../context/ThemeContext';
import ImageLightbox from '../common/ImageLightbox';

export default function ProjectCard({
  project,
  onDetail,
  onEdit,
  onDelete,
  onToggleFavorite
}) {
  const { playSound, isReducedMotion } = useTheme();

  const {
    id,
    title,
    shortDesc,
    thumbnail,
    category,
    techStack = [],
    date,
    status,
    demoUrl,
    githubUrl,
    isFavorite,
    isSample
  } = project;

  // 3D Tilt Refs (Direct DOM manipulation for 60fps & rock-solid click stability)
  const cardRef = useRef(null);
  const innerRef = useRef(null);
  const glareRef = useRef(null);
  const rafId = useRef(null);

  // Lightbox State
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Check if touch device
  const [isTouchDevice] = useState(() => (
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(pointer: coarse)').matches
      : false
  ));

  // 3D Pointer Move Handler with requestAnimationFrame (zero React re-renders)
  const handleMouseMove = (e) => {
    if (isReducedMotion || isTouchDevice) return;
    const card = cardRef.current;
    const inner = innerRef.current;
    const glare = glareRef.current;
    if (!card || !inner) return;

    // Jika kursor berada di atas tombol atau footer aksi, hentikan kalkulasi tilt agar klik stabil 100%
    const target = e.target;
    if (target && target.closest && target.closest('button, a, input, select, textarea, .action-footer, .no-tilt')) {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      return;
    }

    if (rafId.current) cancelAnimationFrame(rafId.current);

    rafId.current = requestAnimationFrame(() => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Max 6 deg tilt
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;
      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;

      inner.style.transform = `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.01, 1.01, 1.01)`;
      if (glare) {
        glare.style.background = `radial-gradient(circle at ${glareX.toFixed(1)}% ${glareY.toFixed(1)}%, rgba(var(--accent-rgb), 0.22) 0%, transparent 65%)`;
        glare.style.opacity = '0.55';
      }
    });
  };

  const handleMouseLeave = () => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    if (innerRef.current) {
      innerRef.current.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    }
    if (glareRef.current) {
      glareRef.current.style.opacity = '0';
    }
  };

  useEffect(() => {
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <>
      <div
        ref={cardRef}
        className="card-3d-perspective"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ height: '100%' }}
      >
        <div
          ref={innerRef}
          className={`card-3d-inner ${isReducedMotion ? 'reduced-motion' : ''}`}
          style={{
            height: '100%',
            transform: 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
            transformStyle: 'flat'
          }}
        >
          {/* Specular 3D Light Glare */}
          {!isReducedMotion && !isTouchDevice && (
            <div
              ref={glareRef}
              className="card-3d-glare"
              style={{
                opacity: 0,
                pointerEvents: 'none'
              }}
            />
          )}

          <GlassCard
            className="project-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              padding: '1.25rem',
              position: 'relative',
              overflow: 'hidden',
              backgroundColor: '#080E1B',
              backgroundImage: 'linear-gradient(180deg, #0F1C36 0%, #060B14 100%)',
              border: '1px solid rgba(69, 207, 255, 0.35)',
              boxShadow: '0 12px 35px rgba(0, 0, 0, 0.8), 0 0 20px rgba(69, 207, 255, 0.12)'
            }}
          >
            {/* Thumbnail Container */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                paddingTop: '56.25%', // 16:9 Aspect Ratio
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                marginBottom: '1rem',
                background: '#090F1C',
                border: '1px solid var(--border-glass)',
                cursor: 'pointer'
              }}
              onClick={() => {
                playSound?.('click');
                setIsLightboxOpen(true);
              }}
              title="Klik untuk memperbesar gambar di Lightbox"
            >
              <img
                src={thumbnail || '/images/avatar.jpg'}
                alt={title}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform var(--transition-normal)'
                }}
                className="project-thumb-img"
              />

              {/* Subtle overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, transparent 40%, rgba(7, 11, 20, 0.85) 100%)'
                }}
              />

              {/* Lightbox hint icon on hover */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '0.6rem',
                  left: '0.6rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: 'rgba(7, 11, 20, 0.75)',
                  backdropFilter: 'blur(8px)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.72rem',
                  color: 'var(--ice-blue)',
                  border: '1px solid var(--border-glass)'
                }}
              >
                <Maximize2 size={12} />
                <span>Zoom</span>
              </div>

              {/* Top Badges */}
              <div
                style={{
                  position: 'absolute',
                  top: '0.6rem',
                  left: '0.6rem',
                  display: 'flex',
                  gap: '0.4rem',
                  flexWrap: 'wrap'
                }}
              >
                <span className="badge badge-ice" style={{ backdropFilter: 'blur(8px)', background: 'rgba(7, 11, 20, 0.75)' }}>
                  {category}
                </span>
                {date && (
                  <span className="badge" style={{ backdropFilter: 'blur(8px)', background: 'rgba(7, 11, 20, 0.75)', color: 'var(--text-secondary)' }}>
                    {date}
                  </span>
                )}
              </div>

              {/* Favorite Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  playSound?.('click');
                  onToggleFavorite(id);
                }}
                style={{
                  position: 'absolute',
                  top: '0.6rem',
                  right: '0.6rem',
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(7, 11, 20, 0.7)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid var(--border-glass)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isFavorite ? '#F87171' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
                title={isFavorite ? 'Hapus dari favorit' : 'Tandai favorit'}
                aria-label="Toggle favorit"
              >
                <Heart size={16} fill={isFavorite ? '#F87171' : 'none'} />
              </button>

              {/* Status Badge */}
              {status && (
                <div style={{ position: 'absolute', bottom: '0.6rem', right: '0.6rem' }}>
                  <span className={`badge ${status === 'Selesai' ? 'badge-success' : 'badge-warning'}`}>
                    {status}
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative', zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                <h3
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    transition: 'color var(--transition-fast)'
                  }}
                  className="project-title-clickable"
                  onClick={() => {
                    playSound?.('click');
                    onDetail(project);
                  }}
                  title="Klik untuk melihat detail proyek ini"
                >
                  {title}
                </h3>
              </div>

              <p
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.5',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {shortDesc}
              </p>

              {/* Tech Stack Pills */}
              {techStack.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', margin: '0.5rem 0' }}>
                  {techStack.slice(0, 4).map((tech, index) => (
                    <span
                      key={index}
                      style={{
                        fontSize: '0.72rem',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(141, 220, 255, 0.08)',
                        border: '1px solid rgba(141, 220, 255, 0.15)',
                        color: 'var(--ice-blue)',
                        fontFamily: 'var(--font-mono)'
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                  {techStack.length > 4 && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                      +{techStack.length - 4}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Action Footer */}
            <div
              className="action-footer no-tilt"
              style={{
                marginTop: '1.25rem',
                paddingTop: '0.85rem',
                borderTop: '1px solid var(--border-glass)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
                position: 'relative',
                zIndex: 30,
                pointerEvents: 'auto'
              }}
            >
              {/* Row 1: Primary actions (Detail, Demo, Github) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  id={`btn-detail-project-${id}`}
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1, minWidth: '90px', cursor: 'pointer', position: 'relative', zIndex: 31 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    playSound?.('click');
                    onDetail(project);
                  }}
                  title="Lihat detail lengkap proyek"
                >
                  <Eye size={14} />
                  <span>Detail</span>
                </button>

                {demoUrl && (
                  <a
                    href={demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-glass btn-sm"
                    title="Kunjungi demo proyek"
                    style={{ cursor: 'pointer', position: 'relative', zIndex: 31 }}
                    onClick={() => playSound?.('click')}
                  >
                    <ExternalLink size={14} />
                    <span>Demo</span>
                  </a>
                )}

                {githubUrl && (
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-glass btn-icon btn-sm"
                    title="Buka kode di GitHub"
                    aria-label="Buka kode di GitHub"
                    style={{ cursor: 'pointer', position: 'relative', zIndex: 31 }}
                    onClick={() => playSound?.('click')}
                  >
                    <Github size={14} />
                  </a>
                )}
              </div>

              {/* Row 2: Management actions (Edit & Hapus) - Jelas, Mudah Diklik! */}
              {(onEdit || onDelete) && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: onEdit && onDelete ? '1fr 1fr' : '1fr',
                  gap: '0.45rem',
                  paddingTop: '0.45rem',
                  borderTop: '1px dashed rgba(255, 255, 255, 0.08)',
                  position: 'relative',
                  zIndex: 32,
                  pointerEvents: 'auto'
                }}>
                  {onEdit && (
                    <button
                      type="button"
                      id={`btn-edit-project-${id}`}
                      className="btn btn-glass btn-sm btn-edit-project"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        playSound?.('click');
                        onEdit(project);
                      }}
                      title="Edit judul, deskripsi, atau teknologi proyek ini"
                      style={{
                        gap: '0.4rem',
                        padding: '0.4rem 0.75rem',
                        fontSize: '0.8rem',
                        justifyContent: 'center',
                        color: 'var(--ice-blue)',
                        borderColor: 'rgba(69, 207, 255, 0.35)',
                        background: 'rgba(69, 207, 255, 0.08)',
                        cursor: 'pointer',
                        position: 'relative',
                        zIndex: 35,
                        pointerEvents: 'auto'
                      }}
                    >
                      <Edit3 size={13} />
                      <span>Edit Proyek</span>
                    </button>
                  )}

                  {onDelete && (
                    <button
                      type="button"
                      id={`btn-delete-project-${id}`}
                      className="btn btn-glass btn-sm btn-delete-project"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        playSound?.('click');
                        onDelete(project);
                      }}
                      title="Hapus proyek ini dari portofolio"
                      style={{
                        gap: '0.4rem',
                        padding: '0.4rem 0.75rem',
                        fontSize: '0.8rem',
                        justifyContent: 'center',
                        color: '#f87171',
                        borderColor: 'rgba(239, 68, 68, 0.35)',
                        background: 'rgba(239, 68, 68, 0.08)',
                        cursor: 'pointer',
                        position: 'relative',
                        zIndex: 35,
                        pointerEvents: 'auto'
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
        </div>
      </div>

      {/* Project Image Lightbox */}
      <ImageLightbox
        isOpen={isLightboxOpen}
        images={[{
          url: thumbnail || '/images/avatar.jpg',
          title: title,
          caption: `${category} • ${techStack.join(', ')}`
        }]}
        onClose={() => setIsLightboxOpen(false)}
      />
    </>
  );
}
