import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Clock,
  Compass,
  FolderGit2,
  Award,
  Flame,
  TrendingUp,
  Trash2,
  Calendar,
  Radio,
  Plus,
  Send,
  Zap,
  RefreshCw
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import GlassCard from '../components/common/GlassCard';
import EmptyState from '../components/common/EmptyState';
import SearchBar from '../components/common/SearchBar';
import FilterDropdown from '../components/common/FilterDropdown';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Modal from '../components/common/Modal';
import CertificateFormModal from '../components/forms/CertificateFormModal';
import { activityFeedService } from '../services/activityFeedService';
import { certificateService } from '../services/certificateService';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { PageTransition, MotionItem, MotionCard, StaggerGrid } from '../components/common/MotionWrapper';
import confetti from 'canvas-confetti';

const TYPE_FILTERS = [
  { value: 'all', label: 'Semua Aktivitas' },
  { value: 'coding_session', label: 'Sesi Coding' },
  { value: 'roadmap', label: 'Learning Roadmap' },
  { value: 'project', label: 'Proyek Portofolio' },
  { value: 'certificate', label: 'Sertifikat' },
  { value: 'achievement', label: 'Prestasi & Lencana' },
  { value: 'level_up', label: 'Kenaikan Level' }
];

export default function ActivityFeed() {
  const toast = useToast();
  const { playSound } = useTheme();

  const [feed, setFeed] = useState([]);
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  // Live real-time clock yang berdetik setiap detik
  const [now, setNow] = useState(() => new Date());

  // Form state untuk pencatatan aktivitas real-time langsung
  const [logForm, setLogForm] = useState({
    title: '',
    type: 'project',
    description: ''
  });

  const reloadFeed = () => {
    setFeed(activityFeedService.getFeed('all'));
  };

  const handleAddCertSubmit = async (formData, selectedFile) => {
    try {
      await certificateService.addCertificate(formData, selectedFile);
      setIsCertModalOpen(false);
      reloadFeed();
      playSound?.('success');
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      toast.success(`Sertifikat "${formData.title}" berhasil ditambahkan & langsung tayang di linimasa real-time!`);
    } catch (err) {
      toast.error('Gagal menambahkan sertifikat. Periksa format data atau file.');
    }
  };

  // 1. Ticker Real-Time: Perbarui waktu setiap detik untuk live clock dan durasi relatif
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Real-time Storage Listener lintas-tab & lintas-jendela
  useEffect(() => {
    reloadFeed();

    const handleStorageUpdate = (e) => {
      if (!e.detail || e.detail.key === 'activity_feed' || e.detail.key === 'projects' || e.detail.key === 'certificates') {
        reloadFeed();
      }
    };

    window.addEventListener('nova-glass-storage-updated', handleStorageUpdate);
    window.addEventListener('nova-glass-storage-reset', reloadFeed);

    return () => {
      window.removeEventListener('nova-glass-storage-updated', handleStorageUpdate);
      window.removeEventListener('nova-glass-storage-reset', reloadFeed);
    };
  }, []);

  // Format durasi relatif dinamis secara real-time
  const getLiveRelativeTime = (isoDate) => {
    if (!isoDate) return '-';
    try {
      const date = new Date(isoDate);
      const diffMs = now.getTime() - date.getTime();
      const diffSec = Math.max(0, Math.floor(diffMs / 1000));
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDays = Math.floor(diffHour / 24);

      if (diffSec < 45) return 'Baru saja • Real-time';
      if (diffSec < 60) return `${diffSec} detik yang lalu`;
      if (diffMin < 60) return `${diffMin} menit yang lalu`;
      if (diffHour < 24) return `${diffHour} jam yang lalu`;
      if (diffDays === 1) return 'Kemarin';
      if (diffDays < 7) return `${diffDays} hari yang lalu`;
      return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (_) {
      return isoDate;
    }
  };

  const filteredFeed = useMemo(() => {
    let result = [...feed];

    if (selectedType !== 'all') {
      result = result.filter(item => item.type === selectedType);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item =>
        item.title.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q))
      );
    }

    return result;
  }, [feed, selectedType, searchQuery]);

  const handleClearFeed = () => {
    activityFeedService.clearFeed();
    reloadFeed();
    setIsClearConfirmOpen(false);
    playSound?.('trash');
    toast.info('Riwayat aktivitas telah dibersihkan.');
  };

  const handleQuickLogSubmit = (e) => {
    e.preventDefault();
    if (!logForm.title.trim()) {
      toast.error('Judul aktivitas wajib diisi!');
      return;
    }

    const created = activityFeedService.logActivity({
      type: logForm.type,
      title: logForm.title.trim(),
      description: logForm.description.trim() || 'Aktivitas belajar & coding langsung dicatat ke linimasa.',
      metadata: { isLive: true }
    });

    if (created) {
      reloadFeed();
      setIsQuickLogOpen(false);
      setLogForm({ title: '', type: 'project', description: '' });
      playSound?.('success');
      toast.success(`Aktivitas "${created.title}" berhasil disiarkan secara real-time!`);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'coding_session':
        return <Clock size={18} className="text-ice" />;
      case 'roadmap':
        return <Compass size={18} className="text-cyan" />;
      case 'project':
        return <FolderGit2 size={18} style={{ color: '#34D399' }} />;
      case 'certificate':
        return <Award size={18} style={{ color: '#FBBF24' }} />;
      case 'achievement':
        return <Flame size={18} style={{ color: '#F472B6' }} />;
      case 'level_up':
        return <TrendingUp size={18} style={{ color: '#C084FC' }} />;
      default:
        return <Sparkles size={18} className="text-ice" />;
    }
  };

  const getActivityBadge = (type) => {
    switch (type) {
      case 'coding_session':
        return <span className="badge badge-ice">Sesi Coding</span>;
      case 'roadmap':
        return <span className="badge badge-cyan">Roadmap</span>;
      case 'project':
        return <span className="badge badge-success">Proyek</span>;
      case 'certificate':
        return <span className="badge badge-warning">Sertifikat</span>;
      case 'achievement':
        return <span className="badge badge-purple">Achievement</span>;
      case 'level_up':
        return <span className="badge badge-cyan">Level Up</span>;
      default:
        return <span className="badge">Aktivitas</span>;
    }
  };

  // Format jam real-time lokal
  const liveTimeString = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const liveDateString = now.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <PageTransition style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <PageHeader
        badge="LOG TRANSPARANSI REAL-TIME"
        title="Activity Feed"
        subtitle="Aliran linimasa riwayat nyata yang aktif dan tersinkronisasi secara real-time: sesi coding, progres kurikulum, karya terbaru, dan pencapaian siswa."
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              id="btn-add-cert-from-feed"
              onClick={() => setIsCertModalOpen(true)}
              title="Tambah sertifikat baru dan siarkan langsung ke linimasa secara real-time"
            >
              <Award size={15} />
              <span>+ Tambah Sertifikat Real-Time</span>
            </button>

            <button
              type="button"
              className="btn btn-glass btn-sm"
              onClick={() => setIsQuickLogOpen(true)}
              title="Catat aktivitas umum secara real-time"
            >
              <Plus size={15} />
              <span>Catat Log Aktivitas</span>
            </button>

            {feed.length > 0 && (
              <button
                type="button"
                className="btn btn-glass btn-sm"
                onClick={() => setIsClearConfirmOpen(true)}
                title="Bersihkan riwayat feed"
              >
                <Trash2 size={15} />
                <span>Bersihkan</span>
              </button>
            )}
          </div>
        }
      />

      {/* Real-Time Live Status Panel */}
      <MotionCard>
        <GlassCard
          style={{
          padding: '1.25rem 1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem',
          background: 'linear-gradient(135deg, rgba(8, 20, 38, 0.94) 0%, rgba(5, 12, 24, 0.98) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(56, 189, 248, 0.08)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Live Pulsing Beacon */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(52, 211, 153, 0.12)', border: '1px solid rgba(52, 211, 153, 0.4)', padding: '0.35rem 0.85rem', borderRadius: '9999px' }}>
            <span style={{
              width: '9px',
              height: '9px',
              borderRadius: '50%',
              background: '#34D399',
              boxShadow: '0 0 12px #34D399',
              display: 'inline-block'
            }} />
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#34D399', letterSpacing: '0.06em' }}>
              LIVE REAL-TIME STREAM
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Waktu Nyata Perangkat:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', fontFamily: 'var(--font-mono)' }}>
                {liveTimeString} WIB
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--ice-blue)' }}>
                • {liveDateString}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          <span style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border-glass)' }}>
            Total <strong>{feed.length}</strong> Aktivitas
          </span>
          <span style={{ color: '#34D399', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Zap size={14} />
            <span>Multi-Tab Auto Sync</span>
          </span>
        </div>
      </GlassCard>
    </MotionCard>

    {/* Filter and Search Bar */}
    <MotionItem className="filter-bar">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Cari aktivitas, judul kegiatan, teknologi, atau deskripsi..."
          className="flex-1"
        />

        <div className="filter-group">
          <FilterDropdown
            label="Filter Jenis Aktivitas"
            value={selectedType}
            onChange={setSelectedType}
            options={TYPE_FILTERS}
          />
        </div>
      </MotionItem>

      {/* Activity Timeline List */}
      {filteredFeed.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title={searchQuery || selectedType !== 'all' ? 'Tidak Ada Aktivitas yang Cocok' : 'Belum Ada Aktivitas'}
          description={
            searchQuery || selectedType !== 'all'
              ? 'Silakan sesuaikan filter pencarian untuk melihat riwayat aktivitas lainnya.'
              : 'Klik "Catat Aktivitas Real-Time" atau buat karya/topik baru untuk melihat aktivitas tercatat secara otomatis di sini.'
          }
          actionText={searchQuery || selectedType !== 'all' ? undefined : 'Catat Aktivitas Pertama'}
          onAction={searchQuery || selectedType !== 'all' ? undefined : () => setIsQuickLogOpen(true)}
        />
      ) : (
        <StaggerGrid style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
          {filteredFeed.map((act) => {
            const isFresh = now.getTime() - new Date(act.createdAt).getTime() < 60000;
            return (
              <MotionCard key={act.id}>
                <GlassCard
                  interactive
                style={{
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1.25rem',
                  backgroundColor: '#090F1E',
                  backgroundImage: isFresh
                    ? 'linear-gradient(180deg, rgba(14, 165, 233, 0.14) 0%, rgba(8, 15, 30, 0.98) 100%)'
                    : 'linear-gradient(180deg, #0E1A33 0%, #060B14 100%)',
                  border: isFresh ? '1px solid rgba(56, 189, 248, 0.55)' : '1px solid rgba(69, 207, 255, 0.22)',
                  boxShadow: isFresh ? '0 0 25px rgba(56, 189, 248, 0.2)' : '0 10px 30px rgba(0, 0, 0, 0.7)'
                }}
              >
                {/* Type Icon Bubble */}
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-glass-bright)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {getActivityIcon(act.type)}
                </div>

                {/* Activity Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {getActivityBadge(act.type)}
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF' }}>
                        {act.title}
                      </h4>
                      {isFresh && (
                        <span style={{
                          fontSize: '0.68rem',
                          background: 'rgba(52, 211, 153, 0.2)',
                          color: '#34D399',
                          border: '1px solid rgba(52, 211, 153, 0.4)',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontWeight: 700
                        }}>
                          BARU
                        </span>
                      )}
                    </div>

                    <span style={{
                      fontSize: '0.8rem',
                      color: isFresh ? '#38BDF8' : 'var(--ice-blue)',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: isFresh ? 700 : 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}>
                      {isFresh && (
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38BDF8', display: 'inline-block' }} />
                      )}
                      {getLiveRelativeTime(act.createdAt)}
                    </span>
                  </div>

                  {act.description && (
                    <p style={{ fontSize: '0.88rem', color: '#CBD5E1', lineHeight: 1.5 }}>
                      {act.description}
                    </p>
                  )}

                  <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    marginTop: '0.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}>
                    <Calendar size={13} />
                    <span>{new Date(act.createdAt).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'medium' })}</span>
                  </div>
                </div>
              </GlassCard>
            </MotionCard>
          );
        })}
      </StaggerGrid>
    )}

      {/* Modal Catat Aktivitas Real-Time */}
      <Modal
        isOpen={isQuickLogOpen}
        onClose={() => setIsQuickLogOpen(false)}
        title="Catat Aktivitas Real-Time"
        icon={Zap}
        maxWidth="540px"
      >
        <form onSubmit={handleQuickLogSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#E0F2FE', marginBottom: '0.45rem' }}>
              Jenis Aktivitas:
            </label>
            <select
              value={logForm.type}
              onChange={(e) => setLogForm({ ...logForm, type: e.target.value })}
              className="form-input"
              style={{ width: '100%' }}
            >
              <option value="project">Proyek Portofolio</option>
              <option value="roadmap">Learning Roadmap</option>
              <option value="certificate">Sertifikat / Lisensi</option>
              <option value="achievement">Prestasi & Pencapaian</option>
              <option value="coding_session">Sesi Belajar Pemrograman</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#E0F2FE', marginBottom: '0.45rem' }}>
              Judul Kegiatan: <span style={{ color: '#F87171' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Menyelesaikan Fitur Sinkronisasi Real-Time"
              value={logForm.title}
              onChange={(e) => setLogForm({ ...logForm, title: e.target.value })}
              className="form-input"
              style={{ width: '100%' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#E0F2FE', marginBottom: '0.45rem' }}>
              Deskripsi Singkat:
            </label>
            <textarea
              placeholder="Jelaskan secara singkat apa yang dipelajari atau dikembangkan..."
              value={logForm.description}
              onChange={(e) => setLogForm({ ...logForm, description: e.target.value })}
              className="form-input"
              rows={3}
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-glass"
              onClick={() => setIsQuickLogOpen(false)}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              <Send size={15} />
              <span>Siarkan ke Feed</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Clear Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isClearConfirmOpen}
        onClose={() => setIsClearConfirmOpen(false)}
        onConfirm={handleClearFeed}
        title="Bersihkan Riwayat Aktivitas"
        message="Apakah Anda yakin ingin menghapus seluruh log riwayat aktivitas pada feed? Data sesi coding dan roadmap Anda tetap aman."
        confirmText="Bersihkan Feed"
        isDanger={true}
      />

      {/* Certificate Form Modal for Real-Time Direct Addition */}
      <CertificateFormModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        onSubmit={handleAddCertSubmit}
      />
    </PageTransition>
  );
}
