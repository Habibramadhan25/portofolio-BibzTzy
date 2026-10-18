import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, Sparkles } from 'lucide-react';
import Modal from '../common/Modal';
import FormField from './FormField';

export default function SessionFinishModal({ isOpen, onClose, activeSession, durationMinutes, onFinish }) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen && activeSession) {
      setTitle(activeSession.title || 'Sesi Coding');
      setNotes(activeSession.notes || '');
    }
  }, [isOpen, activeSession]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onFinish({
      title: title.trim() || activeSession?.title || 'Sesi Coding',
      notes: notes.trim()
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Selesaikan & Simpan Sesi Belajar"
      icon={CheckCircle2}
      maxWidth="520px"
      footer={
        <>
          <button type="button" className="btn btn-glass btn-sm" onClick={onClose}>
            Kembali
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={handleSubmit}>
            <CheckCircle2 size={16} />
            <span>Simpan Sesi (+{durationMinutes >= 30 ? '25' : '15'} XP)</span>
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Duration highlight card */}
        <div style={{
          padding: '1.25rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(69, 207, 255, 0.08)',
          border: '1px solid var(--border-glass-bright)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Durasi Waktu Nyata:</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--ice-blue)', fontFamily: 'var(--font-mono)' }}>
              {durationMinutes} Menit
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="badge badge-success" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
              <Sparkles size={14} style={{ marginRight: '4px' }} />
              +{durationMinutes >= 30 ? '25 XP (Bonus Fokus)' : '15 XP'}
            </span>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Bahasa: {activeSession?.language}
            </div>
          </div>
        </div>

        <FormField
          label="Judul Sesi"
          name="title"
          type="text"
          value={title}
          onChange={setTitle}
          placeholder="Judul aktivitas coding yang baru selesai"
        />

        <FormField
          label="Catatan Hasil Belajar / Ringkasan"
          name="notes"
          type="textarea"
          rows={3}
          value={notes}
          onChange={setNotes}
          placeholder="Apa saja konsep, fitur, atau pemecahan masalah yang Anda pelajari pada sesi ini?"
        />
      </form>
    </Modal>
  );
}
