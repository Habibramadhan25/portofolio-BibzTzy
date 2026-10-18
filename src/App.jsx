import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import Skills from './pages/Skills';
import Education from './pages/Education';
import Certificates from './pages/Certificates';
import CVBuilder from './pages/CVBuilder';
import Contact from './pages/Contact';
import ActivityFeed from './pages/ActivityFeed';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import ScrollToTop from './components/common/ScrollToTop';
import { OwnerProvider } from './context/OwnerContext';

export default function App() {
  return (
    <OwnerProvider>
      <ScrollToTop />
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="projects" element={<Projects />} />
          <Route path="skills" element={<Skills />} />
          <Route path="education" element={<Education />} />
          <Route path="certificates" element={<Certificates />} />
          <Route path="cv" element={<CVBuilder />} />
          <Route path="feed" element={<ActivityFeed />} />
          <Route path="contact" element={<Contact />} />
          <Route path="settings" element={<Settings />} />

          {/* Redirect roadmap to projects */}
          <Route path="roadmap" element={<Navigate to="/projects" replace />} />

          {/* Redirect deprecated activity routes to Home */}
          <Route path="activity" element={<Navigate to="/" replace />} />
          <Route path="aktivitas" element={<Navigate to="/" replace />} />

          {/* Alias Rute Bahasa Indonesia & Bentuk Tunggal */}
          <Route path="skill" element={<Navigate to="/skills" replace />} />
          <Route path="skil" element={<Navigate to="/skills" replace />} />
          <Route path="keahlian" element={<Navigate to="/skills" replace />} />
          <Route path="project" element={<Navigate to="/projects" replace />} />
          <Route path="proyek" element={<Navigate to="/projects" replace />} />
          <Route path="portofolio" element={<Navigate to="/projects" replace />} />
          <Route path="portfolio" element={<Navigate to="/projects" replace />} />
          <Route path="profil" element={<Navigate to="/about" replace />} />
          <Route path="profile" element={<Navigate to="/about" replace />} />
          <Route path="tentang" element={<Navigate to="/about" replace />} />
          <Route path="pendidikan" element={<Navigate to="/education" replace />} />
          <Route path="sertifikat" element={<Navigate to="/certificates" replace />} />
          <Route path="certificate" element={<Navigate to="/certificates" replace />} />
          <Route path="kontak" element={<Navigate to="/contact" replace />} />
          <Route path="pengaturan" element={<Navigate to="/settings" replace />} />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </OwnerProvider>
  );
}
