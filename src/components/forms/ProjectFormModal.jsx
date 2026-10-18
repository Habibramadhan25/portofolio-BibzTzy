import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import FormField from './FormField';
import { Layers, Plus, Check, Upload } from 'lucide-react';
import { validateProjectForm, validateFileSize, normalizeUrl } from '../../utils/validation';
import { useToast } from '../../context/ToastContext';

const CATEGORIES = ['Website', 'Aplikasi', 'UI/UX', 'JavaScript', 'Backend', 'Game Dev', 'Eksperimen'];
const STATUSES = ['Selesai', 'Dalam Proses', 'Konsep'];

export default function ProjectFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null
}) {
  const toast = useToast();
  const [formData, setFormData] = useState({
    title: '',
    category: 'Website',
    shortDesc: '',
    fullDesc: '',
    techStackText: '',
    date: new Date().getFullYear().toString(),
    status: 'Selesai',
    demoUrl: '',
    githubUrl: '',
    thumbnail: '/images/avatar.jpg',
    isFavorite: false
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        category: initialData.category || 'Website',
        shortDesc: initialData.shortDesc || '',
        fullDesc: initialData.fullDesc || '',
        techStackText: Array.isArray(initialData.techStack) ? initialData.techStack.join(', ') : '',
        date: initialData.date || new Date().getFullYear().toString(),
        status: initialData.status || 'Selesai',
        demoUrl: initialData.demoUrl || '',
        githubUrl: initialData.githubUrl || '',
        thumbnail: initialData.thumbnail || '/images/avatar.jpg',
        isFavorite: Boolean(initialData.isFavorite)
      });
    } else {
      setFormData({
        title: '',
        category: 'Website',
        shortDesc: '',
        fullDesc: '',
        techStackText: 'React, Vite, CSS',
        date: new Date().getFullYear().toString(),
        status: 'Selesai',
        demoUrl: '',
        githubUrl: '',
        thumbnail: '/images/avatar.jpg',
        isFavorite: false
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleThumbnailFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const sizeCheck = validateFileSize(file, 4);
    if (!sizeCheck.valid) {
      setErrors(prev => ({ ...prev, thumbnail: sizeCheck.error }));
      toast.error(sizeCheck.error);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({ ...prev, thumbnail: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();

    const preparedData = {
      ...formData,
      demoUrl: normalizeUrl(formData.demoUrl),
      githubUrl: normalizeUrl(formData.githubUrl)
    };

    const validation = validateProjectForm(preparedData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      const firstError = Object.values(validation.errors)[0] || 'Mohon lengkapi formulir proyek dengan benar.';
      toast.error(firstError);
      return;
    }

    const techStack = (preparedData.techStackText || '')
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    onSubmit({
      ...preparedData,
      techStack
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Proyek' : 'Tambah Proyek Baru'}
      icon={Layers}
      maxWidth="640px"
      footer={
        <>
          <button
            type="button"
            id="btn-cancel-project"
            className="btn btn-glass btn-sm"
            onClick={onClose}
          >
            Batal
          </button>
          <button
            type="button"
            id="btn-submit-project"
            className="btn btn-primary btn-sm"
            onClick={handleSubmit}
          >
            <Check size={16} />
            <span>{initialData ? 'Simpan Perubahan' : 'Tambah Proyek'}</span>
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <FormField label="Judul Proyek" required error={errors.title}>
          <input
            type="text"
            id="input-project-title"
            className={`form-input ${errors.title ? 'error' : ''}`}
            placeholder="Contoh: Website Portofolio Interaktif"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
          />
        </FormField>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <FormField label="Kategori" required error={errors.category}>
            <select
              id="input-project-category"
              className="form-select"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c} style={{ background: '#0D1524', color: '#F4F8FF' }}>{c}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Status Proyek" required>
            <select
              id="input-project-status"
              className="form-select"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              {STATUSES.map(s => (
                <option key={s} value={s} style={{ background: '#0D1524', color: '#F4F8FF' }}>{s}</option>
              ))}
            </select>
          </FormField>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <FormField label="Tahun / Tanggal Dibuat">
            <input
              type="text"
              id="input-project-date"
              className="form-input"
              placeholder="Contoh: 2025"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
            />
          </FormField>

          <FormField label="Thumbnail Gambar" hint="Gunakan path/URL atau unggah gambar lokal" error={errors.thumbnail}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="text"
                id="input-project-thumbnail"
                className="form-input"
                placeholder="/images/avatar.jpg atau https://..."
                value={formData.thumbnail}
                onChange={(e) => handleChange('thumbnail', e.target.value)}
                style={{ flex: 1 }}
              />
              <input
                type="file"
                id="projectThumbnailFileInput"
                accept="image/*"
                onChange={handleThumbnailFile}
                style={{ display: 'none' }}
              />
              <label
                htmlFor="projectThumbnailFileInput"
                className="btn btn-glass btn-sm"
                style={{ cursor: 'pointer', padding: '0.5rem 0.75rem', whiteSpace: 'nowrap' }}
                title="Pilih file gambar dari perangkat Anda"
              >
                <Upload size={14} />
                <span>Unggah</span>
              </label>
            </div>
          </FormField>
        </div>

        <FormField label="Teknologi yang Digunakan" hint="Pisahkan dengan koma (misal: React, Vite, Tailwind)">
          <input
            type="text"
            id="input-project-tech-stack"
            className="form-input"
            placeholder="React, CSS3, LocalStorage"
            value={formData.techStackText}
            onChange={(e) => handleChange('techStackText', e.target.value)}
          />
        </FormField>

        <FormField label="Deskripsi Singkat" required error={errors.shortDesc}>
          <input
            type="text"
            id="input-project-short-desc"
            className={`form-input ${errors.shortDesc ? 'error' : ''}`}
            placeholder="Ringkasan 1-2 kalimat untuk kartu proyek..."
            value={formData.shortDesc}
            onChange={(e) => handleChange('shortDesc', e.target.value)}
          />
        </FormField>

        <FormField label="Deskripsi Lengkap" hint="Detail fitur, tantangan yang diselesaikan, dan alur pembuatan">
          <textarea
            id="input-project-full-desc"
            className="form-textarea"
            rows={4}
            placeholder="Jelaskan secara lengkap latar belakang, tujuan, dan fitur utama proyek..."
            value={formData.fullDesc}
            onChange={(e) => handleChange('fullDesc', e.target.value)}
          />
        </FormField>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <FormField label="Tautan Demo (Opsional)" error={errors.demoUrl} hint="https://...">
            <input
              type="url"
              id="input-project-demo-url"
              className={`form-input ${errors.demoUrl ? 'error' : ''}`}
              placeholder="https://demo-proyek.web.app"
              value={formData.demoUrl}
              onChange={(e) => handleChange('demoUrl', e.target.value)}
            />
          </FormField>

          <FormField label="Tautan GitHub (Opsional)" error={errors.githubUrl} hint="https://github.com/...">
            <input
              type="url"
              id="input-project-github-url"
              className={`form-input ${errors.githubUrl ? 'error' : ''}`}
              placeholder="https://github.com/username/repo"
              value={formData.githubUrl}
              onChange={(e) => handleChange('githubUrl', e.target.value)}
            />
          </FormField>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.5rem' }}>
          <input
            type="checkbox"
            id="isFavoriteCheck"
            checked={formData.isFavorite}
            onChange={(e) => handleChange('isFavorite', e.target.checked)}
            style={{ width: '18px', height: '18px', accentColor: 'var(--accent-color)', cursor: 'pointer' }}
          />
          <label htmlFor="isFavoriteCheck" style={{ fontSize: '0.88rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
            Tandai sebagai proyek favorit (tampil di dashboard / highlight)
          </label>
        </div>
      </form>
    </Modal>
  );
}
