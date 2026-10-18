import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import FormField from './FormField';
import { GraduationCap, Briefcase, Check } from 'lucide-react';
import { validateEducationForm } from '../../utils/validation';
import { useToast } from '../../context/ToastContext';

export default function EducationFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null
}) {
  const toast = useToast();
  const [formData, setFormData] = useState({
    type: 'education',
    institution: '',
    role: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: '',
    highlightsText: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        type: initialData.type || 'education',
        institution: initialData.institution || '',
        role: initialData.role || '',
        startDate: initialData.startDate || '',
        endDate: initialData.endDate || '',
        isCurrent: Boolean(initialData.isCurrent),
        description: initialData.description || '',
        highlightsText: Array.isArray(initialData.highlights) ? initialData.highlights.join('\n') : ''
      });
    } else {
      setFormData({
        type: 'education',
        institution: '',
        role: '',
        startDate: '2023',
        endDate: 'Sekarang',
        isCurrent: true,
        description: '',
        highlightsText: ''
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const validation = validateEducationForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      const firstError = Object.values(validation.errors)[0] || 'Mohon lengkapi riwayat pendidikan/kegiatan.';
      toast.error(firstError);
      return;
    }

    const highlights = (formData.highlightsText || '')
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    onSubmit({
      ...formData,
      highlights
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Riwayat' : 'Tambah Riwayat Pendidikan / Pengalaman'}
      icon={formData.type === 'education' ? GraduationCap : Briefcase}
      maxWidth="600px"
      footer={
        <>
          <button
            type="button"
            className="btn btn-glass btn-sm"
            onClick={onClose}
          >
            Batal
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleSubmit}
          >
            <Check size={16} />
            <span>{initialData ? 'Simpan' : 'Tambahkan'}</span>
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <FormField label="Kategori Riwayat">
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              className={`btn btn-sm ${formData.type === 'education' ? 'btn-primary' : 'btn-glass'}`}
              style={{ flex: 1 }}
              onClick={() => handleChange('type', 'education')}
            >
              <GraduationCap size={15} />
              <span>Pendidikan Formal</span>
            </button>
            <button
              type="button"
              className={`btn btn-sm ${formData.type === 'experience' ? 'btn-primary' : 'btn-glass'}`}
              style={{ flex: 1 }}
              onClick={() => handleChange('type', 'experience')}
            >
              <Briefcase size={15} />
              <span>Organisasi / Kegiatan</span>
            </button>
          </div>
        </FormField>

        <FormField
          label={formData.type === 'education' ? 'Nama Sekolah / Institusi' : 'Nama Organisasi / Kegiatan'}
          required
          error={errors.institution}
        >
          <input
            type="text"
            className={`form-input ${errors.institution ? 'error' : ''}`}
            placeholder={formData.type === 'education' ? 'Contoh:' : 'Contoh: OSIS SMK Negeri 1'}
            value={formData.institution}
            onChange={(e) => handleChange('institution', e.target.value)}
          />
        </FormField>

        <FormField
          label={formData.type === 'education' ? 'Jurusan / Program Keahlian' : 'Jabatan / Peran'}
          required
          error={errors.role}
        >
          <input
            type="text"
            className={`form-input ${errors.role ? 'error' : ''}`}
            placeholder={formData.type === 'education' ? 'Pengembangan Perangkat Lunak dan Gim (PPLG)' : 'Anggota Divisi IT'}
            value={formData.role}
            onChange={(e) => handleChange('role', e.target.value)}
          />
        </FormField>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <FormField label="Tanggal / Tahun Mulai" required error={errors.startDate}>
            <input
              type="text"
              className={`form-input ${errors.startDate ? 'error' : ''}`}
              placeholder="Contoh: Juli 2023"
              value={formData.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
            />
          </FormField>

          <FormField
            label="Tanggal / Tahun Selesai"
            required={!formData.isCurrent}
            error={errors.endDate}
          >
            <input
              type="text"
              className={`form-input ${errors.endDate ? 'error' : ''}`}
              placeholder="Contoh: Juni 2026 atau Sekarang"
              value={formData.isCurrent ? 'Sekarang' : formData.endDate}
              disabled={formData.isCurrent}
              onChange={(e) => handleChange('endDate', e.target.value)}
            />
          </FormField>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <input
            type="checkbox"
            id="isCurrentCheck"
            checked={formData.isCurrent}
            onChange={(e) => {
              handleChange('isCurrent', e.target.checked);
              if (e.target.checked) handleChange('endDate', 'Sekarang');
            }}
            style={{ width: '18px', height: '18px', accentColor: 'var(--accent-color)', cursor: 'pointer' }}
          />
          <label htmlFor="isCurrentCheck" style={{ fontSize: '0.88rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
            Masih sedang berlangsung saat ini
          </label>
        </div>

        <FormField label="Deskripsi Kegiatan & Pembelajaran">
          <textarea
            className="form-textarea"
            rows={3}
            placeholder="Jelaskan mata pelajaran inti, fokus studi, atau tanggung jawab..."
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
        </FormField>

        <FormField label="Poin Utama / Sorotan (Highlights)" hint="Tulis 1 poin per baris">
          <textarea
            className="form-textarea"
            rows={3}
            placeholder="Pemrograman Web & Mobile&#10;Basis Data MySQL&#10;Desain UI/UX"
            value={formData.highlightsText}
            onChange={(e) => handleChange('highlightsText', e.target.value)}
          />
        </FormField>
      </form>
    </Modal>
  );
}
