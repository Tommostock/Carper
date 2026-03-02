'use client';

import { useState, useEffect } from 'react';
import BottomSheet from '../ui/BottomSheet';
import ConfirmDialog from '../ui/ConfirmDialog';
import { formatDate } from '../../lib/utils';

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

export default function ItemDetailSheet({ item, open, onClose, categories, onUpdate, onDelete }) {
  const [name, setName]           = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [quantity, setQuantity]   = useState(0);
  const [threshold, setThreshold] = useState(2);
  const [notes, setNotes]         = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (item) {
      setName(item.name || '');
      setCategoryId(item.category_id || categories[0]?.id || '');
      setQuantity(item.quantity ?? 0);
      setThreshold(item.low_stock_threshold ?? 2);
      setNotes(item.notes || '');
    }
  }, [item, categories]);

  if (!item) return null;

  async function handleSave() {
    await onUpdate(item.id, {
      name: name.trim(),
      category_id: categoryId,
      quantity: parseInt(quantity) || 0,
      low_stock_threshold: parseInt(threshold) || 2,
      notes: notes.trim() || null,
    });
    onClose();
  }

  async function handleDelete() {
    await onDelete(item.id);
    setConfirmDelete(false);
    onClose();
  }

  return (
    <>
      <BottomSheet open={open} onClose={onClose} title="Edit Item">
        <div className="flex flex-col gap-4 p-5">

          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>Item Name</label>
            <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>Category</label>
            <select style={inputStyle} value={categoryId} onChange={e => setCategoryId(e.target.value)}>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>Quantity</label>
              <input type="number" min="0" style={inputStyle} value={quantity} onChange={e => setQuantity(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>Low Stock Alert at</label>
              <input type="number" min="0" style={inputStyle} value={threshold} onChange={e => setThreshold(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>Notes</label>
            <textarea
              style={{ ...inputStyle, resize: 'none', height: 72 }}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Optional notes"
            />
          </div>

          {/* Metadata */}
          <div className="rounded-xl p-3 text-xs space-y-1" style={{ background: 'var(--surface2)', color: 'var(--text-muted)' }}>
            {item.last_used_at && <p>Last used: {formatDate(item.last_used_at)}</p>}
            {item.last_restocked_at && <p>Last restocked: {formatDate(item.last_restocked_at)}</p>}
            <p>Added: {formatDate(item.created_at)}</p>
          </div>

          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="w-full py-4 rounded-xl font-semibold text-base"
            style={{ background: 'var(--accent)', color: 'white' }}
          >
            Save Changes
          </button>

          <button
            onClick={() => setConfirmDelete(true)}
            className="w-full py-3 rounded-xl font-medium text-sm"
            style={{ background: 'var(--surface2)', color: 'var(--red)' }}
          >
            Delete Item
          </button>
        </div>
      </BottomSheet>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete Item?"
        message={`Remove "${item.name}" from your inventory?`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
        danger
      />
    </>
  );
}
