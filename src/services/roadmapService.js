import { storageService } from './storageService';
import { activityFeedService } from './activityFeedService';
import { achievementService } from './achievementService';

const STORAGE_KEY = 'learning_roadmap';

export const INITIAL_ROADMAP = [
  {
    id: 'road-1',
    order: 1,
    title: 'HTML5 Fundamentals',
    category: 'Web Core',
    difficulty: 'Dasar',
    status: 'completed',
    description: 'Pemahaman tag semantik, form handling, aksesibilitas dasar (a11y), dan struktur dokumen web standar W3C.',
    targetDate: '2024-02-15',
    completedDate: '2024-02-10',
    resourceUrl: 'https://developer.mozilla.org/id/docs/Web/HTML',
    notes: 'Selesai dipelajari di semester 1 PPLG. Sangat penting untuk SEO dan semantik kode.',
    checklist: [
      { id: 'c1', text: 'Struktur tag semantik (header, nav, main, footer)', completed: true },
      { id: 'c2', text: 'Form input, validation attributes, dan form submission', completed: true },
      { id: 'c3', text: 'Aksesibilitas & alt attributes pada media', completed: true }
    ],
    isSample: true
  },
  {
    id: 'road-2',
    order: 2,
    title: 'CSS3 & Modern Layouts',
    category: 'Web Core',
    difficulty: 'Dasar',
    status: 'completed',
    description: 'Penguasaan Flexbox, CSS Grid, Media Queries untuk responsivitas layar HP hingga desktop, dan CSS Custom Properties (Variables).',
    targetDate: '2024-04-01',
    completedDate: '2024-03-25',
    resourceUrl: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/',
    notes: 'Flexbox dan Grid menjadi pilar penting untuk membuat tata letak modern tanpa framework berat.',
    checklist: [
      { id: 'c1', text: 'Flexbox direction, justify-content, align-items', completed: true },
      { id: 'c2', text: 'CSS Grid repeat, minmax, auto-fit kolom responsif', completed: true },
      { id: 'c3', text: 'CSS Variables (:root) untuk sistem warna tema', completed: true }
    ],
    isSample: true
  },
  {
    id: 'road-3',
    order: 3,
    title: 'Responsive Web Design & Glassmorphism',
    category: 'Frontend',
    difficulty: 'Menengah',
    status: 'completed',
    description: 'Desain antarmuka futuristik berbasis backdrop-filter, border semi-transparan, visual kristal es, dan adaptasi mobile-first.',
    targetDate: '2024-06-01',
    completedDate: '2024-05-20',
    resourceUrl: 'https://glassmorphism.com/',
    notes: 'Diterapkan secara penuh dalam proyek portofolio BibTzy.',
    checklist: [
      { id: 'c1', text: 'Eksperimen backdrop-filter blur & alpha RGBA', completed: true },
      { id: 'c2', text: 'Hierarki kontras teks pada kartu kaca tembus pandang', completed: true },
      { id: 'c3', text: 'Transisi hover dan animasi cahaya aksen neon', completed: true }
    ],
    isSample: true
  },
  {
    id: 'road-4',
    order: 4,
    title: 'JavaScript ES6+ Fundamentals',
    category: 'Web Core',
    difficulty: 'Dasar',
    status: 'completed',
    description: 'Variabel let/const, arrow functions, destructuring, template literals, array methods (map, filter, reduce), dan modular JavaScript.',
    targetDate: '2024-08-15',
    completedDate: '2024-08-10',
    resourceUrl: 'https://javascript.info/',
    notes: 'Fondasi utama sebelum melangkah ke framework modern seperti React.',
    checklist: [
      { id: 'c1', text: 'Arrow functions & lexical this scope', completed: true },
      { id: 'c2', text: 'Array methods: map, filter, reduce, find', completed: true },
      { id: 'c3', text: 'Spread operator, destructuring object & array', completed: true }
    ],
    isSample: true
  },
  {
    id: 'road-5',
    order: 5,
    title: 'DOM Manipulation & Browser Storage',
    category: 'Frontend',
    difficulty: 'Menengah',
    status: 'completed',
    description: 'Manipulasi elemen HTML via JavaScript murni, penanganan event listener, LocalStorage, sessionStorage, dan IndexedDB dasar.',
    targetDate: '2024-10-01',
    completedDate: '2024-09-28',
    resourceUrl: 'https://developer.mozilla.org/id/docs/Web/API/Document_Object_Model',
    notes: 'Memahami cara menyimpan data persistensi di browser tanpa backend.',
    checklist: [
      { id: 'c1', text: 'Event listeners (click, change, keydown, submit)', completed: true },
      { id: 'c2', text: 'LocalStorage CRUD & penanganan JSON stringify/parse', completed: true },
      { id: 'c3', text: 'IndexedDB dasar untuk penyimpanan gambar', completed: true }
    ],
    isSample: true
  },
  {
    id: 'road-6',
    order: 6,
    title: 'Git & GitHub Workflow',
    category: 'Tools',
    difficulty: 'Menengah',
    status: 'in_progress',
    description: 'Version control system: commit, branch, merge, pull request, resolusi konflik, dan kolaborasi repositori di GitHub.',
    targetDate: '2024-12-01',
    completedDate: null,
    resourceUrl: 'https://git-scm.com/doc',
    notes: 'Sedang mempraktikkan git branching dan commit konvensional untuk proyek sekolah.',
    checklist: [
      { id: 'c1', text: 'Git init, add, commit, push, pull remote', completed: true },
      { id: 'c2', text: 'Branching workflow (feature branches)', completed: true },
      { id: 'c3', text: 'Resolusi merge conflict & pull requests', completed: false }
    ],
    isSample: true
  },
  {
    id: 'road-7',
    order: 7,
    title: 'React.js Components & Hooks',
    category: 'Frontend',
    difficulty: 'Menengah',
    status: 'in_progress',
    description: 'Arsitektur komponen modular, JSX, Props, State (useState, useEffect, useMemo, useCallback), serta siklus hidup komponen.',
    targetDate: '2025-01-20',
    completedDate: null,
    resourceUrl: 'https://react.dev/',
    notes: 'Mempelajari cara memecah UI menjadi komponen-komponen kecil yang reusable.',
    checklist: [
      { id: 'c1', text: 'Komponen berbasis fungsi & JSX syntax', completed: true },
      { id: 'c2', text: 'useState & useEffect untuk interaksi dinamis', completed: true },
      { id: 'c3', text: 'Custom hooks & optimasi render', completed: false }
    ],
    isSample: true
  },
  {
    id: 'road-8',
    order: 8,
    title: 'React Router & Global Context State',
    category: 'Frontend',
    difficulty: 'Menengah',
    status: 'in_progress',
    description: 'Navigasi Single Page Application (SPA) multi-halaman tanpa reload dengan React Router v7 dan Context API.',
    targetDate: '2025-03-01',
    completedDate: null,
    resourceUrl: 'https://reactrouter.com/',
    notes: 'Diterapkan pada seluruh navigasi halaman BibTzy.',
    checklist: [
      { id: 'c1', text: 'BrowserRouter, Routes, Route, Outlet konfigurasi', completed: true },
      { id: 'c2', text: 'NavLink aktif & layout wrapper konsisten', completed: true },
      { id: 'c3', text: 'Context API untuk Theme & Toast notifications', completed: true }
    ],
    isSample: true
  },
  {
    id: 'road-9',
    order: 9,
    title: 'API Integration & Asynchronous JS',
    category: 'Frontend',
    difficulty: 'Menengah',
    status: 'not_started',
    description: 'Promises, Async/Await, Fetch API, Axios, penanganan data JSON, error handling (try/catch), dan status loading.',
    targetDate: '2025-05-01',
    completedDate: null,
    resourceUrl: 'https://javascript.info/async',
    notes: 'Digunakan untuk integrasi konsumsi REST API dan pemrosesan data asinkron.',
    checklist: [
      { id: 'c1', text: 'Konsep Promise & Async / Await', completed: false },
      { id: 'c2', text: 'Fetch API requests (GET, POST, PUT, DELETE)', completed: false },
      { id: 'c3', text: 'Penanganan timeout dan feedback error di UI', completed: false }
    ],
    isSample: true
  },
  {
    id: 'road-10',
    order: 10,
    title: 'Database Fundamentals & MySQL',
    category: 'Backend',
    difficulty: 'Dasar',
    status: 'not_started',
    description: 'Desain skema basis data relasional, Normalisasi (1NF, 2NF, 3NF), DDL/DML SQL queries, JOIN tabel, dan integritas data.',
    targetDate: '2025-07-01',
    completedDate: null,
    resourceUrl: 'https://dev.mysql.com/doc/',
    notes: 'Materi kurikulum kejuruan kelas XI PPLG semester depan.',
    checklist: [
      { id: 'c1', text: 'Primary Key, Foreign Key, dan Relasi ERD', completed: false },
      { id: 'c2', text: 'SELECT queries dengan WHERE, ORDER BY, GROUP BY', completed: false },
      { id: 'c3', text: 'INNER JOIN dan LEFT JOIN antar-tabel data', completed: false }
    ],
    isSample: true
  },
  {
    id: 'road-11',
    order: 11,
    title: 'Backend Development with PHP & Laravel',
    category: 'Backend',
    difficulty: 'Mahir',
    status: 'not_started',
    description: 'Arsitektur MVC (Model-View-Controller), routing, migrasi basis data, Eloquent ORM, dan pembuatan RESTful API autentikasi.',
    targetDate: '2025-09-15',
    completedDate: null,
    resourceUrl: 'https://laravel.com/docs',
    notes: 'Persiapan uji kompetensi keahlian (UKK) tingkat SMK.',
    checklist: [
      { id: 'c1', text: 'Struktur folder & konsep MVC Laravel', completed: false },
      { id: 'c2', text: 'Database migrations & seeders', completed: false },
      { id: 'c3', text: 'REST API endpoints dengan JSON responses', completed: false }
    ],
    isSample: true
  },
  {
    id: 'road-12',
    order: 12,
    title: 'Deployment, CI/CD & Production Portfolio',
    category: 'Tools',
    difficulty: 'Menengah',
    status: 'not_started',
    description: 'Build produksi Vite, optimasi aset, deployment ke platform hosting modern (Vercel/Netlify), custom domain, dan SSL.',
    targetDate: '2025-11-01',
    completedDate: null,
    resourceUrl: 'https://vite.dev/guide/static-deploy.html',
    notes: 'Langkah peluncuran website BibTzy ke publik.',
    checklist: [
      { id: 'c1', text: 'Optimasi bundler Vite build & chunk splitting', completed: false },
      { id: 'c2', text: 'Konfigurasi Vercel / GitHub Pages deployment', completed: false },
      { id: 'c3', text: 'Pengujian performa Lighthouse & Core Web Vitals', completed: false }
    ],
    isSample: true
  }
];

export const roadmapService = {
  getRoadmap() {
    const data = storageService.get(STORAGE_KEY, null);
    if (!data) {
      storageService.set(STORAGE_KEY, INITIAL_ROADMAP);
      return INITIAL_ROADMAP;
    }
    return data;
  },

  saveRoadmap(items) {
    storageService.set(STORAGE_KEY, items);
    return items;
  },

  addItem(itemData) {
    const roadmap = this.getRoadmap();
    const newItem = {
      id: `road-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      order: roadmap.length + 1,
      title: itemData.title || 'Materi Belajar Baru',
      category: itemData.category || 'Frontend',
      difficulty: itemData.difficulty || 'Dasar',
      status: itemData.status || 'not_started',
      description: itemData.description || '',
      targetDate: itemData.targetDate || '',
      completedDate: itemData.status === 'completed' ? new Date().toISOString() : null,
      resourceUrl: itemData.resourceUrl || '',
      notes: itemData.notes || '',
      checklist: Array.isArray(itemData.checklist) ? itemData.checklist : []
    };

    const updated = [...roadmap, newItem];
    this.saveRoadmap(updated);

    // If added directly as completed, award XP
    if (newItem.status === 'completed') {
      achievementService.addXP({
        sourceType: 'roadmap',
        sourceId: newItem.id,
        amount: 25,
        reason: `Menyelesaikan Materi: ${newItem.title}`
      });

      activityFeedService.logActivity({
        type: 'roadmap',
        title: `Materi Selesai: ${newItem.title}`,
        description: `Kategori ${newItem.category} (${newItem.difficulty})`,
        entityId: newItem.id
      });
    }

    return newItem;
  },

  updateItem(id, updates) {
    const roadmap = this.getRoadmap();
    const oldItem = roadmap.find(r => r.id === id);
    if (!oldItem) return null;

    const newlyCompleted = oldItem.status !== 'completed' && updates.status === 'completed';

    const updatedItem = {
      ...oldItem,
      ...updates,
      completedDate: newlyCompleted ? new Date().toISOString() : (updates.status === 'completed' ? oldItem.completedDate : null)
    };

    const updatedList = roadmap.map(r => r.id === id ? updatedItem : r);
    this.saveRoadmap(updatedList);

    // If transitioned to completed: log event, give XP, evaluate badges
    if (newlyCompleted) {
      achievementService.addXP({
        sourceType: 'roadmap',
        sourceId: updatedItem.id,
        amount: 25,
        reason: `Menyelesaikan Materi: ${updatedItem.title}`
      });

      activityFeedService.logActivity({
        type: 'roadmap',
        title: `Materi Selesai: ${updatedItem.title}`,
        description: `Selamat! Anda telah menuntaskan topik ${updatedItem.title} (${updatedItem.category}).`,
        entityId: updatedItem.id,
        metadata: { category: updatedItem.category }
      });

      achievementService.evaluateBadges({ roadmap: updatedList });
    } else if (oldItem.status !== 'in_progress' && updates.status === 'in_progress') {
      activityFeedService.logActivity({
        type: 'roadmap',
        title: `Mulai Mempelajari: ${updatedItem.title}`,
        description: `Materi ${updatedItem.category} telah aktif dipelajari.`,
        entityId: updatedItem.id
      });
    }

    return updatedItem;
  },

  deleteItem(id) {
    const roadmap = this.getRoadmap();
    const filtered = roadmap.filter(r => r.id !== id);
    this.saveRoadmap(filtered);
    return true;
  },

  toggleChecklist(itemId, checkId) {
    const roadmap = this.getRoadmap();
    const item = roadmap.find(r => r.id === itemId);
    if (!item || !Array.isArray(item.checklist)) return null;

    const updatedChecklist = item.checklist.map(c => 
      c.id === checkId ? { ...c, completed: !c.completed } : c
    );

    // Auto update status if all completed
    const allDone = updatedChecklist.length > 0 && updatedChecklist.every(c => c.completed);
    let newStatus = item.status;
    if (allDone && item.status !== 'completed') {
      newStatus = 'completed';
    } else if (!allDone && item.status === 'completed') {
      newStatus = 'in_progress';
    }

    return this.updateItem(itemId, {
      checklist: updatedChecklist,
      status: newStatus
    });
  },

  getProgressStats() {
    const roadmap = this.getRoadmap();
    const total = roadmap.length;
    if (total === 0) {
      return {
        total: 0,
        completedCount: 0,
        inProgressCount: 0,
        notStartedCount: 0,
        percent: 0,
        byCategory: {}
      };
    }

    const completedCount = roadmap.filter(r => r.status === 'completed').length;
    const inProgressCount = roadmap.filter(r => r.status === 'in_progress').length;
    const notStartedCount = roadmap.filter(r => r.status === 'not_started').length;
    const percent = Math.round((completedCount / total) * 100);

    // Category breakdown
    const byCategory = {};
    roadmap.forEach(r => {
      const cat = r.category || 'Lainnya';
      if (!byCategory[cat]) {
        byCategory[cat] = { total: 0, completed: 0, inProgress: 0 };
      }
      byCategory[cat].total += 1;
      if (r.status === 'completed') byCategory[cat].completed += 1;
      if (r.status === 'in_progress') byCategory[cat].inProgress += 1;
    });

    return {
      total,
      completedCount,
      inProgressCount,
      notStartedCount,
      percent,
      byCategory
    };
  }
};
