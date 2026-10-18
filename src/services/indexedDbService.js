const DB_NAME = 'NovaGlassDB';
const DB_VERSION = 1;
const STORE_NAME = 'media_files';

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB tidak didukung pada browser ini.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const indexedDbService = {
  async saveFile(id, dataUrlOrBlob, metadata = {}) {
    try {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const item = {
          id,
          data: dataUrlOrBlob,
          metadata,
          updatedAt: new Date().toISOString()
        };
        const request = store.put(item);
        request.onsuccess = () => resolve(true);
        request.onerror = (e) => {
          const err = request.error || e;
          const isQuota = err?.name === 'QuotaExceededError' || err?.code === 22 || err?.message?.toLowerCase().includes('quota');
          const errMsg = isQuota
            ? 'Kapasitas penyimpanan perangkat penuh. Harap kosongkan ruang disk atau gunakan video yang lebih kecil.'
            : (err?.message || 'Gagal menyimpan berkas ke IndexedDB.');
          reject(new Error(errMsg));
        };
        tx.onabort = () => {
          const err = tx.error;
          const isQuota = err?.name === 'QuotaExceededError' || err?.message?.toLowerCase().includes('quota');
          reject(new Error(isQuota ? 'Penyimpanan lokal penuh untuk menyimpan berkas ini.' : 'Transaksi penyimpanan dibatalkan.'));
        };
      });
    } catch (err) {
      console.warn('[indexedDbService] Error saving file:', err);
      throw err;
    }
  },

  async getFile(id) {
    try {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result ? request.result.data : null);
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.warn('[indexedDbService] Error reading file:', err);
      return null;
    }
  },

  async getFileItem(id) {
    try {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.warn('[indexedDbService] Error reading file item:', err);
      return null;
    }
  },

  async getStorageEstimate() {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      try {
        const { quota, usage } = await navigator.storage.estimate();
        const quotaMb = (quota / (1024 * 1024)).toFixed(1);
        const usageMb = (usage / (1024 * 1024)).toFixed(2);
        const freeMb = Math.max(0, (quota - usage) / (1024 * 1024)).toFixed(1);
        const percent = Math.min(100, Math.round((usage / quota) * 100));
        return {
          quotaMb,
          usageMb,
          freeMb,
          percent
        };
      } catch {
        return null;
      }
    }
    return null;
  },

  async deleteFile(id) {
    try {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.delete(id);
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.warn('[indexedDbService] Error deleting file:', err);
      return false;
    }
  },

  async clearAll() {
    try {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.clear();
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.warn('[indexedDbService] Error clearing DB:', err);
      return false;
    }
  }
};
