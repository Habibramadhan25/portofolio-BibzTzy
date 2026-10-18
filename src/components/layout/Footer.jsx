import React from 'react';
import { Sparkles } from 'lucide-react';

export default function Footer({ profile }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-quote">
        <Sparkles size={13} className="text-ice" style={{ display: 'inline', marginRight: '6px', verticalAlign: '-1px' }} />
        "Tidak ada kata terlambat untuk menjadi versi terbaik dari diri sendiri."
      </div>

      <div className="footer-bottom">
        <div>
          © {currentYear} <strong>BibTzy</strong>. Dibuat dengan dedikasi oleh{' '}
          <span style={{ color: 'var(--ice-blue)', fontWeight: 600 }}>{profile?.name || 'Habib Ramadhan'}</span>
          {' '}({profile?.class || 'XI PPLG 3'}).
        </div>
      </div>
    </footer>
  );
}
