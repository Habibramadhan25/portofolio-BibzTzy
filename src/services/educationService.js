import { storageService } from './storageService.js';

export const INITIAL_TIMELINE = [
  {
    id: 'edu-1',
    type: 'education',
    institution: 'SMK Negeri 1 Ciomas',
    role: 'Pengembangan Perangkat Lunak dan Gim (PPLG)',
    startDate: 'Juli 2023',
    endDate: 'Sekarang',
    isCurrent: true,
    description: 'Mempelajari dasar pemrograman terstruktur, algoritma, basis data relasional, pemrograman web (HTML, CSS, JavaScript, PHP), serta perancangan antarmuka pengguna.',
    highlights: [
      'Pemrograman Web & Mobile',
      'Basis Data MySQL',
      'Desain UI/UX & Pembuatan Mockup'
    ],
    isSample: true
  },
  {
    id: 'exp-1',
    type: 'experience',
    institution: 'OSIS SMK Negeri 1 Ciomas',
    role: 'Anggota Divisi IT & Publikasi',
    startDate: 'Januari 2024',
    endDate: 'Sekarang',
    isCurrent: true,
    description: 'Bertanggung jawab dalam mengelola dokumentasi kegiatan, membantu pembuatan materi visual/poster acara sekolah, dan mengelola media publikasi digital.',
    highlights: [
      'Dokumentasi & Publikasi Media',
      'Bantu Pengelolaan Live Streaming Kegiatan',
      'Kolaborasi Antar-Divisi Siswa'
    ],
    isSample: true
  },
  {
    id: 'exp-2',
    type: 'experience',
    institution: 'Proyek Kolaboratif Sekolah',
    role: 'Frontend Developer (Kelompok)',
    startDate: 'Agustus 2024',
    endDate: 'November 2024',
    isCurrent: false,
    description: 'Mengembangkan prototype website e-commerce sederhana bersama 3 rekan siswa PPLG untuk memenuhi tugas akhir semester praktik pemrograman web.',
    highlights: [
      'Membuat Tampilan Halaman Katalog Produk',
      'Integrasi Keranjang Belanja Sederhana',
      'Penyajian Presentasi di Depan Guru Pembimbing'
    ],
    isSample: true
  }
];

const STORAGE_KEY = 'timeline';

export const educationService = {
  getTimeline() {
    const data = storageService.get(STORAGE_KEY, null);
    if (data === null || !Array.isArray(data)) {
      this.saveTimeline(INITIAL_TIMELINE);
      return INITIAL_TIMELINE;
    }

    return data;
  },

  saveTimeline(timeline) {
    storageService.set(STORAGE_KEY, timeline);
    return timeline;
  },

  addItem(itemData) {
    const list = this.getTimeline();
    const newItem = {
      ...itemData,
      id: `time-${Date.now()}`,
      isCurrent: Boolean(itemData.isCurrent),
      highlights: Array.isArray(itemData.highlights)
        ? itemData.highlights
        : (itemData.highlights || '').split('\n').filter(s => s.trim().length > 0),
      isSample: false,
      createdAt: new Date().toISOString()
    };
    const updated = [newItem, ...list];
    this.saveTimeline(updated);
    return newItem;
  },

  updateItem(id, updatedFields) {
    const list = this.getTimeline();
    let updatedItemRef = null;
    const updated = list.map(item => {
      if (item.id === id) {
        const res = {
          ...item,
          ...updatedFields,
          isCurrent: Boolean(updatedFields.isCurrent !== undefined ? updatedFields.isCurrent : item.isCurrent),
          highlights: Array.isArray(updatedFields.highlights)
            ? updatedFields.highlights
            : (updatedFields.highlights !== undefined
              ? updatedFields.highlights.split('\n').filter(s => s.trim().length > 0)
              : item.highlights)
        };
        updatedItemRef = res;
        return res;
      }
      return item;
    });
    this.saveTimeline(updated);

    // Otomatis sinkronkan nama sekolah ke profil utama jika ini adalah riwayat pendidikan sekolah aktif
    if (updatedItemRef && updatedItemRef.type === 'education' && updatedItemRef.institution) {
      try {
        const profile = storageService.get('profile', null);
        if (profile && profile.school !== updatedItemRef.institution) {
          profile.school = updatedItemRef.institution;
          storageService.set('profile', profile);
        }
      } catch (err) {
        console.warn('[educationService] Gagal sinkronkan nama sekolah ke profil:', err);
      }
    }

    return updatedItemRef || updated.find(item => item.id === id);
  },

  deleteItem(id) {
    const list = this.getTimeline();
    const updated = list.filter(item => item.id !== id);
    this.saveTimeline(updated);
    return true;
  },

  resetTimeline() {
    this.saveTimeline(INITIAL_TIMELINE);
    return INITIAL_TIMELINE;
  }
};
