import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useOutletContext } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Download,
  Mail,
  FolderKanban,
  Code2,
  Award,
  GraduationCap,
  ChevronRight,
  ChevronDown,
  User,
  Wrench,
  Clock,
  Edit3
} from 'lucide-react';
import { useOwner } from '../context/OwnerContext';
import StatCard from '../components/common/StatCard';
import GlassCard from '../components/common/GlassCard';
import ProjectCard from '../components/cards/ProjectCard';
import ProjectDetailModal from '../components/cards/ProjectDetailModal';
import { projectService } from '../services/projectService';
import { skillService } from '../services/skillService';
import { certificateService } from '../services/certificateService';
import { educationService } from '../services/educationService';
import { pdfService } from '../services/pdfService';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { PageTransition, MotionItem, MotionCard, StaggerGrid } from '../components/common/MotionWrapper';
import { getIndonesianLiveTime } from '../utils/formatDate';
import confetti from 'canvas-confetti';
import '../styles/nova-home.css';

export default function Home() {
  const { profile } = useOutletContext();
  const { isOwner } = useOwner();
  const toast = useToast();
  const { playSound } = useTheme();

  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isDownloadingCV, setIsDownloadingCV] = useState(false);
  const [liveTime, setLiveTime] = useState(() => getIndonesianLiveTime());
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroVideoRef = useRef(null);

  // Pastikan video hero langsung berputar halus secara otomatis (autoplay & loop muted)
  useEffect(() => {
    if (heroVideoRef.current) {
      heroVideoRef.current.muted = true;
      heroVideoRef.current.play().catch(() => {
        // Fallback jika browser membatasi autoplay
      });
    }
  }, []);

  // Efek parallax halus mengikuti pergerakan kursor pengguna di Hero
  const handleHeroMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePos({ x, y });
  }, []);

  const handleHeroMouseLeave = useCallback(() => {
    setMousePos({ x: 0, y: 0 });
  }, []);

  // Live timer tick every second for real-time Indonesian clock
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTime(getIndonesianLiveTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadData = () => {
      setProjects(projectService.getProjects());
      setSkills(skillService.getSkills());
      setCertificates(certificateService.getCertificates());
      setTimeline(educationService.getTimeline());
    };

    loadData();

    window.addEventListener('nova-glass-storage-updated', loadData);
    window.addEventListener('nova-glass-storage-reset', loadData);

    return () => {
      window.removeEventListener('nova-glass-storage-updated', loadData);
      window.removeEventListener('nova-glass-storage-reset', loadData);
    };
  }, []);

  // Filter featured projects (favorite or first 3)
  const featuredProjects = projects.filter(p => p.isFavorite).slice(0, 3).length > 0
    ? projects.filter(p => p.isFavorite).slice(0, 3)
    : projects.slice(0, 3);

  // Top skills preview (first 6)
  const topSkills = skills.slice(0, 6);

  const handleDownloadCV = () => {
    setIsDownloadingCV(true);
    try {
      const res = pdfService.generateCV({
        profile,
        skills,
        timeline,
        projects
      });

      if (res && res.success) {
        playSound?.('success');
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#45CFFF', '#8DDCFF', '#2563EB', '#FFFFFF']
        });
        toast.success(`CV ${profile?.name || 'Habib'} berhasil dibuat dan diunduh!`);
      } else {
        toast.error('Gagal membuat CV. Silakan coba lagi.');
      }
    } catch (e) {
      toast.error('Terjadi kendala saat membuat CV.');
    } finally {
      setIsDownloadingCV(false);
    }
  };

  const handleToggleFavorite = (id) => {
    projectService.toggleFavorite(id);
    setProjects(projectService.getProjects());
  };

  const handleScrollToContent = (e) => {
    e.preventDefault();
    const target = document.getElementById('home-sections');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <PageTransition className="home-page-transition" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* =========================================================================
          HERO SECTION (NOVA GLASS FULL-SCREEN ARTWORK & HERO CONTENT)
          ========================================================================= */}
      <section
        className="nova-hero-wrapper"
        aria-label="Nova Glass Hero"
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
      >
        {/* Layer Gambar Artwork Animasi Hidup (Bergerak secara Organik & Mengikuti Kursor) */}
        <div className="nova-hero-artwork-layer" aria-hidden="true">
          <motion.div
            className="nova-hero-artwork-inner"
            animate={{
              x: mousePos.x * -28,
              y: mousePos.y * -20,
              rotateX: mousePos.y * 3.5,
              rotateY: mousePos.x * -4.5
            }}
            transition={{ type: 'spring', damping: 26, stiffness: 90, mass: 0.6 }}
          >
            <div className="nova-hero-artwork-breathing">
              <video
                ref={heroVideoRef}
                src="/videos/bibtzy-intro.mp4"
                autoPlay
                loop
                muted
                playsInline
                webkit-playsinline="true"
                x5-playsinline="true"
                poster="/images/nova-glass-hero-bg.jpg"
                className="nova-hero-artwork-img nova-hero-artwork-video"
                aria-label="Nova Glass Animated Hero Character"
              />

              {/* Efek Pendar Cahaya Halo Karakter */}
              <div className="nova-hero-halo-pulse" />

              {/* Partikel Kristal Es Melayang & Berkilau */}
              <div className="nova-hero-crystal-spark spark-1" />
              <div className="nova-hero-crystal-spark spark-2" />
              <div className="nova-hero-crystal-spark spark-3" />
              <div className="nova-hero-crystal-spark spark-4" />
              <div className="nova-hero-crystal-spark spark-5" />
            </div>
          </motion.div>
        </div>

        <div className="nova-hero-overlay" />
        <div className="nova-hero-dust" />

        {/* Hero Left Content Column */}
        <div className="nova-hero-body">
          <MotionItem className="nova-hero-content-col">
            {/* Owner Edit Quick Action */}
            {isOwner && (
              <div style={{ marginBottom: '-0.25rem' }}>
                <Link
                  to="/about"
                  className="badge"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: 'rgba(34, 197, 94, 0.16)',
                    border: '1px solid rgba(74, 222, 128, 0.45)',
                    color: '#4ade80',
                    textDecoration: 'none',
                    padding: '0.35rem 0.85rem',
                    borderRadius: '9999px',
                    fontSize: '0.76rem',
                    fontWeight: 600
                  }}
                  title="Buka Halaman About untuk Mengedit Profil & Biodata"
                >
                  <Edit3 size={13} />
                  <span>Mode Pemilik: Edit Profil</span>
                </Link>
              </div>
            )}

            {/* Profile Name */}
            <h1 className="nova-hero-name">
              {profile?.name || 'Habib Ramadhan'}
            </h1>

            {/* Subline: SMK Student • XI PPLG 3 */}
            <div className="nova-hero-subtitle">
              <span className="dot">•</span>
              <span>{profile?.status || 'SMK Student'}</span>
              <span className="dot">•</span>
              <span>{profile?.class || 'XI PPLG 3'}</span>
            </div>

            {/* Specialization Pill Badge */}
            <div className="nova-spec-badge">
              <Wrench size={14} />
              <span>Pengembangan Perangkat Lunak dan Gim</span>
            </div>

            {/* Main Tagline */}
            <h2 className="nova-hero-headline">
              Belajar Hari Ini,
              <br />
              <span className="nova-hero-headline-accent">Membangun Masa Depan.</span>
            </h2>

            {/* Bio Description */}
            <p className="nova-hero-bio">
              {profile?.bio || 'Saya adalah siswa SMK yang tertarik pada pengembangan website, pemrograman, teknologi, dan desain antarmuka.'}
            </p>

            {/* Action CTA Buttons */}
            <div className="nova-hero-actions">
              <Link to="/projects" className="nova-btn-primary" id="hero-btn-projects">
                <User size={16} />
                <span>Lihat Portofolio</span>
              </Link>

              <button
                type="button"
                className="nova-btn-glass"
                onClick={handleDownloadCV}
                disabled={isDownloadingCV}
                id="hero-btn-cv"
                title="Unduh CV PDF langsung"
              >
                <Download size={16} />
                <span>{isDownloadingCV ? 'Membuat PDF...' : 'Unduh CV'}</span>
              </button>

              <Link to="/contact" className="nova-btn-glass" id="hero-btn-contact">
                <Mail size={16} />
                <span>Hubungi Saya</span>
              </Link>
            </div>
          </MotionItem>
        </div>

        {/* Hero Bottom Bar: Stats Dock & Live Clock Card */}
        <div className="nova-hero-bottom-bar">
          {/* Bottom-Left Horizontal Stats Dock */}
          <MotionCard className="nova-stats-dock">
            <div className="nova-stat-col">
              <span className="nova-stat-value">{projects.length || 6}</span>
              <span className="nova-stat-label">Proyek</span>
            </div>
            <div className="nova-stat-divider" />
            <div className="nova-stat-col">
              <span className="nova-stat-value">{skills.length || 8}</span>
              <span className="nova-stat-label">Skill</span>
            </div>
            <div className="nova-stat-divider" />
            <div className="nova-stat-col">
              <span className="nova-stat-value">{certificates.length || 3}</span>
              <span className="nova-stat-label">Sertifikat</span>
            </div>
            <div className="nova-stat-divider" />
            <div className="nova-stat-col">
              <span className="nova-stat-value">1</span>
              <span className="nova-stat-label">Tahun</span>
            </div>
          </MotionCard>

          {/* Bottom-Right Live Clock & Quote Card */}
          <MotionCard className="nova-clock-card">
            <div className="nova-clock-top">
              <Clock size={20} className="text-ice" />
              <span className="nova-clock-digits">{liveTime.timeWithSeconds}</span>
            </div>
            <div className="nova-clock-date-line">{liveTime.dateStr}</div>
            <div className="nova-clock-quote-line">
              <Sparkles size={14} />
              <span>Proses hari ini adalah hasil esok nanti.</span>
            </div>
          </MotionCard>
        </div>

        {/* Center Bottom Scroll Indicator */}
        <a
          href="#home-sections"
          className="nova-scroll-down-btn"
          aria-label="Gulir ke konten portofolio"
          onClick={handleScrollToContent}
        >
          <ChevronDown size={20} />
        </a>
      </section>

      {/* =========================================================================
          CONTENT SUBSECTIONS BELOW HERO
          ========================================================================= */}
      <div id="home-sections" className="nova-subsections-container">
        {/* STATISTICS OVERVIEW */}
        <section>
          <MotionItem style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Ikhtisar Portofolio
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Statistik langsung yang dihitung secara real-time dari data lokal Anda.
            </p>
          </MotionItem>

          <StaggerGrid style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))',
            gap: '1.25rem'
          }}>
            <MotionCard>
              <StatCard
                icon={FolderKanban}
                number={projects.length}
                label="Total Proyek"
              />
            </MotionCard>
            <MotionCard>
              <StatCard
                icon={Code2}
                number={skills.length}
                label="Keahlian & Teknologi"
              />
            </MotionCard>
            <MotionCard>
              <StatCard
                icon={Award}
                number={certificates.length}
                label="Sertifikat & Lisensi"
              />
            </MotionCard>
            <MotionCard>
              <StatCard
                icon={GraduationCap}
                number={timeline.length}
                label="Riwayat Belajar"
              />
            </MotionCard>
          </StaggerGrid>
        </section>

        {/* FEATURED PROJECTS */}
        <section>
          <MotionItem style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '1.5rem',
            flexWrap: 'wrap'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span className="badge badge-ice">KARYA TERPILIH</span>
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                Proyek Unggulan
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Hasil eksplorasi pengembangan aplikasi, web, dan antarmuka interaktif.
              </p>
            </div>

            <Link to="/projects" className="btn btn-glass btn-sm">
              <span>Lihat Semua ({projects.length})</span>
              <ChevronRight size={16} />
            </Link>
          </MotionItem>

          {featuredProjects.length > 0 ? (
            <StaggerGrid style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
              gap: '1.5rem'
            }}>
              {featuredProjects.map(project => (
                <MotionCard key={project.id}>
                  <ProjectCard
                    project={project}
                    onDetail={(p) => setSelectedProject(p)}
                    onToggleFavorite={handleToggleFavorite}
                  />
                </MotionCard>
              ))}
            </StaggerGrid>
          ) : (
            <MotionCard>
              <GlassCard style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Belum ada proyek yang disimpan.</p>
                <Link to="/projects" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
                  Tambah Proyek Sekarang
                </Link>
              </GlassCard>
            </MotionCard>
          )}
        </section>

        {/* KEY SKILLS HIGHLIGHT */}
        <section>
          <MotionItem style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '1.5rem',
            flexWrap: 'wrap'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span className="badge badge-ice">KOMPETENSI</span>
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                Keahlian & Penguasaan
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Tingkat penguasaan bahasa pemrograman dan teknologi web yang dipelajari di SMK.
              </p>
            </div>

            <Link to="/skills" className="btn btn-glass btn-sm">
              <span>Kelola Skills ({skills.length})</span>
              <ChevronRight size={16} />
            </Link>
          </MotionItem>

          <StaggerGrid style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
            gap: '1.25rem'
          }}>
            {topSkills.map(skill => (
              <MotionCard key={skill.id}>
                <GlassCard interactive style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text-primary)' }}>
                      {skill.name}
                    </div>
                    <span className="badge badge-ice font-mono" style={{ fontSize: '0.75rem' }}>
                      {skill.proficiency}%
                    </span>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    {skill.category} • {skill.levelLabel || 'Menengah'}
                  </div>

                  <div className="progress-bar-container">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${skill.proficiency}%` }}
                    />
                  </div>
                </GlassCard>
              </MotionCard>
            ))}
          </StaggerGrid>
        </section>

        {/* CALL TO ACTION / FOOTER BANNER */}
        <section>
          <MotionCard>
            <div className="glass-panel" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '2rem',
              flexWrap: 'wrap',
              background: 'linear-gradient(135deg, rgba(13, 21, 36, 0.85) 0%, rgba(20, 35, 60, 0.75) 100%)',
              border: '1px solid var(--border-glass-bright)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ maxWidth: '650px', position: 'relative', zIndex: 1 }}>
                <span className="badge badge-ice" style={{ marginBottom: '0.75rem' }}>
                  TERBUKA UNTUK KESEMPATAN
                </span>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem', color: '#FFFFFF' }}>
                  Tertarik Berkolaborasi atau Menawarkan Tempat Magang?
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  Saya selalu siap untuk belajar hal baru, beradaptasi dengan tim kerja profesional, dan memberikan kontribusi terbaik di bidang rekayasa perangkat lunak.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
                <Link to="/contact" className="btn btn-primary">
                  <Mail size={16} />
                  <span>Kirim Pesan</span>
                </Link>
                <Link to="/cv" className="btn btn-glass">
                  <Sparkles size={16} />
                  <span>Buka CV Builder</span>
                </Link>
              </div>
            </div>
          </MotionCard>
        </section>
      </div>

      {/* Detail Modal */}
      <ProjectDetailModal
        isOpen={Boolean(selectedProject)}
        onClose={() => setSelectedProject(null)}
        project={selectedProject}
      />
    </PageTransition>
  );
}
