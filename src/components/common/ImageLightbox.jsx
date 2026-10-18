import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, AlertCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ImageLightbox({
  isOpen,
  images = [],
  initialIndex = 0,
  onClose
}) {
  const { playSound, isReducedMotion } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [hasError, setHasError] = useState(false);
  const overlayRef = useRef(null);

  // Normalize images to array of objects
  const normalizedImages = (images || []).map(img => {
    if (typeof img === 'string') {
      return { url: img, title: '', caption: '' };
    }
    return {
      url: img.url || img.imageUrl || img.thumbnail || '/images/avatar.jpg',
      title: img.title || '',
      caption: img.caption || img.issuer || img.category || ''
    };
  });

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.max(0, Math.min(initialIndex, normalizedImages.length - 1)));
      setIsZoomed(false);
      setHasError(false);
      playSound?.('modal');
    }
  }, [isOpen, initialIndex, normalizedImages.length]);

  // Keyboard navigation: Escape, ArrowLeft, ArrowRight
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowRight' && normalizedImages.length > 1) {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' && normalizedImages.length > 1) {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, normalizedImages.length]);

  if (!isOpen || normalizedImages.length === 0) return null;

  const currentItem = normalizedImages[currentIndex] || normalizedImages[0];

  const handleNext = () => {
    setIsZoomed(false);
    setHasError(false);
    playSound?.('click');
    setCurrentIndex(prev => (prev + 1) % normalizedImages.length);
  };

  const handlePrev = () => {
    setIsZoomed(false);
    setHasError(false);
    playSound?.('click');
    setCurrentIndex(prev => (prev - 1 + normalizedImages.length) % normalizedImages.length);
  };

  const handleToggleZoom = (e) => {
    e.stopPropagation();
    setIsZoomed(prev => !prev);
    playSound?.('click');
  };

  return (
    <div
      ref={overlayRef}
      className="lightbox-overlay animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Image Lightbox Preview"
      onClick={onClose}
    >
      {/* Top Bar Controls */}
      <div
        style={{
          position: 'absolute',
          top: '1.25rem',
          right: '1.5rem',
          left: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
          {normalizedImages.length > 1 && (
            <span className="badge badge-ice">
              {currentIndex + 1} / {normalizedImages.length}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn btn-glass btn-icon btn-sm"
            onClick={handleToggleZoom}
            title={isZoomed ? 'Zoom Out (1x)' : 'Zoom In (1.5x)'}
            aria-label="Toggle zoom"
          >
            {isZoomed ? <ZoomOut size={16} /> : <ZoomIn size={16} />}
          </button>

          <button
            type="button"
            className="btn btn-glass btn-icon btn-sm"
            onClick={onClose}
            title="Tutup Lightbox (Esc)"
            aria-label="Tutup Lightbox"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Image Container */}
      <div
        className="lightbox-content"
        onClick={(e) => e.stopPropagation()}
      >
        {hasError ? (
          <div style={{
            padding: '3rem',
            textAlign: 'center',
            background: 'var(--card-glass)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-glass)'
          }}>
            <AlertCircle size={36} style={{ color: 'var(--color-error)', margin: '0 auto 1rem' }} />
            <p style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Gambar tidak dapat dimuat</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Format berkas tidak didukung atau tautan gambar telah kedaluwarsa.</p>
          </div>
        ) : (
          <img
            src={currentItem.url}
            alt={currentItem.title || 'Preview Gambar'}
            className="lightbox-img"
            style={{
              transform: isZoomed ? 'scale(1.4)' : 'scale(1)',
              cursor: isZoomed ? 'zoom-out' : 'zoom-in',
              transition: isReducedMotion ? 'none' : 'transform 0.25s ease'
            }}
            onClick={handleToggleZoom}
            onError={() => setHasError(true)}
          />
        )}

        {(currentItem.title || currentItem.caption) && (
          <div className="lightbox-caption">
            {currentItem.title && <span>{currentItem.title}</span>}
            {currentItem.title && currentItem.caption && <span> • </span>}
            {currentItem.caption && <span style={{ color: 'var(--ice-blue)', fontWeight: 500 }}>{currentItem.caption}</span>}
          </div>
        )}
      </div>

      {/* Left Navigation Arrow */}
      {normalizedImages.length > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          className="btn btn-glass btn-icon"
          style={{
            position: 'absolute',
            left: '1.5rem',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-full)'
          }}
          title="Gambar Sebelumnya (Panah Kiri)"
          aria-label="Gambar Sebelumnya"
        >
          <ChevronLeft size={22} />
        </button>
      )}

      {/* Right Navigation Arrow */}
      {normalizedImages.length > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          className="btn btn-glass btn-icon"
          style={{
            position: 'absolute',
            right: '1.5rem',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-full)'
          }}
          title="Gambar Selanjutnya (Panah Kanan)"
          aria-label="Gambar Selanjutnya"
        >
          <ChevronRight size={22} />
        </button>
      )}
    </div>
  );
}
