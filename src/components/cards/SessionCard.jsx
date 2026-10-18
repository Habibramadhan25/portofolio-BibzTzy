import React from 'react';
import { Clock, Calendar, Code2, FolderGit2, Trash2, FileText } from 'lucide-react';
import GlassCard from '../common/GlassCard';

export default function SessionCard({ session, onDelete }) {
  const {
    id,
    title,
    language,
    durationMinutes,
    startedAt,
    completedAt,
    projectTitle,
    notes,
    isSample
  } = session;

  const dateObj = new Date(completedAt || startedAt || Date.now());
  const dateFormatted = dateObj.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  const timeFormatted = dateObj.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <GlassCard interactive style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
            <span className="badge badge-ice" style={{ fontSize: '0.75rem' }}>
              <Code2 size={12} style={{ marginRight: '4px' }} />
              {language}
            </span>
            <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)', fontSize: '0.72rem' }}>
              <Clock size={12} style={{ marginRight: '4px' }} />
              {durationMinutes} Menit
            </span>
            {isSample && (
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', border: '1px solid var(--border-glass)', padding: '1px 5px', borderRadius: '4px' }}>
                Contoh
              </span>
            )}
          </div>

          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {title}
          </h4>
        </div>

        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(session)}
            className="btn btn-glass btn-sm"
            title="Hapus sesi"
            style={{
              padding: '0.3rem 0.65rem',
              fontSize: '0.78rem',
              gap: '0.35rem',
              color: '#f87171',
              borderColor: 'rgba(239, 68, 68, 0.35)',
              background: 'rgba(239, 68, 68, 0.08)'
            }}
          >
            <Trash2 size={13} />
            <span>Hapus</span>
          </button>
        )}
      </div>

      {projectTitle && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', color: 'var(--ice-blue)' }}>
          <FolderGit2 size={14} />
          <span>Terkait Proyek: <strong>{projectTitle}</strong></span>
        </div>
      )}

      {notes && (
        <p style={{
          fontSize: '0.84rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
          background: 'rgba(255, 255, 255, 0.02)',
          padding: '0.6rem 0.75rem',
          borderRadius: 'var(--radius-md)',
          borderLeft: '2px solid var(--border-glass-bright)'
        }}>
          {notes}
        </p>
      )}

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        borderTop: '1px solid var(--border-glass)',
        paddingTop: '0.5rem',
        marginTop: '0.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Calendar size={13} />
          <span>{dateFormatted} • {timeFormatted}</span>
        </div>
        <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>
          +{durationMinutes >= 30 ? '25' : '15'} XP
        </span>
      </div>
    </GlassCard>
  );
}
