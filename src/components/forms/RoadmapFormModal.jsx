import React, { useState, useEffect } from 'react';
import { Compass, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import Modal from '../common/Modal';
import FormField from './FormField';
import { useToast } from '../../context/ToastContext';

const CATEGORIES = ['Frontend', 'Web Core', 'Backend', 'Tools', 'DevOps', 'Lainnya'];
const DIFFICULTIES = ['Dasar', 'Menengah', 'Mahir'];
const STATUSES = [
  { value: 'not_started', label: 'Belum Dimulai' },
  { value: 'in_progress', label: 'Sedang Dipelajari' },
  { value: 'completed', label: 'Selesai' }
];

export default function RoadmapFormModal({ isOpen, onClose, onSubmit, initialData = null }) {
  const toast = useToast();
  const [formData, setFormData] = useState({
    title: '',
    category: 'Frontend',
    difficulty: 'Dasar',
    status: 'not_started',
    description: '',
    targetDate: '',
    resourceUrl: '',
    notes: '',
    checklist: []
  });

  const [newChecklistText, setNewChecklistText] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        category: initialData.category || 'Frontend',
        difficulty: initialData.difficulty || 'Dasar',
        status: initialData.status || 'not_started',
        description: initialData.description || '',
        targetDate: initialData.targetDate || '',
        resourceUrl: initialData.resourceUrl || '',
        notes: initialData.notes || '',
        checklist: Array.isArray(initialData.checklist) ? [...initialData.checklist] : []
      });
    } else {
      setFormData({
        title: '',
        category: 'Frontend',
        difficulty: 'Dasar',
        status: 'not_started',
        description: '',
        targetDate: '',
        resourceUrl: '',
        notes: '',
        checklist: [
          { id: 'c1', text: 'Memahami konsep dasar & teori', completed: false },
          { id: 'c2', text: 'Praktik kode latihan & eksperimen', completed: false }
        ]
      });
    }
    setErrors({});
    setNewChecklistText('');
  }, [initialData, isOpen]);

  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    setFormData(prev => ({
      ...prev,
      checklist: [
        ...prev.checklist,
        { id: `c-${Date.now()}`, text: newChecklistText.trim(), completed: false }
      ]
    }));
    setNewChecklistText('');
  };

  const handleRemoveChecklistItem = (id) => {
    setFormData(prev => ({
      ...prev,
      checklist: prev.checklist.filter(c => c.id !== id)
    }));
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!formData.title.trim()) {
      setErrors({ title: 'Judul materi wajib diisi.' });
      toast.error('Judul materi roadmap wajib diisi.');
      return;
    }
    onSubmit(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Materi Roadmap' : 'Tambah Materi Belajar Baru'}
      icon={Compass}
      maxWidth="640px"
      footer={
        <>
          <button type="button" className="btn btn-glass btn-sm" onClick={onClose}>
            Batal
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={handleSubmit}>
            <CheckCircle2 size={16} />
            <span>{initialData ? 'Simpan Perubahan' : 'Tambahkan ke Roadmap'}</span>
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <FormField
          label="Judul Materi / Topik"
          name="title"
          type="text"
          required
          value={formData.title}
          onChange={(val) => setFormData(p => ({ ...p, title: val }))}
          placeholder="Contoh: State Management dengan Zustand atau Docker Basics"
          error={errors.title}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Kategori Materi</label>
            <select
              className="form-select"
              value={formData.category}
              onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat} style={{ background: '#0D1524', color: '#F4F8FF' }}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Tingkat Kesulitan</label>
            <select
              className="form-select"
              value={formData.difficulty}
              onChange={(e) => setFormData(p => ({ ...p, difficulty: e.target.value }))}
            >
              {DIFFICULTIES.map(dif => (
                <option key={dif} value={dif} style={{ background: '#0D1524', color: '#F4F8FF' }}>
                  {dif}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Status Pembelajaran</label>
            <select
              className="form-select"
              value={formData.status}
              onChange={(e) => setFormData(p => ({ ...p, status: e.target.value }))}
            >
              {STATUSES.map(st => (
                <option key={st.value} value={st.value} style={{ background: '#0D1524', color: '#F4F8FF' }}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>

          <FormField
            label="Target Selesai (Opsional)"
            name="targetDate"
            type="date"
            value={formData.targetDate}
            onChange={(val) => setFormData(p => ({ ...p, targetDate: val }))}
          />
        </div>

        <FormField
          label="Deskripsi Materi"
          name="description"
          type="textarea"
          rows={2}
          value={formData.description}
          onChange={(val) => setFormData(p => ({ ...p, description: val }))}
          placeholder="Ringkasan konsep apa saja yang akan dikuasai pada topik ini..."
        />

        <FormField
          label="Tautan Sumber Belajar (URL)"
          name="resourceUrl"
          type="url"
          value={formData.resourceUrl}
          onChange={(val) => setFormData(p => ({ ...p, resourceUrl: val }))}
          placeholder="https://developer.mozilla.org/ atau dokumentasi resmi"
        />

        {/* Sub-tasks / Checklist Section */}
        <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1rem' }}>
          <div style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Checklist Submateri / Tugas Praktik
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
            {formData.checklist.map((c, idx) => (
              <div
                key={c.id || idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-glass)',
                  fontSize: '0.85rem'
                }}
              >
                <span>{c.text}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveChecklistItem(c.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              className="form-input"
              value={newChecklistText}
              onChange={(e) => setNewChecklistText(e.target.value)}
              placeholder="Tambah submateri baru (tekan Tambah)..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddChecklistItem();
                }
              }}
            />
            <button
              type="button"
              className="btn btn-glass btn-sm"
              onClick={handleAddChecklistItem}
            >
              <Plus size={16} />
              <span>Tambah</span>
            </button>
          </div>
        </div>

        <FormField
          label="Catatan Belajar Tambahan"
          name="notes"
          type="textarea"
          rows={2}
          value={formData.notes}
          onChange={(val) => setFormData(p => ({ ...p, notes: val }))}
          placeholder="Catatan personal, kendala, atau rangkuman..."
        />
      </form>
    </Modal>
  );
}
