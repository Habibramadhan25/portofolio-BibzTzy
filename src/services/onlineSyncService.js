import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { storageService } from './storageService';
import { profileService } from './profileService';
import { projectService } from './projectService';
import { skillService } from './skillService';
import { educationService } from './educationService';
import { certificateService } from './certificateService';
import { roadmapService } from './roadmapService';
import { codingActivityService } from './codingActivityService';
import { achievementService } from './achievementService';
import { activityFeedService } from './activityFeedService';
import { ownerKnowledgeService } from './ownerKnowledgeService';

export const onlineSyncService = {
  // 1. Inspect all local data counts
  getLocalSummary() {
    return {
      profile: profileService.getProfile(),
      projectsCount: projectService.getProjects().length,
      skillsCount: skillService.getSkills().length,
      timelineCount: educationService.getTimeline().length,
      certificatesCount: certificateService.getCertificates().length,
      roadmapCount: roadmapService.getRoadmap().length,
      codingSessionsCount: codingActivityService.getSessions().length,
      xpTransactionsCount: achievementService.getTransactions().length,
      badgesCount: achievementService.getUnlockedBadges().length,
      feedCount: activityFeedService.getFeed().length,
      ownerKnowledgeCount: ownerKnowledgeService.getFacts().length
    };
  },

  // 2. Export local backup JSON file before syncing (Safety First)
  exportBackupSnapshot() {
    try {
      const snapshot = {
        exportedAt: new Date().toISOString(),
        version: '3.1.0',
        profile: profileService.getProfile(),
        projects: projectService.getProjects(),
        skills: skillService.getSkills(),
        timeline: educationService.getTimeline(),
        certificates: certificateService.getCertificates(),
        roadmap: roadmapService.getRoadmap(),
        codingSessions: codingActivityService.getSessions(),
        xpTransactions: achievementService.getTransactions(),
        unlockedBadges: achievementService.getUnlockedBadges(),
        activityFeed: activityFeedService.getFeed(),
        ownerKnowledge: ownerKnowledgeService.getFacts()
      };

      const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `nova_glass_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return { success: true };
    } catch (err) {
      console.error('[onlineSyncService] Backup failed:', err);
      return { success: false, error: err.message };
    }
  },

  // 3. Migrate & Sync Local Data to Supabase PostgreSQL Tables
  async syncAllToSupabase(user, onProgress = () => {}) {
    if (!isSupabaseConfigured) {
      return { success: false, error: 'Supabase belum dikonfigurasi di file .env.local.' };
    }

    if (!user || !user.id) {
      return { success: false, error: 'Autentikasi admin diperlukan untuk melakukan sinkronisasi ke cloud.' };
    }

    const userId = user.id;
    const results = {
      profile: false,
      projects: 0,
      skills: 0,
      timeline: 0,
      certificates: 0,
      roadmap: 0,
      codingSessions: 0,
      xpTransactions: 0,
      badges: 0,
      feed: 0,
      errors: []
    };

    try {
      // Step A: Sync Profile
      onProgress({ step: 'Profil', progress: 10 });
      const localProfile = profileService.getProfile();
      if (localProfile) {
        const { error } = await supabase.from('profiles').upsert({
          id: userId,
          name: localProfile.name || 'Habib Ramadhan',
          headline: localProfile.headline || localProfile.status || 'Siswa SMK PPLG',
          tagline: localProfile.tagline || '',
          bio: localProfile.bio || '',
          school: localProfile.school || 'SMK Negeri 1 Ciomas',
          major: localProfile.major || 'PPLG',
          class: localProfile.class || 'XI PPLG 3',
          status: localProfile.status || 'Siswa SMK / Siap Magang',
          avatar_url: localProfile.avatar || '/images/avatar.jpg',
          contact_email: localProfile.email || '',
          contact_phone: localProfile.phone || '',
          location: localProfile.location || 'Bogor, Jawa Barat',
          github_url: localProfile.github || '',
          instagram_url: localProfile.instagram || '',
          updated_at: new Date().toISOString()
        });
        if (error) results.errors.push(`Profile: ${error.message}`);
        else results.profile = true;
      }

      // Step B: Sync Projects
      onProgress({ step: 'Katalog Proyek', progress: 20 });
      const localProjects = projectService.getProjects();
      if (localProjects.length > 0) {
        const rows = localProjects.map((p, idx) => ({
          id: p.id,
          user_id: userId,
          title: p.title,
          short_desc: p.shortDesc || '',
          long_desc: p.longDesc || p.shortDesc || '',
          category: p.category,
          tech_stack: p.techStack || [],
          thumbnail_url: p.thumbnail || '/images/avatar.jpg',
          demo_url: p.demoUrl || '',
          github_url: p.githubUrl || '',
          date: p.date || '',
          status: p.status || 'Selesai',
          is_favorite: Boolean(p.isFavorite),
          is_sample: Boolean(p.isSample),
          is_public: true,
          display_order: idx,
          updated_at: new Date().toISOString()
        }));
        const { error } = await supabase.from('projects').upsert(rows);
        if (error) results.errors.push(`Projects: ${error.message}`);
        else results.projects = rows.length;
      }

      // Step C: Sync Skills
      onProgress({ step: 'Keahlian & Teknologi', progress: 35 });
      const localSkills = skillService.getSkills();
      if (localSkills.length > 0) {
        const rows = localSkills.map((s, idx) => ({
          id: s.id,
          user_id: userId,
          name: s.name,
          category: s.category,
          proficiency: Math.min(100, Math.max(0, s.proficiency || 80)),
          level_label: s.levelLabel || 'Menengah',
          experience_years: s.experienceYears || '1 Tahun',
          icon_name: s.iconName || '',
          is_sample: Boolean(s.isSample),
          display_order: idx,
          updated_at: new Date().toISOString()
        }));
        const { error } = await supabase.from('skills').upsert(rows);
        if (error) results.errors.push(`Skills: ${error.message}`);
        else results.skills = rows.length;
      }

      // Step D: Sync Education Timeline
      onProgress({ step: 'Riwayat Pendidikan', progress: 50 });
      const localTimeline = educationService.getTimeline();
      if (localTimeline.length > 0) {
        const rows = localTimeline.map((t, idx) => ({
          id: t.id,
          user_id: userId,
          title: t.title,
          institution: t.institution,
          period: t.period,
          type: t.type,
          description: t.description || '',
          is_current: Boolean(t.isCurrent),
          is_sample: Boolean(t.isSample),
          display_order: idx,
          updated_at: new Date().toISOString()
        }));
        const { error } = await supabase.from('education_timeline').upsert(rows);
        if (error) results.errors.push(`Timeline: ${error.message}`);
        else results.timeline = rows.length;
      }

      // Step E: Sync Certificates
      onProgress({ step: 'Galeri Sertifikat', progress: 65 });
      const localCerts = certificateService.getCertificates();
      if (localCerts.length > 0) {
        const rows = localCerts.map((c) => ({
          id: c.id,
          user_id: userId,
          title: c.title,
          issuer: c.issuer,
          issue_date: c.issueDate,
          category: c.category,
          description: c.description || '',
          verification_url: c.verificationUrl || '',
          image_url: c.imageUrl || '/images/avatar.jpg',
          is_sample: Boolean(c.isSample),
          is_public: true,
          updated_at: new Date().toISOString()
        }));
        const { error } = await supabase.from('certificates').upsert(rows);
        if (error) results.errors.push(`Certificates: ${error.message}`);
        else results.certificates = rows.length;
      }

      // Step F: Sync Learning Roadmap
      onProgress({ step: 'Learning Roadmap', progress: 75 });
      const localRoadmap = roadmapService.getRoadmap();
      if (localRoadmap.length > 0) {
        const rows = localRoadmap.map((r) => ({
          id: r.id,
          user_id: userId,
          order_num: r.order || 0,
          title: r.title,
          category: r.category,
          difficulty: r.difficulty || 'Dasar',
          status: r.status || 'not_started',
          description: r.description || '',
          target_date: r.targetDate || '',
          completed_at: r.completedAt || null,
          notes: r.notes || '',
          learning_resource_url: r.resource || '',
          checklist: r.checklist || [],
          updated_at: new Date().toISOString()
        }));
        const { error } = await supabase.from('learning_roadmap').upsert(rows);
        if (error) results.errors.push(`Roadmap: ${error.message}`);
        else results.roadmap = rows.length;
      }

      // Step G: Sync Coding Sessions
      onProgress({ step: 'Sesi Coding', progress: 85 });
      const localSessions = codingActivityService.getSessions();
      if (localSessions.length > 0) {
        const rows = localSessions.map((s) => ({
          id: s.id,
          user_id: userId,
          title: s.title,
          language: s.language || 'JavaScript',
          project_id: s.projectId || null,
          project_title: s.projectTitle || null,
          started_at: s.startedAt,
          finished_at: s.finishedAt,
          duration_minutes: s.durationMinutes || 0,
          notes: s.notes || '',
          status: s.status || 'completed'
        }));
        const { error } = await supabase.from('coding_sessions').upsert(rows);
        if (error) results.errors.push(`CodingSessions: ${error.message}`);
        else results.codingSessions = rows.length;
      }

      // Step H: Sync XP Transactions & Achievements
      onProgress({ step: 'XP & Lencana Prestasi', progress: 90 });
      const localXP = achievementService.getTransactions();
      if (localXP.length > 0) {
        const rows = localXP.map((x) => ({
          id: x.id,
          user_id: userId,
          amount: x.amount,
          source_type: x.sourceType,
          source_id: x.sourceId,
          description: x.description,
          created_at: x.timestamp
        }));
        const { error } = await supabase.from('xp_transactions').upsert(rows);
        if (error) results.errors.push(`XP: ${error.message}`);
        else results.xpTransactions = rows.length;
      }

      // Step I: Sync Owner Knowledge Base
      onProgress({ step: 'Basis Pengetahuan Owner', progress: 95 });
      const localFacts = ownerKnowledgeService.getFacts();
      if (localFacts.length > 0) {
        const rows = localFacts.map((f, idx) => ({
          id: f.id,
          user_id: userId,
          key: f.key,
          category: f.category,
          label: f.label,
          target_entity: f.target_entity || 'owner',
          value: f.value || '',
          keywords: f.keywords || [],
          access_level: f.access_level || 'public',
          verification_status: f.verification_status || 'verified',
          is_public: f.isPublic !== false,
          is_verified: f.isVerified !== false,
          known: f.known !== false,
          notes: f.notes || null,
          restricted_message: f.restricted_message || null,
          display_order: idx,
          updated_at: new Date().toISOString()
        }));
        const { error } = await supabase.from('owner_knowledge').upsert(rows);
        if (error) results.errors.push(`OwnerKnowledge: ${error.message}`);
        else results.ownerKnowledge = rows.length;
      }

      onProgress({ step: 'Selesai', progress: 100 });
      return { success: results.errors.length === 0, results };
    } catch (err) {
      console.error('[onlineSyncService] Sync exception:', err);
      return { success: false, error: err.message, results };
    }
  },

  // 4. Real-time Subscription to Supabase Postgres Changes
  initRealtimeSubscription(onUpdate = () => {}) {
    if (!isSupabaseConfigured || typeof window === 'undefined') {
      return { unsubscribe: () => {} };
    }

    try {
      const channel = supabase
        .channel('bibtzy-realtime-cloud')
        .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
          window.dispatchEvent(new CustomEvent('nova-glass-storage-updated', {
            detail: { key: payload.table, payload, isCloudSync: true }
          }));
          onUpdate(payload);
        })
        .subscribe();

      return {
        unsubscribe: () => {
          try {
            supabase.removeChannel(channel);
          } catch (_) {}
        }
      };
    } catch (e) {
      console.warn('[onlineSyncService] Realtime channel subscription failed:', e);
      return { unsubscribe: () => {} };
    }
  }
};
