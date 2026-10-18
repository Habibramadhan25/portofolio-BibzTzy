import React from 'react';
import Modal from './Modal';
import { AlertTriangle, Trash2 } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onCancel,
  onConfirm,
  title = 'Konfirmasi Hapus',
  message = 'Apakah Anda yakin ingin menghapus item ini? Tindakan ini tidak dapat dibatalkan.',
  confirmText = 'Hapus',
  cancelText = 'Batal',
  isDanger = true,
  danger,
  isLoading = false
}) {
  const handleClose = onClose || onCancel;
  const isDangerous = danger !== undefined ? danger : isDanger;
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      icon={AlertTriangle}
      maxWidth="460px"
      footer={
        <>
          <button
            type="button"
            id="btn-cancel-delete"
            className="btn btn-glass btn-sm"
            onClick={handleClose}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            id="btn-confirm-delete"
            className={`btn ${isDangerous ? 'btn-danger' : 'btn-primary'} btn-sm`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isDangerous && <Trash2 size={16} />}
            {isLoading ? 'Memproses...' : confirmText}
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
          {message}
        </p>
      </div>
    </Modal>
  );
}
