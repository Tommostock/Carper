'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../supabase';
import { saveLocal, loadLocal } from '../storage';
import { sortItems } from '../utils';
import { useApp } from './AppContext';

const DEFAULT_CATEGORIES = [
  { id: 'rods',     name: 'Rods',            icon: '🎣', sort_order: 1 },
  { id: 'reels',    name: 'Reels',           icon: '⚙️', sort_order: 2 },
  { id: 'line',     name: 'Line',            icon: '🧵', sort_order: 3 },
  { id: 'hooks',    name: 'Hooks',           icon: '🪝', sort_order: 4 },
  { id: 'rigs',     name: 'Rigs',            icon: '🔧', sort_order: 5 },
  { id: 'bait',     name: 'Bait',            icon: '🍞', sort_order: 6 },
  { id: 'terminal', name: 'Terminal Tackle', icon: '⚓', sort_order: 7 },
  { id: 'additives',name: 'Additives',       icon: '🧪', sort_order: 8 },
  { id: 'setup',    name: 'Setup Gear',      icon: '🎒', sort_order: 9 },
  { id: 'other',    name: 'Other',           icon: '📦', sort_order: 10 },
];

const InventoryContext = createContext(null);

export function InventoryProvider({ children }) {
  const { showToast, setDbStatus } = useApp();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);

  // Load on mount: Supabase → localStorage → defaults
  useEffect(() => {
    async function load() {
      setLoading(true);

      if (isSupabaseConfigured) {
        try {
          const [catRes, itemRes] = await Promise.all([
            supabase.from('categories').select('*').order('sort_order'),
            supabase.from('tackle_items').select('*, categories(name, icon)').order('created_at'),
          ]);
          if (!catRes.error && catRes.data?.length > 0) {
            setCategories(catRes.data);
            saveLocal('categories', catRes.data);
          }
          if (!itemRes.error) {
            const loaded = itemRes.data || [];
            setItems(loaded);
            saveLocal('items', loaded);
            setDbStatus('connected');
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Supabase load failed, falling back to localStorage');
          setDbStatus('local');
        }
      }

      // Fallback to localStorage
      const localItems = loadLocal('items') || [];
      const localCats  = loadLocal('categories');
      if (localCats?.length > 0) setCategories(localCats);
      setItems(localItems);
      setDbStatus('local');
      setLoading(false);
    }
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── CRUD ──────────────────────────────────────────────────────────────────

  const addItem = useCallback(async (itemData) => {
    const newItem = {
      ...itemData,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_used_at: null,
      last_restocked_at: null,
    };
    setItems(prev => {
      const next = [...prev, newItem];
      saveLocal('items', next);
      return next;
    });

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('tackle_items')
        .insert({
          category_id: itemData.category_id,
          name: itemData.name,
          quantity: itemData.quantity,
          low_stock_threshold: itemData.low_stock_threshold,
          critical_threshold: itemData.critical_threshold ?? 0,
          notes: itemData.notes || null,
        })
        .select('*, categories(name, icon)')
        .single();

      if (!error && data) {
        // Replace temp item with Supabase-assigned id
        setItems(prev => {
          const next = prev.map(i => i.id === newItem.id ? data : i);
          saveLocal('items', next);
          return next;
        });
      }
    }
    showToast(`${itemData.name} added`);
  }, [showToast]);

  const updateItem = useCallback(async (id, updates) => {
    setItems(prev => {
      const next = prev.map(i => i.id === id ? { ...i, ...updates, updated_at: new Date().toISOString() } : i);
      saveLocal('items', next);
      return next;
    });

    if (isSupabaseConfigured) {
      await supabase.from('tackle_items').update({
        ...updates,
        updated_at: new Date().toISOString(),
      }).eq('id', id);
    }
  }, []);

  const updateQuantity = useCallback(async (id, delta) => {
    let newQty;
    setItems(prev => {
      const next = prev.map(i => {
        if (i.id !== id) return i;
        newQty = Math.max(0, (i.quantity || 0) + delta);
        const now = new Date().toISOString();
        return {
          ...i,
          quantity: newQty,
          updated_at: now,
          last_used_at: delta < 0 ? now : i.last_used_at,
          last_restocked_at: delta > 0 ? now : i.last_restocked_at,
        };
      });
      saveLocal('items', next);
      return next;
    });

    if (isSupabaseConfigured) {
      const now = new Date().toISOString();
      const extra = delta < 0
        ? { last_used_at: now }
        : { last_restocked_at: now };
      await supabase.from('tackle_items')
        .update({ quantity: newQty, updated_at: now, ...extra })
        .eq('id', id);

      // Also log usage
      if (delta < 0) {
        await supabase.from('usage_log').insert({
          item_id: id,
          quantity: Math.abs(delta),
          used_at: now,
        });
      }
    }
  }, []);

  const deleteItem = useCallback(async (id) => {
    setItems(prev => {
      const next = prev.filter(i => i.id !== id);
      saveLocal('items', next);
      return next;
    });
    if (isSupabaseConfigured) {
      await supabase.from('tackle_items').delete().eq('id', id);
    }
    showToast('Item removed');
  }, [showToast]);

  const getSortedItems = useCallback((categoryFilter = null) => {
    let filtered = categoryFilter
      ? items.filter(i => i.category_id === categoryFilter)
      : items;
    return sortItems(filtered);
  }, [items]);

  return (
    <InventoryContext.Provider value={{
      items,
      categories,
      loading,
      addItem,
      updateItem,
      updateQuantity,
      deleteItem,
      getSortedItems,
    }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory must be inside InventoryProvider');
  return ctx;
}
