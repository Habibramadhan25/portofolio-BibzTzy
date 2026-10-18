import { storageService } from './storageService';
import { activityFeedService } from './activityFeedService';

export const INITIAL_PROJECTS = [
  {
    id: 'proj-1',
    title: 'Website Portfolio BibTzy',
    shortDesc: 'Portofolio interaktif bergaya anime ice blue glassmorphism dengan React dan Vite.',
    fullDesc: 'BibTzy adalah website portofolio modern yang dirancang untuk menampilkan karya, keahlian, dan riwayat belajar siswa SMK. Mengimplementasikan glassmorphism berbasis CSS murni, penyimpanan data lokal melalui LocalStorage dan IndexedDB, live clock, pembuat CV PDF, serta sistem tema lengkap.',
    thumbnail: '/images/avatar.jpg',
    category: 'Website',
    techStack: ['React', 'Vite', 'CSS Glassmorphism', 'LocalStorage', 'jsPDF'],
    date: '2025',
    status: 'Selesai',
    demoUrl: 'https://bibtzy.demo.local',
    githubUrl: 'https://github.com/Habibramadhan25/bibtzy',
    isFavorite: true,
    isSample: false
  },
  {
    id: 'proj-2',
    title: 'TaskMate — Smart ToDo List',
    shortDesc: 'Aplikasi manajemen tugas harian siswa dengan kategori dan prioritas tugas.',
    fullDesc: 'Aplikasi pencatatan tugas sekolah dan proyek pribadi dengan filter status, pengingat tenggat waktu, dan penyimpanan lokal otomatis agar produktivitas belajar tetap terjaga.',
    thumbnail: '/images/avatar.jpg',
    category: 'Aplikasi',
    techStack: ['React', 'JavaScript', 'Tailwind CSS', 'LocalStorage'],
    date: '2025',
    status: 'Dalam Proses',
    demoUrl: 'https://taskmate.demo.local',
    githubUrl: 'https://github.com/Habibramadhan25/taskmate',
    isFavorite: true,
    isSample: false
  },
  {
    id: 'proj-3',
    title: 'Game Petualangan 2D Es Kristal',
    shortDesc: 'Game platformer 2D bertema kristal es menggunakan Unity dan bahasa C#.',
    fullDesc: 'Proyek pembelajaran pengembangan game 2D di SMK jurusan PPLG. Pemain mengontrol karakter untuk mengumpulkan fragmen kristal es melintasi platform rintangan dengan mekanik lompat ganda.',
    thumbnail: '/images/avatar.jpg',
    category: 'Game Dev',
    techStack: ['Unity', 'C#', 'Pixel Art', 'Game Design'],
    date: '2024',
    status: 'Selesai',
    demoUrl: 'https://itch.io',
    githubUrl: 'https://github.com/Habibramadhan25/crystal-runner',
    isFavorite: false,
    isSample: false
  },
  {
    id: 'proj-4',
    title: 'UI/UX Redesign Portal Siswa',
    shortDesc: 'Desain antarmuka modern untuk memudahkan siswa melihat jadwal dan nilai.',
    fullDesc: 'Eksplorasi perancangan desain antarmuka (UI/UX) untuk portal akademik sekolah menggunakan Figma. Mengutamakan kemudahan navigasi di smartphone dan keterbacaan jadwal pelajaran.',
    thumbnail: '/images/avatar.jpg',
    category: 'UI/UX',
    techStack: ['Figma', 'Wireframing', 'Prototyping', 'Design System'],
    date: '2024',
    status: 'Selesai',
    demoUrl: 'https://figma.com',
    githubUrl: '',
    isFavorite: true,
    isSample: false
  },
  {
    id: 'proj-5',
    title: 'Sistem Basis Data Perpustakaan',
    shortDesc: 'Aplikasi manajemen peminjaman buku sederhana dengan relasi database MySQL.',
    fullDesc: 'Proyek tugas basis data di kelas X PPLG untuk mempraktikkan query SQL, relasi tabel anggota, peminjaman buku, dan pembuatan laporan peminjaman dengan antarmuka PHP murni.',
    thumbnail: '/images/avatar.jpg',
    category: 'Backend',
    techStack: ['PHP', 'MySQL', 'CSS3', 'Apache'],
    date: '2024',
    status: 'Selesai',
    demoUrl: '',
    githubUrl: 'https://github.com/Habibramadhan25/perpustakaan-pplg',
    isFavorite: false,
    isSample: false
  },
  {
    id: 'proj-6',
    title: 'Kalkulator Sains & Konverter Satuan',
    shortDesc: 'Eksperimen manipulasi DOM JavaScript murni dengan tampilan transparan futuristik.',
    fullDesc: 'Proyek eksplorasi JavaScript Vanilla untuk menghitung rumus matematika, konversi satuan memori komputer (Byte, KB, MB, GB), dan kalkulator bilangan biner/desimal.',
    thumbnail: '/images/avatar.jpg',
    category: 'JavaScript',
    techStack: ['HTML5', 'CSS3', 'JavaScript Vanilla'],
    date: '2024',
    status: 'Selesai',
    demoUrl: 'https://calc.demo.local',
    githubUrl: 'https://github.com/Habibramadhan25/js-calculator',
    isFavorite: false,
    isSample: false
  }
];

const STORAGE_KEY = 'projects';

export const projectService = {
  getProjects() {
    let data = storageService.get(STORAGE_KEY, null);
    if (!data || !Array.isArray(data) || data.length === 0) {
      this.saveProjects(INITIAL_PROJECTS);
      return INITIAL_PROJECTS;
    }
    // Auto-clean any residual "NOVA GLASS" and remove isSample flag from existing stored projects
    let changed = false;
    data = data.map(item => {
      let updatedItem = { ...item };
      if (updatedItem.isSample) {
        updatedItem.isSample = false;
        changed = true;
      }
      const hasOldBrand = (item.title && /nova\s*glass/i.test(item.title)) ||
                          (item.shortDesc && /nova\s*glass/i.test(item.shortDesc)) ||
                          (item.fullDesc && /nova\s*glass/i.test(item.fullDesc));
      if (hasOldBrand) {
        changed = true;
        updatedItem.title = item.title ? item.title.replace(/nova\s*glass/gi, 'BibTzy') : item.title;
        updatedItem.shortDesc = item.shortDesc ? item.shortDesc.replace(/nova\s*glass/gi, 'BibTzy') : item.shortDesc;
        updatedItem.fullDesc = item.fullDesc ? item.fullDesc.replace(/nova\s*glass/gi, 'BibTzy') : item.fullDesc;
      }
      return updatedItem;
    });
    if (changed) {
      storageService.set(STORAGE_KEY, data);
    }
    return data;
  },

  getProjectById(id) {
    const list = this.getProjects();
    return list.find(item => item.id === id) || null;
  },

  saveProjects(projects) {
    storageService.set(STORAGE_KEY, projects);
    return projects;
  },

  addProject(projectData) {
    const list = this.getProjects();
    const newProject = {
      ...projectData,
      id: `proj-${Date.now()}`,
      isFavorite: Boolean(projectData.isFavorite),
      isSample: false,
      createdAt: new Date().toISOString()
    };
    const updated = [newProject, ...list];
    this.saveProjects(updated);
    try {
      activityFeedService.logActivity({
        type: 'project',
        title: `Proyek Baru: ${newProject.title}`,
        description: newProject.shortDesc || `Menambahkan proyek ${newProject.category} baru ke dalam portofolio digital.`,
        entityId: newProject.id,
        metadata: { category: newProject.category }
      });
    } catch (_) {}
    return newProject;
  },

  updateProject(id, updatedFields) {
    const list = this.getProjects();
    const updated = list.map(item => {
      if (item.id === id) {
        return { ...item, ...updatedFields, updatedAt: new Date().toISOString() };
      }
      return item;
    });
    this.saveProjects(updated);
    const updatedProj = updated.find(item => item.id === id);
    if (updatedProj) {
      try {
        activityFeedService.logActivity({
          type: 'project',
          title: `Proyek Diperbarui: ${updatedProj.title}`,
          description: `Informasi proyek ${updatedProj.title} (${updatedProj.category}) berhasil disunting secara real-time.`,
          entityId: id,
          metadata: { category: updatedProj.category }
        });
      } catch (_) {}
    }
    return updatedProj;
  },

  deleteProject(id) {
    const list = this.getProjects();
    const target = list.find(item => item.id === id);
    const updated = list.filter(item => item.id !== id);
    this.saveProjects(updated);
    if (target) {
      try {
        activityFeedService.logActivity({
          type: 'project',
          title: `Proyek Dihapus: ${target.title}`,
          description: `Proyek ${target.title} telah dihapus dari portofolio.`,
          entityId: id
        });
      } catch (_) {}
    }
    return true;
  },

  toggleFavorite(id) {
    const list = this.getProjects();
    const updated = list.map(item => {
      if (item.id === id) {
        return { ...item, isFavorite: !item.isFavorite };
      }
      return item;
    });
    this.saveProjects(updated);
    return updated.find(item => item.id === id);
  },

  resetProjects() {
    this.saveProjects(INITIAL_PROJECTS);
    return INITIAL_PROJECTS;
  }
};
