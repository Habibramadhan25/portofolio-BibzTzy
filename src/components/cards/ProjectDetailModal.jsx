import React from 'react';
import Modal from '../common/Modal';
import { ExternalLink, Calendar, CheckCircle2, Clock, Edit3 } from 'lucide-react';
import { Github } from '../common/BrandIcons';

export default function ProjectDetailModal({
  isOpen,
  onClose,
  project,
  onEdit
}) {
  if (!project) return null;

  const {
    title,
    fullDesc,
    shortDesc,
    thumbnail,
    category,
    techStack = [],
    date,
    status,
    demoUrl,
    githubUrl,
    isSample
  } = project;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="680px"
      footer={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {demoUrl && (
              <a
                href={demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm"
              >
                <ExternalLink size={15} />
                <span>Lihat Demo Live</span>
              </a>
            )}
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-glass btn-sm"
              >
                <Github size={15} />
                <span>Source Code</span>
              </a>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {onEdit && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  onClose();
                  onEdit(project);
                }}
                style={{ borderColor: 'rgba(69, 207, 255, 0.45)', color: 'var(--ice-blue)', gap: '0.4rem' }}
                title="Edit data proyek ini"
              >
                <Edit3 size={14} />
                <span>Edit Proyek</span>
              </button>
            )}
            <button
              type="button"
              className="btn btn-glass btn-sm"
              onClick={onClose}
            >
              Tutup
            </button>
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Banner Image */}
        <div style={{
          width: '100%',
          height: '240px',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          position: 'relative',
          background: '#090F1C',
          border: '1px solid var(--border-glass)'
        }}>
          <img
            src={thumbnail || '/images/avatar.jpg'}
            alt={title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, transparent 40%, rgba(7, 11, 20, 0.9) 100%)'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '1rem',
            left: '1rem',
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap'
          }}>
            <span className="badge badge-ice">{category}</span>
            <span className={`badge ${status === 'Selesai' ? 'badge-success' : 'badge-warning'}`}>
              {status}
            </span>
            {date && (
              <span className="badge" style={{ background: 'rgba(0,0,0,0.6)', color: 'var(--text-secondary)' }}>
                <Calendar size={12} style={{ marginRight: '4px' }} />
                {date}
              </span>
            )}
            {isSample && (
              <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>
                Contoh Karya
              </span>
            )}
          </div>
        </div>

        {/* Tech Stack */}
        {techStack.length > 0 && (
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Teknologi & Alat
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {techStack.map((tech, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '0.8rem',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(141, 220, 255, 0.1)',
                    border: '1px solid rgba(141, 220, 255, 0.25)',
                    color: 'var(--ice-blue)',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
            Tentang Proyek
          </div>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
            {fullDesc || shortDesc}
          </p>
        </div>
      </div>
    </Modal>
  );
}
