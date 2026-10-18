import { storageService } from './storageService';
import { indexedDbService } from './indexedDbService';
import { activityFeedService } from './activityFeedService';

export const INITIAL_CERTIFICATES = [
  {
    id: 'cert-1',
    title: 'Belajar Dasar Pemrograman Web',
    issuer: 'Dicoding Indonesia',
    issueDate: 'Februari 2024',
    category: 'Web Development',
    description: 'Menyelesaikan modul dasar HTML, CSS, dan pengantar JavaScript serta membuat website interaktif responsif.',
    imageUrl: '/images/avatar.jpg',
    verificationUrl: 'https://www.dicoding.com/certificates/sample-web-dasar',
    isSample: true
  },
  {
    id: 'cert-2',
    title: 'UI/UX Design Fundamental',
    issuer: 'Skilvul',
    issueDate: 'Mei 2024',
    category: 'UI/UX Design',
    description: 'Mempelajari prinsip dasar design thinking, wireframing, prototyping di Figma, serta usability testing.',
    imageUrl: '/images/avatar.jpg',
    verificationUrl: 'https://skilvul.com/certificates/sample-uiux',
    isSample: true
  },
  {
    id: 'cert-3',
    title: 'JavaScript Programming Basic',
    issuer: 'Progate',
    issueDate: 'November 2023',
    category: 'Web Development',
    description: 'Memahami variabel, fungsi bersyarat, perulangan, array, object, dan algoritma dasar pada JavaScript.',
    imageUrl: '/images/avatar.jpg',
    verificationUrl: 'https://progate.com/certificates/sample-js',
    isSample: true
  },
  {
    id: 'cert-4',
    title: 'Sertifikasi Desain Grafis & Vektor',
    issuer: 'Bina Talenta Pelajar',
    issueDate: 'Oktober 2023',
    category: 'Desain',
    description: 'Pelatihan dasar desain visual, komposisi warna, tipografi, dan pembuatan aset digital grafis.',
    imageUrl: '/images/avatar.jpg',
    verificationUrl: '',
    isSample: true
  }
];

const STORAGE_KEY = 'certificates';

export const certificateService = {
  getCertificates() {
    const data = storageService.get(STORAGE_KEY, null);
    if (!data) {
      this.saveCertificates(INITIAL_CERTIFICATES);
      return INITIAL_CERTIFICATES;
    }
    return data;
  },

  saveCertificates(certificates) {
    storageService.set(STORAGE_KEY, certificates);
    return certificates;
  },

  async addCertificate(certData, fileBlob = null) {
    const list = this.getCertificates();
    const id = `cert-${Date.now()}`;
    let hasIndexedDbMedia = false;

    if (fileBlob) {
      await indexedDbService.saveFile(id, fileBlob, { title: certData.title });
      hasIndexedDbMedia = true;
    }

    const newCert = {
      ...certData,
      id,
      hasIndexedDbMedia,
      isSample: false,
      createdAt: new Date().toISOString()
    };

    const updated = [newCert, ...list];
    this.saveCertificates(updated);
    try {
      activityFeedService.logActivity({
        type: 'certificate',
        title: `Sertifikat Ditambahkan: ${newCert.title}`,
        description: `Sertifikasi resmi dari ${newCert.issuer} (${newCert.category}) berhasil ditambahkan.`,
        entityId: id,
        metadata: { issuer: newCert.issuer }
      });
    } catch (_) {}
    return newCert;
  },

  async updateCertificate(id, updatedFields, fileBlob = null) {
    const list = this.getCertificates();
    let hasIndexedDbMedia = false;

    if (fileBlob) {
      await indexedDbService.saveFile(id, fileBlob, { title: updatedFields.title });
      hasIndexedDbMedia = true;
    }

    const updated = list.map(item => {
      if (item.id === id) {
        return {
          ...item,
          ...updatedFields,
          hasIndexedDbMedia: fileBlob ? true : item.hasIndexedDbMedia,
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    });

    this.saveCertificates(updated);
    const updatedCert = updated.find(item => item.id === id);
    if (updatedCert) {
      try {
        activityFeedService.logActivity({
          type: 'certificate',
          title: `Sertifikat Diperbarui: ${updatedCert.title}`,
          description: `Informasi sertifikat ${updatedCert.title} berhasil diperbarui.`,
          entityId: id,
          metadata: { issuer: updatedCert.issuer }
        });
      } catch (_) {}
    }
    return updatedCert;
  },

  async deleteCertificate(id) {
    const list = this.getCertificates();
    const target = list.find(item => item.id === id);
    if (target && target.hasIndexedDbMedia) {
      await indexedDbService.deleteFile(id);
    }
    const updated = list.filter(item => item.id !== id);
    this.saveCertificates(updated);
    if (target) {
      try {
        activityFeedService.logActivity({
          type: 'certificate',
          title: `Sertifikat Dihapus: ${target.title}`,
          description: `Sertifikat ${target.title} telah dihapus.`,
          entityId: id
        });
      } catch (_) {}
    }
    return true;
  },

  async getCertificateMedia(cert) {
    if (!cert) return null;
    if (cert.hasIndexedDbMedia) {
      const fileData = await indexedDbService.getFile(cert.id);
      if (fileData) return fileData;
    }
    return cert.imageUrl || '/images/avatar.jpg';
  },

  resetCertificates() {
    this.saveCertificates(INITIAL_CERTIFICATES);
    return INITIAL_CERTIFICATES;
  }
};
