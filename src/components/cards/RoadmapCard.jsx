import React from 'react';
import {
  CheckCircle2,
  Clock,
  Circle,
  ExternalLink,
  Edit3,
  Trash2,
  Calendar,
  CheckSquare,
  Square,
  BookOpen
} from 'lucide-react';
import GlassCard from '../common/GlassCard';

export default function RoadmapCard({
  item,
  onStatusChange,
  onToggleChecklist,
  onEdit,
  onDelete
}) {
  const {
    id,
    order,
    title,
    category,
    difficulty,
    status,
    description,
    targetDate,
    completedDate,
    resourceUrl,
    notes,
    checklist = []
  } = item;

  const isCompleted = status === 'completed';
  const isInProgress = status === 'in_progress';

  // Calculate checklist progress
  const completedTasks = checklist.filter(c => c.completed).length;
  const checklistPercent = checklist.length > 0 ? Math.round((completedTasks / checklist.length) * 100) : 0;

  const getStatusBadge = () => {
    if (isCompleted) {
      return (
        <span className="badge badge-success">
          <CheckCircle2 size={12} style={{ marginRight: '4px' }} />
          Selesai (+25 XP)
        </span>
      );
    }
    if (isInProgress) {
      return (
        <span className="badge badge-cyan">
          <Clock size={12} style={{ marginRight: '4px' }} />
          Sedang Dipelajari
        </span>
      );
    }
    return (
      <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)' }}>
        <Circle size={12} style={{ marginRight: '4px' }} />
        Belum Dimulai
      </span>
    );
  };

  const getDifficultyBadge = () => {
    if (difficulty === 'Mahir') return <span className="badge badge-purple">Mahir</span>;
    if (difficulty === 'Menengah') return <span className="badge badge-ice">Menengah</span>;
    return <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.04)', color: 'var(--text-secondary)' }}>Dasar</span>;
  };

  return (
    <GlassCard
      interactive
      className={`roadmap-card status-${status}`}
      style={{
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        borderLeft: isCompleted
          ? '4px solid var(--color-success)'
          : isInProgress
          ? '4px solid var(--accent-color)'
          : '4px solid rgba(255, 255, 255, 0.15)'
      }}
    >
      {/* Top Header Row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: isCompleted ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255, 255, 255, 0.05)',
            border: `1.5px solid ${isCompleted ? 'var(--color-success)' : 'var(--border-glass)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: isCompleted ? 'var(--color-success)' : 'var(--text-secondary)',
            fontFamily: 'var(--font-mono)'
          }}>
            {order || '✦'}
          </span>

          <span className="badge badge-ice" style={{ fontSize: '0.75rem' }}>{category}</span>
          {getDifficultyBadge()}
          {getStatusBadge()}
        </div>

        {/* Action Buttons */}
        {(onEdit || onDelete) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
            {onEdit && (
              <button
                type="button"
                className="btn btn-glass btn-sm"
                onClick={() => onEdit(item)}
                title="Edit topik"
                style={{
                  padding: '0.3rem 0.65rem',
                  fontSize: '0.78rem',
                  gap: '0.35rem',
                  color: 'var(--ice-blue)',
                  borderColor: 'rgba(69, 207, 255, 0.35)',
                  background: 'rgba(69, 207, 255, 0.08)'
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
                onClick={() => onDelete(item)}
                title="Hapus topik"
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
        )}
      </div>

      {/* Title & Description */}
      <div>
        <h3 style={{
          fontSize: '1.2rem',
          fontWeight: 700,
          color: isCompleted ? '#FFFFFF' : 'var(--text-primary)',
          marginBottom: '0.4rem'
        }}>
          {title}
        </h3>
        {description && (
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {description}
          </p>
        )}
      </div>

      {/* Subtasks Checklist */}
      {checklist.length > 0 && (
        <div style={{
          padding: '0.85rem 1rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(13, 21, 36, 0.5)',
          border: '1px solid var(--border-glass)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              Checklist Praktik ({completedTasks}/{checklist.length})
            </span>
            <span className="font-mono text-ice">{checklistPercent}% Selesai</span>
          </div>

          <div className="progress-bar-container" style={{ height: '5px' }}>
            <div className="progress-bar-fill" style={{ width: `${checklistPercent}%` }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.25rem' }}>
            {checklist.map((c) => (
              <div
                key={c.id}
                className={`checklist-item ${c.completed ? 'done' : ''}`}
                onClick={onToggleChecklist ? () => onToggleChecklist(id, c.id) : undefined}
                style={{ cursor: onToggleChecklist ? 'pointer' : 'default' }}
              >
                {c.completed ? (
                  <CheckSquare size={16} className="text-ice flex-shrink-0" />
                ) : (
                  <Square size={16} className="text-muted flex-shrink-0" />
                )}
                <span style={{ flex: 1 }}>{c.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {notes && (
        <div style={{
          fontSize: '0.82rem',
          color: 'var(--text-secondary)',
          background: 'rgba(255, 255, 255, 0.02)',
          padding: '0.65rem 0.85rem',
          borderRadius: 'var(--radius-md)',
          borderLeft: '2px solid var(--border-glass-bright)'
        }}>
          <strong>Catatan:</strong> {notes}
        </div>
      )}

      {/* Bottom Status Changer & Resource Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        borderTop: '1px solid var(--border-glass)',
        paddingTop: '0.75rem'
      }}>
        {/* Quick Status Buttons (Only for Owner) */}
        {onStatusChange ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ubah Status:</span>
            <button
              type="button"
              className={`btn btn-sm ${status === 'not_started' ? 'btn-primary' : 'btn-glass'}`}
              style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem' }}
              onClick={() => onStatusChange(id, 'not_started')}
            >
              Belum
            </button>
            <button
              type="button"
              className={`btn btn-sm ${status === 'in_progress' ? 'btn-primary' : 'btn-glass'}`}
              style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem' }}
              onClick={() => onStatusChange(id, 'in_progress')}
            >
              Pelajari
            </button>
            <button
              type="button"
              className={`btn btn-sm ${status === 'completed' ? 'btn-primary' : 'btn-glass'}`}
              style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem' }}
              onClick={() => onStatusChange(id, 'completed')}
            >
              Selesai
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>Status:</span>
            <strong style={{ color: isCompleted ? 'var(--color-success)' : isInProgress ? 'var(--ice-blue)' : 'var(--text-secondary)' }}>
              {isCompleted ? 'Tuntas' : isInProgress ? 'Sedang Dipelajari' : 'Belum Dimulai'}
            </strong>
          </div>
        )}

        {/* Resource link or Date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.78rem' }}>
          {targetDate && (
            <span style={{ color: 'var(--text-muted)' }}>
              <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Target: {targetDate}
            </span>
          )}

          {resourceUrl && (
            <a
              href={resourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-glass btn-sm"
              style={{ padding: '0.25rem 0.65rem', fontSize: '0.72rem', textDecoration: 'none' }}
            >
              <ExternalLink size={12} />
              <span>Dokumentasi</span>
            </a>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
