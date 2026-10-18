const PREFIX = 'nova-glass-';

// Real-time Cross-Tab / Cross-Window Synchronization Channel
let syncChannel = null;
try {
  if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
    syncChannel = new BroadcastChannel('bibtzy-realtime-channel');
    syncChannel.onmessage = (event) => {
      const data = event.data;
      if (!data) return;
      if (data.type === 'storage-updated') {
        window.dispatchEvent(new CustomEvent('nova-glass-storage-updated', {
          detail: { key: data.key, value: data.value, isRemoteSync: true }
        }));
      } else if (data.type === 'storage-reset') {
        window.dispatchEvent(new CustomEvent('nova-glass-storage-reset', {
          detail: { isRemoteSync: true }
        }));
      }
    };
  }
} catch (e) {
  console.warn('[storageService] BroadcastChannel not supported, falling back to storage event', e);
}

// Fallback listener untuk window 'storage' event (lintas window dan multi-tab)
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (!event.key || !event.key.startsWith(PREFIX)) return;
    const strippedKey = event.key.replace(PREFIX, '');
    let parsedValue = null;
    try {
      parsedValue = event.newValue ? JSON.parse(event.newValue) : null;
    } catch (_) {}

    window.dispatchEvent(new CustomEvent('nova-glass-storage-updated', {
      detail: { key: strippedKey, value: parsedValue, isRemoteSync: true }
    }));
  });
}

export const storageService = {
  get(key, defaultValue = null) {
    try {
      const raw = localStorage.getItem(`${PREFIX}${key}`);
      if (raw === null || raw === undefined) return defaultValue;
      return JSON.parse(raw);
    } catch (error) {
      console.warn(`[storageService] Error parsing key "${key}":`, error);
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
      window.dispatchEvent(new CustomEvent('nova-glass-storage-updated', {
        detail: { key, value }
      }));
      // Siarkan ke seluruh tab dan window browser secara real-time
      if (syncChannel) {
        try {
          syncChannel.postMessage({ type: 'storage-updated', key, value });
        } catch (_) {}
      }
      return true;
    } catch (error) {
      console.error(`[storageService] Error writing key "${key}":`, error);
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(`${PREFIX}${key}`);
      window.dispatchEvent(new CustomEvent('nova-glass-storage-updated', {
        detail: { key, value: null }
      }));
      // Siarkan penghapusan ke seluruh tab secara real-time
      if (syncChannel) {
        try {
          syncChannel.postMessage({ type: 'storage-updated', key, value: null });
        } catch (_) {}
      }
      return true;
    } catch (error) {
      console.error(`[storageService] Error removing key "${key}":`, error);
      return false;
    }
  },

  clearAll() {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(PREFIX)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
      window.dispatchEvent(new CustomEvent('nova-glass-storage-reset'));
      // Siarkan reset ke seluruh tab secara real-time
      if (syncChannel) {
        try {
          syncChannel.postMessage({ type: 'storage-reset' });
        } catch (_) {}
      }
      return true;
    } catch (error) {
      console.error('[storageService] Error clearing storage:', error);
      return false;
    }
  },

  getUsageEstimate() {
    try {
      let totalBytes = 0;
      let novaBytes = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k) {
          const val = localStorage.getItem(k) || '';
          const bytes = (k.length + val.length) * 2;
          totalBytes += bytes;
          if (k.startsWith(PREFIX)) {
            novaBytes += bytes;
          }
        }
      }
      return {
        novaGlassKb: (novaBytes / 1024).toFixed(2),
        totalKb: (totalBytes / 1024).toFixed(2),
        estimatedMaxKb: 5120 // ~5MB typical browser limit
      };
    } catch (e) {
      return { novaGlassKb: '0', totalKb: '0', estimatedMaxKb: 5120 };
    }
  }
};
