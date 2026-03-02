'use client';

import { useState } from 'react';
import { useLocations } from '../../lib/context/LocationsContext';
import ConfirmDialog from '../ui/ConfirmDialog';

const TYPE_ICONS = { lake: '🏞️', 'gravel pit': '⛏️', reservoir: '💧', river: '🌊', canal: '⛵', other: '📍' };

export default function LocationListDrawer({ open, onClose, onLocSelect }) {
  const { locations, toggleFavourite, deleteLocation } = useLocations();
  const [confirmId, setConfirmId] = useState(null);

  const sorted = [...locations].sort((a, b) => {
    if (a.is_favourite && !b.is_favourite) return -1;
    if (!a.is_favourite && b.is_favourite) return 1;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative rounded-t-2xl overflow-hidden" style={{ background: 'var(--surface)', maxHeight: '70vh' }}>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--border)' }} />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-semibold" style={{ color: 'var(--text)' }}>Saved Locations ({locations.length})</h2>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', fontSize: 20 }}>×</button>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(70vh - 80px)' }}>
          {sorted.length === 0 ? (
            <p className="text-center py-10 text-sm" style={{ color: 'var(--text-muted)' }}>No saved locations yet</p>
          ) : (
            sorted.map(loc => (
              <div
                key={loc.id}
                className="flex items-center gap-3 px-4 py-3 border-b"
                style={{ borderColor: 'var(--border)' }}
              >
                <button className="flex-1 flex items-center gap-3 text-left" onClick={() => { onLocSelect(loc); onClose(); }}>
                  <span className="text-xl">{TYPE_ICONS[loc.type] || '📍'}</span>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{loc.name}</p>
                    {loc.area && <p className="text-xs" style={{ color: 'var(--text-dim)' }}>{loc.area} · {loc.type}</p>}
                  </div>
                </button>
                <button
                  onClick={() => toggleFavourite(loc.id)}
                  className="text-lg px-1"
                  style={{ color: loc.is_favourite ? '#f4c430' : 'var(--border)' }}
                >
                  ★
                </button>
                <button
                  onClick={() => setConfirmId(loc.id)}
                  className="text-sm px-2 py-1 rounded-lg"
                  style={{ color: 'var(--red)', background: 'rgba(230,57,70,0.1)' }}
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!confirmId}
        title="Remove Location?"
        message="This will also delete all catch photos for this location."
        onConfirm={() => { deleteLocation(confirmId); setConfirmId(null); }}
        onCancel={() => setConfirmId(null)}
        danger
      />
    </div>
  );
}
