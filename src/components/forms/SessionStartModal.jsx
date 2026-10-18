import React, { useState, useEffect } from 'react';
import { PlayCircle, Clock, Code2, FolderGit2 } from 'lucide-react';
import Modal from '../common/Modal';
import FormField from './FormField';
import { projectService } from '../../services/projectService';

const POPULAR_LANGUAGES = [
  'JavaScript',
  'React / JSX',
  'HTML & CSS',
  'PHP / Laravel',
  'MySQL / SQL',
  'UI/UX Figma',
  'C# / Unity',
  'Python',
  'Algoritma & Logika'
];

export default function SessionStartModal({ isOpen, onClose, onStart }) {
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('JavaScript');
  const [projectId, setProjectId] = useState('');
  const [notes, setNotes] = useState('');
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setProjects(projectService.getProjects());
      setTitle(`Sesi Belajar ${language}`);
      setNotes('');
    }
  }, [isOpen, language]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedProj = projects.find(p => p.id === projectId);
    onStart({
      title: title.trim() || `Sesi Belajar ${language}`,
      language,
      projectId: projectId || '',
      projectTitle: selectedProj ? selectedProj.title : '',
      notes: notes.trim()
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mulai Sesi Belajar / Coding Baru"
      icon={PlayCircle}
      maxWidth="540px"
      footer={
        <>
          <button type="button" className="btn btn-glass btn-sm" onClick={onClose}>
            Batal
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={handleSubmit}>
            <PlayCircle size={16} />
            <span>Mulai Timer Sesi</span>
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <FormField
          label="Judul Sesi Belajar"
          name="title"
          type="text"
          value={title}
          onChange={setTitle}
          placeholder="Contoh: Belajar State Management React atau Latihan CSS Grid"
          hint="Beri nama yang mendeskripsikan materi yang sedang dipelajari."
        />

        <div className="form-group">
          <label className="form-label">
            <span>Bahasa / Kategori Belajar</span>
          </label>
          <select
            className="form-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {POPULAR_LANGUAGES.map(lang => (
              <option key={lang} value={lang} style={{ background: '#0D1524', color: '#F4F8FF' }}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">
            <span>Hubungkan dengan Proyek (Opsional)</span>
            <span className="form-hint">Daftar proyek tersimpan</span>
          </label>
          <select
            className="form-select"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          >
            <option value="" style={{ background: '#0D1524', color: '#F4F8FF' }}>-- Tidak Terhubung ke Proyek Tertentu --</option>
            {projects.map(proj => (
              <option key={proj.id} value={proj.id} style={{ background: '#0D1524', color: '#F4F8FF' }}>
                {proj.title} ({proj.category})
              </option>
            ))}
          </select>
        </div>

        <FormField
          label="Catatan Awal / Target Belajar"
          name="notes"
          type="textarea"
          rows={3}
          value={notes}
          onChange={setNotes}
          placeholder="Tuliskan target modul atau bug yang ingin diselesaikan pada sesi ini..."
        />
      </form>
    </Modal>
  );
}
