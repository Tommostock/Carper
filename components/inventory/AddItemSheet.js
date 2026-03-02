'use client';

import { useState } from 'react';
import BottomSheet from '../ui/BottomSheet';

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

export default function AddItemSheet({ open, onClose, categories, onSave }) {
  const [name, setName]             = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [quantity, setQuantity]     = useState(0);
  const [threshold, setThreshold]   = useState(2);
  const [notes, setNotes]           = useState('');

  function reset() {
    setName(''); setCategoryId(categories[0]?.id || ''); setQuantity(0); setThreshold(2); setNotes('');
  }

  function handleClose() { reset(); onClose(); }

  async function handleSave() {
    if (!name.trim()) return;
    await onSave({
      name: name.trim(),
      category_id: categoryId,
      quantity: parseInt(quantity) || 0,
      low_stock_threshold: parseInt(threshold) || 2,
      critical_threshold: 0,
      notes: notes.trim() || null,
    });
    reset();
    onClose();
  }

  return (
    <BottomSheet open={open} onClose={handleClose} title="Add Tackle Item">
      <div className="flex flex-col gap-4 p-5">

        <div>
          <label className="block text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>Item Name *</label>
          <input
            style={inputStyle}
            placeholder="e.g. Mainline Boilies 15mm"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>Category</label>
          <select
            style={inputStyle}
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
          >
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>Starting Qty</label>
            <input
              type="number"
              min="0"
              style={inputStyle}
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>Low Stock Alert at</label>
            <input
              type="number"
              min="0"
              style={inputStyle}
              value={threshold}
              onChange={e => setThreshold(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>Notes (optional)</label>
          <textarea
            style={{ ...inputStyle, resize: 'none', height: 72 }}
            placeholder="e.g. Krill flavour, 15mm"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={!name.trim()}
          className="w-full py-4 rounded-xl font-semibold text-base mt-1"
          style={{
            background: name.trim() ? 'var(--accent)' : 'var(--surface2)',
            color: name.trim() ? 'white' : 'var(--text-dim)',
          }}
        >
          Add Item
        </button>
      </div>
    </BottomSheet>
  );
}
