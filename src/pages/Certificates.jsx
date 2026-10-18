import React, { useState, useEffect, useMemo } from 'react';
import {
  Award,
  Plus,
  RotateCcw,
  Lock
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import SearchBar from '../components/common/SearchBar';
import FilterDropdown from '../components/common/FilterDropdown';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import CertificateCard from '../components/cards/CertificateCard';
import CertificatePreviewModal from '../components/cards/CertificatePreviewModal';
import CertificateFormModal from '../components/forms/CertificateFormModal';
import { certificateService } from '../services/certificateService';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { useOwner } from '../context/OwnerContext';
import { PageTransition, MotionItem, MotionCard, StaggerGrid } from '../components/common/MotionWrapper';
import confetti from 'canvas-confetti';

const STANDARD_CATEGORIES = ['Web Development', 'UI/UX Design', 'Programming', 'Desain', 'Basis Data'];

const BASE_CERT_CATEGORIES = [
  { value: 'all', label: 'Semua Kategori' },
  { value: 'Web Development', label: 'Web Development' },
  { value: 'UI/UX Design', label: 'UI/UX Design' },
  { value: 'Programming', label: 'Programming' },
  { value: 'Desain', label: 'Desain Grafis' },
  { value: 'Basis Data', label: 'Basis Data' }
];

export default function Certificates() {
  const toast = useToast();
  const { isOwner, openAuthModal } = useOwner();
  const [certificates, setCertificates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCert, setEditingCert] = useState(null);
  const [previewCert, setPreviewCert] = useState(null);
  const [previewMediaSrc, setPreviewMediaSrc] = useState('');
  const [deletingCert, setDeletingCert] = useState(null);

  const loadCertificates = () => {
    setCertificates(certificateService.getCertificates());
  };

  useEffect(() => {
    loadCertificates();

    const handleStorage = (e) => {
      if (!e.detail || e.detail.key === 'certificates') {
        loadCertificates();
      }
    };

    window.addEventListener('nova-glass-storage-updated', handleStorage);
    window.addEventListener('nova-glass-storage-reset', loadCertificates);

    return () => {
      window.removeEventListener('nova-glass-storage-updated', handleStorage);
      window.removeEventListener('nova-glass-storage-reset', loadCertificates);
    };
  }, []);

  // Opsi kategori dinamis yang mencakup kategori manual kustom
  const categoryOptions = useMemo(() => {
    const standardValues = new Set(STANDARD_CATEGORIES);
    const customCats = [];
    certificates.forEach(c => {
      if (c.category && !standardValues.has(c.category) && c.category !== 'Lainnya') {
        if (!customCats.includes(c.category)) {
          customCats.push(c.category);
        }
      }
    });
    const customOptions = customCats.map(cat => ({ value: cat, label: cat }));
    return [...BASE_CERT_CATEGORIES, ...customOptions, { value: 'Lainnya', label: 'Lainnya' }];
  }, [certificates]);

  const filteredCertificates = useMemo(() => {
    return certificates.filter(cert => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q ||
        cert.title.toLowerCase().includes(q) ||
        cert.issuer.toLowerCase().includes(q) ||
        (cert.description && cert.description.toLowerCase().includes(q));

      const matchCat = selectedCategory === 'all' ||
        cert.category === selectedCategory ||
        (selectedCategory === 'Lainnya' && (!STANDARD_CATEGORIES.includes(cert.category) || cert.category === 'Lainnya'));

      return matchSearch && matchCat;
    });
  }, [certificates, searchQuery, selectedCategory]);

  const handleCreateNew = () => {
    setEditingCert(null);
    setIsFormOpen(true);
  };

  const handleEdit = (cert) => {
    setEditingCert(cert);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData, selectedFile) => {
    try {
      if (editingCert) {
        await certificateService.updateCertificate(editingCert.id, formData, selectedFile);
        playSound?.('success');
        toast.success(`Sertifikat "${formData.title}" berhasil diperbarui!`);
      } else {
        await certificateService.addCertificate(formData, selectedFile);
        playSound?.('success');
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
        toast.success(`Sertifikat "${formData.title}" berhasil ditambahkan & disiarkan real-time ke Activity Feed!`);
      }
      loadCertificates();
      setIsFormOpen(false);
      setEditingCert(null);
    } catch (err) {
      toast.error('Gagal menyimpan sertifikat. Periksa format file.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingCert) return;
    await certificateService.deleteCertificate(deletingCert.id);
    toast.info(`Sertifikat "${deletingCert.title}" telah dihapus.`);
    setDeletingCert(null);
    loadCertificates();
  };

  const handlePreview = (cert, mediaSrc) => {
    setPreviewCert(cert);
    setPreviewMediaSrc(mediaSrc);
  };

  const { playSound } = useTheme();

  return (
    <PageTransition style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <PageHeader
        badge="VALIDASI KREDENSIAL"
        title="Galeri Sertifikat & Lisensi"
        subtitle="Dokumentasi sertifikasi pelatihan, kursus pemrograman, dan pencapaian kompetensi siswa."
        actions={
          isOwner ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleCreateNew}
              id="btn-add-cert"
            >
              <Plus size={16} />
              <span>Tambah Sertifikat</span>
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

      {/* Filter and Search Bar */}
      <MotionItem className="filter-bar">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Cari judul sertifikat atau penerbit (Dicoding, Skilvul, Progate)..."
          className="search-input-wrapper"
        />

        <div className="filter-group">
          <FilterDropdown
            label="Kategori"
            value={selectedCategory}
            options={categoryOptions}
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

      {/* Quick Count */}
      <MotionItem style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
        Menampilkan <strong>{filteredCertificates.length}</strong> dari <strong>{certificates.length}</strong> total sertifikat
      </MotionItem>

      {/* Certificates Grid */}
      {filteredCertificates.length > 0 ? (
        <StaggerGrid style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 350px))',
          gap: '1.5rem',
          justifyContent: 'start'
        }}>
          {filteredCertificates.map(cert => (
            <MotionCard key={cert.id}>
              <CertificateCard
                certificate={cert}
                onPreview={handlePreview}
                onEdit={isOwner ? handleEdit : openAuthModal}
                onDelete={isOwner ? (c) => setDeletingCert(c) : openAuthModal}
              />
            </MotionCard>
          ))}
        </StaggerGrid>
      ) : (
        <EmptyState
          icon={Award}
          title={searchQuery || selectedCategory !== 'all' ? 'Tidak Ada Sertifikat yang Cocok' : 'Belum Ada Sertifikat'}
          description={
            searchQuery || selectedCategory !== 'all'
              ? 'Tidak ditemukan sertifikat dengan kriteria pencarian ini. Silakan atur ulang filter pencarian Anda.'
              : 'Unggah sertifikat kursus atau bukti kompetensi keahlian Anda untuk memperkuat portofolio.'
          }
          actionText={
            searchQuery || selectedCategory !== 'all'
              ? 'Bersihkan Filter'
              : (isOwner ? 'Tambah Sertifikat Sekarang' : undefined)
          }
          onAction={
            searchQuery || selectedCategory !== 'all'
              ? () => { setSearchQuery(''); setSelectedCategory('all'); }
              : (isOwner ? handleCreateNew : undefined)
          }
        />
      )}

      {/* Form Modal */}
      <CertificateFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingCert(null);
        }}
        onSubmit={handleFormSubmit}
        onDelete={isOwner ? (cert) => {
          setIsFormOpen(false);
          setDeletingCert(cert);
        } : openAuthModal}
        initialData={editingCert}
      />

      {/* Preview Modal */}
      <CertificatePreviewModal
        isOpen={Boolean(previewCert)}
        onClose={() => {
          setPreviewCert(null);
          setPreviewMediaSrc('');
        }}
        certificate={previewCert}
        mediaSrc={previewMediaSrc}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingCert)}
        title="Hapus Sertifikat?"
        message={`Apakah Anda yakin ingin menghapus sertifikat "${deletingCert?.title}"? Dokumen dan gambar terkait akan dihapus dari penyimpanan browser.`}
        confirmText="Hapus Sertifikat"
        cancelText="Batal"
        danger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingCert(null)}
      />
    </PageTransition>
  );
}
