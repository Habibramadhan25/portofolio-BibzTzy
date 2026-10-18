import { storageService } from './storageService';

export const INITIAL_SKILLS = [
  {
    id: 'skill-1',
    name: 'HTML5',
    category: 'Frontend',
    proficiency: 90,
    levelLabel: 'Mahir',
    shortDesc: 'Struktur semantik dokumen web modern, aksesibilitas (a11y), dan form handling.',
    icon: 'Code2',
    isSample: true
  },
  {
    id: 'skill-2',
    name: 'CSS3 & Glassmorphism',
    category: 'Frontend',
    proficiency: 85,
    levelLabel: 'Mahir',
    shortDesc: 'Desain responsif, CSS variables, flexbox, grid, backdrop-filter, dan animasi modern.',
    icon: 'Palette',
    isSample: true
  },
  {
    id: 'skill-3',
    name: 'JavaScript (ES6+)',
    category: 'Programming Languages',
    proficiency: 80,
    levelLabel: 'Menengah',
    shortDesc: 'DOM manipulation, async/await, fetch API, local storage, dan event handling.',
    icon: 'FileCode2',
    isSample: true
  },
  {
    id: 'skill-4',
    name: 'React.js',
    category: 'Frontend',
    proficiency: 75,
    levelLabel: 'Menengah',
    shortDesc: 'Komponen berbasis fungsi, React hooks, state management, dan integrasi API.',
    icon: 'Atom',
    isSample: true
  },
  {
    id: 'skill-5',
    name: 'PHP',
    category: 'Backend',
    proficiency: 70,
    levelLabel: 'Menengah',
    shortDesc: 'Pemrograman backend dasar, penanganan session, autentikasi, dan pengolahan form.',
    icon: 'Server',
    isSample: true
  },
  {
    id: 'skill-6',
    name: 'Laravel',
    category: 'Backend',
    proficiency: 60,
    levelLabel: 'Dasar - Menengah',
    shortDesc: 'Arsitektur MVC, routing, Eloquent ORM, migrasi database, dan pembuatan REST API dasar.',
    icon: 'Layers',
    isSample: true
  },
  {
    id: 'skill-7',
    name: 'MySQL',
    category: 'Database',
    proficiency: 75,
    levelLabel: 'Menengah',
    shortDesc: 'Perancangan skema relasional, query DDL & DML, join tabel, dan indeks data.',
    icon: 'Database',
    isSample: true
  },
  {
    id: 'skill-8',
    name: 'Git & GitHub',
    category: 'Tools',
    proficiency: 80,
    levelLabel: 'Menengah',
    shortDesc: 'Version control, branching, pull request, resolusi konflik, dan kolaborasi repositori.',
    icon: 'GitBranch',
    isSample: true
  },
  {
    id: 'skill-9',
    name: 'Figma',
    category: 'UI/UX Design',
    proficiency: 75,
    levelLabel: 'Menengah',
    shortDesc: 'Wireframing, pembuatan komponen visual, auto-layout, dan interactive prototype.',
    icon: 'Layout',
    isSample: true
  },
  {
    id: 'skill-10',
    name: 'Tailwind CSS',
    category: 'Frontend',
    proficiency: 70,
    levelLabel: 'Menengah',
    shortDesc: 'Pembangunan antarmuka cepat dengan utility classes yang fleksibel.',
    icon: 'Sparkles',
    isSample: true
  },
  {
    id: 'skill-11',
    name: 'Unity & C#',
    category: 'Game Dev',
    proficiency: 50,
    levelLabel: 'Dasar',
    shortDesc: 'Mekanik dasar game 2D, komponen rigidbody, collider, dan scripting game C#.',
    icon: 'Gamepad2',
    isSample: true
  }
];

const STORAGE_KEY = 'skills';

export const skillService = {
  getSkills() {
    const data = storageService.get(STORAGE_KEY, null);
    if (!data) {
      this.saveSkills(INITIAL_SKILLS);
      return INITIAL_SKILLS;
    }
    return data;
  },

  saveSkills(skills) {
    storageService.set(STORAGE_KEY, skills);
    return skills;
  },

  addSkill(skillData) {
    const list = this.getSkills();
    const newSkill = {
      ...skillData,
      id: `skill-${Date.now()}`,
      proficiency: Number(skillData.proficiency) || 50,
      isSample: false,
      createdAt: new Date().toISOString()
    };
    const updated = [...list, newSkill];
    this.saveSkills(updated);
    return newSkill;
  },

  updateSkill(id, updatedFields) {
    const list = this.getSkills();
    const updated = list.map(item => {
      if (item.id === id) {
        return {
          ...item,
          ...updatedFields,
          proficiency: Number(updatedFields.proficiency !== undefined ? updatedFields.proficiency : item.proficiency)
        };
      }
      return item;
    });
    this.saveSkills(updated);
    return updated.find(item => item.id === id);
  },

  deleteSkill(id) {
    const list = this.getSkills();
    const updated = list.filter(item => item.id !== id);
    this.saveSkills(updated);
    return true;
  },

  resetSkills() {
    this.saveSkills(INITIAL_SKILLS);
    return INITIAL_SKILLS;
  }
};
