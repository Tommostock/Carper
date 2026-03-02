'use client';

import { getStockStatus } from '../../lib/utils';

export default function ShoppingListItem({ item, onToggle }) {
  return (
    <button
      onClick={() => onToggle(item.id)}
      className="flex items-center gap-3 w-full px-4 py-3.5 text-left active:opacity-70"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      {/* Checkbox */}
      <span
        className="flex-shrink-0 flex items-center justify-center rounded-lg text-sm"
        style={{
          width: 26, height: 26,
          background: item.is_purchased ? 'var(--accent)' : 'var(--surface2)',
          border: `2px solid ${item.is_purchased ? 'var(--accent)' : 'var(--border)'}`,
          color: 'white',
        }}
      >
        {item.is_purchased ? '✓' : ''}
      </span>

      {/* Name */}
      <span
        className="flex-1 text-sm font-medium"
        style={{
          color: item.is_purchased ? 'var(--text-dim)' : 'var(--text)',
          textDecoration: item.is_purchased ? 'line-through' : 'none',
        }}
      >
        {item.name}
      </span>

      {/* Qty badge */}
      {item.quantity > 1 && (
        <span
          className="text-xs px-2 py-0.5 rounded-lg flex-shrink-0"
          style={{ background: 'var(--surface2)', color: 'var(--text-muted)' }}
        >
          ×{item.quantity}
        </span>
      )}

      {/* Manual badge */}
      {item.is_manual && (
        <span className="text-xs" style={{ color: 'var(--text-dim)' }}>added</span>
      )}
    </button>
  );
}
