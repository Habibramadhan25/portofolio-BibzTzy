import React from 'react';
import { Sparkles, Plus } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Sparkles,
  title = 'Belum Ada Data',
  description = 'Data masih kosong. Anda dapat menambahkan item baru sekarang.',
  actionText,
  onAction,
  actionIcon: ActionIcon = Plus
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={28} />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-desc">{description}</p>
      {actionText && onAction && (
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={onAction}
        >
          {ActionIcon && <ActionIcon size={16} />}
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
}
