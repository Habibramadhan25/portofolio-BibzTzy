import React, { useState, useEffect, useMemo } from 'react';
import {
  Compass,
  Plus,
  CheckCircle2,
  Clock,
  Circle,
  Filter,
  BarChart3,
  Layers,
  Sparkles,
  BookOpen,
  Lock
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import GlassCard from '../components/common/GlassCard';
import StatCard from '../components/common/StatCard';
import EmptyState from '../components/common/EmptyState';
import SearchBar from '../components/common/SearchBar';
import FilterDropdown from '../components/common/FilterDropdown';
import ConfirmDialog from '../components/common/ConfirmDialog';
import RoadmapFormModal from '../components/forms/RoadmapFormModal';
import RoadmapCard from '../components/cards/RoadmapCard';
import { roadmapService } from '../services/roadmapService';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { useOwner } from '../context/OwnerContext';
import { PageTransition } from '../components/common/MotionWrapper';

const STATUS_FILTERS = [
  { value: 'all', label: 'Semua Status' },
  { value: 'completed', label: 'Selesai' },
  { value: 'in_progress', label: 'Sedang Dipelajari' },
  { value: 'not_started', label: 'Belum Dimulai' }
];

const CATEGORIES = ['Semua', 'Web Core', 'Frontend', 'Backend', 'Tools'];

export default function LearningRoadmap() {
  const toast = useToast();
  const { playSound } = useTheme();
  const { isOwner, openAuthModal } = useOwner();

  const [roadmap, setRoadmap] = useState([]);
  const [stats, setStats] = useState(() => roadmapService.getProgressStats());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  const reloadData = () => {
    setRoadmap(roadmapService.getRoadmap());
    setStats(roadmapService.getProgressStats());
  };

  useEffect(() => {
    reloadData();

    const handleStorageUpdate = (e) => {
      if (!e.detail || e.detail.key === 'learning_roadmap') {
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

  // Filtered topics
  const filteredRoadmap = useMemo(() => {
    let result = [...roadmap];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r =>
        r.title.toLowerCase().includes(q) ||
        (r.description && r.description.toLowerCase().includes(q)) ||
        (r.notes && r.notes.toLowerCase().includes(q))
      );
    }

    if (selectedCategory !== 'Semua') {
      result = result.filter(r => r.category === selectedCategory);
    }

    if (selectedStatus !== 'all') {
      result = result.filter(r => r.status === selectedStatus);
    }

    return result.sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [roadmap, searchQuery, selectedCategory, selectedStatus]);

  // Handlers
  const handleSaveItem = (itemData) => {
    if (editingItem) {
      const updated = roadmapService.updateItem(editingItem.id, itemData);
      if (updated) {
        toast.success(`Materi "${updated.title}" berhasil diperbarui!`);
      }
    } else {
      const created = roadmapService.addItem(itemData);
      toast.success(`Materi "${created.title}" berhasil ditambahkan ke roadmap!`);
    }
    reloadData();
    setIsFormModalOpen(false);
    setEditingItem(null);
  };

  const handleStatusChange = (id, newStatus) => {
    const updated = roadmapService.updateItem(id, { status: newStatus });
    reloadData();
    if (newStatus === 'completed') {
      playSound?.('success');
      toast.success(`Selamat! "${updated?.title}" telah diselesaikan (+25 XP)!`);
    } else {
      toast.info(`Status "${updated?.title}" diperbarui.`);
    }
  };

  const handleToggleChecklist = (itemId, checkId) => {
    roadmapService.toggleChecklist(itemId, checkId);
    reloadData();
  };

  const handleDeleteConfirm = () => {
    if (!deletingItem) return;
    roadmapService.deleteItem(deletingItem.id);
    reloadData();
    toast.info(`Materi "${deletingItem.title}" telah dihapus.`);
    setDeletingItem(null);
  };

  return (
    <PageTransition style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Page Header */}
      <PageHeader
        badge="Kurikulum Belajar Terstruktur"
        title="Learning Roadmap"
        subtitle="Panduan alur belajar komprehensif mulai dari dasar HTML, CSS, JavaScript, hingga pengembangan aplikasi berbasis React dan Backend."
        actions={
          isOwner ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setEditingItem(null);
                setIsFormModalOpen(true);
              }}
            >
              <Plus size={18} />
              <span>Tambah Materi Baru</span>
            </button>
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

      {/* =========================================================================
          PROGRESS OVERVIEW & CATEGORY BREAKDOWN
          ========================================================================= */}
      <GlassCard className="glass-card-glow" style={{ padding: 'clamp(1.25rem, 4vw, 2rem)' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: '2rem',
          alignItems: 'center'
        }}>
          {/* Left: Overall Big Progress */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <span className="badge badge-cyan" style={{ marginBottom: '0.4rem' }}>Progress Kurikulum</span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Kesiapan Penguasaan Materi</h3>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="font-mono text-gradient" style={{ fontSize: '2.4rem', fontWeight: 800 }}>
                  {stats.percent}%
                </span>
              </div>
            </div>

            <div className="progress-bar-container" style={{ height: '12px' }}>
              <div className="progress-bar-fill" style={{ width: `${stats.percent}%` }} />
            </div>

            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                ● {stats.completedCount} Materi Selesai
              </span>
              <span style={{ color: 'var(--cyan)', fontWeight: 600 }}>
                ● {stats.inProgressCount} Sedang Dipelajari
              </span>
              <span style={{ color: 'var(--text-muted)' }}>
                ○ {stats.notStartedCount} Belum Dimulai
              </span>
            </div>
          </div>

          {/* Right: Category Progress Chips */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 120px), 1fr))',
            gap: '0.75rem',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(13, 21, 36, 0.6)',
            border: '1px solid var(--border-glass)'
          }}>
            {Object.entries(stats.byCategory || {}).map(([catName, catData]) => {
              const catPercent = catData.total > 0 ? Math.round((catData.completed / catData.total) * 100) : 0;
              return (
                <div key={catName} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{catName}</span>
                    <span className="text-ice font-mono">{catPercent}%</span>
                  </div>
                  <div className="progress-bar-container" style={{ height: '5px' }}>
                    <div className="progress-bar-fill" style={{ width: `${catPercent}%` }} />
                  </div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    {catData.completed}/{catData.total} selesai
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </GlassCard>

      {/* =========================================================================
          FILTERS & SEARCH
          ========================================================================= */}
      <div className="filter-bar">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Cari materi roadmap, kata kunci, atau catatan..."
          className="flex-1"
        />

        <div className="filter-group">
          <FilterDropdown
            label="Filter Status"
            value={selectedStatus}
            onChange={setSelectedStatus}
            options={STATUS_FILTERS}
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="filter-tabs">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            type="button"
            className={`filter-tab ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat} {cat !== 'Semua' && `(${roadmap.filter(r => r.category === cat).length})`}
          </button>
        ))}
      </div>

      {/* =========================================================================
          ROADMAP LIST OR EMPTY STATE
          ========================================================================= */}
      {filteredRoadmap.length === 0 ? (
        <EmptyState
          icon={Compass}
          title={searchQuery || selectedCategory !== 'Semua' || selectedStatus !== 'all' ? 'Tidak Ada Topik yang Cocok' : 'Roadmap Masih Kosong'}
          description={
            searchQuery || selectedCategory !== 'Semua' || selectedStatus !== 'all'
              ? 'Silakan coba sesuaikan kata kunci pencarian atau ubah filter status/kategori.'
              : 'Tambahkan topik pembelajaran pertama Anda untuk mulai melacak progres belajar.'
          }
          actionText={isOwner ? "Tambah Topik Baru" : undefined}
          onAction={isOwner ? () => {
            setEditingItem(null);
            setIsFormModalOpen(true);
          } : undefined}
        />
      ) : (
        <div className="roadmap-timeline">
          {filteredRoadmap.map((item) => (
            <RoadmapCard
              key={item.id}
              item={item}
              onStatusChange={isOwner ? handleStatusChange : undefined}
              onToggleChecklist={isOwner ? handleToggleChecklist : undefined}
              onEdit={isOwner ? (it) => {
                setEditingItem(it);
                setIsFormModalOpen(true);
              } : undefined}
              onDelete={isOwner ? (it) => setDeletingItem(it) : undefined}
            />
          ))}
        </div>
      )}

      {/* Form Add / Edit Modal */}
      <RoadmapFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleSaveItem}
        initialData={editingItem}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingItem)}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Materi Roadmap"
        message={`Apakah Anda yakin ingin menghapus materi "${deletingItem?.title}" dari roadmap? Persentase kelulusan kurikulum Anda akan dihitung ulang.`}
        confirmText="Hapus Materi"
        isDanger={true}
      />
    </PageTransition>
  );
}
