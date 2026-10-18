import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, Shield, Zap, Volume2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import confetti from 'canvas-confetti';
import '../../styles/ice-angel-mascot.css';

export default function IceAngelMascot({
  className = '',
  style = {},
  imageSrc = '/images/ice-angel-mascot.jpg',
  altText = 'BibTzy Mascot — Ice Angel Anime Girl'
}) {
  const { isReducedMotion, playSound } = useTheme();
  const cardRef = useRef(null);
  const rafId = useRef(null);

  const [isHovered, setIsHovered] = useState(false);
  const [novaKey, setNovaKey] = useState(0); // Triggers ice shockwave effect
  const [tilt, setTilt] = useState({
    rx: 0,
    ry: 0,
    glareX: 50,
    glareY: 50,
    glareOpacity: 0,
    shadowX: 0,
    shadowY: 20
  });

  const targetTilt = useRef({
    rx: 0,
    ry: 0,
    glareX: 50,
    glareY: 50,
    glareOpacity: 0,
    shadowX: 0,
    shadowY: 20
  });

  // Smooth rAF update loop
  const updateTransform = useCallback(() => {
    if (isReducedMotion) return;

    setTilt(prev => {
      const lerp = 0.16;
      const t = targetTilt.current;
      const nRx = prev.rx + (t.rx - prev.rx) * lerp;
      const nRy = prev.ry + (t.ry - prev.ry) * lerp;
      const nGlareX = prev.glareX + (t.glareX - prev.glareX) * lerp;
      const nGlareY = prev.glareY + (t.glareY - prev.glareY) * lerp;
      const nGlareOp = prev.glareOpacity + (t.glareOpacity - prev.glareOpacity) * lerp;
      const nShadowX = prev.shadowX + (t.shadowX - prev.shadowX) * lerp;
      const nShadowY = prev.shadowY + (t.shadowY - prev.shadowY) * lerp;

      const diff = Math.abs(nRx - t.rx) + Math.abs(nRy - t.ry);
      if (diff > 0.04) {
        rafId.current = requestAnimationFrame(updateTransform);
      } else {
        rafId.current = null;
      }

      return {
        rx: nRx,
        ry: nRy,
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

  // Pointer move handler
  const handlePointerMove = (e) => {
    if (isReducedMotion || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX);
    const clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY);

    if (clientX === undefined || clientY === undefined) return;

    const x = Math.max(-1, Math.min(1, (clientX - (rect.left + rect.width / 2)) / (rect.width / 2)));
    const y = Math.max(-1, Math.min(1, (clientY - (rect.top + rect.height / 2)) / (rect.height / 2)));

    // Subtle 3D tilt
    const rx = -y * 10;
    const ry = x * 12;

    const glareX = (x + 1) * 50;
    const glareY = (y + 1) * 50;
    const glareOpacity = Math.min(0.6, Math.sqrt(x * x + y * y) * 0.5 + 0.15);

    const shadowX = -x * 16;
    const shadowY = 22 - y * 12;

    targetTilt.current = {
      rx,
      ry,
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

  const handlePointerLeave = () => {
    setIsHovered(false);
    targetTilt.current = {
      rx: 0,
      ry: 0,
      glareX: 50,
      glareY: 50,
      glareOpacity: 0,
      shadowX: 0,
      shadowY: 20
    };
    scheduleUpdate();
  };

  // Trigger Ice Nova Shockwave on click
  const handleCardClick = (e) => {
    playSound?.('levelUp');
    setNovaKey(prev => prev + 1);

    // Ethereal frost sparks
    try {
      confetti({
        particleCount: 28,
        spread: 55,
        origin: {
          x: e.clientX / window.innerWidth,
          y: e.clientY / window.innerHeight
        },
        colors: ['#8DDCFF', '#45CFFF', '#FFFFFF', '#E0F2FE'],
        ticks: 80,
        gravity: 0.8,
        scalar: 0.8
      });
    } catch {
      // safe fallback
    }
  };

  useEffect(() => {
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  const stageTransform = isReducedMotion
    ? 'none'
    : `perspective(1000px) rotateX(${tilt.rx.toFixed(2)}deg) rotateY(${tilt.ry.toFixed(2)}deg)`;

  const dynamicShadow = isReducedMotion
    ? '0 20px 50px rgba(0, 0, 0, 0.85), 0 0 35px rgba(56, 189, 248, 0.22)'
    : `${tilt.shadowX.toFixed(1)}px ${tilt.shadowY.toFixed(1)}px 48px rgba(0, 0, 0, 0.85), 0 0 35px rgba(56, 189, 248, 0.25)`;

  const glareStyle = isReducedMotion
    ? { display: 'none' }
    : {
        background: `radial-gradient(circle at ${tilt.glareX.toFixed(1)}% ${tilt.glareY.toFixed(1)}%, rgba(255, 255, 255, 0.45) 0%, rgba(141, 220, 255, 0.12) 40%, transparent 75%)`,
        opacity: tilt.glareOpacity
      };

  return (
    <div
      className={`ice-angel-container ${className}`}
      style={style}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {/* 3D Interactive Stage */}
      <div
        ref={cardRef}
        className={`ice-angel-stage ${!isHovered && !isReducedMotion ? 'ice-angel-floating' : ''}`}
        style={{ transform: stageTransform }}
        onClick={handleCardClick}
      >
        <div
          className="ice-angel-card"
          style={{ boxShadow: dynamicShadow }}
        >
          {/* Cosmic Dark Background & Grid */}
          <div className="ice-angel-bg-glow" />
          <div className="ice-angel-grid-pattern" />

          {/* Ethereal Glowing Halo Ring in 3D Space */}
          <div className="ice-angel-halo-wrap">
            <div className="ice-angel-halo-ring" />
          </div>

          {/* Floating Ice Crystal Shards */}
          <div className="ice-crystal-shard ice-crystal-1" />
          <div className="ice-crystal-shard ice-crystal-2" />
          <div className="ice-crystal-shard ice-crystal-3" />
          <div className="ice-crystal-shard ice-crystal-4" />

          {/* Dynamic Glare Specular Highlight */}
          <div className="ice-angel-glare" style={glareStyle} />

          {/* Character Photo Frame */}
          <div className="ice-angel-image-wrap">
            <img
              src={imageSrc}
              alt={altText}
              className="ice-angel-photo"
              onError={(e) => {
                // Safe fallback to default avatar if specific file fails
                e.currentTarget.src = '/images/avatar.jpg';
              }}
            />
            {/* Gradient Dark Overlay at bottom */}
            <div className="ice-angel-fade-gradient" />
          </div>

          {/* Information & Badge Overlay */}
          <div className="ice-angel-info-overlay">
            <div className="ice-angel-badge-row">
              <span className="ice-angel-badge">
                <Sparkles size={12} />
                <span>ICE ANGEL MASCOT</span>
              </span>

              <div className="ice-angel-status-pill">
                <span className="ice-angel-status-dot" />
                <span>ONLINE</span>
              </div>
            </div>

            <h3 className="ice-angel-title">BibTzy Ice Angel</h3>
            <p className="ice-angel-desc">
              <span>Futuristic Anime Mascot • Cold Cyber Elegance</span>
            </p>
          </div>

          {/* Ice Nova Wave (Triggered on click) */}
          {novaKey > 0 && <div key={novaKey} className="ice-nova-ring" />}
        </div>
      </div>

      {/* Interactive Hint Bar Below */}
      <div className="ice-angel-hint-bar">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <Sparkles size={12} className="text-ice" />
          <span>Interactive 3D Parallax Mascot</span>
        </span>

        <button
          type="button"
          className="ice-angel-hint-btn"
          onClick={handleCardClick}
          title="Picu resonansi kristal es"
        >
          <Zap size={12} />
          <span>Ice Resonance</span>
        </button>
      </div>
    </div>
  );
}
