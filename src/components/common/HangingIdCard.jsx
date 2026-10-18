import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, Eye, ShieldCheck, Zap } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import '../../styles/hanging-card.css';

export default function HangingIdCard({ profile, className = '', style = {} }) {
  const { isReducedMotion, playSound } = useTheme();
  const cardRef = useRef(null);
  const rafId = useRef(null);

  const [isHovered, setIsHovered] = useState(false);
  const [isColorMode, setIsColorMode] = useState(false); // Default B&W as requested
  const [tilt, setTilt] = useState({
    rx: 0,
    ry: 0,
    rz: 0,
    glareX: 50,
    glareY: 50,
    glareOpacity: 0,
    shadowX: 0,
    shadowY: 20
  });

  // Target values for smooth rAF interpolation
  const targetTilt = useRef({
    rx: 0,
    ry: 0,
    rz: 0,
    glareX: 50,
    glareY: 50,
    glareOpacity: 0,
    shadowX: 0,
    shadowY: 20
  });

  // Barcode pattern for authentic high-tech badge look
  const barcodeBars = [2, 4, 1, 3, 2, 5, 1, 2, 4, 2, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 1, 3, 2];

  // Animation frame loop - runs ONLY when actively hovering or resetting
  const updateTransform = useCallback(() => {
    if (isReducedMotion) return;

    setTilt(prev => {
      const lerp = 0.18;
      const t = targetTilt.current;
      const nRx = prev.rx + (t.rx - prev.rx) * lerp;
      const nRy = prev.ry + (t.ry - prev.ry) * lerp;
      const nRz = prev.rz + (t.rz - prev.rz) * lerp;
      const nGlareX = prev.glareX + (t.glareX - prev.glareX) * lerp;
      const nGlareY = prev.glareY + (t.glareY - prev.glareY) * lerp;
      const nGlareOp = prev.glareOpacity + (t.glareOpacity - prev.glareOpacity) * lerp;
      const nShadowX = prev.shadowX + (t.shadowX - prev.shadowX) * lerp;
      const nShadowY = prev.shadowY + (t.shadowY - prev.shadowY) * lerp;

      // Check if values have settled (hentikan loop jika sudah mencapai target posisi)
      const diff = Math.abs(nRx - t.rx) + Math.abs(nRy - t.ry);
      if (diff > 0.05) {
        rafId.current = requestAnimationFrame(updateTransform);
      } else {
        rafId.current = null;
      }

      return {
        rx: nRx,
        ry: nRy,
        rz: nRz,
        glareX: nGlareX,
        glareY: nGlareY,
        glareOpacity: nGlareOp,
        shadowX: nShadowX,
        shadowY: nShadowY
      };
    });
  }, [isHovered, isReducedMotion]);

  const scheduleUpdate = useCallback(() => {
    if (!rafId.current && !isReducedMotion) {
      rafId.current = requestAnimationFrame(updateTransform);
    }
  }, [updateTransform, isReducedMotion]);

  // Pointer Move Handler (mouse or touch)
  const handlePointerMove = (e) => {
    if (isReducedMotion || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX);
    const clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY);

    if (clientX === undefined || clientY === undefined) return;

    // Center offset normalized from -1 to 1
    const x = Math.max(-1, Math.min(1, (clientX - (rect.left + rect.width / 2)) / (rect.width / 2)));
    const y = Math.max(-1, Math.min(1, (clientY - (rect.top + rect.height / 2)) / (rect.height / 2)));

    // Physics calculations
    const rx = -y * 12; // tilt X axis (inverted)
    const ry = x * 15;  // tilt Y axis
    const rz = x * 2.2; // subtle lanyard twist

    // Glare position (percentage)
    const glareX = (x + 1) * 50;
    const glareY = (y + 1) * 50;
    const glareOpacity = Math.min(0.65, Math.sqrt(x * x + y * y) * 0.55 + 0.15);

    // Opposite shadow offset
    const shadowX = -x * 20;
    const shadowY = 22 - y * 14;

    targetTilt.current = {
      rx,
      ry,
      rz,
      glareX,
      glareY,
      glareOpacity,
      shadowX,
      shadowY
    };

    if (!isHovered) {
      setIsHovered(true);
      playSound?.('hover');
    }

    scheduleUpdate();
  };

  // Pointer Leave Handler - Smooth reset to rest
  const handlePointerLeave = () => {
    setIsHovered(false);
    targetTilt.current = {
      rx: 0,
      ry: 0,
      rz: 0,
      glareX: 50,
      glareY: 50,
      glareOpacity: 0,
      shadowX: 0,
      shadowY: 20
    };
    scheduleUpdate();
  };

  // Clean up RAF on unmount
  useEffect(() => {
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  const avatarSrc = profile?.avatar || '/images/avatar.jpg';
  const name = profile?.name || 'Habib Ramadhan';
  const role = `${profile?.status || 'Siswa SMK'} • ${profile?.class || 'XI PPLG 3'}`;
  const school = profile?.school || 'SMK NEGERI 1 CIOMAS';

  // Dynamic transforms applied inline for maximum fluidity
  const cardTransform = isReducedMotion
    ? 'none'
    : `perspective(1000px) rotateX(${tilt.rx.toFixed(2)}deg) rotateY(${tilt.ry.toFixed(2)}deg) rotateZ(${tilt.rz.toFixed(2)}deg)`;

  const strapTransform = isReducedMotion
    ? 'none'
    : `rotateZ(${(tilt.rz * 0.8).toFixed(2)}deg) skewX(${(-tilt.ry * 0.25).toFixed(2)}deg)`;

  const dynamicShadow = isReducedMotion
    ? '0 16px 40px rgba(0, 0, 0, 0.75)'
    : `${tilt.shadowX.toFixed(1)}px ${tilt.shadowY.toFixed(1)}px 42px rgba(0, 0, 0, 0.7), 0 0 35px rgba(255, 255, 255, 0.05)`;

  const glareStyle = isReducedMotion
    ? { display: 'none' }
    : {
        background: `radial-gradient(circle at ${tilt.glareX.toFixed(1)}% ${tilt.glareY.toFixed(1)}%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.08) 45%, transparent 75%)`,
        opacity: tilt.glareOpacity
      };

  return (
    <div
      className={`hanging-card-container ${className}`}
      style={style}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {/* 1. Ceiling Anchor Point */}
      <div className="hanging-card-ceiling-anchor" title="Hanging Mount" />

      {/* 2. Lanyard Strap (Tali Hitam Vertikal dengan Teks DC CARD) */}
      <div
        className="hanging-card-strap"
        style={{ transform: strapTransform }}
        title="Lanyard Strap"
      >
        <span className="hanging-card-strap-text">
          DC CARD • DC CARD
        </span>
      </div>

      {/* 3. Metal Clasp & Ring */}
      <div className="hanging-card-clip-group">
        <div className="hanging-card-clasp" />
        <div className="hanging-card-ring" />
      </div>

      {/* 4. The 3D Hanging Card Badge */}
      <div
        ref={cardRef}
        className={`hanging-card-pivot ${!isHovered && !isReducedMotion ? 'hanging-card-sway' : ''}`}
        style={{ transform: cardTransform }}
      >
        <div
          className="hanging-card-badge"
          style={{ boxShadow: dynamicShadow }}
        >
          {/* Dark Background with Subtle Cyber Grid */}
          <div className="hanging-card-grid-bg" />

          {/* Dynamic Glare Overlay */}
          <div className="hanging-card-glare" style={glareStyle} />

          {/* Card Top Punch Slot */}
          <div className="hanging-card-slot" />

          {/* Card Header: Chip, Badge Type, Status */}
          <div className="hanging-card-header">
            <div className="hanging-card-logo-badge">
              <div className="hanging-card-chip" title="Smart IC Chip" />
              <span className="hanging-card-type-tag">DC CARD // 2.0</span>
            </div>

            <div className="hanging-card-status-pill">
              <span className="hanging-card-status-dot" />
              <span>ACTIVE</span>
            </div>
          </div>

          {/* Portrait Photo Frame with White Border */}
          <div className="hanging-card-photo-frame">
            <img
              src={avatarSrc}
              alt={name}
              className="hanging-card-photo-img"
              style={{
                filter: isColorMode
                  ? 'none'
                  : 'grayscale(100%) contrast(1.18) brightness(1.05)'
              }}
            />

            {/* Corner Reticle Viewfinders */}
            <div className="hanging-card-reticle tl" />
            <div className="hanging-card-reticle tr" />
            <div className="hanging-card-reticle bl" />
            <div className="hanging-card-reticle br" />
          </div>

          {/* Identity Details */}
          <div className="hanging-card-details">
            <h3 className="hanging-card-name">{name}</h3>
            <div className="hanging-card-role">{role}</div>
            <div className="hanging-card-school">{school}</div>
          </div>

          {/* Footer: Barcode & Cyber Hologram */}
          <div className="hanging-card-footer">
            <div className="hanging-card-barcode-wrap">
              <div className="hanging-card-barcode-lines">
                {barcodeBars.map((w, idx) => (
                  <span
                    key={idx}
                    className="hanging-card-bar"
                    style={{ width: `${w}px`, opacity: idx % 2 === 0 ? 0.9 : 0.7 }}
                  />
                ))}
              </div>
              <span className="hanging-card-barcode-num">BIBTZY-08404-PPLG3</span>
            </div>

            {/* Holographic Security Seal */}
            <div className="hanging-card-holo-seal" title="Authentic Cyber Seal">
              DC
            </div>
          </div>
        </div>

        {/* Interactive Controls & Hints below Card */}
        <div className="hanging-card-hint">
          <span className="hanging-card-hint-badge">
            <Sparkles size={13} />
            <span>Interactive 3D Tilt</span>
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              playSound?.('click');
              setIsColorMode(prev => !prev);
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted, #94A3B8)',
              fontSize: '0.72rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '2px 4px',
              borderRadius: '4px',
              transition: 'color 0.2s ease'
            }}
            title="Beralih antara foto hitam-putih dan warna asli"
          >
            <Eye size={12} />
            <span>{isColorMode ? 'Mode B&W' : 'Warna Asli'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
