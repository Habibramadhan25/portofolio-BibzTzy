import React, { useState, useEffect, useMemo } from 'react';
import {
  Brain,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Lock,
  Globe,
  Trash2,
  Edit3,
  RotateCcw,
  Sparkles,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertTriangle,
  MessageSquare,
  ArrowRight,
  Send,
  X,
  Save,
  HelpCircle,
  CloudUpload,
  User,
  Users,
  Compass,
  Check
} from 'lucide-react';
import GlassCard from '../common/GlassCard';
import ConfirmDialog from '../common/ConfirmDialog';
import { useOwner } from '../../context/OwnerContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import {
  ownerKnowledgeService,
  KNOWLEDGE_CATEGORIES,
  KNOWLEDGE_SYNC_EVENT
} from '../../services/ownerKnowledgeService';
import { isSupabaseConfigured } from '../../lib/supabase';

// Template saran penambahan fakta cepat
const QUICK_FACT_TEMPLATES = [
  {
    label: 'Warna Favorit',
    key: 'warna_favorit',
    category: 'media',
    target_entity: 'owner',
    keywords: 'warna, warna favorit, warna kesukaan, color, favourite color',
    value: '',
    access_level: 'public',
    verification_status: 'verified'
  },
  {
    label: 'Musik / Lagu Favorit',
    key: 'musik_favorit',
    category: 'media',
    target_entity: 'owner',
    keywords: 'musik, lagu, playlist, genre musik, musik favorit, lagu favorit',
    value: '',
    access_level: 'public',
    verification_status: 'verified'
  },
  {
    label: 'Film Favorit',
    key: 'film_favorit',
    category: 'media',
    target_entity: 'owner',
    keywords: 'film, movie, bioskop, film favorit, tontonan favorit',
    value: '',
    access_level: 'public',
    verification_status: 'verified'
  },
  {
    label: 'Cita-cita & Impian',
    key: 'cita_cita',
    category: 'goals',
    target_entity: 'owner',
    keywords: 'cita-cita, cita cita, tujuan, impian, karier, target masa depan',
    value: 'Menjadi Web Developer profesional dan software architect.',
    access_level: 'public',
    verification_status: 'verified'
  },
  {
    label: 'Makanan Favorit Teman (Bibztzy)',
    key: 'makanan_bibztzy',
    category: 'friends',
    target_entity: 'bibztzy',
    keywords: 'makanan bibztzy, makanan temannya, kesukaan bibztzy, makanan teman owner',
    value: '',
    access_level: 'public',
    verification_status: 'pending'
  }
];

// Pertanyaan uji cepat multi-turn
const SAMPLE_TEST_PROMPTS = [
  'Apa makanan kesukaan owner?',
  'Kalau minumannya?',
  'Kalau teman dekatnya?',
  'Apa makanan kesukaan teman dekat owner?',
  'Owner sekarang belajar apa?',
  'Proyek apa yang sedang dikerjakan owner?',
  'Apa hubungan antara informasi yang sudah dibahas sebelumnya?',
  'Apa warna favorit owner?'
];

export default function OwnerKnowledgeManager() {
  const { isOwner, openAuthModal } = useOwner();
  const { playSound } = useTheme();
  const toast = useToast();

  const [facts, setFacts] = useState(() => ownerKnowledgeService.getFacts());
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedEntityFilter, setSelectedEntityFilter] = useState('all'); // 'all' | 'owner' | 'friends'
  const [selectedAccessFilter, setSelectedAccessFilter] = useState('all'); // 'all' | 'public' | 'restricted'
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);

  // Form Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFact, setEditingFact] = useState(null);
  const [formData, setFormData] = useState({
    category: 'identity',
    target_entity: 'owner',
    key: '',
    label: '',
    value: '',
    keywords: '',
    access_level: 'public',
    isPublic: true,
    verification_status: 'verified',
    isVerified: true,
    restricted_message: ''
  });

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    factId: null
  });

  // Live Test Sandbox state
  const [testQuery, setTestQuery] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [testHistory, setTestHistory] = useState([]);

  // Sinkronisasi data saat storage diperbarui
  useEffect(() => {
    const handleSync = () => {
      setFacts(ownerKnowledgeService.getFacts());
    };
    window.addEventListener(KNOWLEDGE_SYNC_EVENT, handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener(KNOWLEDGE_SYNC_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Filter fakta
  const filteredFacts = useMemo(() => {
    return facts.filter(fact => {
      const matchCat = selectedCategory === 'all' || fact.category === selectedCategory;
      const matchEntity = selectedEntityFilter === 'all' ||
        (selectedEntityFilter === 'owner' && (fact.target_entity === 'owner' || !fact.target_entity)) ||
        (selectedEntityFilter === 'friends' && (fact.target_entity === 'friends' || fact.target_entity === 'bibztzy' || fact.category === 'friends'));

      const matchAccess = selectedAccessFilter === 'all' ||
        (selectedAccessFilter === 'public' && fact.isPublic) ||
        (selectedAccessFilter === 'restricted' && !fact.isPublic);

      const q = searchQuery.toLowerCase().trim();
      const matchText = !q ||
        (fact.label || '').toLowerCase().includes(q) ||
        (fact.value || '').toLowerCase().includes(q) ||
        (fact.key || '').toLowerCase().includes(q) ||
        (Array.isArray(fact.keywords) && fact.keywords.some(k => k.toLowerCase().includes(q)));

      return matchCat && matchEntity && matchAccess && matchText;
    });
  }, [facts, selectedCategory, selectedEntityFilter, selectedAccessFilter, searchQuery]);

  // Statistik
  const stats = useMemo(() => {
    const total = facts.length;
    const verified = facts.filter(f => f.isVerified).length;
    const isPublic = facts.filter(f => f.isPublic).length;
    const isPrivate = facts.filter(f => !f.isPublic).length;
    const pending = facts.filter(f => f.verification_status === 'pending').length;
    return { total, verified, isPublic, isPrivate, pending };
  }, [facts]);

  const handleOpenAdd = () => {
    if (!isOwner) {
      openAuthModal();
      return;
    }
    setEditingFact(null);
    setFormData({
      category: 'identity',
      target_entity: 'owner',
      key: '',
      label: '',
      value: '',
      keywords: '',
      access_level: 'public',
      isPublic: true,
      verification_status: 'verified',
      isVerified: true,
      restricted_message: ''
    });
    setIsModalOpen(true);
    playSound?.('click');
  };

  const handleApplyTemplate = (tpl) => {
    if (!isOwner) {
      openAuthModal();
      return;
    }
    setEditingFact(null);
    setFormData({
      category: tpl.category || 'custom',
      target_entity: tpl.target_entity || 'owner',
      key: tpl.key || '',
      label: tpl.label || '',
      value: tpl.value || '',
      keywords: tpl.keywords || '',
      access_level: tpl.access_level || 'public',
      isPublic: tpl.access_level === 'public',
      verification_status: tpl.verification_status || 'verified',
      isVerified: tpl.verification_status === 'verified',
      restricted_message: ''
    });
    setIsModalOpen(true);
    playSound?.('click');
    toast.info(`Template "${tpl.label}" diterapkan. Silakan lengkapi atau ubah nilainya.`);
  };

  const handleOpenEdit = (fact) => {
    if (!isOwner) {
      openAuthModal();
      return;
    }
    setEditingFact(fact);
    setFormData({
      category: fact.category || 'identity',
      target_entity: fact.target_entity || 'owner',
      key: fact.key || '',
      label: fact.label || '',
      value: fact.value || '',
      keywords: Array.isArray(fact.keywords) ? fact.keywords.join(', ') : '',
      access_level: fact.access_level || (fact.isPublic === false ? 'restricted' : 'public'),
      isPublic: fact.access_level === 'restricted' ? false : (fact.isPublic !== undefined ? fact.isPublic : true),
      verification_status: fact.verification_status || (fact.isVerified === false ? 'pending' : 'verified'),
      isVerified: fact.verification_status === 'pending' ? false : (fact.isVerified !== undefined ? fact.isVerified : true),
      restricted_message: fact.restricted_message || ''
    });
    setIsModalOpen(true);
    playSound?.('click');
  };

  const handleTogglePublic = (fact) => {
    if (!isOwner) {
      openAuthModal();
      return;
    }
    const nextPublic = !fact.isPublic;
    const updated = ownerKnowledgeService.upsertFact({
      ...fact,
      isPublic: nextPublic,
      access_level: nextPublic ? 'public' : 'restricted'
    });
    setFacts(ownerKnowledgeService.getFacts());
    playSound?.('click');
    toast.info(`Tingkat akses "${fact.label}" diubah menjadi: ${updated.access_level === 'public' ? 'Publik (Bisa Dijawab)' : 'Restricted (Dibatasi demi Privasi)'}`);
  };

  const handleSaveForm = (e) => {
    e.preventDefault();
    if (!isOwner) {
      openAuthModal();
      return;
    }

    if (!formData.label.trim()) {
      toast.error('Judul topik fakta tidak boleh kosong.');
      return;
    }

    const payload = {
      id: editingFact ? editingFact.id : undefined,
      key: formData.key.trim() || (editingFact ? editingFact.key : formData.label.toLowerCase().replace(/[^a-z0-9]/g, '_')),
      category: formData.category,
      target_entity: formData.target_entity || 'owner',
      label: formData.label.trim(),
      value: formData.value.trim(),
      keywords: formData.keywords,
      access_level: formData.access_level,
      isPublic: formData.access_level === 'public',
      verification_status: formData.verification_status,
      isVerified: formData.verification_status === 'verified',
      known: formData.value.trim().length > 0 && formData.verification_status === 'verified',
      restricted_message: formData.restricted_message.trim() || undefined
    };

    ownerKnowledgeService.upsertFact(payload);
    setFacts(ownerKnowledgeService.getFacts());
    setIsModalOpen(false);
    playSound?.('success');
    toast.success(editingFact ? 'Fakta pengetahuan berhasil diperbarui!' : 'Fakta baru berhasil ditambahkan!');
  };

  const handleDelete = (id, label) => {
    if (!isOwner) {
      openAuthModal();
      return;
    }
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Fakta Pengetahuan?',
      message: `Apakah Anda yakin ingin menghapus fakta "${label}" dari basis pengetahuan NOVA AI? Tindakan ini tidak dapat dibatalkan.`,
      factId: id
    });
  };

  const confirmDeleteAction = () => {
    if (confirmDialog.factId) {
      ownerKnowledgeService.deleteFact(confirmDialog.factId);
      setFacts(ownerKnowledgeService.getFacts());
      playSound?.('click');
      toast.success('Fakta pengetahuan berhasil dihapus.');
    }
    setConfirmDialog({ isOpen: false, title: '', message: '', factId: null });
  };

  const handleResetDefaults = () => {
    if (!isOwner) {
      openAuthModal();
      return;
    }
    if (window.confirm('Kembalikan semua fakta pengetahuan owner ke data default awal? Seluruh fakta resmi bawaan (nama, sekolah, nasgor, matcha milk, hobi ngedit, FF, teman dekat) akan dipulihkan.')) {
      const def = ownerKnowledgeService.resetFacts();
      setFacts(def);
      playSound?.('levelUp');
      toast.success('Basis pengetahuan owner berhasil dikembalikan ke standar awal.');
    }
  };

  // Sinkronisasi dengan cloud Supabase
  const handleCloudSync = async () => {
    if (!isSupabaseConfigured) {
      toast.info('Supabase belum dikonfigurasi di .env.local. Data disimpan aman secara lokal.');
      return;
    }
    setIsSyncingCloud(true);
    playSound?.('bubble');
    try {
      const refreshed = await ownerKnowledgeService.fetchFactsFromSupabase();
      setFacts(refreshed);
      toast.success('Basis pengetahuan berhasil disinkronkan dengan Supabase Cloud!');
    } catch (err) {
      toast.error('Gagal sinkronisasi cloud: ' + err.message);
    } finally {
      setIsSyncingCloud(false);
    }
  };

  // Uji Coba Langsung (Live Multi-Turn Simulation)
  const handleRunTest = (queryToTest = null) => {
    const query = (typeof queryToTest === 'string' ? queryToTest : testQuery).trim();
    if (!query) return;

    playSound?.('bubble');
    const answer = ownerKnowledgeService.generateAnswer(query, testHistory);
    const searchMatch = ownerKnowledgeService.searchFact(query, testHistory);

    setTestResult({
      query,
      answer: answer || '⚠️ Pertanyaan ini tidak cocok dengan topik pengetahuan spesifik owner, dan akan diteruskan ke asisten AI umum portofolio.',
      matchedFact: searchMatch.fact,
      resolved: searchMatch.resolved,
      isRelational: searchMatch.isRelational
    });

    // Perbarui riwayat uji untuk konteks multi-turn berikutnya
    setTestHistory(prev => [
      ...prev.slice(-6),
      { role: 'user', content: query },
      { role: 'assistant', content: answer || 'Jawaban' }
    ]);
  };

  const handleClearTestHistory = () => {
    setTestHistory([]);
    setTestResult(null);
    setTestQuery('');
    playSound?.('click');
    toast.info('Riwayat simulasi obrolan dibersihkan.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header & Status Akses */}
      <GlassCard style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.25), rgba(59, 130, 246, 0.25))',
              border: '1px solid rgba(6, 182, 212, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8'
            }}>
              <Brain size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                Basis Pengetahuan Owner (NOVA AI Memory Engine)
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Kelola fakta resmi, preferensi, makanan & minuman favorit, hobi, game, target belajar, dan data teman dekat yang diizinkan untuk dijawab AI.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {isSupabaseConfigured && (
              <button
                type="button"
                onClick={handleCloudSync}
                disabled={isSyncingCloud}
                className="btn btn-glass"
                style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem', gap: '0.4rem' }}
                title="Sinkronkan dengan basis data cloud Supabase"
              >
                <CloudUpload size={14} className={isSyncingCloud ? 'animate-spin' : ''} />
                <span>{isSyncingCloud ? 'Sinkron...' : 'Sync Cloud'}</span>
              </button>
            )}

            {!isOwner ? (
              <button
                type="button"
                onClick={openAuthModal}
                className="btn btn-glass btn-sm"
                style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem', gap: '0.4rem' }}
                title="Hanya pemilik yang dapat mengubah basis pengetahuan"
              >
                <Lock size={14} className="text-muted" />
                <span style={{ color: 'var(--text-secondary)' }}>Mode Tamu (Hanya Melihat)</span>
              </button>
            ) : (
              <>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.4rem 0.85rem',
                  background: 'rgba(34, 197, 94, 0.15)',
                  border: '1px solid rgba(34, 197, 94, 0.35)',
                  borderRadius: 'var(--radius-full)',
                  color: '#4ade80',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}>
                  <ShieldCheck size={14} />
                  <span>Akses Pemilik Terverifikasi</span>
                </div>

                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="btn btn-primary"
                  style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                >
                  <Plus size={16} />
                  <span>Tambah Fakta Baru</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="btn btn-glass"
                  title="Pulihkan fakta ke standar bawaan"
                  style={{ fontSize: '0.85rem', padding: '0.5rem 0.85rem' }}
                >
                  <RotateCcw size={15} />
                  <span>Default</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Kartu Ringkasan Statistik */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '0.75rem',
          paddingTop: '0.5rem'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-glass)',
            borderRadius: '10px',
            padding: '0.75rem 1rem'
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Fakta</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>{stats.total}</div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-glass)',
            borderRadius: '10px',
            padding: '0.75rem 1rem'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#4ade80' }}>Terverifikasi</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#4ade80' }}>{stats.verified}</div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-glass)',
            borderRadius: '10px',
            padding: '0.75rem 1rem'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#38bdf8' }}>Publik (AI Aktif)</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8' }}>{stats.isPublic}</div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-glass)',
            borderRadius: '10px',
            padding: '0.75rem 1rem'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#f59e0b' }}>Privat / Dibatasi</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b' }}>{stats.isPrivate}</div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-glass)',
            borderRadius: '10px',
            padding: '0.75rem 1rem'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#a78bfa' }}>Pending</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#a78bfa' }}>{stats.pending}</div>
          </div>
        </div>

        {/* Saran Tambah Cepat Template Fakta */}
        {isOwner && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-glass)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              💡 Tambah Cepat Template Pengetahuan Baru:
            </span>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {QUICK_FACT_TEMPLATES.map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl)}
                  className="btn btn-glass btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                >
                  <Plus size={12} />
                  <span>{tpl.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </GlassCard>

      {/* Simulator Uji Kontekstual Langsung */}
      <GlassCard style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={16} style={{ color: '#38bdf8' }} />
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
              Simulator Jawaban NOVA AI (Uji Pertanyaan Bertingkat & Kontekstual)
            </h4>
          </div>
          {testHistory.length > 0 && (
            <button
              type="button"
              onClick={handleClearTestHistory}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <RotateCcw size={12} />
              <span>Bersihkan Riwayat ({Math.floor(testHistory.length / 2)} giliran)</span>
            </button>
          )}
        </div>

        <p style={{ margin: '0 0 0.85rem 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Coba tanyakan secara bertahap, misal: <i>"Apa makanan kesukaan owner?"</i> lalu lanjutkan dengan <i>"Kalau minumannya?"</i> atau <i>"Kalau teman dekatnya?"</i>
        </p>

        {/* Tombol Cepat Pertanyaan Contoh */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
          {SAMPLE_TEST_PROMPTS.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setTestQuery(q);
                handleRunTest(q);
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: 'var(--radius-full)',
                color: 'var(--text-secondary)',
                fontSize: '0.72rem',
                padding: '0.25rem 0.65rem',
                cursor: 'pointer'
              }}
            >
              💬 {q}
            </button>
          ))}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleRunTest(); }} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.85rem' }}>
          <input
            type="text"
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            placeholder="Ketik pertanyaan uji (misal: Apa game favorit owner? atau Kalau minumannya?)..."
            className="input-glass"
            style={{ flex: 1, fontSize: '0.85rem' }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0 1.25rem' }}>
            <Send size={15} />
            <span>Uji</span>
          </button>
        </form>

        {testResult && (
          <div style={{
            background: 'rgba(6, 182, 212, 0.06)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
            borderRadius: '10px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', flexWrap: 'wrap', gap: '0.4rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>
                Pertanyaan: <strong style={{ color: 'var(--text-main)' }}>"{testResult.query}"</strong>
              </span>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {testResult.isRelational ? (
                  <span style={{
                    background: 'rgba(168, 85, 247, 0.2)',
                    color: '#c084fc',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontWeight: 600
                  }}>
                    🔗 Sintesis Relasional Multi-Turn
                  </span>
                ) : testResult.matchedFact ? (
                  <span style={{
                    background: 'rgba(34, 197, 94, 0.2)',
                    color: '#4ade80',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontWeight: 600
                  }}>
                    Fakta Cocok: {testResult.matchedFact.label} ({testResult.matchedFact.target_entity || 'owner'})
                  </span>
                ) : (
                  <span style={{
                    background: 'rgba(245, 158, 11, 0.2)',
                    color: '#f59e0b',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontWeight: 600
                  }}>
                    Anti-Halusinasi / Topik Belum Ada
                  </span>
                )}
              </div>
            </div>

            <div style={{
              background: 'rgba(0, 0, 0, 0.25)',
              padding: '0.85rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
              color: 'var(--text-main)'
            }}>
              {testResult.answer}
            </div>

            {testResult.resolved && testResult.resolved.isFollowUp && (
              <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontStyle: 'italic' }}>
                💡 Terdeteksi sebagai pertanyaan lanjutan konteks multi-turn (Target: {testResult.resolved.targetEntity || 'owner'}, Topik: {testResult.resolved.detectedTopic || 'topik sebelumnya'}).
              </div>
            )}
          </div>
        )}
      </GlassCard>

      {/* Filter Kategori, Entitas & Pencarian Fakta */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Filter Entitas Subjek */}
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: '0.2rem' }}>Subjek:</span>
            <button
              type="button"
              onClick={() => setSelectedEntityFilter('all')}
              className={`btn ${selectedEntityFilter === 'all' ? 'btn-primary' : 'btn-glass'}`}
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setSelectedEntityFilter('owner')}
              className={`btn ${selectedEntityFilter === 'owner' ? 'btn-primary' : 'btn-glass'}`}
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
            >
              <User size={12} />
              <span>Owner Saja</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedEntityFilter('friends')}
              className={`btn ${selectedEntityFilter === 'friends' ? 'btn-primary' : 'btn-glass'}`}
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
            >
              <Users size={12} />
              <span>Teman & Sahabat</span>
            </button>
          </div>

          {/* Search box */}
          <div style={{ position: 'relative', width: 'min(260px, 100%)' }}>
            <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari topik atau fakta..."
              className="input-glass"
              style={{ width: '100%', paddingLeft: '2.25rem', fontSize: '0.8rem' }}
            />
          </div>
        </div>

        {/* Filter Kategori Tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {KNOWLEDGE_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.id);
                playSound?.('click');
              }}
              className={`btn ${selectedCategory === cat.id ? 'btn-primary' : 'btn-glass'}`}
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.7rem' }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Daftar Fakta Pengetahuan */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {filteredFacts.length === 0 ? (
            <div style={{
              gridColumn: '1 / -1',
              padding: '2.5rem',
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '12px',
              border: '1px dashed var(--border-glass)'
            }}>
              <AlertTriangle size={32} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Tidak ada fakta pengetahuan yang cocok dengan filter atau pencarian Anda.
              </p>
            </div>
          ) : (
            filteredFacts.map(fact => (
              <GlassCard
                key={fact.id}
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.85rem',
                  border: fact.isPublic ? '1px solid var(--border-glass)' : '1px dashed rgba(245, 158, 11, 0.4)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {fact.label}
                      </h4>
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginTop: '0.2rem' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          ID: <code style={{ color: '#38bdf8' }}>{fact.key}</code>
                        </span>
                        {fact.target_entity && fact.target_entity !== 'owner' && (
                          <span style={{
                            fontSize: '0.65rem',
                            background: 'rgba(168, 85, 247, 0.15)',
                            color: '#c084fc',
                            padding: '1px 5px',
                            borderRadius: '4px'
                          }}>
                            Entity: {fact.target_entity}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      {fact.verification_status === 'pending' || fact.isVerified === false ? (
                        <span style={{
                          fontSize: '0.65rem',
                          background: 'rgba(245, 158, 11, 0.15)',
                          color: '#f59e0b',
                          padding: '1px 6px',
                          borderRadius: 'var(--radius-full)',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px'
                        }}>
                          ⏳ Pending
                        </span>
                      ) : (
                        <span style={{
                          fontSize: '0.65rem',
                          background: 'rgba(34, 197, 94, 0.15)',
                          color: '#4ade80',
                          padding: '1px 6px',
                          borderRadius: 'var(--radius-full)',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px'
                        }}>
                          <CheckCircle2 size={10} /> Verified
                        </span>
                      )}

                      <span style={{
                        fontSize: '0.65rem',
                        background: (fact.access_level === 'restricted' || !fact.isPublic) ? 'rgba(239, 68, 68, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                        color: (fact.access_level === 'restricted' || !fact.isPublic) ? '#f87171' : '#38bdf8',
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-full)',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px'
                      }}>
                        {(fact.access_level === 'restricted' || !fact.isPublic) ? <Lock size={10} /> : <Globe size={10} />}
                        {(fact.access_level === 'restricted' || !fact.isPublic) ? 'Restricted' : 'Public'}
                      </span>
                    </div>
                  </div>

                  <p style={{
                    margin: 0,
                    fontSize: '0.85rem',
                    color: 'var(--text-main)',
                    lineHeight: 1.5,
                    background: 'rgba(0, 0, 0, 0.2)',
                    padding: '0.65rem',
                    borderRadius: '8px'
                  }}>
                    {fact.value ? fact.value : <em style={{ color: 'var(--text-muted)' }}>(Belum dicatat / belum ditentukan oleh owner)</em>}
                  </p>
                </div>

                {isOwner && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--border-glass)' }}>
                    <button
                      type="button"
                      onClick={() => handleTogglePublic(fact)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: fact.isPublic ? '#38bdf8' : '#f59e0b',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                      title={fact.isPublic ? 'Ubah menjadi privat (tidak dijawab ke pengunjung)' : 'Bolehkan AI menjawab ke pengunjung'}
                    >
                      {fact.isPublic ? <Eye size={13} /> : <EyeOff size={13} />}
                      <span>{fact.isPublic ? 'Status: Publik' : 'Status: Privat'}</span>
                    </button>

                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(fact)}
                        className="btn btn-glass"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                        title="Edit fakta"
                      >
                        <Edit3 size={13} />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(fact.id, fact.label)}
                        className="btn btn-glass"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', color: '#f87171' }}
                        title="Hapus fakta"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                )}
              </GlassCard>
            ))
          )}
        </div>
      </div>

      {/* Modal Tambah / Edit Fakta */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.25rem'
        }}>
          <div style={{
            background: 'var(--bg-glass-strong, rgba(11, 25, 44, 0.96))',
            border: '1px solid var(--border-glass)',
            borderRadius: '16px',
            width: 'min(540px, 100%)',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '1.5rem',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {editingFact ? 'Edit Fakta Pengetahuan' : 'Tambah Fakta Pengetahuan Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveForm} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    Kategori Pengetahuan
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-glass"
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  >
                    {KNOWLEDGE_CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                      <option key={cat.id} value={cat.id} style={{ background: '#0b192c', color: '#fff' }}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    Subjek Entitas (Target)
                  </label>
                  <select
                    value={formData.target_entity}
                    onChange={(e) => setFormData({ ...formData, target_entity: e.target.value })}
                    className="input-glass"
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  >
                    <option value="owner" style={{ background: '#0b192c', color: '#fff' }}>👤 Owner (Habib Ramadhan)</option>
                    <option value="bibztzy" style={{ background: '#0b192c', color: '#fff' }}>🤝 Teman: Bibztzy</option>
                    <option value="friends" style={{ background: '#0b192c', color: '#fff' }}>👥 Teman: Lainnya / Umum</option>
                    <option value="project" style={{ background: '#0b192c', color: '#fff' }}>🚀 Proyek Portofolio</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Judul / Topik Pertanyaan (Label)
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="Misal: Makanan Kesukaan, Game Favorit, Teman Dekat..."
                  className="input-glass"
                  style={{ width: '100%', fontSize: '0.85rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Isi Fakta / Jawaban Terverifikasi
                </label>
                <textarea
                  rows={4}
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="Tuliskan fakta yang sebenarnya tanpa tebakan. Jika belum diketahui, kosongkan agar AI jujur menyatakan belum diketahui."
                  className="input-glass"
                  style={{ width: '100%', fontSize: '0.85rem', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Kata Kunci Alias / Sinonim (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  placeholder="Misal: makanan, makan, kuliner, laper, food..."
                  className="input-glass"
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Membantu NOVA AI mengenali variasi kalimat, typo ringan, dan sinonim kata.
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    Tingkat Akses (access_level)
                  </label>
                  <select
                    value={formData.access_level}
                    onChange={(e) => {
                      const lvl = e.target.value;
                      setFormData({
                        ...formData,
                        access_level: lvl,
                        isPublic: lvl === 'public'
                      });
                    }}
                    className="input-glass"
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  >
                    <option value="public" style={{ background: '#0b192c', color: '#fff' }}>🌐 Public (Bisa Dijawab AI)</option>
                    <option value="restricted" style={{ background: '#0b192c', color: '#fff' }}>🔒 Restricted (Dibatasi / Privasi)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    Status Verifikasi
                  </label>
                  <select
                    value={formData.verification_status}
                    onChange={(e) => {
                      const st = e.target.value;
                      setFormData({
                        ...formData,
                        verification_status: st,
                        isVerified: st === 'verified'
                      });
                    }}
                    className="input-glass"
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  >
                    <option value="verified" style={{ background: '#0b192c', color: '#fff' }}>✅ Verified (Terverifikasi)</option>
                    <option value="pending" style={{ background: '#0b192c', color: '#fff' }}>⏳ Pending (Menunggu Konfirmasi)</option>
                  </select>
                </div>
              </div>

              {formData.access_level === 'restricted' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#f59e0b', marginBottom: '0.35rem' }}>
                    Pesan Privasi (Restricted Message)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.restricted_message}
                    onChange={(e) => setFormData({ ...formData, restricted_message: e.target.value })}
                    placeholder="Contoh: Informasi mengenai fakta ini memiliki tingkat akses terbatas dan tidak ditampilkan kepada umum demi menjaga privasi..."
                    className="input-glass"
                    style={{ width: '100%', fontSize: '0.85rem', resize: 'vertical', borderColor: 'rgba(245, 158, 11, 0.4)' }}
                  />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Pesan ini akan ditampilkan secara sopan kepada pengunjung saat menanyakan topik yang dibatasi tanpa membocorkan datanya.
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-glass"
                  style={{ fontSize: '0.85rem' }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ fontSize: '0.85rem' }}
                >
                  <Save size={15} />
                  <span>Simpan Fakta</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDeleteAction}
        onCancel={() => setConfirmDialog({ isOpen: false, title: '', message: '', factId: null })}
      />
    </div>
  );
}
