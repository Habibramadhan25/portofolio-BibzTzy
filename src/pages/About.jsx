import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  GraduationCap,
  MapPin,
  Mail,
  Phone,
  Edit3,
  RotateCcw,
  Sparkles,
  Languages,
  CheckCircle2,
  ExternalLink,
  HeartHandshake,
  Target,
  Lock
} from 'lucide-react';
import { Github, Instagram } from '../components/common/BrandIcons';
import PageHeader from '../components/common/PageHeader';
import GlassCard from '../components/common/GlassCard';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ProfileEditModal from '../components/forms/ProfileEditModal';
import { profileService } from '../services/profileService';
import { useToast } from '../context/ToastContext';
import { useOwner } from '../context/OwnerContext';
import { PageTransition, MotionItem, MotionCard } from '../components/common/MotionWrapper';

export default function About() {
  const { profile, setProfile } = useOutletContext();
  const toast = useToast();
  const { isOwner, openAuthModal } = useOwner();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleSaveProfile = (updatedProfile) => {
    profileService.saveProfile(updatedProfile);
    setProfile(updatedProfile);
    setIsEditModalOpen(false);
    toast.success('Profil siswa berhasil diperbarui!');
  };

  const handleConfirmReset = () => {
    const res = profileService.resetProfile();
    setProfile(res);
    setIsResetConfirmOpen(false);
    toast.info('Profil telah dikembalikan ke data awal bawaan.');
  };

  return (
    <PageTransition style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <PageHeader
        badge="IDENTITAS SISWA"
        title="Profil & Tentang Saya"
        subtitle="Informasi lengkap mengenai latar belakang pendidikan, minat teknologi, dan tujuan karier."
        actions={
          isOwner ? (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setIsResetConfirmOpen(true)}
                title="Kembalikan profil ke data awal"
              >
                <RotateCcw size={15} />
                <span>Reset Default</span>
              </button>

              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setIsEditModalOpen(true)}
                id="btn-edit-profile"
              >
                <Edit3 size={15} />
                <span>Edit Profil</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-glass btn-sm"
              onClick={openAuthModal}
              title="Portofolio Terproteksi — Klik untuk verifikasi pemilik"
              style={{ gap: '0.45rem' }}
            >
              <Lock size={14} className="text-muted" />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Mode Tamu (Read-Only)</span>
            </button>
          )
        }
      />

      {/* Main Grid: Left Column (Avatar & Contacts) | Right Column (Bio, Interests, Career) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
        gap: '2rem',
        alignItems: 'start'
      }}>
        {/* Left Card: Avatar & Quick Info */}
        <MotionCard style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <GlassCard style={{ padding: 'clamp(1.25rem, 4vw, 2rem)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Avatar Frame with Ice Glow */}
              <div style={{
                width: 'clamp(120px, 35vw, 160px)',
                height: 'clamp(120px, 35vw, 160px)',
                borderRadius: 'var(--radius-xl)',
                padding: '4px',
                background: 'linear-gradient(135deg, var(--ice-blue), var(--cyan), transparent)',
                boxShadow: '0 0 30px rgba(var(--accent-rgb), 0.35)',
                marginBottom: '1.25rem'
              }}>
              <img
                src={profile?.avatar || '/images/avatar.jpg'}
                alt={profile?.name || 'Habib Ramadhan'}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 'calc(var(--radius-xl) - 4px)',
                  objectFit: 'cover'
                }}
              />
            </div>

            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              {profile?.name || 'Habib Ramadhan'}
            </h2>

            <span className="badge badge-ice" style={{ marginBottom: '1rem' }}>
              {profile?.status || 'Siswa SMK'} • {profile?.class || 'XI PPLG 3'}
            </span>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              {profile?.tagline || 'Belajar Hari Ini, Membangun Masa Depan.'}
            </p>

            <div style={{ width: '100%', borderTop: '1px solid var(--border-glass)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <GraduationCap size={16} className="text-ice flex-shrink-0" />
                <span style={{ color: 'var(--text-secondary)' }}>Sekolah:</span>
                <strong style={{ color: 'var(--text-primary)', marginLeft: 'auto' }}>
                  {profile?.school || 'SMK Negeri 1 Ciomas'}
                </strong>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <MapPin size={16} className="text-ice flex-shrink-0" />
                <span style={{ color: 'var(--text-secondary)' }}>Lokasi:</span>
                <span style={{ color: 'var(--text-primary)', marginLeft: 'auto' }}>
                  {profile?.location || 'Bogor, Indonesia'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--color-success)' }} className="flex-shrink-0" />
                <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                <span className="badge badge-success" style={{ marginLeft: 'auto', padding: '0.15rem 0.6rem' }}>
                  Siswa Aktif
                </span>
              </div>
            </div>
          </GlassCard>

          {/* Social Links Card */}
          <GlassCard style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Tautan & Kontak Langsung
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {profile?.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="btn btn-glass"
                  style={{ justifyContent: 'flex-start', padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                >
                  <Mail size={16} className="text-ice" />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile.email}</span>
                </a>
              )}

              {profile?.whatsapp && (
                <a
                  href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-glass"
                  style={{ justifyContent: 'flex-start', padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                >
                  <Phone size={16} style={{ color: '#25D366' }} />
                  <span>{profile.whatsapp}</span>
                  <ExternalLink size={13} style={{ marginLeft: 'auto', opacity: 0.6 }} />
                </a>
              )}

              {profile?.github && (
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-glass"
                  style={{ justifyContent: 'flex-start', padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                >
                  <Github size={16} />
                  <span>GitHub Profile</span>
                  <ExternalLink size={13} style={{ marginLeft: 'auto', opacity: 0.6 }} />
                </a>
              )}


              {profile?.instagram && (
                <a
                  href={profile.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-glass"
                  style={{ justifyContent: 'flex-start', padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                >
                  <Instagram size={16} style={{ color: '#E4405F' }} />
                  <span>Instagram</span>
                  <ExternalLink size={13} style={{ marginLeft: 'auto', opacity: 0.6 }} />
                </a>
              )}
            </div>
          </GlassCard>
        </MotionCard>

        {/* Right Column: Bio, Interests, Goals, Languages */}
        <MotionCard style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Bio / Ringkasan Diri */}
          <GlassCard style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(var(--accent-rgb), 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-color)'
              }}>
                <Sparkles size={18} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                Tentang Saya
              </h3>
            </div>

            <p style={{
              color: 'var(--text-secondary)',
              lineHeight: 1.8,
              fontSize: '0.96rem',
              whiteSpace: 'pre-line'
            }}>
              {profile?.bio || 'Siswa SMK yang tertarik pada pengembangan website, pemrograman, teknologi, dan desain antarmuka.'}
            </p>
          </GlassCard>

          {/* Program Keahlian & Jurusan */}
          <GlassCard style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(192, 132, 252, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#C084FC'
              }}>
                <GraduationCap size={18} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                Konsentrasi Keahlian (PPLG)
              </h3>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              Jurusan <strong>{profile?.major || 'Pengembangan Perangkat Lunak dan Gim (PPLG)'}</strong> berfokus pada pemahaman algoritma pemrograman, rekayasa perangkat lunak web, basis data terstruktur, logika berorientasi objek, serta perancangan antarmuka visual yang intuitif.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))',
              gap: '0.75rem',
              background: 'rgba(0, 0, 0, 0.2)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-glass)'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mata Pelajaran Utama</span>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                  Pemrograman Web & Perangkat lunak dan Gim
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Basis Data</span>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                  MySQL & Relational Design
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Minat & Ketertarikan */}
          <GlassCard style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(52, 211, 153, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-success)'
              }}>
                <HeartHandshake size={18} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                Bidang Minat
              </h3>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              {Array.isArray(profile?.interests) && profile.interests.length > 0 ? (
                profile.interests.map((interest, idx) => (
                  <span
                    key={idx}
                    className="badge badge-ice"
                    style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem' }}
                  >
                    ✦ {interest}
                  </span>
                ))
              ) : (
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Belum ada minat yang dicantumkan.</span>
              )}
            </div>
          </GlassCard>

          {/* Tujuan Karier & Bahasa */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1.5rem' }}>
            {/* Career Goal */}
            <GlassCard style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Target size={18} className="text-ice" />
                <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Tujuan Karier</h4>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                {profile?.careerGoal || 'Menjadi Web Developer profesional yang mampu menciptakan solusi digital yang bermanfaat.'}
              </p>
            </GlassCard>

            {/* Languages */}
            <GlassCard style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Languages size={18} className="text-ice" />
                <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Bahasa</h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {Array.isArray(profile?.languages) && profile.languages.length > 0 ? (
                  profile.languages.map((lang, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-color)' }} />
                      <span style={{ color: 'var(--text-primary)' }}>{lang}</span>
                    </div>
                  ))
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Indonesia</span>
                )}
              </div>
            </GlassCard>
          </div>
        </MotionCard>
      </div>

      {/* Edit Profile Modal */}
      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        onSave={handleSaveProfile}
        onReset={() => {
          handleConfirmReset();
          setIsEditModalOpen(false);
        }}
      />

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        title="Reset Profil ke Data Awal?"
        message="Tindakan ini akan mengembalikan data profil, nama, kontak, dan biografi Anda ke konfigurasi standar default BibTzy."
        confirmText="Ya, Reset Profil"
        cancelText="Batal"
        danger={true}
        onConfirm={handleConfirmReset}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </PageTransition>
  );
}
