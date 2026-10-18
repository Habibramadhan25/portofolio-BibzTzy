import React from 'react';
import { GraduationCap, Briefcase, Calendar, CheckCircle2, Edit3, Trash2 } from 'lucide-react';

export default function TimelineItem({
  item,
  onEdit,
  onDelete
}) {
  const { id, type, institution, role, startDate, endDate, isCurrent, description, highlights = [], isSample } = item;
  const isEdu = type === 'education';

  return (
    <div className="timeline-item">
      <div className="timeline-marker">
        {isEdu ? <GraduationCap size={16} /> : <Briefcase size={16} />}
      </div>

      <div className="timeline-card">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
              <span className={`badge ${isEdu ? 'badge-ice' : 'badge-purple'}`}>
                {isEdu ? 'Pendidikan' : 'Pengalaman & Kegiatan'}
              </span>
              <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)' }}>
                <Calendar size={12} style={{ marginRight: '4px' }} />
                {startDate} — {isCurrent ? 'Sekarang' : endDate}
              </span>
              {isCurrent && (
                <span className="badge badge-success">
                  Sedang Berlangsung
                </span>
              )}
              {isSample && (
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', border: '1px solid var(--border-glass)', padding: '1px 6px', borderRadius: '4px' }}>
                  Contoh
                </span>
              )}
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {institution}
            </h3>
            <div style={{ fontSize: '0.92rem', color: 'var(--ice-blue)', fontWeight: 600 }}>
              {role}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
            {onEdit && (
              <button
                type="button"
                className="btn btn-glass btn-sm"
                onClick={() => onEdit(item)}
                title="Edit riwayat"
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
                title="Hapus riwayat"
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
        </div>

        {description && (
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '0.75rem' }}>
            {description}
          </p>
        )}

        {highlights && highlights.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', borderTop: '1px solid var(--border-glass)', paddingTop: '0.6rem' }}>
            {highlights.map((h, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                <CheckCircle2 size={13} className="text-ice" style={{ flexShrink: 0 }} />
                <span>{h}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
