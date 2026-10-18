import React, { useState, useEffect } from 'react';
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
  ChevronRight
} from 'lucide-react';
import ClockWidget from '../components/common/ClockWidget';
import StatCard from '../components/common/StatCard';
import GlassCard from '../components/common/GlassCard';
import HangingIdCard from '../components/common/HangingIdCard';
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
import confetti from 'canvas-confetti';

export default function Home() {
  const { profile } = useOutletContext();
  const toast = useToast();
  const { playSound } = useTheme();

  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isDownloadingCV, setIsDownloadingCV] = useState(false);
  const [cardStyle, setCardStyle] = useState('hanging-3d'); // 'hanging-3d' | 'anime-glass'

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

  return (
    <PageTransition style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      {/* =========================================================================
          HERO SECTION
          ========================================================================= */}
      <section className="hero-section" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
        gap: '2.5rem',
        alignItems: 'center'
      }}>
        {/* Left Column: Greeting & Info */}
        <MotionItem style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="badge badge-ice animate-pulse-glow" style={{ padding: '0.4rem 1rem' }}>
              <Sparkles size={14} className="text-ice" />
              BIBTZY • SMK PPLG PORTFOLIO
            </span>
            <span className="badge badge-success">
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-success)', display: 'inline-block' }} />
              Siap Magang
            </span>
          </div>

          <div>
            <h1 style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              marginBottom: '0.5rem'
            }}>
              Halo, Saya <br />
              <span className="text-gradient glow-text">
                {profile?.name || 'Habib Ramadhan'}
              </span>
            </h1>

            <p style={{
              fontSize: '1.1rem',
              color: 'var(--ice-blue)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              flexWrap: 'wrap'
            }}>
              <span>{profile?.status || 'Siswa SMK'}</span>
              <span>•</span>
              <span style={{ color: 'var(--text-primary)' }}>{profile?.class || 'XI PPLG 3'}</span>
              <span>•</span>
              <span>{profile?.school || 'SMK Negeri 1 Ciomas'}</span>
            </p>
          </div>


          <p style={{
            fontSize: '1rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
            maxWidth: '560px'
          }}>
            {profile?.bio || 'Siswa SMK yang tertarik pada pengembangan website, pemrograman, teknologi, dan desain antarmuka.'}
          </p>

          {/* Action CTA Buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap',
            marginTop: '0.5rem'
          }}>
            <Link to="/projects" className="btn btn-primary" id="hero-btn-projects" style={{ flex: '1 1 auto', minWidth: '150px' }}>
              <span>Lihat Portofolio</span>
              <ArrowRight size={16} />
            </Link>

            <Link to="/contact" className="btn btn-outline" id="hero-btn-contact" style={{ flex: '1 1 auto', minWidth: '130px' }}>
              <Mail size={16} />
              <span>Hubungi Saya</span>
            </Link>

            <button
              type="button"
              className="btn btn-glass"
              onClick={handleDownloadCV}
              disabled={isDownloadingCV}
              id="hero-btn-cv"
              title="Unduh CV PDF langsung"
              style={{ flex: '1 1 auto', minWidth: '120px' }}
            >
              <Download size={16} />
              <span>{isDownloadingCV ? 'Membuat PDF...' : 'Unduh CV'}</span>
            </button>
          </div>

          {/* Quick Tech Tags */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Teknologi Inti:</span>
            {['React', 'Vite', 'CSS Glassmorphism', 'JavaScript', 'PHP', 'MySQL'].map(t => (
              <span key={t} className="badge" style={{ background: 'var(--card-glass)', border: '1px solid var(--border-glass)', fontSize: '0.75rem' }}>
                {t}
              </span>
            ))}
          </div>
        </MotionItem>

        {/* Right Column: Interactive 3D Hanging ID Card (DC CARD) & Live Clock */}
        <MotionCard style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', width: '100%' }}>
          {/* View Mode Toggle Pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: 'rgba(5, 11, 20, 0.65)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--border-glass)',
            padding: '3px 4px',
            borderRadius: 'var(--radius-full)',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <button
              type="button"
              onClick={() => {
                playSound?.('click');
                setCardStyle('hanging-3d');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '4px 11px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.74rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: cardStyle === 'hanging-3d' ? 'var(--accent-color)' : 'transparent',
                color: cardStyle === 'hanging-3d' ? '#050B14' : 'var(--text-secondary)',
                boxShadow: cardStyle === 'hanging-3d' ? '0 0 12px rgba(var(--accent-rgb), 0.4)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <Sparkles size={12} />
              <span>3D Hanging Card</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playSound?.('click');
                setCardStyle('anime-glass');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '4px 11px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.74rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: cardStyle === 'anime-glass' ? 'var(--accent-color)' : 'transparent',
                color: cardStyle === 'anime-glass' ? '#050B14' : 'var(--text-secondary)',
                boxShadow: cardStyle === 'anime-glass' ? '0 0 12px rgba(var(--accent-rgb), 0.4)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <span>Glass Avatar</span>
            </button>
          </div>

          {/* Conditional Card Rendering */}
          {cardStyle === 'hanging-3d' ? (
            <HangingIdCard profile={profile} />
          ) : (
            /* Avatar Showcase with Glass Box */
            <div className="glass-card glass-card-glow animate-float" style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-xl)',
              width: '100%',
              maxWidth: '380px',
              position: 'relative'
            }}>
              <div style={{
                width: '100%',
                height: 'clamp(240px, 50vw, 320px)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                position: 'relative',
                background: '#04070D',
                border: '1px solid var(--border-glass-bright)'
              }}>
                <img
                  src={profile?.avatar || '/images/avatar.jpg'}
                  alt={profile?.name || 'Habib Ramadhan'}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, transparent 50%, rgba(7, 11, 20, 0.85) 100%)'
                }} />

                {/* Status overlay on image */}
                <div style={{
                  position: 'absolute',
                  bottom: '1rem',
                  left: '1rem',
                  right: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF' }}>
                      {profile?.name || 'Habib Ramadhan'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--ice-blue)', fontWeight: 600 }}>
                      {profile?.major || 'PPLG'}
                    </div>
                  </div>
                  <span className="badge badge-ice" style={{ backdropFilter: 'blur(10px)', background: 'rgba(7, 11, 20, 0.7)' }}>
                    Active
                  </span>
                </div>
              </div>

              {/* Sub-label under avatar */}
              <div style={{
                marginTop: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.82rem',
                color: 'var(--text-secondary)'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Sparkles size={14} className="text-ice" />
                  Anime Ice Blue Style
                </span>
                <Link to="/about" style={{ color: 'var(--accent-color)', fontWeight: 600, textDecoration: 'none' }}>
                  Lihat Detail Profil →
                </Link>
              </div>
            </div>
          )}

          {/* Live Clock Widget */}
          <div style={{ width: '100%', maxWidth: '380px' }}>
            <ClockWidget />
          </div>
        </MotionCard>
      </section>

      {/* =========================================================================
          STATISTICS OVERVIEW (Dihitung dari data nyata tersimpan)
          ========================================================================= */}
      <section>
        <MotionItem style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)' }}>
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

      {/* =========================================================================
          FEATURED PROJECTS (Proyek Unggulan)
          ========================================================================= */}
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
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800 }}>
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

      {/* =========================================================================
          KEY SKILLS HIGHLIGHT
          ========================================================================= */}
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
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800 }}>
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

      {/* =========================================================================
          CALL TO ACTION / FOOTER BANNER
          ========================================================================= */}
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

      {/* Detail Modal */}
      <ProjectDetailModal
        isOpen={Boolean(selectedProject)}
        onClose={() => setSelectedProject(null)}
        project={selectedProject}
      />
    </PageTransition>
  );
}
