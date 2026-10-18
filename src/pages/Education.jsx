import React, { useState, useEffect, useMemo } from 'react';
import {
  GraduationCap,
  Briefcase,
  Plus,
  Calendar,
  Layers,
  BookOpen,
  Lock
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import TimelineItem from '../components/cards/TimelineItem';
import EducationFormModal from '../components/forms/EducationFormModal';
import { educationService } from '../services/educationService';
import { useToast } from '../context/ToastContext';
import { useOwner } from '../context/OwnerContext';
import { PageTransition, MotionItem, MotionCard, StaggerGrid } from '../components/common/MotionWrapper';

export default function Education() {
  const toast = useToast();
  const { isOwner, openAuthModal } = useOwner();
  const [timeline, setTimeline] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'education' | 'experience'

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  const loadTimeline = () => {
    setTimeline(educationService.getTimeline());
  };

  useEffect(() => {
    loadTimeline();

    const handleStorage = (e) => {
      if (!e.detail || e.detail.key === 'timeline') {
        loadTimeline();
      }
    };

    window.addEventListener('nova-glass-storage-updated', handleStorage);
    window.addEventListener('nova-glass-storage-reset', loadTimeline);

    return () => {
      window.removeEventListener('nova-glass-storage-updated', handleStorage);
      window.removeEventListener('nova-glass-storage-reset', loadTimeline);
    };
  }, []);

  const filteredTimeline = useMemo(() => {
    if (activeTab === 'all') return timeline;
    return timeline.filter(item => item.type === activeTab);
  }, [timeline, activeTab]);

  const handleCreateNew = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (formData) => {
    if (editingItem) {
      educationService.updateItem(editingItem.id, formData);
      toast.success('Riwayat berhasil diperbarui!');
    } else {
      educationService.addItem(formData);
      toast.success('Riwayat baru berhasil ditambahkan!');
    }
    loadTimeline();
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingItem) return;
    educationService.deleteItem(deletingItem.id);
    toast.info('Riwayat telah dihapus.');
    setDeletingItem(null);
    loadTimeline();
  };

  const eduCount = timeline.filter(t => t.type === 'education').length;
  const expCount = timeline.filter(t => t.type === 'experience').length;

  return (
    <PageTransition style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <PageHeader
        badge="REKAM JEJAK"
        title="Pendidikan & Pengalaman"
        subtitle="Riwayat institusi sekolah, kegiatan organisasi siswa, dan proyek kolaboratif yang pernah dijalani."
        actions={
          isOwner ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleCreateNew}
              id="btn-add-timeline"
            >
              <Plus size={16} />
              <span>Tambah Riwayat</span>
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

      {/* Tabs Filter Bar */}
      <MotionItem style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap',
        borderBottom: '1px solid var(--border-glass)',
        paddingBottom: '1rem'
      }}>
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          background: 'var(--card-glass)',
          padding: '0.35rem',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-glass)'
        }}>
          <button
            type="button"
            className={`filter-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            Semua ({timeline.length})
          </button>
          <button
            type="button"
            className={`filter-tab ${activeTab === 'education' ? 'active' : ''}`}
            onClick={() => setActiveTab('education')}
          >
            Pendidikan ({eduCount})
          </button>
          <button
            type="button"
            className={`filter-tab ${activeTab === 'experience' ? 'active' : ''}`}
            onClick={() => setActiveTab('experience')}
          >
            Pengalaman & Organisasi ({expCount})
          </button>
        </div>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Disusun berdasarkan kronologi waktu
        </div>
      </MotionItem>

      {/* Timeline List */}
      {filteredTimeline.length > 0 ? (
        <StaggerGrid className="timeline-container" style={{ maxWidth: '850px' }}>
          {filteredTimeline.map(item => (
            <MotionCard key={item.id} hoverLift={false}>
              <TimelineItem
                item={item}
                onEdit={isOwner ? handleEdit : openAuthModal}
                onDelete={isOwner ? (it) => setDeletingItem(it) : openAuthModal}
              />
            </MotionCard>
          ))}
        </StaggerGrid>
      ) : (
        <EmptyState
          icon={BookOpen}
          title={activeTab !== 'all' ? `Belum Ada Data ${activeTab === 'education' ? 'Pendidikan' : 'Pengalaman'}` : 'Belum Ada Riwayat'}
          description="Tambahkan riwayat jenjang sekolah, jurusan, atau pengalaman divisi organisasi Anda."
          actionText={isOwner ? "Tambah Riwayat Sekarang" : undefined}
          onAction={isOwner ? handleCreateNew : undefined}
        />
      )}

      {/* Form Modal */}
      <EducationFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingItem}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingItem)}
        title="Hapus Riwayat?"
        message={`Apakah Anda yakin ingin menghapus data "${deletingItem?.institution} - ${deletingItem?.role}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Riwayat"
        cancelText="Batal"
        danger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingItem(null)}
      />
    </PageTransition>
  );
}
