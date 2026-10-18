import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import FormField from './FormField';
import { Award, Upload, Check, AlertCircle, Trash2 } from 'lucide-react';
import { validateCertificateForm, validateFileSize, validateFileFormat, normalizeUrl } from '../../utils/validation';
import { useToast } from '../../context/ToastContext';

const CATEGORIES = [
  'Web Development',
  'UI/UX Design',
  'Programming',
  'Desain',
  'Basis Data',
  'Lainnya'
];

export default function CertificateFormModal({
  isOpen,
  onClose,
  onSubmit,
  onDelete = null,
  initialData = null
}) {
  const toast = useToast();
  const [formData, setFormData] = useState({
    title: '',
    issuer: '',
    issueDate: '',
    category: 'Web Development',
    description: '',
    imageUrl: '/images/avatar.jpg',
    verificationUrl: ''
  });

  const [categorySelect, setCategorySelect] = useState('Web Development');
  const [customCategory, setCustomCategory] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      const standardCats = ['Web Development', 'UI/UX Design', 'Programming', 'Desain', 'Basis Data'];
      const rawCat = initialData.category || 'Web Development';
      const isStandard = standardCats.includes(rawCat);

      if (isStandard) {
        setCategorySelect(rawCat);
        setCustomCategory('');
      } else {
        setCategorySelect('Lainnya');
        setCustomCategory(rawCat === 'Lainnya' ? '' : rawCat);
      }

      setFormData({
        title: initialData.title || '',
        issuer: initialData.issuer || '',
        issueDate: initialData.issueDate || '',
        category: rawCat,
        description: initialData.description || '',
        imageUrl: initialData.imageUrl || '/images/avatar.jpg',
        verificationUrl: initialData.verificationUrl || ''
      });
      setPreviewUrl(initialData.imageUrl || '');
    } else {
      setCategorySelect('Web Development');
      setCustomCategory('');
      setFormData({
        title: '',
        issuer: '',
        issueDate: new Date().getFullYear().toString(),
        category: 'Web Development',
        description: '',
        imageUrl: '/images/avatar.jpg',
        verificationUrl: ''
      });
      setPreviewUrl('');
    }
    setSelectedFile(null);
    setErrors({});
  }, [initialData, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCategorySelectChange = (val) => {
    setCategorySelect(val);
    if (val !== 'Lainnya') {
      handleChange('category', val);
    } else {
      handleChange('category', customCategory.trim() || 'Lainnya');
    }
  };

  const handleCustomCategoryChange = (val) => {
    setCustomCategory(val);
    handleChange('category', val.trim() || 'Lainnya');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size & format
    const sizeCheck = validateFileSize(file, 5); // 5MB limit
    if (!sizeCheck.valid) {
      setErrors(prev => ({ ...prev, file: sizeCheck.error }));
      return;
    }

    const formatCheck = validateFileFormat(file);
    if (!formatCheck.valid) {
      setErrors(prev => ({ ...prev, file: formatCheck.error }));
      return;
    }

    setErrors(prev => ({ ...prev, file: undefined }));
    setSelectedFile(file);

    // Create object URL for local preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const finalCategory = categorySelect === 'Lainnya'
      ? (customCategory.trim() || 'Lainnya')
      : categorySelect;

    const dataToSubmit = {
      ...formData,
      category: finalCategory,
      verificationUrl: formData.verificationUrl ? normalizeUrl(formData.verificationUrl) : '',
      imageUrl: previewUrl || formData.imageUrl
    };

    const validation = validateCertificateForm(dataToSubmit);
    if (!validation.isValid) {
      setErrors(validation.errors);
      const firstError = Object.values(validation.errors)[0] || 'Mohon lengkapi formulir sertifikat.';
      toast.error(firstError);
      return;
    }

    onSubmit(
      dataToSubmit,
      previewUrl || null
    );
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Sertifikat' : 'Tambah Sertifikat Baru'}
      icon={Award}
      maxWidth="600px"
      footer={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '0.75rem' }}>
          {initialData && onDelete ? (
            <button
              type="button"
              className="btn btn-glass btn-sm"
              style={{
                color: '#f87171',
                borderColor: 'rgba(239, 68, 68, 0.35)',
                background: 'rgba(239, 68, 68, 0.08)',
                gap: '0.4rem',
                marginRight: 'auto'
              }}
              onClick={() => onDelete(initialData)}
              title="Hapus sertifikat ini secara permanen"
            >
              <Trash2 size={15} />
              <span>Hapus Sertifikat</span>
            </button>
          ) : <div />}

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
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
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        <FormField label="Judul Sertifikat" required error={errors.title}>
          <input
            type="text"
            className={`form-input ${errors.title ? 'error' : ''}`}
            placeholder="Contoh: Belajar Dasar Pemrograman Web"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
          />
        </FormField>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <FormField label="Penerbit / Penyelenggara" required error={errors.issuer}>
            <input
              type="text"
              className={`form-input ${errors.issuer ? 'error' : ''}`}
              placeholder="Contoh: Dicoding, Skilvul, BNSP"
              value={formData.issuer}
              onChange={(e) => handleChange('issuer', e.target.value)}
            />
          </FormField>

          <FormField label="Kategori" required>
            <select
              className="form-select"
              value={categorySelect}
              onChange={(e) => handleCategorySelectChange(e.target.value)}
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c} style={{ background: '#0D1524', color: '#F4F8FF' }}>{c}</option>
              ))}
            </select>
          </FormField>
        </div>

        {/* Input Kategori Manual jika pengguna memilih "Lainnya" */}
        {categorySelect === 'Lainnya' && (
          <div style={{ marginTop: '0.25rem' }}>
            <FormField
              label="Ketik Kategori Manual"
              required
              hint="Tuliskan nama kategori sertifikat Anda sendiri (misal: Cybersecurity, Cloud Computing, AI, Jaringan)"
            >
              <input
                type="text"
                autoFocus
                className="form-input"
                placeholder="Contoh: Cybersecurity, Mobile Development, AI..."
                value={customCategory}
                onChange={(e) => handleCustomCategoryChange(e.target.value)}
              />
            </FormField>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <FormField label="Tanggal / Tahun Perolehan" required error={errors.issueDate}>
            <input
              type="text"
              className={`form-input ${errors.issueDate ? 'error' : ''}`}
              placeholder="Contoh: Februari 2024"
              value={formData.issueDate}
              onChange={(e) => handleChange('issueDate', e.target.value)}
            />
          </FormField>

          <FormField label="Tautan Verifikasi (Opsional)" error={errors.verificationUrl} hint="https://...">
            <input
              type="url"
              className={`form-input ${errors.verificationUrl ? 'error' : ''}`}
              placeholder="https://dicoding.com/certificates/..."
              value={formData.verificationUrl}
              onChange={(e) => handleChange('verificationUrl', e.target.value)}
            />
          </FormField>
        </div>

        {/* File Upload / Image Picker */}
        <FormField
          label="Unggah File Sertifikat (Gambar / Dokumen)"
          hint="Mendukung JPG, PNG, WebP (Maksimal 5MB). Tersimpan aman via IndexedDB lokal."
          error={errors.file}
        >
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            padding: '1rem',
            background: 'var(--card-glass)',
            border: '1px dashed var(--border-glass-bright)',
            borderRadius: 'var(--radius-md)',
            alignItems: 'center',
            textAlign: 'center'
          }}>
            <input
              type="file"
              id="certFilePicker"
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <label
              htmlFor="certFilePicker"
              className="btn btn-outline btn-sm"
              style={{ cursor: 'pointer' }}
            >
              <Upload size={16} />
              <span>{selectedFile ? 'Pilih Berkas Lain' : 'Pilih Berkas dari Komputer'}</span>
            </label>
            {selectedFile && (
              <span style={{ fontSize: '0.8rem', color: 'var(--ice-blue)' }}>
                {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </span>
            )}
            {previewUrl && (
              <div style={{ width: '120px', height: '80px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
                <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
          </div>
        </FormField>

        <FormField label="Deskripsi Sertifikat & Kompetensi yang Dicapai">
          <textarea
            className="form-textarea"
            rows={3}
            placeholder="Jelaskan ringkasan materi atau keahlian yang diuji pada sertifikasi ini..."
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
        </FormField>
      </form>
    </Modal>
  );
}
