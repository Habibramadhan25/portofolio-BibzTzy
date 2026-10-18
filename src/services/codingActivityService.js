import { storageService } from './storageService';
import { activityFeedService } from './activityFeedService';
import { achievementService } from './achievementService';

const SESSIONS_KEY = 'coding_sessions';
const ACTIVE_SESSION_KEY = 'active_coding_session';

// Helper to create date relative to now
const daysAgo = (d, hour = 16, min = 0) => {
  const dt = new Date();
  dt.setDate(dt.getDate() - d);
  dt.setHours(hour, min, 0, 0);
  return dt.toISOString();
};

const INITIAL_SESSIONS = [
  {
    id: 'sess-sample-1',
    title: 'Membangun Desain Ice Blue Glassmorphism',
    language: 'CSS / React',
    projectId: 'proj-1',
    projectTitle: 'Website Portfolio BibTzy',
    durationMinutes: 45,
    durationMs: 45 * 60 * 1000,
    startedAt: daysAgo(5, 16, 0),
    completedAt: daysAgo(5, 16, 45),
    notes: 'Mengatur variabel CSS, backdrop-filter blur, border transparan kristal, dan efek hover.',
    isSample: true
  },
  {
    id: 'sess-sample-2',
    title: 'Integrasi LocalStorage & IndexedDB',
    language: 'JavaScript',
    projectId: 'proj-1',
    projectTitle: 'Website Portfolio BibTzy',
    durationMinutes: 60,
    durationMs: 60 * 60 * 1000,
    startedAt: daysAgo(4, 15, 30),
    completedAt: daysAgo(4, 16, 30),
    notes: 'Membuat modul storage terpusat dan penanganan fallback penyimpanan lokal.',
    isSample: true
  },
  {
    id: 'sess-sample-3',
    title: 'Pembuatan Komponen CRUD Proyek',
    language: 'React / JSX',
    projectId: 'proj-1',
    projectTitle: 'Website Portfolio BibTzy',
    durationMinutes: 35,
    durationMs: 35 * 60 * 1000,
    startedAt: daysAgo(3, 19, 0),
    completedAt: daysAgo(3, 19, 35),
    notes: 'Validasi form modal, penanganan gambar, filter kategori, dan pencarian instan.',
    isSample: true
  },
  {
    id: 'sess-sample-4',
    title: 'Eksplorasi Ekspor jsPDF untuk CV',
    language: 'JavaScript / jsPDF',
    projectId: 'proj-1',
    projectTitle: 'Website Portfolio BibTzy',
    durationMinutes: 50,
    durationMs: 50 * 60 * 1000,
    startedAt: daysAgo(2, 14, 0),
    completedAt: daysAgo(2, 14, 50),
    notes: 'Menyusun layout lembar A4, margin simetris, tata letak teks, dan skema warna biru.',
    isSample: true
  },
  {
    id: 'sess-sample-5',
    title: 'Latihan Logika Algoritma & TaskMate',
    language: 'JavaScript',
    projectId: 'proj-2',
    projectTitle: 'TaskMate — Smart ToDo List',
    durationMinutes: 40,
    durationMs: 40 * 60 * 1000,
    startedAt: daysAgo(1, 16, 15),
    completedAt: daysAgo(1, 16, 55),
    notes: 'Implementasi prioritas tugas harian dan filter kategori tugas sekolah.',
    isSample: true
  },
  {
    id: 'sess-sample-6',
    title: 'Pengembangan Fitur Interaktif Terpadu',
    language: 'React / State Management',
    projectId: 'proj-1',
    projectTitle: 'Website Portfolio BibTzy',
    durationMinutes: 25,
    durationMs: 25 * 60 * 1000,
    startedAt: daysAgo(0, 8, 30),
    completedAt: daysAgo(0, 8, 55),
    notes: 'Merancang arsitektur Coding Activity Tracker, Roadmap, dan Command Palette.',
    isSample: true
  }
];

export const codingActivityService = {
  getSessions() {
    const data = storageService.get(SESSIONS_KEY, null);
    if (!data) {
      storageService.set(SESSIONS_KEY, INITIAL_SESSIONS);
      return INITIAL_SESSIONS;
    }
    return data;
  },

  saveSessions(sessions) {
    storageService.set(SESSIONS_KEY, sessions);
    return sessions;
  },

  addSession(session) {
    const sessions = this.getSessions();
    const newSession = {
      id: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ...session,
      createdAt: new Date().toISOString()
    };
    const updated = [newSession, ...sessions];
    this.saveSessions(updated);
    return newSession;
  },

  deleteSession(id) {
    const sessions = this.getSessions();
    const filtered = sessions.filter(s => s.id !== id);
    this.saveSessions(filtered);
    return true;
  },

  // =========================================================================
  // ACTIVE SESSION TRACKER ENGINE (Resilient to reload, background, tabs)
  // =========================================================================
  getActiveSession() {
    return storageService.get(ACTIVE_SESSION_KEY, null);
  },

  startSession({ title = '', language = 'JavaScript', projectId = '', projectTitle = '', notes = '' }) {
    // If there is already an active session, return it
    const existing = this.getActiveSession();
    if (existing) return existing;

    const newSession = {
      id: `active-${Date.now()}`,
      title: title || 'Sesi Belajar Pemrograman',
      language: language || 'JavaScript',
      projectId: projectId || '',
      projectTitle: projectTitle || '',
      notes: notes || '',
      startTime: Date.now(),
      startedAt: new Date().toISOString(),
      accumulatedMs: 0,
      isPaused: false,
      pausedAt: null
    };

    storageService.set(ACTIVE_SESSION_KEY, newSession);
    return newSession;
  },

  pauseSession() {
    const active = this.getActiveSession();
    if (!active || active.isPaused) return active;

    const now = Date.now();
    const currentSegment = now - active.startTime;
    const updated = {
      ...active,
      isPaused: true,
      pausedAt: now,
      accumulatedMs: (active.accumulatedMs || 0) + currentSegment
    };

    storageService.set(ACTIVE_SESSION_KEY, updated);
    return updated;
  },

  resumeSession() {
    const active = this.getActiveSession();
    if (!active || !active.isPaused) return active;

    const updated = {
      ...active,
      isPaused: false,
      pausedAt: null,
      startTime: Date.now()
    };

    storageService.set(ACTIVE_SESSION_KEY, updated);
    return updated;
  },

  cancelSession() {
    storageService.remove(ACTIVE_SESSION_KEY);
    return true;
  },

  finishSession(additionalData = {}) {
    const active = this.getActiveSession();
    if (!active) return null;

    const now = Date.now();
    let totalMs = active.accumulatedMs || 0;
    if (!active.isPaused && active.startTime) {
      totalMs += (now - active.startTime);
    }

    const durationMinutes = Math.max(1, Math.round(totalMs / 60000));

    const completedSession = {
      id: `sess-${now}-${Math.random().toString(36).substring(2, 6)}`,
      title: additionalData.title || active.title || 'Sesi Coding',
      language: additionalData.language || active.language || 'JavaScript',
      projectId: additionalData.projectId || active.projectId || '',
      projectTitle: additionalData.projectTitle || active.projectTitle || '',
      notes: additionalData.notes || active.notes || '',
      durationMinutes,
      durationMs: totalMs,
      startedAt: active.startedAt,
      completedAt: new Date(now).toISOString()
    };

    // Save to permanent sessions list
    const sessions = this.getSessions();
    this.saveSessions([completedSession, ...sessions]);

    // Clear active session
    storageService.remove(ACTIVE_SESSION_KEY);

    // Log to Activity Feed
    activityFeedService.logActivity({
      type: 'coding_session',
      title: `Sesi Coding: ${completedSession.title}`,
      description: `Durasi ${completedSession.durationMinutes} menit (${completedSession.language})`,
      entityId: completedSession.id,
      metadata: { durationMinutes, language: completedSession.language }
    });

    // Award XP (Base: 15 XP + 10 XP bonus if >= 30 mins)
    const xpReward = durationMinutes >= 30 ? 25 : 15;
    achievementService.addXP({
      sourceType: 'coding_session',
      sourceId: completedSession.id,
      amount: xpReward,
      reason: `Menyelesaikan Sesi Coding (${durationMinutes} menit)`
    });

    // Re-evaluate badges
    achievementService.evaluateBadges({
      sessions: [completedSession, ...sessions]
    });

    return completedSession;
  },

  getElapsedMs(activeSession) {
    if (!activeSession) return 0;
    let total = activeSession.accumulatedMs || 0;
    if (!activeSession.isPaused && activeSession.startTime) {
      total += (Date.now() - activeSession.startTime);
    }
    return total;
  },

  // =========================================================================
  // METRICS & STATS ENGINE
  // =========================================================================
  getStats() {
    const sessions = this.getSessions();
    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((acc, s) => acc + (Number(s.durationMinutes) || 0), 0);
    const totalHours = (totalMinutes / 60).toFixed(1);

    // Distinct active days
    const distinctDays = new Set(
      sessions.map(s => {
        const d = s.completedAt || s.startedAt;
        return d ? new Date(d).toISOString().slice(0, 10) : null;
      }).filter(Boolean)
    );

    // Today's stats
    const todayStr = new Date().toISOString().slice(0, 10);
    const todaySessions = sessions.filter(s => {
      const d = s.completedAt || s.startedAt;
      return d && d.slice(0, 10) === todayStr;
    });
    const todayMinutes = todaySessions.reduce((acc, s) => acc + (Number(s.durationMinutes) || 0), 0);

    // Connected projects count
    const connectedProjects = new Set(
      sessions.map(s => s.projectId).filter(Boolean)
    );

    return {
      totalSessions,
      totalMinutes,
      totalHours,
      totalDays: distinctDays.size,
      todaySessionsCount: todaySessions.length,
      todayMinutes,
      projectsWorkedCount: connectedProjects.size
    };
  },

  getWeeklyActivity() {
    const sessions = this.getSessions();
    const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    const now = new Date();
    
    // Get start of this week (Monday)
    const currentDay = now.getDay(); // 0 is Sun, 1 is Mon...
    const distanceToMonday = (currentDay + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday);
    monday.setHours(0, 0, 0, 0);

    const weekData = days.map((dayName, idx) => {
      const targetDate = new Date(monday);
      targetDate.setDate(monday.getDate() + idx);
      const dateStr = targetDate.toISOString().slice(0, 10);

      const daySessions = sessions.filter(s => {
        const d = s.completedAt || s.startedAt;
        return d && d.slice(0, 10) === dateStr;
      });

      const minutes = daySessions.reduce((acc, s) => acc + (Number(s.durationMinutes) || 0), 0);
      const isToday = targetDate.toISOString().slice(0, 10) === now.toISOString().slice(0, 10);

      return {
        day: dayName,
        date: dateStr,
        minutes,
        sessionsCount: daySessions.length,
        isToday
      };
    });

    const maxMinutes = Math.max(60, ...weekData.map(d => d.minutes));

    return {
      days: weekData,
      maxMinutes
    };
  },

  getHeatmapData(weeksCount = 16) {
    const sessions = this.getSessions();
    const totalDays = weeksCount * 7;
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Group sessions by YYYY-MM-DD
    const sessionsByDate = {};
    sessions.forEach(s => {
      const d = s.completedAt || s.startedAt;
      if (d) {
        const key = d.slice(0, 10);
        sessionsByDate[key] = (sessionsByDate[key] || 0) + (Number(s.durationMinutes) || 0);
      }
    });

    const days = [];
    for (let i = totalDays - 1; i >= 0; i--) {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() - i);
      const dateKey = targetDate.toISOString().slice(0, 10);
      const minutes = sessionsByDate[dateKey] || 0;

      // Level 0 - 4
      let level = 0;
      if (minutes > 0 && minutes < 30) level = 1;
      else if (minutes >= 30 && minutes < 60) level = 2;
      else if (minutes >= 60 && minutes < 120) level = 3;
      else if (minutes >= 120) level = 4;

      days.push({
        date: dateKey,
        minutes,
        level,
        dayOfWeek: targetDate.getDay() // 0 = Sun, 1 = Mon ...
      });
    }

    return days;
  }
};
