import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop
 * Memastikan setiap perpindahan rute/halaman (termasuk halaman Settings)
 * selalu menampilkan bagian paling atas halaman (scrollTop: 0),
 * tidak tertahan di posisi bawah halaman sebelumnya.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Reset window dan document scroll secara instan ke paling atas
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Reset scroll pada wrapper konten jika ada container yang memiliki scroll independen
    try {
      const scrollContainers = document.querySelectorAll('.main-wrapper, .page-container, .app-container');
      scrollContainers.forEach((el) => {
        if (el) el.scrollTop = 0;
      });
    } catch (_) {}
  }, [pathname]);

  return null;
}
