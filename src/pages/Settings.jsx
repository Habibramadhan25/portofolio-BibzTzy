import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Link, useOutletContext, useSearchParams } from 'react-router-dom';
import {
  Palette,
  Sun,
  Moon,
  RotateCcw,
  AlertTriangle,
  Info,
  User,
  HardDrive,
  Volume2,
  VolumeX,
  Sliders,
  Image as ImageIcon,
  Upload,
  Trash2,
  Check,
  Video,
  Film,
  RefreshCw,
  X,
  Sparkles,
  Zap,
  Activity,
  Layers,
  HelpCircle,
  Eye,
  Lock,
  Unlock,
  ShieldCheck,
  KeyRound,
  Brain
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import GlassCard from '../components/common/GlassCard';
import ConfirmDialog from '../components/common/ConfirmDialog';
import OwnerKnowledgeManager from '../components/admin/OwnerKnowledgeManager';
import { PageTransition, MotionItem, MotionCard } from '../components/common/MotionWrapper';
import { useTheme } from '../context/ThemeContext';
import { useOwner } from '../context/OwnerContext';
import { storageService } from '../services/storageService';
import { profileService } from '../services/profileService';
import { projectService } from '../services/projectService';
import { skillService } from '../services/skillService';
import { educationService } from '../services/educationService';
import { certificateService } from '../services/certificateService';
import { indexedDbService } from '../services/indexedDbService';
import { useToast } from '../context/ToastContext';

export default function Settings() {
  const { profile, setProfile } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryTab = searchParams.get('tab');
  const {
    theme,
    setTheme,
    accent,
    setAccent,
    accentColors,
    preset,
    setPreset,
    presets,
    bgType,
    setBgType,
    bgEnabled,
    setBgEnabled,
    bgOverlay,
    setBgOverlay,
    bgBlur,
    setBgBlur,
    backgroundTypes,
    customWallpaper,
    saveCustomWallpaper,
    removeCustomWallpaper,
    soundEnabled,
    setSoundEnabled,
    soundVolume,
    setSoundVolume,
    playSound,
    testSound,
    motionMode,
    setMotionMode,
    isReducedMotion,
    resetAppearance
  } = useTheme();

  const toast = useToast();
  const { isOwner, openAuthModal, logoutOwner, changePin, defaultPin } = useOwner();

  const [activeTab, setActiveTab] = useState(() => {
    if (queryTab === 'knowledge' || queryTab === 'owner-knowledge') return 'knowledge';
    if (queryTab === 'security') return 'security';
    if (queryTab === 'storage') return 'storage';
    return 'appearance';
  });

  useEffect(() => {
    if (queryTab && ['appearance', 'security', 'storage', 'knowledge'].includes(queryTab)) {
      setActiveTab(queryTab);
    }
  }, [queryTab]);
  const [mascotEnabled, setMascotEnabled] = useState(() => storageService.get('nova_mascot_enabled', true));
  const [mascotAnimEnabled, setMascotAnimEnabled] = useState(() => storageService.get('nova_mascot_anim_enabled', true));

  const handleToggleMascot = (val) => {
    storageService.set('nova_mascot_enabled', val);
    setMascotEnabled(val);
    window.dispatchEvent(new CustomEvent('nova-mascot-settings-changed'));
    toast.info(val ? 'Maskot Chibi diaktifkan.' : 'Maskot Chibi disembunyikan.');
  };

  const handleToggleMascotAnim = (val) => {
    storageService.set('nova_mascot_anim_enabled', val);
    setMascotAnimEnabled(val);
    window.dispatchEvent(new CustomEvent('nova-mascot-settings-changed'));
    toast.info(val ? 'Animasi maskot diaktifkan.' : 'Animasi maskot disederhanakan.');
  };

  // Pastikan halaman Settings selalu muncul di posisi paling atas saat dibuka atau ganti tab
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [activeTab]);
  const [pendingMedia, setPendingMedia] = useState(null);
  const [isUploadingWallpaper, setIsUploadingWallpaper] = useState(false);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const [idbStorage, setIdbStorage] = useState(null);

  const refreshStorageEstimate = async () => {
    const est = await indexedDbService.getStorageEstimate();
    if (est) setIdbStorage(est);
  };

  useEffect(() => {
    refreshStorageEstimate();
  }, [customWallpaper]);

  useEffect(() => {
    return () => {
      if (pendingMedia?.previewUrl && pendingMedia?.isBlobUrl) {
        try {
          URL.revokeObjectURL(pendingMedia.previewUrl);
        } catch {
          // ignore
        }
      }
    };
  }, [pendingMedia]);

  // Owner PIN change form state
  const [pinForm, setPinForm] = useState({ oldPin: '', newPin: '', confirmPin: '' });
  const [pinError, setPinError] = useState('');

  const handlePinChangeSubmit = (e) => {
    e.preventDefault();
    setPinError('');
    if (!pinForm.oldPin) {
      setPinError('Harap masukkan PIN saat ini.');
      return;
    }
    if (!pinForm.newPin || pinForm.newPin.length < 4) {
      setPinError('PIN baru minimal harus 4 digit.');
      return;
    }
    if (pinForm.newPin !== pinForm.confirmPin) {
      setPinError('Konfirmasi PIN baru tidak cocok.');
      return;
    }

    const res = changePin(pinForm.oldPin, pinForm.newPin);
    if (!res.success) {
      setPinError(res.error || 'Gagal mengubah PIN.');
    } else {
      setPinForm({ oldPin: '', newPin: '', confirmPin: '' });
      playSound?.('success');
    }
  };

  const [storageEstimate, setStorageEstimate] = useState({ novaGlassKb: '0', totalKb: '0', estimatedMaxKb: 5120 });
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    actionType: ''
  });

  const updateUsage = () => {
    setStorageEstimate(storageService.getUsageEstimate());
  };

  useEffect(() => {
    updateUsage();
  }, []);

  const openConfirm = (actionType, title, message) => {
    if (actionType !== 'reset-appearance' && !isOwner) {
      toast.info('Hanya pemilik portofolio (Habib) yang berhak mereset data. Masukkan PIN untuk verifikasi.');
      openAuthModal();
      return;
    }
    setConfirmDialog({
      isOpen: true,
      actionType,
      title,
      message
    });
  };

  const handleConfirmAction = async () => {
    const type = confirmDialog.actionType;
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));

    switch (type) {
      case 'reset-appearance':
        await resetAppearance();
        playSound?.('success');
        toast.success('Pengaturan tampilan berhasil dikembalikan ke standar awal.');
        break;

      case 'profile':
        const newProf = profileService.resetProfile();
        setProfile(newProf);
        playSound?.('click');
        toast.success('Profil siswa berhasil direset ke nilai bawaan.');
        break;

      case 'projects':
        projectService.resetProjects();
        playSound?.('click');
        toast.success('Daftar proyek berhasil dikembalikan ke data awal.');
        break;

      case 'skills':
        skillService.resetSkills();
        playSound?.('click');
        toast.success('Daftar keterampilan berhasil dikembalikan ke data awal.');
        break;

      case 'timeline':
        educationService.resetTimeline();
        playSound?.('click');
        toast.success('Riwayat pendidikan & kegiatan berhasil dikembalikan ke data awal.');
        break;

      case 'certificates':
        certificateService.resetCertificates();
        playSound?.('click');
        toast.success('Galeri sertifikat berhasil dikembalikan ke data awal.');
        break;

      case 'all':
        await indexedDbService.clearAll();
        storageService.clearAll();
        // Re-initialize defaults
        const defProf = profileService.getProfile();
        setProfile(defProf);
        projectService.getProjects();
        skillService.getSkills();
        educationService.getTimeline();
        certificateService.getCertificates();
        playSound?.('levelUp');
        toast.success('Seluruh data portofolio telah direset ke kondisi awal pabrik.');
        break;

      default:
        break;
    }

    updateUsage();
  };

  // Wallpaper upload handler with validation for image
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const nameLower = file.name.toLowerCase();
    const isValidExt = nameLower.endsWith('.jpg') || nameLower.endsWith('.jpeg') || nameLower.endsWith('.png') || nameLower.endsWith('.webp');

    if (!validTypes.includes(file.type) && !isValidExt) {
      toast.error('Format berkas tidak didukung. Harap pilih gambar JPEG, PNG, atau WebP.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      toast.error(`Ukuran gambar (${sizeMb} MB) melebihi batas maksimal 5 MB.`);
      return;
    }

    if (pendingMedia?.previewUrl && pendingMedia?.isBlobUrl) {
      try {
        URL.revokeObjectURL(pendingMedia.previewUrl);
      } catch {
        // ignore
      }
    }

    const previewUrl = URL.createObjectURL(file);
    setPendingMedia({
      file,
      previewUrl,
      mediaType: 'image',
      name: file.name,
      sizeMb: (file.size / (1024 * 1024)).toFixed(2),
      isBlobUrl: true
    });

    playSound?.('click');
    toast.info(`Gambar "${file.name}" siap dipratinjau. Klik "Terapkan" untuk menjadikannya latar belakang.`);
  };

  // Video wallpaper upload handler with 20 MB limit & format validation
  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const nameLower = file.name.toLowerCase();
    const isMp4 = file.type === 'video/mp4' || nameLower.endsWith('.mp4');
    const isWebm = file.type === 'video/webm' || nameLower.endsWith('.webm');

    if (!isMp4 && !isWebm) {
      toast.error('Format video tidak didukung. Harap pilih berkas video berformat MP4 atau WebM.');
      return;
    }

    const MAX_VIDEO_SIZE = 20 * 1024 * 1024;
    if (file.size > MAX_VIDEO_SIZE) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      toast.error(`Ukuran video (${sizeMb} MB) melebihi batas maksimal 20 MB. Harap pilih video yang lebih ringkas.`);
      return;
    }

    if (pendingMedia?.previewUrl && pendingMedia?.isBlobUrl) {
      try {
        URL.revokeObjectURL(pendingMedia.previewUrl);
      } catch {
        // ignore
      }
    }

    const previewUrl = URL.createObjectURL(file);
    setPendingMedia({
      file,
      previewUrl,
      mediaType: 'video',
      name: file.name,
      sizeMb: (file.size / (1024 * 1024)).toFixed(2),
      isBlobUrl: true
    });

    playSound?.('click');
    toast.info(`Video "${file.name}" siap dipratinjau. Klik "Terapkan" untuk menyimpannya ke IndexedDB dan menjadikannya latar belakang.`);
  };

  const handleApplyWallpaper = async () => {
    if (!pendingMedia) return;
    setIsUploadingWallpaper(true);
    try {
      const res = await saveCustomWallpaper(pendingMedia.file, pendingMedia.mediaType, {
        name: pendingMedia.name,
        size: pendingMedia.file.size
      });

      if (res?.success || res === true) {
        playSound?.('success');
        setBgType('custom');
        setBgEnabled(true);
        toast.success(`Wallpaper ${pendingMedia.mediaType === 'video' ? 'video' : 'gambar'} berhasil disimpan ke IndexedDB dan diterapkan!`);
        if (pendingMedia?.previewUrl && pendingMedia?.isBlobUrl) {
          try {
            URL.revokeObjectURL(pendingMedia.previewUrl);
          } catch {
            // ignore
          }
        }
        setPendingMedia(null);
        refreshStorageEstimate();
      } else {
        toast.error(res?.error || 'Gagal menyimpan wallpaper ke penyimpanan lokal IndexedDB.');
      }
    } catch (err) {
      toast.error(err?.message || 'Terjadi kesalahan saat memproses wallpaper.');
    } finally {
      setIsUploadingWallpaper(false);
    }
  };

  const handleRemoveWallpaper = async () => {
    if (pendingMedia) {
      if (pendingMedia.previewUrl && pendingMedia.isBlobUrl) {
        try {
          URL.revokeObjectURL(pendingMedia.previewUrl);
        } catch {
          // ignore
        }
      }
      setPendingMedia(null);
      toast.info('Pratinjau berkas dibatalkan.');
      return;
    }

    setIsUploadingWallpaper(true);
    try {
      const res = await removeCustomWallpaper();
      if (res?.success || res === true) {
        playSound?.('click');
        toast.info('Wallpaper kustom dihapus. Latar belakang dikembalikan ke bawaan.');
        refreshStorageEstimate();
      } else {
        toast.error(res?.error || 'Gagal menghapus wallpaper.');
      }
    } catch (err) {
      toast.error('Gagal menghapus wallpaper: ' + (err?.message || ''));
    } finally {
      setIsUploadingWallpaper(false);
    }
  };

  const handleTestSoundClick = () => {
    const res = testSound();
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  const usagePercent = Math.min(100, Math.max(1, (Number(storageEstimate.novaGlassKb) / (storageEstimate.estimatedMaxKb || 5120)) * 100));

  return (
    <PageTransition style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <PageHeader
        badge="PREFERENSI & PERSONALISASI"
        title="Pengaturan Website"
        subtitle="Kelola tema tampilan anime glass, wallpaper kustom, efek suara Web Audio, reduced motion, dan penyimpanan lokal."
      />

      {/* Settings Navigation Tabs */}
      <MotionItem style={{ display: 'flex', gap: '0.65rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => {
            playSound?.('click');
            setActiveTab('appearance');
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
          }}
          className={`btn ${activeTab === 'appearance' ? 'btn-primary' : 'btn-glass'}`}
          style={{ padding: '0.65rem 1.25rem' }}
        >
          <Palette size={16} />
          <span>Tampilan & Personalisasi</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playSound?.('click');
            setActiveTab('security');
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
          }}
          className={`btn ${activeTab === 'security' ? 'btn-primary' : 'btn-glass'}`}
          style={{
            padding: '0.65rem 1.25rem',
            borderColor: isOwner ? 'rgba(34, 197, 94, 0.45)' : undefined,
            color: isOwner && activeTab !== 'security' ? '#4ade80' : undefined
          }}
        >
          {isOwner ? <ShieldCheck size={16} /> : <Lock size={16} />}
          <span>Akses Pemilik (Keamanan)</span>
          {isOwner && (
            <span style={{
              fontSize: '0.65rem',
              background: 'rgba(34, 197, 94, 0.2)',
              color: '#4ade80',
              padding: '1px 6px',
              borderRadius: 'var(--radius-full)',
              fontWeight: 700
            }}>
              AKTIF
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            playSound?.('click');
            setActiveTab('knowledge');
            setSearchParams({ tab: 'knowledge' });
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
          }}
          className={`btn ${activeTab === 'knowledge' ? 'btn-primary' : 'btn-glass'}`}
          style={{
            padding: '0.65rem 1.25rem',
            borderColor: 'rgba(56, 189, 248, 0.45)',
            color: activeTab !== 'knowledge' ? '#38bdf8' : undefined
          }}
        >
          <Brain size={16} />
          <span>Basis Pengetahuan AI</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playSound?.('click');
            setActiveTab('storage');
            setSearchParams({ tab: 'storage' });
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
          }}
          className={`btn ${activeTab === 'storage' ? 'btn-primary' : 'btn-glass'}`}
          style={{ padding: '0.65rem 1.25rem' }}
        >
          <HardDrive size={16} />
          <span>Penyimpanan & Reset Data</span>
        </button>
      </MotionItem>

      {/* =========================================================================
          TAB 1: TAMPILAN & PERSONALISASI
          ========================================================================= */}
      {activeTab === 'appearance' && (
        <MotionCard key="appearance" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '2rem', alignItems: 'start' }}>
          {/* Left Column: Theme Presets & Color Accents */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Theme Presets Grid */}
            <GlassCard style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Sparkles size={18} className="text-ice" />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Preset Tema BibTzy</h3>
                </div>
                <span className="badge badge-ice font-mono" style={{ fontSize: '0.75rem' }}>{preset}</span>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                Pilih palet warna yang terkoordinasi dan harmonis dengan kontras teks tinggi.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 125px), 1fr))', gap: '0.75rem' }}>
                {presets.map((p) => {
                  const isActive = preset === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        playSound?.('click');
                        setPreset(p.id);
                        toast.info(`Tema preset diubah ke "${p.name}".`);
                      }}
                      style={{
                        padding: '0.85rem',
                        borderRadius: 'var(--radius-md)',
                        background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'var(--card-glass)',
                        border: `1.5px solid ${isActive ? p.hex : 'var(--border-glass)'}`,
                        boxShadow: isActive ? `0 0 16px rgba(var(--accent-rgb), 0.35)` : 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            background: p.hex,
                            border: '2px solid rgba(255, 255, 255, 0.4)'
                          }}
                        />
                        {isActive && <Check size={14} style={{ color: p.hex }} />}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                        {p.description}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Accent Color Swatches */}
              <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-glass)' }}>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.6rem', fontWeight: 600 }}>
                  WARNA AKSEN ANIME ICE:
                </label>

                <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                  {accentColors.map(c => {
                    const isActive = accent === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          playSound?.('click');
                          setAccent(c.id);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.45rem 0.85rem',
                          borderRadius: 'var(--radius-full)',
                          border: `1.5px solid ${isActive ? c.hex : 'var(--border-glass)'}`,
                          background: isActive ? c.bg : 'var(--card-glass)',
                          cursor: 'pointer',
                          color: 'var(--text-primary)',
                          fontSize: '0.82rem',
                          fontWeight: isActive ? 700 : 500,
                          transition: 'all var(--transition-fast)'
                        }}
                      >
                        <span style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: c.hex,
                          boxShadow: isActive ? `0 0 10px ${c.hex}` : 'none'
                        }} />
                        <span>{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </GlassCard>

            {/* Sound Effects Controls (Web Audio API) */}
            <GlassCard style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  {soundEnabled ? <Volume2 size={18} className="text-ice" /> : <VolumeX size={18} style={{ color: 'var(--text-muted)' }} />}
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Efek Suara (Sound Effects)</h3>
                </div>
                <span className={`badge ${soundEnabled ? 'badge-success' : ''}`} style={{ fontSize: '0.75rem' }}>
                  {soundEnabled ? 'AKTIF (ON)' : 'NONAKTIF (OFF)'}
                </span>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                Suara UI lembut disintesis langsung menggunakan <strong>Web Audio API</strong> (tanpa file audio eksternal, hemat bandwidth, dan bebas lag).
              </p>

              {/* Sound Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', padding: '0.85rem', background: 'rgba(0, 0, 0, 0.2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Aktifkan Efek Suara Interaktif</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Suara klik tombol, chime XP, kenaikan level, dan suara terminal.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setSoundEnabled(checked);
                    if (checked) {
                      setTimeout(() => playSound?.('success'), 50);
                      toast.success('Efek suara diaktifkan.');
                    } else {
                      toast.info('Efek suara dinonaktifkan.');
                    }
                  }}
                  style={{ width: '22px', height: '22px', accentColor: 'var(--accent-color)', cursor: 'pointer' }}
                />
              </div>

              {/* Volume Slider */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>VOLUME SUARA:</span>
                  <span className="font-mono" style={{ color: soundEnabled ? 'var(--ice-blue)' : 'var(--text-muted)' }}>
                    {soundVolume}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={soundVolume}
                  disabled={!soundEnabled}
                  onChange={(e) => setSoundVolume(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-color)', cursor: soundEnabled ? 'pointer' : 'not-allowed', opacity: soundEnabled ? 1 : 0.4 }}
                />
              </div>

              {/* Test Sound Button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-glass btn-sm"
                  onClick={handleTestSoundClick}
                  title="Putar efek suara uji coba"
                >
                  <Volume2 size={14} />
                  <span>Uji Suara (Test Sound)</span>
                </button>
                {!soundEnabled && (
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    (Aktifkan toggle di atas untuk mendengar)
                  </span>
                )}
              </div>
            </GlassCard>

            {/* Reduced Motion Controls */}
            <GlassCard style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                <Activity size={18} className="text-ice" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Aksesibilitas Gerakan (Reduced Motion)</h3>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                Atur bagaimana animasi mengambang, efek 3D tilt, dan transisi halaman diperlakukan pada perangkat Anda.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {[
                  { id: 'system', label: 'Follow System (Mengikuti Pengaturan OS / Browser)', desc: 'Menghormati preferensi prefers-reduced-motion dari perangkat Anda secara otomatis.' },
                  { id: 'reduced', label: 'Reduced Motion ON (Selalu Kurangi Animasi)', desc: 'Nonaktifkan 3D tilt kartu, hilangkan animasi mengambang, dan gunakan transisi instan.' },
                  { id: 'normal', label: 'Reduced Motion OFF (Animasi Penuh)', desc: 'Tampilkan efek 3D perspective, floating cards, dan pergerakan halaman secara utuh.' }
                ].map(opt => {
                  const isSelected = motionMode === opt.id;
                  return (
                    <label
                      key={opt.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        background: isSelected ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                        border: `1px solid ${isSelected ? 'var(--border-glass-bright)' : 'var(--border-glass)'}`,
                        cursor: 'pointer'
                      }}
                    >
                      <input
                        type="radio"
                        name="motionMode"
                        checked={isSelected}
                        onChange={() => {
                          playSound?.('click');
                          setMotionMode(opt.id);
                          toast.info(`Mode gerakan diubah ke: ${opt.label.split('(')[0]}`);
                        }}
                        style={{ marginTop: '3px', accentColor: 'var(--accent-color)', cursor: 'pointer' }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                          {opt.label}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {opt.desc}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* Entrance Animation Replay Trigger */}
              <div style={{
                marginTop: '1.25rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border-glass)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Animasi Masuk Website (Splash Intro)
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Putar kembali animasi sambutan saat pertama kali mengunjungi website.
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-glass btn-sm"
                  onClick={() => {
                    playSound?.('click');
                    window.dispatchEvent(new CustomEvent('nova-glass-trigger-entrance'));
                  }}
                  title="Putar ulang animasi intro website"
                >
                  <Sparkles size={14} className="text-ice" />
                  <span>Putar Animasi Masuk</span>
                </button>
              </div>
            </GlassCard>
          </div>

          {/* Right Column: Background Canvas & Custom Wallpaper */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <GlassCard style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <ImageIcon size={18} className="text-ice" />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Latar Belakang & Wallpaper</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Aktif:</span>
                  <input
                    type="checkbox"
                    checked={bgEnabled}
                    onChange={(e) => {
                      playSound?.('click');
                      setBgEnabled(e.target.checked);
                    }}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--accent-color)', cursor: 'pointer' }}
                  />
                </div>
              </div>

              {/* Background Preset Selector */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  JENIS LATAR BELAKANG:
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 120px), 1fr))', gap: '0.65rem' }}>
                  {backgroundTypes.map((bt) => {
                    const isSelected = bgType === bt.id;
                    return (
                      <button
                        key={bt.id}
                        type="button"
                        onClick={() => {
                          playSound?.('click');
                          setBgType(bt.id);
                        }}
                        style={{
                          padding: '0.75rem',
                          borderRadius: 'var(--radius-md)',
                          background: isSelected ? 'rgba(255, 255, 255, 0.08)' : 'var(--card-glass)',
                          border: `1.5px solid ${isSelected ? 'var(--accent-color)' : 'var(--border-glass)'}`,
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: isSelected ? 'var(--accent-color)' : 'var(--text-primary)' }}>
                          {bt.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {bt.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Overlay Intensity Slider */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.4rem', fontWeight: 600 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>INTENSITAS OVERLAY GELAP:</span>
                  <span className="font-mono" style={{ color: 'var(--ice-blue)' }}>{bgOverlay}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="90"
                  value={bgOverlay}
                  onChange={(e) => setBgOverlay(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-color)', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Mengatur kegelapan lapisan atas agar konten teks selalu mudah dibaca.
                </span>
              </div>

              {/* Blur Slider */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.4rem', fontWeight: 600 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>EFEK BLUR LATAR:</span>
                  <span className="font-mono" style={{ color: 'var(--ice-blue)' }}>{bgBlur} px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={bgBlur}
                  onChange={(e) => setBgBlur(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-color)', cursor: 'pointer' }}
                />
              </div>

              {/* Custom Wallpaper Upload Section (IndexedDB backed) */}
              <div style={{ paddingTop: '1.25rem', borderTop: '1px solid var(--border-glass)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Layers size={14} style={{ color: 'var(--ice-blue)' }} />
                    <span>Unggah Wallpaper Kustom (IndexedDB)</span>
                  </label>
                  {(pendingMedia || customWallpaper) && (
                    <button
                      type="button"
                      className="btn btn-glass btn-sm"
                      onClick={handleRemoveWallpaper}
                      disabled={isUploadingWallpaper}
                      style={{ color: 'var(--color-error)', fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
                      title={pendingMedia ? 'Batalkan pratinjau' : (customWallpaper?.type === 'video' ? 'Hapus Video' : 'Hapus Wallpaper')}
                    >
                      <Trash2 size={13} />
                      <span>{pendingMedia ? 'Batal' : (customWallpaper?.type === 'video' ? 'Hapus Video' : 'Hapus')}</span>
                    </button>
                  )}
                </div>

                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '0.85rem' }}>
                  Unggah video langsung dari perangkat Anda dan simpan secara persisten di <strong>IndexedDB</strong> tanpa membebani LocalStorage. Mendukung <strong>Video MP4 / WebM</strong> (maks. 20 MB) dan <strong>Gambar PNG / JPG / WebP</strong> (maks. 5 MB).
                </p>

                {/* Storage Status Bar */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.45rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(7, 11, 20, 0.45)',
                  border: '1px solid var(--border-glass)',
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)',
                  marginBottom: '0.85rem'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <HardDrive size={12} style={{ color: 'var(--ice-blue)' }} />
                    <span>Status Penyimpanan: IndexedDB Aktif</span>
                  </span>
                  {idbStorage ? (
                    <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>
                      Tersedia: {idbStorage.freeMb} MB / {idbStorage.quotaMb} MB
                    </span>
                  ) : (
                    <span>Siap digunakan secara lokal</span>
                  )}
                </div>

                {/* Hidden Native File Pickers */}
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/mp4, video/webm"
                  onChange={handleVideoChange}
                  style={{ display: 'none' }}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />

                {/* Action Buttons: Choose Video & Choose Image */}
                <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('bibtzy-chibi-guide-trigger', {
                        detail: { key: 'wallpaper', label: 'Custom Wallpaper' }
                      }));
                      videoInputRef.current?.click();
                    }}
                    disabled={isUploadingWallpaper}
                    style={{ background: 'linear-gradient(135deg, rgba(69, 207, 255, 0.25), rgba(141, 220, 255, 0.15))', borderColor: 'var(--ice-blue)' }}
                  >
                    <Video size={14} style={{ color: 'var(--ice-blue)' }} />
                    <span>Pilih Video dari Perangkat</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-glass btn-sm"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('bibtzy-chibi-guide-trigger', {
                        detail: { key: 'wallpaper', label: 'Custom Wallpaper' }
                      }));
                      fileInputRef.current?.click();
                    }}
                    disabled={isUploadingWallpaper}
                  >
                    <ImageIcon size={14} />
                    <span>Pilih Berkas Gambar...</span>
                  </button>
                </div>

                {/* Media Preview Box (Video or Image) */}
                {(pendingMedia || customWallpaper) && (
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{
                      position: 'relative',
                      width: '100%',
                      height: '180px',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      border: '1px solid var(--border-glass-bright)',
                      backgroundColor: '#040711'
                    }}>
                      {/* Video Player Preview */}
                      {(pendingMedia?.mediaType === 'video' || (!pendingMedia && customWallpaper?.type === 'video')) ? (
                        <video
                          key={pendingMedia ? pendingMedia.previewUrl : customWallpaper?.url}
                          src={pendingMedia ? pendingMedia.previewUrl : customWallpaper?.url}
                          autoPlay
                          loop
                          muted
                          playsInline
                          controls
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block'
                          }}
                        />
                      ) : (
                        /* Image Preview */
                        <img
                          src={pendingMedia ? pendingMedia.previewUrl : (customWallpaper?.url || customWallpaper)}
                          alt="Wallpaper preview"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      )}

                      {/* Status Badge on Preview */}
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        background: 'rgba(7, 11, 20, 0.88)',
                        backdropFilter: 'blur(8px)',
                        padding: '3px 9px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.7rem',
                        color: pendingMedia ? 'var(--accent-color)' : 'var(--ice-blue)',
                        fontWeight: 600,
                        border: '1px solid var(--border-glass)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}>
                        {pendingMedia ? (
                          <>
                            <Sparkles size={11} />
                            <span>Pratinjau: {pendingMedia.mediaType === 'video' ? 'Video' : 'Gambar'} ({pendingMedia.sizeMb} MB)</span>
                          </>
                        ) : (
                          <>
                            {customWallpaper?.type === 'video' ? <Video size={11} /> : <ImageIcon size={11} />}
                            <span>
                              {bgType === 'custom'
                                ? `${customWallpaper?.type === 'video' ? 'Video' : 'Gambar'} Aktif (Latar Belakang)`
                                : 'Tersimpan di IndexedDB'}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Pending Controls: Terapkan, Ganti, Hapus */}
                    {pendingMedia && (
                      <div style={{
                        display: 'flex',
                        gap: '0.65rem',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        marginTop: '0.75rem',
                        padding: '0.65rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'rgba(69, 207, 255, 0.06)',
                        border: '1px solid rgba(69, 207, 255, 0.2)'
                      }}>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          disabled={isUploadingWallpaper}
                          onClick={handleApplyWallpaper}
                          style={{ flex: '1 1 auto', justifyContent: 'center' }}
                        >
                          <Check size={14} />
                          <span>{isUploadingWallpaper ? 'Menyimpan ke IndexedDB...' : (pendingMedia.mediaType === 'video' ? 'Terapkan Video' : 'Terapkan Wallpaper')}</span>
                        </button>

                        <button
                          type="button"
                          className="btn btn-glass btn-sm"
                          disabled={isUploadingWallpaper}
                          onClick={() => {
                            if (pendingMedia.mediaType === 'video') {
                              videoInputRef.current?.click();
                            } else {
                              fileInputRef.current?.click();
                            }
                          }}
                        >
                          <RefreshCw size={13} />
                          <span>{pendingMedia.mediaType === 'video' ? 'Ganti Video' : 'Ganti Gambar'}</span>
                        </button>

                        <button
                          type="button"
                          className="btn btn-glass btn-sm"
                          disabled={isUploadingWallpaper}
                          onClick={handleRemoveWallpaper}
                          style={{ color: 'var(--color-error)' }}
                        >
                          <X size={13} />
                          <span>Batal</span>
                        </button>
                      </div>
                    )}

                    {/* Active Wallpaper Controls (when not pending) */}
                    {!pendingMedia && customWallpaper && (
                      <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', marginTop: '0.75rem', alignItems: 'center' }}>
                        {bgType !== 'custom' && (
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                              playSound?.('click');
                              setBgType('custom');
                              setBgEnabled(true);
                              toast.success('Wallpaper kustom berhasil diaktifkan sebagai latar belakang!');
                            }}
                            style={{ flex: '1 1 auto', justifyContent: 'center' }}
                          >
                            <Check size={14} />
                            <span>Terapkan Sebagai Latar Belakang</span>
                          </button>
                        )}

                        <button
                          type="button"
                          className="btn btn-glass btn-sm"
                          onClick={() => {
                            if (customWallpaper?.type === 'video') {
                              videoInputRef.current?.click();
                            } else {
                              fileInputRef.current?.click();
                            }
                          }}
                        >
                          <RefreshCw size={13} />
                          <span>{customWallpaper?.type === 'video' ? 'Ganti Video' : 'Ganti Gambar'}</span>
                        </button>

                        <button
                          type="button"
                          className="btn btn-glass btn-sm"
                          onClick={handleRemoveWallpaper}
                          disabled={isUploadingWallpaper}
                          style={{ color: 'var(--color-error)' }}
                        >
                          <Trash2 size={13} />
                          <span>{customWallpaper?.type === 'video' ? 'Hapus Video' : 'Hapus Wallpaper'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Pengaturan Maskot Chibi & Animasi AI */}
            <GlassCard style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
                <Sparkles size={18} style={{ color: 'var(--accent-color)' }} />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Maskot Chibi & Animasi Interaktif
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                      Tampilkan Maskot Chibi di Sudut Layar
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Menampilkan maskot pendamping BibTzy yang terhubung dengan status NOVA AI dan panduan halaman.
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`btn btn-sm ${mascotEnabled ? 'btn-primary' : 'btn-glass'}`}
                    onClick={() => handleToggleMascot(!mascotEnabled)}
                  >
                    {mascotEnabled ? 'Aktif' : 'Nonaktif'}
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', borderTop: '1px solid var(--border-glass)', paddingTop: '0.85rem' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                      Animasi & Efek Reaktif Maskot
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Mengaktifkan efek getar, ekspresi berbicara, dan efek denyut saat NOVA AI sedang mendengarkan atau berpikir.
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`btn btn-sm ${mascotAnimEnabled ? 'btn-primary' : 'btn-glass'}`}
                    onClick={() => handleToggleMascotAnim(!mascotAnimEnabled)}
                    disabled={!mascotEnabled}
                  >
                    {mascotAnimEnabled ? 'Aktif' : 'Nonaktif'}
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', borderTop: '1px solid var(--border-glass)', paddingTop: '0.85rem' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                      Buka Asisten Percakapan NOVA AI
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Mulai percakapan suara dua arah, tanya info owner, atau belajar coding tutor.
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => window.dispatchEvent(new CustomEvent('nova-ai-open'))}
                  >
                    Buka NOVA AI
                  </button>
                </div>
              </div>
            </GlassCard>

            {/* Appearance Reset Only */}
            <GlassCard style={{ padding: '1.5rem', border: '1px dashed var(--border-glass)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    Reset Tampilan ke Standar
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Mengembalikan tema, wallpaper, dan suara ke default tanpa menghapus proyek atau sertifikat.
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-glass btn-sm"
                  onClick={() => openConfirm('reset-appearance', 'Reset Pengaturan Tampilan?', 'Apakah Anda ingin mengembalikan tema, warna aksen, wallpaper, dan suara ke kondisi awal? Seluruh proyek dan prestasi belajar Anda tetap aman.')}
                >
                  <RotateCcw size={14} />
                  <span>Reset Tampilan</span>
                </button>
              </div>
            </GlassCard>
          </div>
        </MotionCard>
      )}

      {/* =========================================================================
          TAB 2: KEAMANAN & AKSES MODE PEMILIK
          ========================================================================= */}
      {activeTab === 'security' && (
        <MotionCard key="security" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '2rem', alignItems: 'start' }}>
          {/* Card 1: Status Akses */}
          <GlassCard style={{
            padding: '2rem',
            border: isOwner ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid var(--border-glass)',
            boxShadow: isOwner ? '0 0 24px rgba(34, 197, 94, 0.15)' : 'none'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                background: isOwner ? 'rgba(34, 197, 94, 0.15)' : 'rgba(56, 189, 248, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isOwner ? '#4ade80' : 'var(--ice-blue)',
                border: `1px solid ${isOwner ? 'rgba(34, 197, 94, 0.35)' : 'var(--border-glass-bright)'}`
              }}>
                {isOwner ? <ShieldCheck size={22} /> : <Lock size={22} />}
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  {isOwner ? 'Mode Pemilik Aktif' : 'Mode Tamu (Hanya Lihat)'}
                </h3>
                <span style={{ fontSize: '0.78rem', color: isOwner ? '#4ade80' : 'var(--text-muted)' }}>
                  {isOwner ? 'Hak Akses Penuh: Habib Ramadhan' : 'Akses edit & reset dinonaktifkan'}
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {isOwner
                ? 'Anda saat ini memegang akses administratif penuh. Semua tombol untuk mengedit profil siswa, menambah proyek baru, mengelola keahlian, dan mengubah sertifikat dapat Anda gunakan.'
                : 'Portofolio ini diproteksi secara khusus agar pengunjung publik, guru, atau penilai hanya dapat melihat (Read-Only) seluruh karya dan identitas Anda tanpa risiko data terubah atau terhapus.'}
            </p>

            {isOwner ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={logoutOwner}
                  style={{ gap: '0.5rem', justifyContent: 'center' }}
                >
                  <Lock size={16} />
                  <span>Kunci Portofolio (Beralih ke Mode Tamu)</span>
                </button>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  Tips: Anda dapat mengunci kembali kapan saja sebelum memperlihatkan web ke orang lain.
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={openAuthModal}
                  style={{ gap: '0.5rem', justifyContent: 'center' }}
                >
                  <Unlock size={16} />
                  <span>Buka Akses Mode Pemilik (Masukkan PIN)</span>
                </button>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  Gunakan PIN rahasia pemilik Anda untuk membuka akses penuh.
                </span>
              </div>
            )}
          </GlassCard>

          {/* Card 2: Pengaturan PIN Pemilik */}
          <GlassCard style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <KeyRound size={20} className="text-ice" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                Ubah PIN Keamanan Pemilik
              </h3>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Ganti PIN keamanan pemilik dengan kombinasi angka atau sandi pribadi Anda sendiri (minimal 4 digit/karakter).
            </p>

            <form onSubmit={handlePinChangeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  PIN Saat Ini
                </label>
                <input
                  type="password"
                  placeholder="Ketik PIN lama"
                  className="form-input"
                  value={pinForm.oldPin}
                  onChange={(e) => setPinForm(prev => ({ ...prev, oldPin: e.target.value }))}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  PIN Baru (Minimal 4 karakter)
                </label>
                <input
                  type="password"
                  placeholder="Ketik PIN baru"
                  className="form-input"
                  value={pinForm.newPin}
                  onChange={(e) => setPinForm(prev => ({ ...prev, newPin: e.target.value }))}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Konfirmasi PIN Baru
                </label>
                <input
                  type="password"
                  placeholder="Ulangi PIN baru"
                  className="form-input"
                  value={pinForm.confirmPin}
                  onChange={(e) => setPinForm(prev => ({ ...prev, confirmPin: e.target.value }))}
                />
              </div>

              {pinError && (
                <div style={{ color: 'var(--color-error)', fontSize: '0.8rem', fontWeight: 500 }}>
                  {pinError}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-sm"
                style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}
              >
                <Check size={14} />
                <span>Simpan PIN Baru</span>
              </button>
            </form>
          </GlassCard>
        </MotionCard>
      )}

      {/* =========================================================================
          TAB 3: PENYIMPANAN & MANAJEMEN DATA
          ========================================================================= */}
      {activeTab === 'storage' && (
        <MotionCard key="storage" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '2rem', alignItems: 'start' }}>
          {/* Storage Quota Card */}
          <GlassCard style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <HardDrive size={18} className="text-ice" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                Penyimpanan Data Lokal Browser
              </h3>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
              Seluruh proyek, keahlian, sertifikat, sesi coding, dan riwayat belajar tersimpan secara offline di <strong>LocalStorage</strong> dan <strong>IndexedDB</strong> pada perangkat Anda.
            </p>

            {/* Quota Bar */}
            <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Terpakai oleh BibTzy:</span>
                <span className="font-mono" style={{ fontWeight: 700, color: 'var(--ice-blue)' }}>
                  {storageEstimate.novaGlassKb} KB / ~5120 KB
                </span>
              </div>

              <div className="progress-bar-container">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${Math.max(usagePercent, 2)}%` }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              <Info size={16} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--ice-blue)' }} />
              <span>
                Data tidak dikirim ke server eksternal demi privasi dan keamanan penuh.
              </span>
            </div>
          </GlassCard>

          {/* Selective Reset Actions */}
          <GlassCard style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <AlertTriangle size={18} style={{ color: 'var(--color-warning)' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                Reset Data Per Bagian
              </h3>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Pilih bagian yang ingin dikembalikan ke data sampel awal SMK Negeri 1 Ciomas:
            </p>

            {!isOwner && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                marginBottom: '1rem',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Lock size={16} className="text-ice" />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Mode Tamu. Reset data dikunci untuk umum.
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
                  onClick={openAuthModal}
                >
                  Buka Kunci
                </button>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <button
                type="button"
                className="btn btn-glass btn-sm"
                style={{ justifyContent: 'space-between' }}
                onClick={() => openConfirm('projects', 'Kembalikan Proyek?', 'Daftar proyek akan dikembalikan ke data awal.')}
              >
                <span>Reset Katalog Proyek</span>
                <RotateCcw size={14} />
              </button>

              <button
                type="button"
                className="btn btn-glass btn-sm"
                style={{ justifyContent: 'space-between' }}
                onClick={() => openConfirm('skills', 'Kembalikan Keahlian?', 'Daftar kompetensi keahlian akan dikembalikan ke data awal.')}
              >
                <span>Reset Keahlian & Teknologi</span>
                <RotateCcw size={14} />
              </button>

              <button
                type="button"
                className="btn btn-glass btn-sm"
                style={{ justifyContent: 'space-between' }}
                onClick={() => openConfirm('timeline', 'Kembalikan Riwayat?', 'Riwayat pendidikan & magang akan dikembalikan ke data awal.')}
              >
                <span>Reset Riwayat Pendidikan</span>
                <RotateCcw size={14} />
              </button>

              <button
                type="button"
                className="btn btn-glass btn-sm"
                style={{ justifyContent: 'space-between' }}
                onClick={() => openConfirm('certificates', 'Kembalikan Sertifikat?', 'Galeri sertifikat akan dikembalikan ke data awal.')}
              >
                <span>Reset Galeri Sertifikat</span>
                <RotateCcw size={14} />
              </button>
            </div>

            {/* Total Factory Reset */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-glass)' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ width: '100%', borderColor: 'var(--color-error)', color: 'var(--color-error)' }}
                onClick={() => openConfirm('all', 'Reset Seluruh Data Portofolio?', 'PERINGATAN: Seluruh proyek, sertifikat, sesi coding, dan pengaturan lokal akan dihapus dan dikembalikan ke kondisi pabrik. Tindakan ini tidak dapat dibatalkan.')}
              >
                <Trash2 size={14} />
                <span>Reset Total Seluruh Data (Factory Reset)</span>
              </button>
            </div>
          </GlassCard>
        </MotionCard>
      )}

      {/* =========================================================================
          TAB 4: BASIS PENGETAHUAN OWNER (NOVA AI)
          ========================================================================= */}
      {activeTab === 'knowledge' && (
        <MotionCard key="knowledge" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <OwnerKnowledgeManager />
        </MotionCard>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Ya, Lanjutkan"
        cancelText="Batal"
        danger={confirmDialog.actionType === 'all'}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </PageTransition>
  );
}
