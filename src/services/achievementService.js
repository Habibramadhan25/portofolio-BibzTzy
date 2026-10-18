import { storageService } from './storageService';
import { activityFeedService } from './activityFeedService';

const TRANSACTIONS_KEY = 'xp_transactions';
const BADGES_KEY = 'unlocked_badges';

export const LEVEL_TIERS = [
  { level: 1, name: 'Beginner', minXp: 0, maxXp: 99, icon: 'Seedling', color: '#8DDCFF' },
  { level: 2, name: 'Explorer', minXp: 100, maxXp: 249, icon: 'Compass', color: '#45CFFF' },
  { level: 3, name: 'Builder', minXp: 250, maxXp: 499, icon: 'Hammer', color: '#34D399' },
  { level: 4, name: 'Developer', minXp: 500, maxXp: 899, icon: 'Code', color: '#60A5FA' },
  { level: 5, name: 'Innovator', minXp: 900, maxXp: 1399, icon: 'Zap', color: '#C084FC' },
  { level: 6, name: 'Creator', minXp: 1400, maxXp: 1999, icon: 'Sparkles', color: '#F472B6' },
  { level: 7, name: 'Architect', minXp: 2000, maxXp: 99999, icon: 'Crown', color: '#FBBF24' }
];

export const ALL_BADGES = [
  {
    id: 'first_session',
    name: 'First Session',
    description: 'Menyelesaikan sesi coding pertama Anda yang tercatat secara nyata.',
    category: 'Coding',
    icon: 'PlayCircle',
    xpReward: 20
  },
  {
    id: 'deep_focus',
    name: 'Deep Focus',
    description: 'Menyelesaikan sesi belajar coding tanpa henti selama minimal 30 menit.',
    category: 'Coding',
    icon: 'Timer',
    xpReward: 25
  },
  {
    id: 'consistent_learner',
    name: 'Consistent Learner',
    description: 'Mencatatkan aktivitas belajar pada minimal 3 hari yang berbeda.',
    category: 'Habit',
    icon: 'Flame',
    xpReward: 30
  },
  {
    id: 'roadmap_starter',
    name: 'Roadmap Starter',
    description: 'Menuntaskan materi pembelajaran pertama dalam Learning Roadmap.',
    category: 'Roadmap',
    icon: 'BookOpen',
    xpReward: 25
  },
  {
    id: 'roadmap_master',
    name: 'Roadmap Master',
    description: 'Menyelesaikan 5 materi atau lebih dalam kurikulum Learning Roadmap.',
    category: 'Roadmap',
    icon: 'GraduationCap',
    xpReward: 50
  },
  {
    id: 'project_builder',
    name: 'Project Builder',
    description: 'Memiliki minimal 3 karya proyek portofolio yang tersimpan.',
    category: 'Portfolio',
    icon: 'Layers',
    xpReward: 35
  },
  {
    id: 'certified_dev',
    name: 'Certified Developer',
    description: 'Menyimpan dan memverifikasi minimal 2 sertifikat kompetensi.',
    category: 'Portfolio',
    icon: 'Award',
    xpReward: 30
  },
  {
    id: 'level_up_hero',
    name: 'Level Up Hero',
    description: 'Berhasil naik ke Level 2 (Explorer) atau lebih tinggi.',
    category: 'Level',
    icon: 'TrendingUp',
    xpReward: 20
  }
];

const INITIAL_TRANSACTIONS = [
  {
    id: 'xp-init-1',
    sourceType: 'system_welcome',
    sourceId: 'welcome',
    amount: 50,
    reason: 'Inisialisasi akun pengembang BibTzy',
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
  },
  {
    id: 'xp-init-2',
    sourceType: 'project',
    sourceId: 'proj-1',
    amount: 15,
    reason: 'Proyek: Website Portfolio BibTzy',
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
  },
  {
    id: 'xp-init-3',
    sourceType: 'project',
    sourceId: 'proj-2',
    amount: 15,
    reason: 'Proyek: TaskMate Smart ToDo List',
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
  },
  {
    id: 'xp-init-4',
    sourceType: 'certificate',
    sourceId: 'cert-1',
    amount: 20,
    reason: 'Sertifikat: Belajar Dasar Pemrograman Web',
    createdAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString()
  },
  {
    id: 'xp-init-5',
    sourceType: 'certificate',
    sourceId: 'cert-2',
    amount: 20,
    reason: 'Sertifikat: UI/UX Design Fundamental',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  }
];

const INITIAL_UNLOCKED = {
  project_builder: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
  certified_dev: new Date(Date.now() - 3600000 * 12).toISOString(),
  level_up_hero: new Date(Date.now() - 3600000 * 10).toISOString()
};

export const achievementService = {
  getTransactions() {
    const data = storageService.get(TRANSACTIONS_KEY, null);
    if (!data) {
      storageService.set(TRANSACTIONS_KEY, INITIAL_TRANSACTIONS);
      return INITIAL_TRANSACTIONS;
    }
    return data;
  },

  getTotalXP() {
    const txs = this.getTransactions();
    return txs.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
  },

  getLevelInfo(totalXp = null) {
    const xp = totalXp !== null ? totalXp : this.getTotalXP();
    let currentTier = LEVEL_TIERS[0];

    for (let i = LEVEL_TIERS.length - 1; i >= 0; i--) {
      if (xp >= LEVEL_TIERS[i].minXp) {
        currentTier = LEVEL_TIERS[i];
        break;
      }
    }

    const nextTier = LEVEL_TIERS.find(t => t.level === currentTier.level + 1) || null;

    let progressInLevel = 0;
    let xpToNext = 0;

    if (nextTier) {
      const levelSpan = nextTier.minXp - currentTier.minXp;
      const currentLevelGained = xp - currentTier.minXp;
      progressInLevel = Math.min(100, Math.max(0, Math.round((currentLevelGained / levelSpan) * 100)));
      xpToNext = nextTier.minXp - xp;
    } else {
      progressInLevel = 100;
      xpToNext = 0;
    }

    return {
      currentLevel: currentTier.level,
      levelName: currentTier.name,
      totalXp: xp,
      minXp: currentTier.minXp,
      maxXp: currentTier.maxXp,
      nextLevelMinXp: nextTier ? nextTier.minXp : currentTier.maxXp,
      xpToNext,
      progressInLevel,
      color: currentTier.color,
      icon: currentTier.icon
    };
  },

  addXP({ sourceType, sourceId, amount, reason }) {
    if (!amount || amount <= 0) return { success: false, awarded: 0 };

    const txs = this.getTransactions();
    const oldTotal = this.getTotalXP();
    const oldLevel = this.getLevelInfo(oldTotal).currentLevel;

    // Idempotency: Prevent double XP for same sourceType and sourceId
    if (sourceType && sourceId) {
      const alreadyAwarded = txs.some(
        t => t.sourceType === sourceType && String(t.sourceId) === String(sourceId)
      );
      if (alreadyAwarded) {
        return { success: false, duplicate: true, awarded: 0 };
      }
    }

    const newTx = {
      id: `xp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sourceType: sourceType || 'general',
      sourceId: sourceId || null,
      amount: Number(amount),
      reason: reason || 'Aktivitas Belajar Terverifikasi',
      createdAt: new Date().toISOString()
    };

    const updatedTxs = [newTx, ...txs];
    storageService.set(TRANSACTIONS_KEY, updatedTxs);

    const newTotal = oldTotal + Number(amount);
    const newLevelInfo = this.getLevelInfo(newTotal);
    const leveledUp = newLevelInfo.currentLevel > oldLevel;

    if (leveledUp) {
      activityFeedService.logActivity({
        type: 'level_up',
        title: `Naik ke Level ${newLevelInfo.currentLevel}: ${newLevelInfo.levelName}!`,
        description: `Selamat! Anda berhasil mengumpulkan ${newTotal} XP dan naik tingkat.`,
        metadata: { newLevel: newLevelInfo.currentLevel, levelName: newLevelInfo.levelName }
      });

      this.awardBadge('level_up_hero');
    }

    return {
      success: true,
      awarded: amount,
      newTotalXP: newTotal,
      leveledUp,
      oldLevel,
      newLevel: newLevelInfo.currentLevel,
      levelName: newLevelInfo.levelName
    };
  },

  getUnlockedBadges() {
    const data = storageService.get(BADGES_KEY, null);
    if (!data) {
      storageService.set(BADGES_KEY, INITIAL_UNLOCKED);
      return INITIAL_UNLOCKED;
    }
    return data;
  },

  awardBadge(badgeId) {
    const unlocked = this.getUnlockedBadges();
    if (unlocked[badgeId]) return false; // already unlocked

    const badgeObj = ALL_BADGES.find(b => b.id === badgeId);
    if (!badgeObj) return false;

    const now = new Date().toISOString();
    const updated = { ...unlocked, [badgeId]: now };
    storageService.set(BADGES_KEY, updated);

    // Award bonus XP for badge unlock
    if (badgeObj.xpReward) {
      this.addXP({
        sourceType: 'badge',
        sourceId: badgeId,
        amount: badgeObj.xpReward,
        reason: `Membuka Badge: ${badgeObj.name}`
      });
    }

    // Log to Activity Feed
    activityFeedService.logActivity({
      type: 'achievement',
      title: `Badge Terbuka: ${badgeObj.name}!`,
      description: badgeObj.description,
      metadata: { badgeId, xpReward: badgeObj.xpReward }
    });

    return true;
  },

  evaluateBadges({ sessions = [], roadmap = [], projects = [], certificates = [] }) {
    const newlyUnlocked = [];

    // 1. first_session
    if (sessions.length > 0) {
      if (this.awardBadge('first_session')) newlyUnlocked.push('first_session');
    }

    // 2. deep_focus (any session >= 30 mins)
    const hasDeepFocus = sessions.some(s => (Number(s.durationMinutes) || 0) >= 30);
    if (hasDeepFocus) {
      if (this.awardBadge('deep_focus')) newlyUnlocked.push('deep_focus');
    }

    // 3. consistent_learner (sessions on >= 3 distinct days)
    const distinctDays = new Set(
      sessions.map(s => {
        const d = s.completedAt || s.startedAt;
        return d ? new Date(d).toISOString().slice(0, 10) : null;
      }).filter(Boolean)
    );
    if (distinctDays.size >= 3) {
      if (this.awardBadge('consistent_learner')) newlyUnlocked.push('consistent_learner');
    }

    // 4. roadmap_starter (at least 1 completed roadmap item)
    const completedRoadmapCount = roadmap.filter(r => r.status === 'completed').length;
    if (completedRoadmapCount >= 1) {
      if (this.awardBadge('roadmap_starter')) newlyUnlocked.push('roadmap_starter');
    }

    // 5. roadmap_master (at least 5 completed roadmap items)
    if (completedRoadmapCount >= 5) {
      if (this.awardBadge('roadmap_master')) newlyUnlocked.push('roadmap_master');
    }

    // 6. project_builder (at least 3 projects)
    if (projects.length >= 3) {
      if (this.awardBadge('project_builder')) newlyUnlocked.push('project_builder');
    }

    // 7. certified_dev (at least 2 certificates)
    if (certificates.length >= 2) {
      if (this.awardBadge('certified_dev')) newlyUnlocked.push('certified_dev');
    }

    return newlyUnlocked;
  },

  getAllBadgesStatus() {
    const unlocked = this.getUnlockedBadges();
    return ALL_BADGES.map(badge => ({
      ...badge,
      isUnlocked: Boolean(unlocked[badge.id]),
      unlockedAt: unlocked[badge.id] || null
    }));
  }
};
