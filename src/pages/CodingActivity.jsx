import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  PlayCircle,
  PauseCircle,
  CheckCircle2,
  XCircle,
  Flame,
  Calendar,
  BarChart3,
  FolderGit2,
  Plus,
  Info
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import GlassCard from '../components/common/GlassCard';
import StatCard from '../components/common/StatCard';
import EmptyState from '../components/common/EmptyState';
import SearchBar from '../components/common/SearchBar';
import FilterDropdown from '../components/common/FilterDropdown';
import ConfirmDialog from '../components/common/ConfirmDialog';
import SessionStartModal from '../components/forms/SessionStartModal';
import SessionFinishModal from '../components/forms/SessionFinishModal';
import SessionCard from '../components/cards/SessionCard';
import { codingActivityService } from '../services/codingActivityService';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { useOwner } from '../context/OwnerContext';
import { PageTransition } from '../components/common/MotionWrapper';

export default function CodingActivity() {
  const toast = useToast();
  const { playSound } = useTheme();
  const { isOwner } = useOwner();

  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [elapsedMs, setElapsedMs] = useState(0);

  // Stats & Visualizations
  const [stats, setStats] = useState(() => codingActivityService.getStats());
  const [weeklyData, setWeeklyData] = useState(() => codingActivityService.getWeeklyActivity());
  const [heatmapDays, setHeatmapDays] = useState(() => codingActivityService.getHeatmapData(16));

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');

  // Modals
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [deletingSession, setDeletingSession] = useState(null);

  // Load state from service
  const reloadData = () => {
    setSessions(codingActivityService.getSessions());
    setActiveSession(codingActivityService.getActiveSession());
    setStats(codingActivityService.getStats());
    setWeeklyData(codingActivityService.getWeeklyActivity());
    setHeatmapDays(codingActivityService.getHeatmapData(16));
  };

  useEffect(() => {
    reloadData();

    const handleStorageUpdate = (e) => {
      if (!e.detail || e.detail.key === 'coding_sessions' || e.detail.key === 'active_coding_session') {
        reloadData();
      }
    };

    window.addEventListener('nova-glass-storage-updated', handleStorageUpdate);
    window.addEventListener('nova-glass-storage-reset', reloadData);

    return () => {
      window.removeEventListener('nova-glass-storage-updated', handleStorageUpdate);
      window.removeEventListener('nova-glass-storage-reset', reloadData);
    };
  }, []);

  // Real-time ticking timer for active session
  useEffect(() => {
    if (!activeSession) {
      setElapsedMs(0);
      return;
    }

    // Set initial
    setElapsedMs(codingActivityService.getElapsedMs(activeSession));

    if (activeSession.isPaused) return;

    const timer = setInterval(() => {
      setElapsedMs(codingActivityService.getElapsedMs(activeSession));
    }, 1000);

    return () => clearInterval(timer);
  }, [activeSession]);

  // Format timer as HH:MM:SS or MM:SS
  const formatTimer = (ms) => {
    const totalSecs = Math.floor(ms / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    const pad = (n) => String(n).padStart(2, '0');
    if (hours > 0) {
      return `${pad(hours)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  // Handlers for Timer
  const handleStartSession = (sessionData) => {
    const started = codingActivityService.startSession(sessionData);
    setActiveSession(started);
    toast.success(`Sesi coding "${started.title}" telah dimulai!`);
  };

  const handlePauseResume = () => {
    if (!activeSession) return;
    if (activeSession.isPaused) {
      const resumed = codingActivityService.resumeSession();
      setActiveSession(resumed);
      toast.info('Sesi coding dilanjutkan.');
    } else {
      const paused = codingActivityService.pauseSession();
      setActiveSession(paused);
      toast.info('Sesi coding dijeda.');
    }
  };

  const handleFinishConfirm = (data) => {
    const finished = codingActivityService.finishSession(data);
    setActiveSession(null);
    reloadData();
    playSound?.('success');
    toast.success(`Sesi "${finished.title}" selesai disimpan (+${finished.durationMinutes >= 30 ? '25' : '15'} XP)!`);
  };

  const handleCancelSession = () => {
    codingActivityService.cancelSession();
    setActiveSession(null);
    setIsCancelConfirmOpen(false);
    toast.info('Sesi coding dibatalkan.');
  };

  const handleDeleteSession = () => {
    if (!deletingSession) return;
    codingActivityService.deleteSession(deletingSession.id);
    reloadData();
    toast.info('Sesi berhasil dihapus.');
    setDeletingSession(null);
  };

  // Filtered Sessions
  const filteredSessions = useMemo(() => {
    let result = [...sessions];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s =>
        s.title.toLowerCase().includes(q) ||
        (s.notes && s.notes.toLowerCase().includes(q)) ||
        (s.projectTitle && s.projectTitle.toLowerCase().includes(q))
      );
    }
    if (selectedLanguage !== 'all') {
      result = result.filter(s => s.language === selectedLanguage);
    }
    return result;
  }, [sessions, searchQuery, selectedLanguage]);

  // Unique languages
  const languageOptions = useMemo(() => {
    const langs = new Set(sessions.map(s => s.language).filter(Boolean));
    return [
      { value: 'all', label: 'Semua Bahasa / Kategori' },
      ...Array.from(langs).map(l => ({ value: l, label: l }))
    ];
  }, [sessions]);

  const activeDurationMinutes = Math.max(1, Math.round(elapsedMs / 60000));

  return (
    <PageTransition style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Header */}
      <PageHeader
        badge="Aktivitas & Konsistensi Belajar"
        title="Coding Activity Tracker"
        subtitle="Mencatat durasi belajar pemrograman secara nyata, menganalisis grafik mingguan, serta memantau konsistensi coding harian."
        actions={
          !activeSession ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setIsStartModalOpen(true)}
            >
              <PlayCircle size={18} />
              <span>Mulai Sesi Coding Baru</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setIsFinishModalOpen(true)}
            >
              <CheckCircle2 size={16} />
              <span>Selesaikan Sesi Ini</span>
            </button>
          )
        }
      />

      {/* =========================================================================
          ACTIVE SESSION LIVE TIMER BANNER (If session is active)
          ========================================================================= */}
      {activeSession && (
        <div className="active-session-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            {/* Glowing Timer Circle */}
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: activeSession.isPaused ? 'rgba(251, 191, 36, 0.15)' : 'rgba(69, 207, 255, 0.2)',
              border: `2px solid ${activeSession.isPaused ? 'var(--color-warning)' : 'var(--accent-color)'}`,
              boxShadow: activeSession.isPaused ? 'none' : '0 0 20px rgba(var(--accent-rgb), 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: activeSession.isPaused ? 'var(--color-warning)' : 'var(--accent-color)'
            }}>
              <Clock size={30} className={!activeSession.isPaused ? 'animate-spin-slow' : ''} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                <span className={`badge ${activeSession.isPaused ? 'badge-warning' : 'badge-success'}`}>
                  {activeSession.isPaused ? 'Sesi Dijeda' : 'Sesi Aktif Berjalan'}
                </span>
                <span className="badge badge-ice">{activeSession.language}</span>
                {activeSession.projectTitle && (
                  <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)' }}>
                    {activeSession.projectTitle}
                  </span>
                )}
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>
                {activeSession.title}
              </h3>
            </div>
          </div>

          {/* Large Digital Stopwatch */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'right' }}>
              <div className="timer-large">
                {formatTimer(elapsedMs)}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Target: +{activeDurationMinutes >= 30 ? '25' : '15'} XP setelah selesai
              </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <button
                type="button"
                className={`btn ${activeSession.isPaused ? 'btn-primary' : 'btn-glass'}`}
                onClick={handlePauseResume}
                title={activeSession.isPaused ? 'Lanjutkan sesi' : 'Jeda sesi sementara'}
              >
                {activeSession.isPaused ? <PlayCircle size={18} /> : <PauseCircle size={18} />}
                <span>{activeSession.isPaused ? 'Lanjutkan' : 'Jeda'}</span>
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setIsFinishModalOpen(true)}
                title="Selesaikan dan simpan sesi"
              >
                <CheckCircle2 size={18} />
                <span>Selesai</span>
              </button>

              <button
                type="button"
                className="btn btn-danger btn-icon"
                onClick={() => setIsCancelConfirmOpen(true)}
                title="Batalkan sesi ini"
              >
                <XCircle size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          REAL STATS OVERVIEW
          ========================================================================= */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))',
        gap: '1.25rem'
      }}>
        <StatCard
          icon={Clock}
          value={`${stats.totalHours} Jam`}
          label="Total Durasi Coding"
          description={`${stats.totalMinutes} menit tercatat dari data aktual`}
        />
        <StatCard
          icon={PlayCircle}
          value={stats.totalSessions}
          label="Total Sesi Belajar"
          description={`${stats.todaySessionsCount} sesi diselesaikan hari ini`}
        />
        <StatCard
          icon={Flame}
          value={`${stats.totalDays} Hari`}
          label="Hari Aktif Belajar"
          description="Konsistensi catatan belajar"
        />
        <StatCard
          icon={FolderGit2}
          value={stats.projectsWorkedCount}
          label="Proyek Terkait"
          description="Proyek yang dikerjakan pada sesi"
        />
      </div>

      {/* =========================================================================
          WEEKLY ACTIVITY CHART & HEATMAP
          ========================================================================= */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
        gap: '2rem'
      }}>
        {/* Weekly Activity Barchart */}
        <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div className="stat-icon-wrapper" style={{ width: '38px', height: '38px' }}>
                <BarChart3 size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Aktivitas Minggu Ini</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Durasi coding harian (Senin - Minggu)
                </p>
              </div>
            </div>
            <span className="badge badge-ice" style={{ fontSize: '0.75rem' }}>Minggu Berjalan</span>
          </div>

          <div className="weekly-chart">
            {weeklyData.days.map((d) => {
              const heightPercent = weeklyData.maxMinutes > 0
                ? Math.min(100, Math.round((d.minutes / weeklyData.maxMinutes) * 100))
                : 0;

              return (
                <div key={d.day} className="weekly-bar-col" title={`${d.date}: ${d.minutes} menit (${d.sessionsCount} sesi)`}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {d.minutes > 0 ? `${d.minutes}m` : '-'}
                  </div>
                  <div className="weekly-bar-track">
                    <div
                      className="weekly-bar-fill"
                      style={{
                        height: `${Math.max(4, heightPercent)}%`,
                        opacity: d.minutes > 0 ? 1 : 0.2
                      }}
                    />
                  </div>
                  <span className={`weekly-bar-label ${d.isToday ? 'active' : ''}`}>
                    {d.day} {d.isToday && '✦'}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--border-glass)',
            paddingTop: '0.6rem'
          }}>
            <span>Hari ini: <strong style={{ color: 'var(--ice-blue)' }}>{stats.todayMinutes} menit</strong></span>
            <span>Target harian: 30 menit</span>
          </div>
        </GlassCard>

        {/* Heatmap Contribution Calendar */}
        <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div className="stat-icon-wrapper" style={{ width: '38px', height: '38px' }}>
                <Calendar size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Kalender Kontribusi Belajar</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Catatan 16 minggu terakhir (bergaya GitHub Heatmap)
                </p>
              </div>
            </div>
            <span className="badge badge-cyan" style={{ fontSize: '0.72rem' }}>Aktivitas Nyata</span>
          </div>

          <div className="heatmap-container">
            <div className="heatmap-grid">
              {heatmapDays.map((cell, idx) => (
                <div
                  key={idx}
                  className={`heatmap-cell level-${cell.level}`}
                  title={`${cell.date}: ${cell.minutes} menit belajar`}
                />
              ))}
            </div>
          </div>

          {/* Heatmap Legend */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            borderTop: '1px solid var(--border-glass)',
            paddingTop: '0.6rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Info size={13} className="text-ice" />
              <span>Data dihitung murni dari sesi belajar tersimpan lokal.</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>Kurang</span>
              <div className="heatmap-cell level-0" style={{ width: '10px', height: '10px' }} />
              <div className="heatmap-cell level-1" style={{ width: '10px', height: '10px' }} />
              <div className="heatmap-cell level-2" style={{ width: '10px', height: '10px' }} />
              <div className="heatmap-cell level-3" style={{ width: '10px', height: '10px' }} />
              <div className="heatmap-cell level-4" style={{ width: '10px', height: '10px' }} />
              <span>Banyak</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* =========================================================================
          SESSIONS HISTORY LIST
          ========================================================================= */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Riwayat Sesi Coding ({filteredSessions.length})</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Daftar seluruh aktivitas belajar yang pernah Anda selesaikan.
            </p>
          </div>

          {isOwner && !activeSession && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setIsStartModalOpen(true)}
            >
              <Plus size={16} />
              <span>Mulai Sesi Baru</span>
            </button>
          )}
        </div>

        {/* Filter bar */}
        <div className="filter-bar">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Cari sesi, catatan, atau proyek terkait..."
            className="flex-1"
          />

          <FilterDropdown
            label="Filter Bahasa"
            value={selectedLanguage}
            onChange={setSelectedLanguage}
            options={languageOptions}
          />
        </div>

        {/* Sessions Grid */}
        {filteredSessions.length === 0 ? (
          <EmptyState
            icon={Clock}
            title={searchQuery || selectedLanguage !== 'all' ? 'Tidak Ada Sesi yang Cocok' : 'Belum Ada Sesi Coding'}
            description={
              searchQuery || selectedLanguage !== 'all'
                ? 'Coba ganti filter bahasa atau bersihkan kata kunci pencarian.'
                : 'Mulai sesi coding pertama Anda untuk mencatat waktu belajar dan mendapatkan XP!'
            }
            actionText="Mulai Sesi Coding Pertama"
            onAction={() => setIsStartModalOpen(true)}
          />
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
            gap: '1.25rem'
          }}>
            {filteredSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onDelete={(s) => setDeletingSession(s)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Start Session Modal */}
      <SessionStartModal
        isOpen={isStartModalOpen}
        onClose={() => setIsStartModalOpen(false)}
        onStart={handleStartSession}
      />

      {/* Finish Session Modal */}
      <SessionFinishModal
        isOpen={isFinishModalOpen}
        onClose={() => setIsFinishModalOpen(false)}
        activeSession={activeSession}
        durationMinutes={activeDurationMinutes}
        onFinish={handleFinishConfirm}
      />

      {/* Cancel Active Session Dialog */}
      <ConfirmDialog
        isOpen={isCancelConfirmOpen}
        onClose={() => setIsCancelConfirmOpen(false)}
        onConfirm={handleCancelSession}
        title="Batalkan Sesi Coding"
        message="Apakah Anda yakin ingin membatalkan sesi coding yang sedang berlangsung? Durasi waktu sesi ini tidak akan disimpan ke riwayat dan tidak memperoleh XP."
        confirmText="Ya, Batalkan Sesi"
        isDanger={true}
      />

      {/* Delete Past Session Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingSession)}
        onClose={() => setDeletingSession(null)}
        onConfirm={handleDeleteSession}
        title="Hapus Sesi Coding"
        message={`Apakah Anda yakin ingin menghapus catatan sesi "${deletingSession?.title}"? Tindakan ini akan memperbarui total statistik durasi belajar Anda.`}
        confirmText="Hapus Sesi"
        isDanger={true}
      />
    </PageTransition>
  );
}
