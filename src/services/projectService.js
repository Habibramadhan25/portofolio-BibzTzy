import { storageService } from './storageService';
import { activityFeedService } from './activityFeedService';

export const INITIAL_PROJECTS = [];

const DUMMY_PROJECT_IDS = new Set([
  'proj-1',
  'proj-2',
  'proj-3',
  'proj-4',
  'proj-5',
  'proj-6'
]);

const STORAGE_KEY = 'projects';

export const projectService = {
  getProjects() {
    let data = storageService.get(STORAGE_KEY, null);
    if (data === null || !Array.isArray(data)) {
      this.saveProjects(INITIAL_PROJECTS);
      return INITIAL_PROJECTS;
    }

    // Auto-clean any residual dummy sample projects (proj-1 to proj-6) so old cache on mobile/browsers is wiped
    const initialLen = data.length;
    data = data.filter(item => !DUMMY_PROJECT_IDS.has(item.id));
    if (data.length !== initialLen) {
      storageService.set(STORAGE_KEY, data);
    }

    return data;
  },

  clearAllProjects() {
    this.saveProjects([]);
    try {
      activityFeedService.logActivity({
        type: 'project',
        title: 'Katalog Proyek Dikosongkan',
        description: 'Semua proyek dalam katalog portofolio telah dihapus.',
        entityId: 'all'
      });
    } catch (_) {}
    return [];
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
