import { storageService } from './storageService';
import { indexedDbService } from './indexedDbService';
import { activityFeedService } from './activityFeedService';

export const INITIAL_CERTIFICATES = [
  {
    id: 'cert-1',
    title: 'Belajar Back-End Pemula dengan JavaScript',
    issuer: 'Dicoding Indonesia',
    issueDate: '24 Februari 2026',
    category: 'Web Development',
    description: 'Menyelesaikan modul Belajar Back-End Pemula dengan JavaScript.',
    imageUrl: '/images/cert-backend.jpg',
    verificationUrl: 'https://www.dicoding.com/certificates/98XW0O4D9XM3',
    credentialId: '98XW0O4D9XM3',
    isSample: false
  }
];

const STORAGE_KEY = 'certificates';

export const certificateService = {
  getCertificates() {
    const data = storageService.get(STORAGE_KEY, null);
    if (data === null || !Array.isArray(data)) {
      this.saveCertificates(INITIAL_CERTIFICATES);
      return INITIAL_CERTIFICATES;
    }

    // Auto-clean old template dummy certificates if still lingering
    const hasOldDummyTitles = data.some(c => c.title === 'Belajar Dasar Pemrograman Web' || c.title === 'UI/UX Design Fundamental');
    let list = hasOldDummyTitles
      ? data.filter(c => c.title !== 'Belajar Dasar Pemrograman Web' && c.title !== 'UI/UX Design Fundamental')
      : data;

    // Auto-fix typo in credential ID / verification URL (98XW004D9XM3 -> 98XW0O4D9XM3) in cached certificates
    let changed = hasOldDummyTitles;
    list = list.map(cert => {
      if (
        (cert.verificationUrl && cert.verificationUrl.includes('98XW004D9XM3')) ||
        (cert.credentialId && cert.credentialId === '98XW004D9XM3')
      ) {
        changed = true;
        return {
          ...cert,
          verificationUrl: cert.verificationUrl
            ? cert.verificationUrl.replace('98XW004D9XM3', '98XW0O4D9XM3')
            : 'https://www.dicoding.com/certificates/98XW0O4D9XM3',
          credentialId: '98XW0O4D9XM3'
        };
      }
      return cert;
    });

    if (changed) {
      this.saveCertificates(list);
    }

    return list;
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
    if (cert.imageUrl && cert.imageUrl !== '/images/avatar.jpg') {
      return cert.imageUrl;
    }
    if (cert.title && cert.title.toLowerCase().includes('backend')) {
      return '/images/cert-backend.jpg';
    }
    return cert.imageUrl || '/images/cert-backend.jpg';
  },

  resetCertificates() {
    this.saveCertificates(INITIAL_CERTIFICATES);
    return INITIAL_CERTIFICATES;
  }
};
