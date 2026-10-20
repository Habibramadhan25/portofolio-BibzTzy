import { storageService } from './storageService.js';

export const DEFAULT_PROFILE = {
  name: 'Habib Ramadhan',
  status: 'Siswa SMK',
  class: 'XI PPLG 3',
  major: 'Pengembangan Perangkat Lunak dan Gim (PPLG)',
  school: 'SMK Negeri 1 Ciomas',
  location: 'Bogor, Indonesia',
  tagline: 'Belajar Hari Ini, Membangun Masa Depan.',
  bio: 'Saya adalah siswa SMK yang tertarik pada pengembangan website, pemrograman, teknologi, dan desain antarmuka. Saya selalu ingin belajar hal baru dan mengembangkan kemampuan agar bisa menjadi lebih baik di masa depan.',
  interests: ['Web Development', 'UI/UX Design', 'Game Development', 'Teknologi'],
  careerGoal: 'Menjadi seorang Web Developer yang profesional dan mampu menciptakan solusi digital yang bermanfaat.',
  languages: ['Indonesia (Fasih)', 'Inggris (Dasar)'],
  email: 'habibtzyeeh25@gmail.com',
  whatsapp: '+62 812-8404-6378',
  github: 'https://github.com/Habibramadhan25',
  instagram: 'https://www.instagram.com/bibzcoto?xtok=MWY2MjJqdWx4YjR1eQ==',
  avatar: '/images/user-avatar.jpg',
  avatarType: 'custom', // 'preset' | 'custom'
  birthDate: '25 Agustus 2009', // Ulang tahun: 25 Agustus 2009 (status pending, tahun lahir belum diketahui)
  closeFriends: ['Bibztzy', 'Ilham', 'Rafli'] // Teman owner: Bibztzy, Ilham, dan Rafli
};

const STORAGE_KEY = 'profile';

export const profileService = {
  getProfile() {
    const stored = storageService.get(STORAGE_KEY, null);
    if (!stored) {
      this.saveProfile(DEFAULT_PROFILE);
      return DEFAULT_PROFILE;
    }

    let needsSave = false;
    const merged = { ...DEFAULT_PROFILE, ...stored };

    // Update avatar ke foto asli Habib jika masih pakai avatar preset lama
    if (merged.avatar === '/images/avatar.jpg') {
      merged.avatar = '/images/user-avatar.jpg';
      merged.avatarType = 'custom';
      needsSave = true;
    }

    // Hapus LinkedIn secara permanen sesuai permintaan
    if ('linkedin' in merged || 'linkedin' in stored) {
      delete merged.linkedin;
      delete stored.linkedin;
      needsSave = true;
    }

    // Migrasi email lama ke email baru hanya jika kosong atau memakai placeholder bawaan lama
    if (merged.email === 'habibramadhan21@gmail.com' || !merged.email) {
      merged.email = 'habibtzyeeh25@gmail.com';
      needsSave = true;
    }

    // Nomor WhatsApp bawaan jika kosong atau memakai nomor dummy lawas
    if (merged.whatsapp === '+62 812-3456-7890' || !merged.whatsapp) {
      merged.whatsapp = '+62 812-8404-6378';
      needsSave = true;
    }

    // Migrasi tanggal lahir / ulang tahun ke 25 Agustus 2009 jika masih versi lama
    if (merged.birthDate === '25 Oktober' || !merged.birthDate || merged.birthDate.includes('Oktober')) {
      merged.birthDate = '25 Agustus 2009';
      needsSave = true;
    }

    // Link GitHub bawaan jika kosong
    if (!merged.github) {
      merged.github = 'https://github.com/Habibramadhan25';
      needsSave = true;
    }

    // Link Instagram bawaan jika kosong
    if (!merged.instagram) {
      merged.instagram = 'https://www.instagram.com/bibzcoto?xtok=MWY2MjJqdWx4YjR1eQ==';
      needsSave = true;
    }

    if (needsSave) {
      this.saveProfile(merged);
    }

    return merged;
  },

  saveProfile(updatedProfile) {
    const cleanProfile = { ...updatedProfile };
    delete cleanProfile.linkedin;
    storageService.set(STORAGE_KEY, cleanProfile);

    // Otomatis sinkronkan nama sekolah ke kartu riwayat pendidikan formal jika ada perubahan
    if (cleanProfile.school) {
      try {
        const timeline = storageService.get('timeline', null);
        if (Array.isArray(timeline)) {
          let hasChanges = false;
          const updatedTimeline = timeline.map(item => {
            if (item.type === 'education' && (item.id === 'edu-1' || item.isCurrent)) {
              if (item.institution !== cleanProfile.school) {
                hasChanges = true;
                return { ...item, institution: cleanProfile.school };
              }
            }
            return item;
          });
          if (hasChanges) {
            storageService.set('timeline', updatedTimeline);
          }
        }
      } catch (err) {
        console.warn('[profileService] Gagal sinkronkan sekolah ke timeline:', err);
      }
    }

    return cleanProfile;
  },

  resetProfile() {
    const cleanDefault = { ...DEFAULT_PROFILE };
    delete cleanDefault.linkedin;
    storageService.set(STORAGE_KEY, cleanDefault);
    return cleanDefault;
  }
};
