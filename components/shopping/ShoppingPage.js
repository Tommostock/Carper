'use client';

import { useState, useEffect, useCallback } from 'react';
import { useInventory } from '../../lib/context/InventoryContext';
import { useApp } from '../../lib/context/AppContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { saveLocal, loadLocal } from '../../lib/storage';
import { generateShoppingList, formatDate } from '../../lib/utils';
import Header from '../layout/Header';
import ShoppingListItem from './ShoppingListItem';
import EmptyState from '../ui/EmptyState';

const SESSION_KEY = 'carper_shopping';

export default function ShoppingPage() {
  const { items } = useInventory();
  const { showToast } = useApp();
  const [shoppingItems, setShoppingItems] = useState([]);
  const [sessionId, setSessionId]         = useState(null);
  const [sessionDate, setSessionDate]     = useState(null);
  const [manualInput, setManualInput]     = useState('');
  const [showManual, setShowManual]       = useState(false);

  // Load persisted list on mount
  useEffect(() => {
    const saved = loadLocal('shopping');
    if (saved?.items?.length > 0) {
      setShoppingItems(saved.items);
      setSessionId(saved.sessionId);
      setSessionDate(saved.date);
    }
  }, []);

  function persistList(items, sid, date) {
    const data = { items, sessionId: sid, date };
    saveLocal('shopping', data);
  }

  const handleGenerate = useCallback(() => {
    const generated = generateShoppingList(items);
    if (generated.length === 0) {
      showToast('Everything looks well stocked!', 'success');
      return;
    }
    const sid  = crypto.randomUUID();
    const date = new Date().toISOString();
    const listItems = generated.map(item => ({
      id: crypto.randomUUID(),
      item_id: item.id,
      name: item.name,
      quantity: 1,
      is_purchased: false,
      is_manual: false,
      list_session: sid,
    }));
    setShoppingItems(listItems);
    setSessionId(sid);
    setSessionDate(date);
    persistList(listItems, sid, date);
    showToast(`${listItems.length} items added to list`);

    if (isSupabaseConfigured) {
      supabase.from('shopping_list').insert(listItems).then(({ error }) => {
        if (error) console.warn('Shopping list sync failed:', error);
      });
    }
  }, [items, showToast]);

  const toggleItem = useCallback((id) => {
    setShoppingItems(prev => {
      const next = prev.map(i =>
        i.id === id
          ? { ...i, is_purchased: !i.is_purchased, purchased_at: !i.is_purchased ? new Date().toISOString() : null }
          : i
      );
      persistList(next, sessionId, sessionDate);
      if (isSupabaseConfigured) {
        const item = next.find(i => i.id === id);
        supabase.from('shopping_list')
          .update({ is_purchased: item.is_purchased, purchased_at: item.purchased_at })
          .eq('id', id)
          .then(() => {});
      }
      return next;
    });
  }, [sessionId, sessionDate]);

  function handleAddManual() {
    if (!manualInput.trim()) return;
    const newItem = {
      id: crypto.randomUUID(),
      name: manualInput.trim(),
      quantity: 1,
      is_purchased: false,
      is_manual: true,
      list_session: sessionId || crypto.randomUUID(),
    };
    const next = [...shoppingItems, newItem];
    setShoppingItems(next);
    persistList(next, sessionId, sessionDate);
    setManualInput('');
    setShowManual(false);
  }

  function clearDone() {
    const next = shoppingItems.filter(i => !i.is_purchased);
    setShoppingItems(next);
    persistList(next, sessionId, sessionDate);
    showToast('Purchased items cleared');
  }

  function clearAll() {
    setShoppingItems([]);
    setSessionId(null);
    setSessionDate(null);
    saveLocal('shopping', null);
  }

  const purchased = shoppingItems.filter(i => i.is_purchased).length;
  const total     = shoppingItems.length;

  return (
    <>
      <Header
        title="Shopping"
        right={
          purchased > 0 && (
            <button
              onClick={clearDone}
              className="text-sm px-3 py-1.5 rounded-lg"
              style={{ background: 'var(--surface2)', color: 'var(--text-muted)' }}
            >
              Clear Done
            </button>
          )
        }
      />

      <div className="flex-1 overflow-y-auto">
        {/* Prepare for Trip CTA */}
        <div className="px-4 pt-4 pb-2">
          <button
            onClick={handleGenerate}
            className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 active:opacity-80"
            style={{ background: 'var(--accent)', color: 'white', fontSize: 16 }}
          >
            <span>🎒</span> Prepare for Trip
          </button>
        </div>

        {shoppingItems.length === 0 ? (
          <EmptyState
            icon="🛒"
            title="No shopping list yet"
            message="Tap 'Prepare for Trip' to generate one from your low stock"
          />
        ) : (
          <>
            {/* List header */}
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
                {sessionDate && `Generated ${formatDate(sessionDate)}`}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {purchased}/{total} done
              </span>
            </div>

            {/* Items */}
            <div className="rounded-2xl mx-4 overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              {shoppingItems.map(item => (
                <ShoppingListItem key={item.id} item={item} onToggle={toggleItem} />
              ))}
            </div>

            {/* Manual add */}
            <div className="px-4 mt-3">
              {showManual ? (
                <div className="flex gap-2">
                  <input
                    autoFocus
                    className="flex-1 px-4 py-3 rounded-xl text-sm"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 16 }}
                    placeholder="Item name..."
                    value={manualInput}
                    onChange={e => setManualInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddManual()}
                  />
                  <button
                    onClick={handleAddManual}
                    className="px-4 rounded-xl font-medium text-sm"
                    style={{ background: 'var(--accent)', color: 'white' }}
                  >
                    Add
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowManual(true)}
                  className="w-full py-3 rounded-xl text-sm"
                  style={{ background: 'var(--surface)', color: 'var(--text-muted)', border: '1px dashed var(--border)' }}
                >
                  + Add item manually
                </button>
              )}
            </div>

            {/* Clear all */}
            {total > 0 && (
              <div className="px-4 mt-3 mb-4">
                <button
                  onClick={clearAll}
                  className="w-full py-3 rounded-xl text-sm"
                  style={{ color: 'var(--text-dim)' }}
                >
                  Clear entire list
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
