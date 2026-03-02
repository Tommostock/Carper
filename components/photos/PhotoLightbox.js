'use client';

import { useEffect } from 'react';
import { formatDate, formatWeight } from '../../lib/utils';

export default function PhotoLightbox({ photo, onClose }) {
  useEffect(() => {
    if (!photo) return;
    document.body.style.overflow = 'hidden';
    const handleKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [photo, onClose]);

  if (!photo) return null;

  const weight = formatWeight(photo.weight_lb, photo.weight_oz);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'rgba(0,0,0,0.95)' }}
      onClick={onClose}
    >
      {/* Close */}
      <div className="flex justify-end p-4 flex-shrink-0">
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-full text-xl"
          style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}
        >
          ×
        </button>
      </div>

      {/* Image */}
      <div className="flex-1 flex items-center justify-center p-4" onClick={e => e.stopPropagation()}>
        <img
          src={photo.url}
          alt={photo.caption || 'Catch photo'}
          className="max-w-full max-h-full rounded-xl object-contain"
          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
        />
      </div>

      {/* Metadata */}
      <div
        className="flex-shrink-0 px-6 py-4 space-y-1"
        style={{ background: 'rgba(0,0,0,0.6)' }}
        onClick={e => e.stopPropagation()}
      >
        {weight && (
          <p className="font-bold text-lg" style={{ color: 'var(--accent2)' }}>
            🐟 {photo.fish_species || 'Carp'} — {weight}
          </p>
        )}
        {!weight && photo.fish_species && (
          <p className="font-bold text-lg" style={{ color: 'var(--accent2)' }}>🐟 {photo.fish_species}</p>
        )}
        {photo.caption && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{photo.caption}</p>}
        {photo.caught_at && (
          <p className="text-xs" style={{ color: 'var(--text-dim)' }}>{formatDate(photo.caught_at)}</p>
        )}
      </div>
    </div>
  );
}
