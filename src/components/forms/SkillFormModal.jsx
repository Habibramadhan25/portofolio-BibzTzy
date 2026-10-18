import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import FormField from './FormField';
import { Sparkles, Check } from 'lucide-react';
import { validateSkillForm } from '../../utils/validation';
import { useToast } from '../../context/ToastContext';

const SKILL_CATEGORIES = [
  'Frontend',
  'Backend',
  'Programming Languages',
  'Database',
  'Tools',
  'UI/UX Design',
  'Game Dev'
];

const AVAILABLE_ICONS = [
  { id: 'Code2', label: 'Code' },
  { id: 'Palette', label: 'Palette' },
  { id: 'FileCode2', label: 'FileCode' },
  { id: 'Atom', label: 'React/Atom' },
  { id: 'Server', label: 'Server' },
  { id: 'Layers', label: 'Layers' },
  { id: 'Database', label: 'Database' },
  { id: 'GitBranch', label: 'Git' },
  { id: 'Layout', label: 'Design' },
  { id: 'Sparkles', label: 'Sparkles' },
  { id: 'Gamepad2', label: 'Game' }
];

export default function SkillFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null
}) {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    category: 'Frontend',
    proficiency: 75,
    levelLabel: 'Menengah',
    shortDesc: '',
    icon: 'Code2'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        category: initialData.category || 'Frontend',
        proficiency: initialData.proficiency || 75,
        levelLabel: initialData.levelLabel || 'Menengah',
        shortDesc: initialData.shortDesc || '',
        icon: initialData.icon || 'Code2'
      });
    } else {
      setFormData({
        name: '',
        category: 'Frontend',
        proficiency: 75,
        levelLabel: 'Menengah',
        shortDesc: '',
        icon: 'Code2'
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

  const handleProficiencyChange = (val) => {
    const num = Number(val);
    let label = 'Dasar';
    if (num >= 85) label = 'Mahir (Advanced)';
    else if (num >= 65) label = 'Menengah (Intermediate)';
    else if (num >= 40) label = 'Dasar - Menengah';
    else label = 'Dasar (Beginner)';

    setFormData(prev => ({
      ...prev,
      proficiency: num,
      levelLabel: label
    }));
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const validation = validateSkillForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      const firstError = Object.values(validation.errors)[0] || 'Mohon lengkapi formulir keahlian.';
      toast.error(firstError);
      return;
    }

    onSubmit(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Keahlian' : 'Tambah Keahlian Baru'}
      icon={Sparkles}
      maxWidth="540px"
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
        <FormField label="Nama Keterampilan / Teknologi" required error={errors.name}>
          <input
            type="text"
            className={`form-input ${errors.name ? 'error' : ''}`}
            placeholder="Contoh: React.js, TypeScript, Docker"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </FormField>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <FormField label="Kategori" required error={errors.category}>
            <select
              className="form-select"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
            >
              {SKILL_CATEGORIES.map(c => (
                <option key={c} value={c} style={{ background: '#0D1524', color: '#F4F8FF' }}>{c}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Pilih Ikon">
            <select
              className="form-select"
              value={formData.icon}
              onChange={(e) => handleChange('icon', e.target.value)}
            >
              {AVAILABLE_ICONS.map(ic => (
                <option key={ic.id} value={ic.id} style={{ background: '#0D1524', color: '#F4F8FF' }}>
                  {ic.label}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField label={`Tingkat Penguasaan: ${formData.proficiency}% (${formData.levelLabel})`}>
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={formData.proficiency}
            onChange={(e) => handleProficiencyChange(e.target.value)}
            style={{ width: '100%', accentColor: 'var(--accent-color)', cursor: 'pointer' }}
          />
        </FormField>

        <FormField label="Deskripsi Singkat Pengalaman Skill" hint="Jelaskan apa yang sudah Anda buat dengan skill ini">
          <textarea
            className="form-textarea"
            rows={3}
            placeholder="Contoh: Menguasai pembuatan komponen stateful, hook dasar, dan styling modern..."
            value={formData.shortDesc}
            onChange={(e) => handleChange('shortDesc', e.target.value)}
          />
        </FormField>
      </form>
    </Modal>
  );
}
