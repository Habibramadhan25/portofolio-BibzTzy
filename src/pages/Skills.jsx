import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Plus,
  Code2,
  TrendingUp,
  Award,
  Layers,
  RotateCcw,
  Lock
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import SearchBar from '../components/common/SearchBar';
import FilterDropdown from '../components/common/FilterDropdown';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import StatCard from '../components/common/StatCard';
import SkillCard from '../components/cards/SkillCard';
import SkillFormModal from '../components/forms/SkillFormModal';
import { skillService } from '../services/skillService';
import { useToast } from '../context/ToastContext';
import { useOwner } from '../context/OwnerContext';
import { PageTransition, MotionItem, MotionCard, StaggerGrid } from '../components/common/MotionWrapper';

const SKILL_CATEGORIES = [
  { value: 'all', label: 'Semua Kategori' },
  { value: 'Frontend', label: 'Frontend Development' },
  { value: 'Backend', label: 'Backend Development' },
  { value: 'Programming Languages', label: 'Programming Languages' },
  { value: 'Database', label: 'Database' },
  { value: 'Tools', label: 'Tools & Version Control' },
  { value: 'UI/UX Design', label: 'UI/UX Design' },
  { value: 'Game Dev', label: 'Game Development' }
];

export default function Skills() {
  const navigate = useNavigate();
  const toast = useToast();
  const { isOwner, openAuthModal } = useOwner();
  const [skills, setSkills] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');


  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [deletingSkill, setDeletingSkill] = useState(null);

  const loadSkills = () => {
    setSkills(skillService.getSkills());
  };

  useEffect(() => {
    loadSkills();

    const handleStorage = (e) => {
      if (!e.detail || e.detail.key === 'skills') {
        loadSkills();
      }
    };

    window.addEventListener('nova-glass-storage-updated', handleStorage);
    window.addEventListener('nova-glass-storage-reset', loadSkills);

    return () => {
      window.removeEventListener('nova-glass-storage-updated', handleStorage);
      window.removeEventListener('nova-glass-storage-reset', loadSkills);
    };
  }, []);

  // Filtered skills
  const filteredSkills = useMemo(() => {
    return skills.filter(skill => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q ||
        skill.name.toLowerCase().includes(q) ||
        (skill.shortDesc && skill.shortDesc.toLowerCase().includes(q)) ||
        (skill.category && skill.category.toLowerCase().includes(q));

      const matchCat = selectedCategory === 'all' || skill.category === selectedCategory;

      return matchSearch && matchCat;
    });
  }, [skills, searchQuery, selectedCategory]);

  // Stats calculation
  const stats = useMemo(() => {
    if (skills.length === 0) return { avg: 0, advanced: 0, categoriesCount: 0 };
    const totalProf = skills.reduce((acc, s) => acc + (Number(s.proficiency) || 0), 0);
    const avg = Math.round(totalProf / skills.length);
    const advanced = skills.filter(s => (Number(s.proficiency) || 0) >= 80).length;
    const cats = new Set(skills.map(s => s.category));
    return { avg, advanced, categoriesCount: cats.size };
  }, [skills]);

  const handleCreateNew = () => {
    setEditingSkill(null);
    setIsFormOpen(true);
  };

  const handleEdit = (skill) => {
    setEditingSkill(skill);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (formData) => {
    if (editingSkill) {
      skillService.updateSkill(editingSkill.id, formData);
      toast.success(`Skill "${formData.name}" berhasil diperbarui!`);
    } else {
      skillService.addSkill(formData);
      toast.success(`Skill "${formData.name}" berhasil ditambahkan!`);
    }
    loadSkills();
    setIsFormOpen(false);
    setEditingSkill(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingSkill) return;
    skillService.deleteSkill(deletingSkill.id);
    toast.info(`Skill "${deletingSkill.name}" telah dihapus.`);
    setDeletingSkill(null);
    loadSkills();
  };

  return (
    <PageTransition style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <PageHeader
        badge="KOMPETENSI TEKNIS"
        title="Keahlian & Teknologi"
        subtitle="Daftar keahlian teknis pemrograman, perancangan antarmuka, dan perkakas pengembangan yang telah saya pelajari."
        actions={
          isOwner ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleCreateNew}
              id="btn-add-skill"
            >
              <Plus size={16} />
              <span>Tambah Skill Baru</span>
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

      {/* Stats row */}
      <StaggerGrid style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))',
        gap: '1.25rem'
      }}>
        <MotionCard>
          <StatCard
            icon={Code2}
            number={skills.length}
            label="Total Keterampilan"
          />
        </MotionCard>
        <MotionCard>
          <StatCard
            icon={TrendingUp}
            number={`${stats.avg}%`}
            label="Rata-rata Penguasaan"
          />
        </MotionCard>
        <MotionCard>
          <StatCard
            icon={Award}
            number={stats.advanced}
            label="Keahlian Mahir (≥80%)"
          />
        </MotionCard>
        <MotionCard>
          <StatCard
            icon={Layers}
            number={stats.categoriesCount}
            label="Kategori Keahlian"
          />
        </MotionCard>
      </StaggerGrid>

      {/* Filter and Search Bar */}
      <MotionItem className="filter-bar">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Cari keahlian (contoh: React, CSS, PHP)..."
          className="search-input-wrapper"
        />

        <div className="filter-group">
          <FilterDropdown
            label="Kategori"
            value={selectedCategory}
            options={SKILL_CATEGORIES}
            onChange={setSelectedCategory}
          />

          {(searchQuery || selectedCategory !== 'all') && (
            <button
              type="button"
              className="btn btn-glass btn-sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              title="Reset Filter"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </MotionItem>

      {/* Skills Grid */}
      {filteredSkills.length > 0 ? (
        <StaggerGrid style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
          gap: '1.5rem'
        }}>
          {filteredSkills.map(skill => (
            <MotionCard key={skill.id}>
              <SkillCard
                skill={skill}
                onEdit={isOwner ? handleEdit : openAuthModal}
                onDelete={isOwner ? (s) => setDeletingSkill(s) : openAuthModal}
              />
            </MotionCard>
          ))}
        </StaggerGrid>
      ) : (
        <EmptyState
          icon={Code2}
          title={searchQuery || selectedCategory !== 'all' ? 'Tidak Ada Skill yang Cocok' : 'Belum Ada Keahlian'}
          description={
            searchQuery || selectedCategory !== 'all'
              ? 'Tidak ditemukan keterampilan yang sesuai dengan kata kunci atau filter ini.'
              : 'Daftar keahlian Anda masih kosong. Tambahkan bahasa pemrograman atau tools pertama Anda sekarang!'
          }
          actionText={
            searchQuery || selectedCategory !== 'all'
              ? 'Bersihkan Filter'
              : (isOwner ? 'Tambah Skill Sekarang' : undefined)
          }
          onAction={
            searchQuery || selectedCategory !== 'all'
              ? () => { setSearchQuery(''); setSelectedCategory('all'); }
              : (isOwner ? handleCreateNew : undefined)
          }
        />
      )}

      {/* Form Modal */}
      <SkillFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingSkill(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingSkill}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingSkill)}
        title="Hapus Keterampilan?"
        message={`Apakah Anda yakin ingin menghapus skill "${deletingSkill?.name}"? Data penguasaan ini akan dihapus dari portofolio lokal Anda.`}
        confirmText="Hapus Skill"
        cancelText="Batal"
        danger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingSkill(null)}
      />
    </PageTransition>
  );
}
