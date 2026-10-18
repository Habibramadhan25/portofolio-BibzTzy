import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  FileText,
  Download,
  Sparkles,
  Check,
  Eye,
  Settings2,
  RefreshCw,
  Award,
  GraduationCap,
  Briefcase,
  Code2,
  FolderKanban
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import GlassCard from '../components/common/GlassCard';
import { projectService } from '../services/projectService';
import { skillService } from '../services/skillService';
import { educationService } from '../services/educationService';
import { certificateService } from '../services/certificateService';
import { pdfService } from '../services/pdfService';
import { useToast } from '../context/ToastContext';
import { PageTransition, MotionItem, MotionCard } from '../components/common/MotionWrapper';
import confetti from 'canvas-confetti';

export default function CVBuilder() {
  const { profile } = useOutletContext();
  const toast = useToast();

  const [skills, setSkills] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [projects, setProjects] = useState([]);
  const [certificates, setCertificates] = useState([]);

  // CV Settings
  const [customSummary, setCustomSummary] = useState('');
  const [includeSections, setIncludeSections] = useState({
    summary: true,
    timeline: true,
    skills: true,
    projects: true,
    certificates: true
  });
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const loadAll = () => {
      setSkills(skillService.getSkills());
      setTimeline(educationService.getTimeline());
      setProjects(projectService.getProjects());
      setCertificates(certificateService.getCertificates());
    };

    loadAll();

    if (profile?.bio && !customSummary) {
      setCustomSummary(profile.bio);
    }
  }, [profile]);

  const toggleSection = (key) => {
    setIncludeSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      // Filter out sections based on checkboxes
      const res = pdfService.generateCV({
        profile,
        skills: includeSections.skills ? skills : [],
        timeline: includeSections.timeline ? timeline : [],
        projects: includeSections.projects ? projects : [],
        customSummary: includeSections.summary ? customSummary : ''
      });

      if (res && res.success) {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#45CFFF', '#8DDCFF', '#2563EB', '#34D399', '#FFFFFF']
        });
        toast.success(`CV ${profile?.name || 'Siswa'} berhasil di-generate dan diunduh!`);
      } else {
        toast.error('Gagal men-generate PDF. Silakan periksa data.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan saat memproses pembuatan dokumen PDF.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <PageTransition style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <PageHeader
        badge="GENERATOR DOKUMEN"
        title="Pembuat CV Otomatis (PDF)"
        subtitle="Rancang dan unduh dokumen Curriculum Vitae siswa SMK berstandar industri secara langsung dari data portofolio Anda."
        actions={
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            id="btn-download-cv-top"
          >
            <Download size={16} />
            <span>{isGenerating ? 'Membuat Dokumen PDF...' : 'Unduh CV (.PDF)'}</span>
          </button>
        }
      />

      {/* Main Grid: Left Config Panel | Right Live Preview Sheet */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
        gap: '2rem',
        alignItems: 'start'
      }}>
        {/* Left Column: Configuration & Controls */}
        <MotionCard style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Custom Summary Box */}
          <GlassCard style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
              <Settings2 size={18} className="text-ice" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                Ringkasan Profil Khusus
              </h3>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Sesuaikan narasi ringkasan profesional yang akan dicetak di bagian teratas CV Anda.
            </p>

            <textarea
              className="form-textarea"
              rows={5}
              value={customSummary}
              onChange={(e) => setCustomSummary(e.target.value)}
              placeholder="Tuliskan deskripsi kompetensi, motivasi belajar, dan aspirasi karier Anda..."
            />

            <button
              type="button"
              className="btn btn-glass btn-sm"
              style={{ marginTop: '0.75rem', width: '100%' }}
              onClick={() => setCustomSummary(profile?.bio || '')}
            >
              <RefreshCw size={14} />
              <span>Gunakan Bio Default dari Profil</span>
            </button>
          </GlassCard>

          {/* Section Selection Toggles */}
          <GlassCard style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Pilih Bagian yang Disertakan
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Aktifkan atau nonaktifkan section tertentu sesuai kebutuhan lamaran magang atau pekerjaan.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input
                  type="checkbox"
                  checked={includeSections.summary}
                  onChange={() => toggleSection('summary')}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--accent-color)' }}
                />
                <span style={{ fontWeight: 600 }}>Ringkasan Profesional (Summary)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input
                  type="checkbox"
                  checked={includeSections.timeline}
                  onChange={() => toggleSection('timeline')}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--accent-color)' }}
                />
                <span style={{ fontWeight: 600 }}>Pendidikan & Riwayat Kegiatan ({timeline.length})</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input
                  type="checkbox"
                  checked={includeSections.skills}
                  onChange={() => toggleSection('skills')}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--accent-color)' }}
                />
                <span style={{ fontWeight: 600 }}>Keahlian & Penguasaan Teknologi ({skills.length})</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input
                  type="checkbox"
                  checked={includeSections.projects}
                  onChange={() => toggleSection('projects')}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--accent-color)' }}
                />
                <span style={{ fontWeight: 600 }}>Proyek Terpilih ({projects.length})</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input
                  type="checkbox"
                  checked={includeSections.certificates}
                  onChange={() => toggleSection('certificates')}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--accent-color)' }}
                />
                <span style={{ fontWeight: 600 }}>Sertifikat & Lisensi ({certificates.length})</span>
              </label>
            </div>
          </GlassCard>

          {/* Action Card */}
          <GlassCard style={{ padding: '1.5rem', background: 'rgba(var(--accent-rgb), 0.08)', border: '1px solid var(--border-glass-bright)' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem', color: '#FFFFFF' }}>
              Ekspor Dokumen PDF
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Dokumen akan dihasilkan dalam format standar A4 portrait, font Helvetica yang bersih, rapi, serta ramah ATS (Applicant Tracking System).
            </p>

            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem' }}
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              id="btn-download-cv-bottom"
            >
              <Download size={18} />
              <span>{isGenerating ? 'Memproses PDF...' : 'Unduh CV (.PDF)'}</span>
            </button>
          </GlassCard>
        </MotionCard>

        {/* Right Column: Live A4 Document Preview */}
        <MotionCard style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Eye size={15} className="text-ice" />
              Pratinjau Lembar Dokumen A4 (Live Preview)
            </span>
            <span className="badge badge-ice" style={{ fontSize: '0.72rem' }}>
              Format Standar A4
            </span>
          </div>

          {/* Document Sheet Simulation */}
          <div style={{
            background: '#FFFFFF',
            color: '#0F172A',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 12px 48px rgba(0, 0, 0, 0.6)',
            padding: 'clamp(1.25rem, 4vw, 2.5rem) clamp(1rem, 3.5vw, 2.25rem)',
            minHeight: '700px',
            fontFamily: 'Helvetica, Arial, sans-serif',
            fontSize: '0.85rem',
            lineHeight: 1.5,
            border: '1px solid rgba(255, 255, 255, 0.4)',
            position: 'relative',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch'
          }}>
            {/* Top Accent Cyan Bar */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '6px',
              background: 'linear-gradient(90deg, #0E7490, #45CFFF)',
              borderTopLeftRadius: 'var(--radius-md)',
              borderTopRightRadius: 'var(--radius-md)'
            }} />

            {/* Header: Name & School */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0B132B', marginBottom: '0.2rem', letterSpacing: '-0.02em' }}>
                {profile?.name || 'Habib Ramadhan'}
              </h1>
              <div style={{ fontSize: '0.95rem', color: '#1E293B', fontWeight: 600 }}>
                {profile?.status || 'Siswa SMK'} • {profile?.class || 'XI PPLG 3'} • {profile?.school || 'SMK Negeri 1 Ciomas'}
              </div>
              {profile?.tagline && (
                <div style={{ fontStyle: 'italic', fontSize: '0.82rem', color: '#64748B', marginTop: '0.2rem' }}>
                  "{profile.tagline}"
                </div>
              )}
            </div>

            {/* Contacts line */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
              fontSize: '0.78rem',
              color: '#475569',
              paddingBottom: '0.85rem',
              borderBottom: '1px solid #CBD5E1',
              marginBottom: '1.5rem'
            }}>
              {profile?.email && <span>{profile.email}</span>}
              {profile?.whatsapp && <span>• {profile.whatsapp}</span>}
              {profile?.location && <span>• {profile.location}</span>}
              {profile?.github && <span>• {profile.github.replace('https://', '')}</span>}
            </div>

            {/* 1. Ringkasan Profil */}
            {includeSections.summary && (customSummary || profile?.bio) && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  color: '#0E7490',
                  textTransform: 'uppercase',
                  borderBottom: '1.5px solid #0E7490',
                  paddingBottom: '0.25rem',
                  marginBottom: '0.6rem'
                }}>
                  Ringkasan Profil
                </div>
                <p style={{ color: '#334155', fontSize: '0.82rem', lineHeight: 1.6 }}>
                  {customSummary || profile?.bio}
                </p>
              </div>
            )}

            {/* 2. Pendidikan & Riwayat */}
            {includeSections.timeline && timeline.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  color: '#0E7490',
                  textTransform: 'uppercase',
                  borderBottom: '1.5px solid #0E7490',
                  paddingBottom: '0.25rem',
                  marginBottom: '0.75rem'
                }}>
                  Pendidikan & Riwayat Kegiatan
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {timeline.map(item => (
                    <div key={item.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <strong style={{ fontSize: '0.88rem', color: '#0F172A' }}>{item.institution}</strong>
                        <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                          {item.startDate} — {item.endDate || (item.isCurrent ? 'Sekarang' : '')}
                        </span>
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#334155' }}>
                        {item.role}
                      </div>
                      {item.description && (
                        <p style={{ color: '#475569', fontSize: '0.78rem', marginTop: '0.2rem' }}>
                          {item.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Keahlian Teknis */}
            {includeSections.skills && skills.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  color: '#0E7490',
                  textTransform: 'uppercase',
                  borderBottom: '1.5px solid #0E7490',
                  paddingBottom: '0.25rem',
                  marginBottom: '0.6rem'
                }}>
                  Keahlian & Teknologi
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {skills.map(s => (
                    <span
                      key={s.id}
                      style={{
                        padding: '0.2rem 0.6rem',
                        background: '#F1F5F9',
                        border: '1px solid #CBD5E1',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        color: '#0F172A',
                        fontWeight: 600
                      }}
                    >
                      {s.name} ({s.proficiency}%)
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Proyek Portofolio Terpilih */}
            {includeSections.projects && projects.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  color: '#0E7490',
                  textTransform: 'uppercase',
                  borderBottom: '1.5px solid #0E7490',
                  paddingBottom: '0.25rem',
                  marginBottom: '0.75rem'
                }}>
                  Proyek Portofolio Terpilih
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {projects.slice(0, 3).map(p => (
                    <div key={p.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <strong style={{ fontSize: '0.85rem', color: '#0F172A' }}>{p.title}</strong>
                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>[{p.category}] - {p.status}</span>
                      </div>
                      {p.techStack && (
                        <div style={{ fontStyle: 'italic', fontSize: '0.75rem', color: '#0E7490' }}>
                          Teknologi: {Array.isArray(p.techStack) ? p.techStack.join(', ') : p.techStack}
                        </div>
                      )}
                      <p style={{ color: '#475569', fontSize: '0.78rem', marginTop: '0.15rem' }}>
                        {p.shortDesc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Document Watermark / Footer */}
            <div style={{
              marginTop: '2rem',
              borderTop: '1px solid #E2E8F0',
              paddingTop: '0.75rem',
              fontSize: '0.72rem',
              color: '#94A3B8',
              textAlign: 'center'
            }}>
              Curriculum Vitae {profile?.name || 'Siswa SMK'} — Digenerate secara otomatis via BibTzy Portfolio Platform
            </div>
          </div>
        </MotionCard>
      </div>
    </PageTransition>
  );
}
