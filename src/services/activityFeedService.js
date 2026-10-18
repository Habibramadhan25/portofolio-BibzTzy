import { storageService } from './storageService';

const STORAGE_KEY = 'activity_feed';

const INITIAL_FEED = [
  {
    id: 'act-init-1',
    type: 'project',
    title: 'Portofolio BibTzy Dimulai',
    description: 'Fondasi arsitektur website Anime Ice Blue Glassmorphism berhasil diinisialisasi.',
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    metadata: { category: 'Website' }
  },
  {
    id: 'act-init-3',
    type: 'achievement',
    title: 'Badge Terbuka: Consistent Learner',
    description: 'Memulai perjalanan eksplorasi coding dan dokumentasi belajar aktif.',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    metadata: { badgeId: 'first_session' }
  }
];

export const activityFeedService = {
  getFeed(filterType = 'all') {
    const data = storageService.get(STORAGE_KEY, null);
    let list = data;
    if (!list) {
      this.saveFeed(INITIAL_FEED);
      list = INITIAL_FEED;
    }

    let changed = false;

    // Bersihkan entri dummy sertifikat bawaan ('act-init-2' / 'Sertifikat Dicoding Ditambahkan')
    // agar Activity Feed hanya menampilkan sertifikat yang BENAR-BENAR ditambahkan oleh pengguna secara real-time.
    const originalLen = list.length;
    list = list.filter(item => 
      item.id !== 'act-init-2' && 
      item.title !== 'Sertifikat Dicoding Ditambahkan' &&
      !(item.type === 'certificate' && item.id?.startsWith('act-init-'))
    );
    if (list.length !== originalLen) {
      changed = true;
    }

    // Auto-clean residual "NOVA GLASS" branding ke "BibTzy" secara otomatis
    list = list.map(item => {
      const hasOldBrand = (item.title && /nova\s*glass/i.test(item.title)) ||
                          (item.description && /nova\s*glass/i.test(item.description));
      if (hasOldBrand) {
        changed = true;
        return {
          ...item,
          title: item.title ? item.title.replace(/nova\s*glass/gi, 'BibTzy') : item.title,
          description: item.description ? item.description.replace(/nova\s*glass/gi, 'BibTzy') : item.description
        };
      }
      return item;
    });
    if (changed) {
      this.saveFeed(list);
    }

    if (filterType && filterType !== 'all') {
      return list.filter(item => item.type === filterType);
    }
    return list;
  },

  saveFeed(items) {
    storageService.set(STORAGE_KEY, items);
    return items;
  },

  logRealtimeQuickActivity(title, description = '', type = 'project') {
    return this.logActivity({
      type,
      title,
      description: description || 'Aktivitas nyata berhasil dicatat secara langsung ke feed.',
      metadata: { isLive: true }
    });
  },

  logActivity({ type, title, description, entityId = null, metadata = {} }) {
    if (!title) return null;

    const list = this.getFeed('all');

    // Prevent immediate duplicate log within 5 seconds for same title & type
    const now = Date.now();
    const isRecentDuplicate = list.some(item => 
      item.type === type &&
      item.title === title &&
      (now - new Date(item.createdAt).getTime()) < 5000
    );

    if (isRecentDuplicate) return null;

    const newActivity = {
      id: `act-${now}-${Math.random().toString(36).substring(2, 7)}`,
      type,
      title,
      description: description || '',
      entityId,
      createdAt: new Date(now).toISOString(),
      metadata
    };

    const updated = [newActivity, ...list].slice(0, 100); // keep max 100 recent
    this.saveFeed(updated);
    return newActivity;
  },

  clearFeed() {
    this.saveFeed([]);
    return true;
  },

  formatRelativeTime(isoDateString) {
    if (!isoDateString) return '-';
    try {
      const date = new Date(isoDateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDays = Math.floor(diffHour / 24);

      if (diffSec < 45) return 'Baru saja';
      if (diffMin < 60) return `${diffMin} menit yang lalu`;
      if (diffHour < 24) return `${diffHour} jam yang lalu`;
      if (diffDays === 1) return 'Kemarin';
      if (diffDays < 7) return `${diffDays} hari yang lalu`;

      const day = String(date.getDate()).padStart(2, '0');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    } catch (e) {
      return isoDateString;
    }
  }
};
