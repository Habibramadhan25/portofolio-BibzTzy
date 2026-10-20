import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import FormField from './FormField';
import { User, Check, RefreshCw, Upload } from 'lucide-react';
import { validateProfileForm, validateFileSize, normalizeUrl } from '../../utils/validation';
import { DEFAULT_PROFILE } from '../../services/profileService';
import { useToast } from '../../context/ToastContext';

export default function ProfileEditModal({
  isOpen,
  onClose,
  profile,
  onSave,
  onReset
}) {
  const toast = useToast();
  const [formData, setFormData] = useState({ ...DEFAULT_PROFILE });
  const [errors, setErrors] = useState({});
  const [avatarPreview, setAvatarPreview] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData({
        ...profile,
        birthDate: profile.birthDate || '',
        closeFriendsText: Array.isArray(profile.closeFriends) ? profile.closeFriends.join(', ') : (profile.closeFriends || ''),
        interestsText: Array.isArray(profile.interests) ? profile.interests.join(', ') : '',
        languagesText: Array.isArray(profile.languages) ? profile.languages.join(', ') : ''
      });
      setAvatarPreview(profile.avatar || '/images/avatar.jpg');
    }
    setErrors({});
  }, [profile, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleAvatarFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const sizeCheck = validateFileSize(file, 4);
    if (!sizeCheck.valid) {
      setErrors(prev => ({ ...prev, avatar: sizeCheck.error }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result);
      setFormData(prev => ({ ...prev, avatar: reader.result, avatarType: 'custom' }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();

    const preparedData = {
      ...formData,
      github: formData.github ? normalizeUrl(formData.github) : '',
      instagram: formData.instagram ? normalizeUrl(formData.instagram) : ''
    };

    const validation = validateProfileForm(preparedData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      const firstError = Object.values(validation.errors)[0] || 'Mohon periksa data profil yang wajib diisi.';
      toast.error(firstError);
      return;
    }

    const interests = (preparedData.interestsText || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const languages = (preparedData.languagesText || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const closeFriends = (preparedData.closeFriendsText || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    onSave({
      ...preparedData,
      birthDate: preparedData.birthDate || '',
      closeFriends,
      interests,
      languages,
      avatar: avatarPreview || preparedData.avatar
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Profil Siswa (BibTzy)"
      icon={User}
      maxWidth="720px"
      footer={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={onReset}
            title="Kembalikan profil ke data awal bawaan"
          >
            <RefreshCw size={14} />
            <span>Reset ke Default</span>
          </button>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
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
              <span>Simpan Profil</span>
            </button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        {/* Avatar Section */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          padding: '1rem',
          background: 'var(--card-glass)',
          border: '1px solid var(--border-glass)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '1.25rem'
        }}>
          <img
            src={avatarPreview || '/images/avatar.jpg'}
            alt="Avatar Preview"
            style={{
              width: '74px',
              height: '74px',
              borderRadius: 'var(--radius-md)',
              objectFit: 'cover',
              border: '2px solid var(--border-glass-bright)',
              boxShadow: '0 0 16px rgba(var(--accent-rgb), 0.3)'
            }}
          />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Foto Profil / Ilustrasi Avatar
            </span>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input
                type="file"
                id="avatarFileInput"
                accept="image/*"
                onChange={handleAvatarFile}
                style={{ display: 'none' }}
              />
              <label htmlFor="avatarFileInput" className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }}>
                <Upload size={14} />
                <span>Unggah Foto</span>
              </label>
              <button
                type="button"
                className="btn btn-glass btn-sm"
                onClick={() => {
                  setAvatarPreview('/images/avatar.jpg');
                  setFormData(prev => ({ ...prev, avatar: '/images/avatar.jpg', avatarType: 'preset' }));
                }}
              >
                Gunakan Ilustrasi Anime Es
              </button>
            </div>
          </div>
        </div>

        {/* Identity Fields */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <FormField label="Nama Lengkap" required error={errors.name}>
            <input
              type="text"
              className={`form-input ${errors.name ? 'error' : ''}`}
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </FormField>

          <FormField label="Status" required>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Siswa SMK"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
            />
          </FormField>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <FormField label="Kelas" required error={errors.class}>
            <input
              type="text"
              className={`form-input ${errors.class ? 'error' : ''}`}
              placeholder="XI PPLG 3"
              value={formData.class}
              onChange={(e) => handleChange('class', e.target.value)}
            />
          </FormField>

          <FormField label="Jurusan" required error={errors.major}>
            <input
              type="text"
              className={`form-input ${errors.major ? 'error' : ''}`}
              placeholder="Pengembangan Perangkat Lunak dan Gim"
              value={formData.major}
              onChange={(e) => handleChange('major', e.target.value)}
            />
          </FormField>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <FormField label="Nama Sekolah" required error={errors.school}>
            <input
              type="text"
              className={`form-input ${errors.school ? 'error' : ''}`}
              value={formData.school}
              onChange={(e) => handleChange('school', e.target.value)}
            />
          </FormField>

          <FormField label="Lokasi / Kota">
            <input
              type="text"
              className="form-input"
              placeholder="Bogor, Indonesia"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
            />
          </FormField>
        </div>

        <FormField label="Tagline Portofolio">
          <input
            type="text"
            className="form-input"
            placeholder="Belajar Hari Ini, Membangun Masa Depan."
            value={formData.tagline}
            onChange={(e) => handleChange('tagline', e.target.value)}
          />
        </FormField>

        <FormField label="Deskripsi Diri / Bio Singkat">
          <textarea
            className="form-textarea"
            rows={3}
            value={formData.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
          />
        </FormField>

        <FormField label="Tujuan Karier">
          <textarea
            className="form-textarea"
            rows={2}
            value={formData.careerGoal}
            onChange={(e) => handleChange('careerGoal', e.target.value)}
          />
        </FormField>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <FormField label="Minat & Bidang (Pisahkan dengan koma)">
            <input
              type="text"
              className="form-input"
              placeholder="Web Development, UI/UX Design, Game Dev"
              value={formData.interestsText}
              onChange={(e) => handleChange('interestsText', e.target.value)}
            />
          </FormField>

          <FormField label="Bahasa yang Dikuasai (Pisahkan dengan koma)">
            <input
              type="text"
              className="form-input"
              placeholder="Indonesia (Fasih), Inggris (Dasar)"
              value={formData.languagesText}
              onChange={(e) => handleChange('languagesText', e.target.value)}
            />
          </FormField>
        </div>

        {/* Info Pribadi Tambahan untuk NOVA AI */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <FormField label="Tanggal Lahir / Ulang Tahun">
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: 25 Oktober 2008"
              value={formData.birthDate || ''}
              onChange={(e) => handleChange('birthDate', e.target.value)}
            />
          </FormField>

          <FormField label="Teman Dekat / Sahabat (Pisahkan dengan koma)">
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Budi, Farhan, Rizky"
              value={formData.closeFriendsText || ''}
              onChange={(e) => handleChange('closeFriendsText', e.target.value)}
            />
          </FormField>
        </div>

        {/* Contact Links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <FormField label="Alamat Email" error={errors.email}>
            <input
              type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </FormField>

          <FormField label="Nomor WhatsApp">
            <input
              type="text"
              className="form-input"
              value={formData.whatsapp}
              onChange={(e) => handleChange('whatsapp', e.target.value)}
            />
          </FormField>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <FormField label="Profil GitHub URL">
            <input
              type="url"
              className="form-input"
              value={formData.github}
              onChange={(e) => handleChange('github', e.target.value)}
            />
          </FormField>
        </div>
      </form>
    </Modal>
  );
}
