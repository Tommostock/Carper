'use client';

import { useEffect } from 'react';

export default function BottomSheet({ open, onClose, title, children }) {
  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Sheet */}
      <div className="relative rounded-t-2xl overflow-hidden" style={{ background: 'var(--surface)', maxHeight: '92vh' }}>
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--border)' }} />
        </div>
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-base font-semibold" style={{ color: 'var(--text)' }}>{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full text-lg"
              style={{ color: 'var(--text-muted)', background: 'var(--surface2)' }}
            >
              ×
            </button>
          </div>
        )}
        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(92vh - 80px)', paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
