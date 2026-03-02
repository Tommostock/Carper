'use client';

import { useState, useMemo, useEffect } from 'react';
import { useInventory } from '../../lib/context/InventoryContext';
import { useApp } from '../../lib/context/AppContext';
import { getStockStatus } from '../../lib/utils';
import Header from '../layout/Header';
import CategoryBar from './CategoryBar';
import ItemCard from './ItemCard';
import AddItemSheet from './AddItemSheet';
import ItemDetailSheet from './ItemDetailSheet';
import EmptyState from '../ui/EmptyState';

const LAST_CAT_KEY = 'carper_last_category';

export default function InventoryPage() {
  const { items, categories, loading, addItem, updateItem, updateQuantity, deleteItem, getSortedItems } = useInventory();
  const { showToast } = useApp();

  const [activeCat, setActiveCat] = useState(null);
  const [showAdd, setShowAdd]     = useState(false);
  const [detailItem, setDetailItem] = useState(null);

  // Remember last category across sessions
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(LAST_CAT_KEY) : null;
    if (saved) setActiveCat(saved === 'null' ? null : saved);
  }, []);

  function selectCat(id) {
    setActiveCat(id);
    if (typeof window !== 'undefined') localStorage.setItem(LAST_CAT_KEY, id);
  }

  const sortedItems = useMemo(() => getSortedItems(activeCat), [getSortedItems, activeCat]);

  // Count items per category (for badge)
  const itemCounts = useMemo(() => {
    const counts = {};
    items.forEach(i => {
      counts[i.category_id] = (counts[i.category_id] || 0) + 1;
    });
    return counts;
  }, [items]);

  const lowCount = items.filter(i => getStockStatus(i) !== 'ok').length;

  return (
    <>
      <Header
        title="Carper"
        right={
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center justify-center rounded-xl font-semibold text-sm px-3"
            style={{ height: 36, background: 'var(--accent)', color: 'white' }}
          >
            + Add
          </button>
        }
      />

      <CategoryBar
        categories={categories}
        activeId={activeCat}
        onSelect={selectCat}
        itemCounts={itemCounts}
      />

      {/* Low stock banner */}
      {lowCount > 0 && !activeCat && (
        <div className="mx-4 mt-3 px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm" style={{ background: 'rgba(249,115,22,0.12)', color: 'var(--orange)' }}>
          <span>⚠️</span>
          <span><strong>{lowCount}</strong> {lowCount === 1 ? 'item needs' : 'items need'} attention</span>
        </div>
      )}

      {/* Item list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
        {loading ? (
          <div className="flex justify-center py-16">
            <span style={{ color: 'var(--text-muted)' }}>Loading...</span>
          </div>
        ) : sortedItems.length === 0 ? (
          <EmptyState
            icon="🎒"
            title="No tackle here yet"
            message="Tap + Add to add your first item"
          />
        ) : (
          sortedItems.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onQuantityChange={updateQuantity}
              onTap={() => setDetailItem(item)}
            />
          ))
        )}
      </div>

      <AddItemSheet
        open={showAdd}
        onClose={() => setShowAdd(false)}
        categories={categories}
        onSave={addItem}
      />

      <ItemDetailSheet
        item={detailItem}
        open={!!detailItem}
        onClose={() => setDetailItem(null)}
        categories={categories}
        onUpdate={updateItem}
        onDelete={deleteItem}
      />
    </>
  );
}
