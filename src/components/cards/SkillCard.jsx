import React from 'react';
import GlassCard from '../common/GlassCard';
import {
  Code2,
  Palette,
  FileCode2,
  Atom,
  Server,
  Layers,
  Database,
  GitBranch,
  Layout,
  Sparkles,
  Gamepad2,
  Edit3,
  Trash2
} from 'lucide-react';

const ICON_MAP = {
  Code2,
  Palette,
  FileCode2,
  Atom,
  Server,
  Layers,
  Database,
  GitBranch,
  Layout,
  Sparkles,
  Gamepad2
};

export default function SkillCard({
  skill,
  onEdit,
  onDelete
}) {
  const { id, name, category, proficiency = 50, levelLabel, shortDesc, icon = 'Code2', isSample } = skill;
  const IconComponent = ICON_MAP[icon] || Code2;

  return (
    <GlassCard interactive style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(var(--accent-rgb), 0.12)',
            border: '1px solid var(--border-glass-bright)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-color)'
          }}>
            <IconComponent size={22} />
          </div>

          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {name}
            </h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--ice-blue)' }}>
              {category}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          {onEdit && (
            <button
              type="button"
              className="btn btn-glass btn-sm"
              onClick={() => onEdit(skill)}
              title="Edit keahlian ini"
              style={{
                padding: '0.25rem 0.55rem',
                fontSize: '0.72rem',
                gap: '0.3rem',
                color: 'var(--ice-blue)',
                borderColor: 'rgba(69, 207, 255, 0.3)',
                background: 'rgba(69, 207, 255, 0.08)'
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
              onClick={() => onDelete(skill)}
              title="Hapus keahlian ini"
              style={{
                padding: '0.25rem 0.55rem',
                fontSize: '0.72rem',
                gap: '0.3rem',
                color: '#f87171',
                borderColor: 'rgba(239, 68, 68, 0.35)',
                background: 'rgba(239, 68, 68, 0.08)'
              }}
            >
              <Trash2 size={12} />
              <span>Hapus</span>
            </button>
          )}
        </div>
      </div>

      {shortDesc && (
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.45', margin: 0 }}>
          {shortDesc}
        </p>
      )}

      {/* Progress & Percentage */}
      <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>{levelLabel || 'Tingkat'}</span>
          <span style={{ fontWeight: 700, color: 'var(--accent-color)', fontFamily: 'var(--font-mono)' }}>
            {proficiency}%
          </span>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${Math.min(100, Math.max(0, proficiency))}%` }} />
        </div>
      </div>
    </GlassCard>
  );
}
