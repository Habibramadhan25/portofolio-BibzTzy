import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  RotateCcw,
  FolderOpen,
  Lock,
  Trash2
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import SearchBar from '../components/common/SearchBar';
import FilterDropdown from '../components/common/FilterDropdown';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ProjectCard from '../components/cards/ProjectCard';
import ProjectDetailModal from '../components/cards/ProjectDetailModal';
import ProjectFormModal from '../components/forms/ProjectFormModal';
import { projectService } from '../services/projectService';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { useOwner } from '../context/OwnerContext';
import { PageTransition, MotionItem, MotionCard, StaggerGrid } from '../components/common/MotionWrapper';

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'Semua Kategori' },
  { value: 'Website', label: 'Website' },
  { value: 'Aplikasi', label: 'Aplikasi' },
  { value: 'UI/UX', label: 'UI/UX' },
  { value: 'JavaScript', label: 'JavaScript' },
  { value: 'Backend', label: 'Backend' },
  { value: 'Game Dev', label: 'Game Dev' },
  { value: 'Eksperimen', label: 'Eksperimen' }
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'Semua Status' },
  { value: 'Selesai', label: 'Selesai' },
  { value: 'Dalam Proses', label: 'Dalam Proses' },
  { value: 'Konsep', label: 'Konsep' }
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Terbaru' },
  { value: 'oldest', label: 'Terlama' },
  { value: 'name-asc', label: 'Nama (A-Z)' },
  { value: 'favorite', label: 'Favorit Teratas' }
];

export default function Projects() {
  const toast = useToast();
  const { isOwner, openAuthModal } = useOwner();
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [detailProject, setDetailProject] = useState(null);
  const [deletingProject, setDeletingProject] = useState(null);
  const [isClearAllOpen, setIsClearAllOpen] = useState(false);

  const loadProjects = () => {
    setProjects(projectService.getProjects());
  };

  useEffect(() => {
    loadProjects();

    const handleStorage = (e) => {
      if (!e.detail || e.detail.key === 'projects') {
        loadProjects();
      }
    };

    window.addEventListener('nova-glass-storage-updated', handleStorage);
    window.addEventListener('nova-glass-storage-reset', loadProjects);

    return () => {
      window.removeEventListener('nova-glass-storage-updated', handleStorage);
      window.removeEventListener('nova-glass-storage-reset', loadProjects);
    };
  }, []);

  // Filtered & Sorted Projects
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q ||
        project.title.toLowerCase().includes(q) ||
        (project.shortDesc && project.shortDesc.toLowerCase().includes(q)) ||
        (project.fullDesc && project.fullDesc.toLowerCase().includes(q)) ||
        (Array.isArray(project.techStack) && project.techStack.some(t => t.toLowerCase().includes(q)));

      // Category
      const matchCategory = selectedCategory === 'all' || project.category === selectedCategory;

      // Status
      const matchStatus = selectedStatus === 'all' || project.status === selectedStatus;

      return matchSearch && matchCategory && matchStatus;
    }).sort((a, b) => {
      if (sortBy === 'favorite') {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
      }
      if (sortBy === 'oldest') {
        return (a.date || '').localeCompare(b.date || '');
      }
      if (sortBy === 'name-asc') {
        return a.title.localeCompare(b.title);
      }
      // default: newest
      return (b.date || '').localeCompare(a.date || '');
    });
  }, [projects, searchQuery, selectedCategory, selectedStatus, sortBy]);

  const handleCreateNew = () => {
    setEditingProject(null);
    setIsFormOpen(true);
  };

  const handleEdit = (project) => {
    if (!project) return;
    setEditingProject({ ...project });
    setIsFormOpen(true);
  };

  const handleDeleteClick = (project) => {
    if (!project) return;
    setDeletingProject({ ...project });
  };

  const handleFormSubmit = (formData) => {
    if (editingProject && editingProject.id) {
      const res = projectService.updateProject(editingProject.id, formData);
      if (res) {
        toast.success(`Proyek "${formData.title}" berhasil diperbarui!`);
      } else {
        toast.error('Gagal memperbarui proyek.');
      }
    } else {
      const res = projectService.addProject(formData);
      if (res) {
        toast.success(`Proyek "${formData.title}" berhasil ditambahkan!`);
      } else {
        toast.error('Gagal menambahkan proyek baru.');
      }
    }
    loadProjects();
    setIsFormOpen(false);
    setEditingProject(null);
  };

  const handleToggleFavorite = (id) => {
    projectService.toggleFavorite(id);
    loadProjects();
  };

  const handleConfirmDelete = () => {
    if (!deletingProject || !deletingProject.id) return;
    const titleToDelete = deletingProject.title || 'Proyek';
    const res = projectService.deleteProject(deletingProject.id);
    if (res) {
      toast.info(`Proyek "${titleToDelete}" telah dihapus.`);
    } else {
      toast.error('Gagal menghapus proyek.');
    }
    setDeletingProject(null);
    loadProjects();
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSortBy('newest');
  };

  const { playSound } = useTheme();

  return (
    <PageTransition style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <PageHeader
        badge="PORTOFOLIO DIGITAL"
        title="Katalog Proyek & Karya"
        subtitle="Daftar proyek pembuatan website, antarmuka pengguna, dan eksperimen kode yang telah saya kembangkan."
        actions={
          isOwner ? (
            <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {projects.length > 0 && (
                <button
                  type="button"
                  className="btn btn-glass btn-sm"
                  onClick={() => setIsClearAllOpen(true)}
                  style={{
                    color: '#ff6b6b',
                    borderColor: 'rgba(255, 107, 107, 0.35)',
                    background: 'rgba(255, 107, 107, 0.08)',
                    gap: '0.45rem',
                    padding: '0.5rem 0.9rem'
                  }}
                  title="Hapus seluruh proyek dari portofolio"
                  id="btn-clear-all-projects"
                >
                  <Trash2 size={15} />
                  <span>Hapus Semua ({projects.length})</span>
                </button>
              )}
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleCreateNew}
                id="btn-add-project"
              >
                <Plus size={16} />
                <span>Tambah Proyek Baru</span>
              </button>
            </div>
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

      {/* Filter and Search Bar */}
      <MotionItem className="filter-bar">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Cari berdasarkan judul, teknologi, atau deskripsi..."
          className="search-input-wrapper"
        />

        <div className="filter-group">
          <FilterDropdown
            label="Kategori"
            value={selectedCategory}
            options={CATEGORY_OPTIONS}
            onChange={setSelectedCategory}
          />

          <FilterDropdown
            label="Status"
            value={selectedStatus}
            options={STATUS_OPTIONS}
            onChange={setSelectedStatus}
          />

          <FilterDropdown
            label="Urutkan"
            value={sortBy}
            options={SORT_OPTIONS}
            onChange={setSortBy}
          />

          {(searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all' || sortBy !== 'newest') && (
            <button
              type="button"
              className="btn btn-glass btn-sm"
              onClick={handleResetFilters}
              title="Reset Filter"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </MotionItem>

      {/* Quick Summary Counter */}
      <MotionItem style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
        <span>
          Menampilkan <strong>{filteredProjects.length}</strong> dari <strong>{projects.length}</strong> total proyek
        </span>
      </MotionItem>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <StaggerGrid style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 420px))',
          gap: '1.75rem',
          justifyContent: 'start'
        }}>
          {filteredProjects.map(project => (
            <MotionCard key={project.id}>
              <ProjectCard
                project={project}
                onDetail={(p) => setDetailProject(p)}
                onEdit={isOwner ? handleEdit : openAuthModal}
                onDelete={isOwner ? handleDeleteClick : openAuthModal}
                onToggleFavorite={isOwner ? handleToggleFavorite : openAuthModal}
              />
            </MotionCard>
          ))}
        </StaggerGrid>
      ) : (
        <EmptyState
          icon={FolderOpen}
          title={searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all' ? 'Tidak Ada Proyek yang Cocok' : 'Belum Ada Proyek'}
          description={
            searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all'
              ? 'Tidak ditemukan proyek dengan kriteria pencarian tersebut. Silakan bersihkan filter pencarian Anda.'
              : 'Mulailah dengan menambahkan karya atau proyek pertama Anda untuk menampilkannya di portofolio.'
          }
          actionText={
            searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all'
              ? 'Bersihkan Filter'
              : 'Tambah Proyek Pertama'
          }
          onAction={
            searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all'
              ? handleResetFilters
              : handleCreateNew
          }
        />
      )}

      {/* Create / Edit Modal */}
      <ProjectFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProject(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingProject}
      />

      {/* Detail Modal */}
      <ProjectDetailModal
        isOpen={Boolean(detailProject)}
        onClose={() => setDetailProject(null)}
        project={detailProject}
        onEdit={isOwner ? handleEdit : undefined}
      />

      {/* Delete Single Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingProject)}
        title="Hapus Proyek?"
        message={`Apakah Anda yakin ingin menghapus proyek "${deletingProject?.title}"? Data proyek akan dihapus dari penyimpanan lokal browser Anda.`}
        confirmText="Hapus Proyek"
        cancelText="Batal"
        danger={true}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletingProject(null)}
        onCancel={() => setDeletingProject(null)}
      />

      {/* Clear All Confirmation */}
      <ConfirmDialog
        isOpen={isClearAllOpen}
        title="Hapus Semua Proyek?"
        message={`Apakah Anda yakin ingin menghapus seluruh ${projects.length} proyek? Semua proyek akan dibersihkan dan tidak akan muncul kembali.`}
        confirmText="Ya, Hapus Semua"
        cancelText="Batal"
        danger={true}
        onConfirm={() => {
          projectService.clearAllProjects();
          toast.info('Seluruh proyek berhasil dihapus.');
          setIsClearAllOpen(false);
          loadProjects();
        }}
        onClose={() => setIsClearAllOpen(false)}
        onCancel={() => setIsClearAllOpen(false)}
      />
    </PageTransition>
  );
}
