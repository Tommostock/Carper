'use client';

import { useState, useEffect } from 'react';
import BottomSheet from '../ui/BottomSheet';

const WATER_TYPES = ['lake', 'gravel pit', 'reservoir', 'river', 'canal', 'other'];

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 10,
  background: 'var(--surface2)',
  color: 'var(--text)',
  border: '1px solid var(--border)',
  fontSize: 16,
  outline: 'none',
};

export default function SaveLocationSheet({ open, onClose, prefill, onSave }) {
  const [name, setName]   = useState('');
  const [type, setType]   = useState('lake');
  const [area, setArea]   = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (prefill) {
      setName(prefill.name || '');
      setArea(prefill.area || '');
    }
  }, [prefill]);

  function reset() { setName(''); setType('lake'); setArea(''); setNotes(''); }

  async function handleSave() {
    if (!name.trim() || !prefill) return;
    await onSave({
      name: name.trim(),
      lat: prefill.lat,
      lng: prefill.lng,
      type,
      area: area.trim() || null,
      notes: notes.trim() || null,
      nominatim_id: prefill.nominatim_id || null,
    });
    reset();
    onClose();
  }

  return (
    <BottomSheet open={open} onClose={() => { reset(); onClose(); }} title="Save Location">
      <div className="flex flex-col gap-4 p-5">

        <div>
          <label className="block text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>Location Name *</label>
          <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Farlows Lake" />
        </div>

        <div>
          <label className="block text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>Water Type</label>
          <div className="flex flex-wrap gap-2">
            {WATER_TYPES.map(t => (
              <button
                key={t}
                onClick={() => setType(t)}
                className="px-3 py-1.5 rounded-lg text-sm capitalize"
                style={{
                  background: type === t ? 'var(--accent)' : 'var(--surface2)',
                  color: type === t ? 'white' : 'var(--text-muted)',
                  border: `1px solid ${type === t ? 'var(--accent)' : 'var(--border)'}`,
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>County / Area</label>
          <input style={inputStyle} value={area} onChange={e => setArea(e.target.value)} placeholder="e.g. Essex" />
        </div>

        <div>
          <label className="block text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>Notes (optional)</label>
          <textarea
            style={{ ...inputStyle, resize: 'none', height: 72 }}
            placeholder="Day ticket prices, rules, best pegs..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        {prefill && (
          <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
            📍 {prefill.lat?.toFixed(5)}, {prefill.lng?.toFixed(5)}
          </p>
        )}

        <button
          onClick={handleSave}
          disabled={!name.trim()}
          className="w-full py-4 rounded-xl font-semibold text-base"
          style={{ background: name.trim() ? 'var(--accent)' : 'var(--surface2)', color: name.trim() ? 'white' : 'var(--text-dim)' }}
        >
          Save Location
        </button>
      </div>
    </BottomSheet>
  );
}
