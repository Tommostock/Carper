'use client';

import { getStockStatus } from '../../lib/utils';
import StockBadge from './StockBadge';
import QuantityStepper from './QuantityStepper';

export default function ItemCard({ item, onQuantityChange, onTap }) {
  const status = getStockStatus(item);
  const catName = item.categories?.name || item.category_name || '';
  const catIcon = item.categories?.icon || '📦';

  return (
    <div
      className="rounded-2xl p-4 cursor-pointer active:scale-[0.98] transition-transform"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      onClick={onTap}
    >
      {/* Top row: name + badge */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-base truncate" style={{ color: 'var(--text)' }}>
            {item.name}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {catIcon} {catName}
          </p>
        </div>
        <StockBadge status={status} />
      </div>

      {/* Stepper */}
      <QuantityStepper
        value={item.quantity}
        onChange={(delta) => onQuantityChange(item.id, delta)}
        onClick={(e) => e.stopPropagation()}
      />

      {/* Notes */}
      {item.notes && (
        <p className="text-xs mt-2 italic" style={{ color: 'var(--text-dim)' }}>
          {item.notes}
        </p>
      )}
    </div>
  );
}
