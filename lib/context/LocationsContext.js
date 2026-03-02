'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../supabase';
import { saveLocal, loadLocal } from '../storage';
import { useApp } from './AppContext';

const LocationsContext = createContext(null);

export function LocationsProvider({ children }) {
  const { showToast } = useApp();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('locations')
            .select('*')
            .order('created_at', { ascending: false });
          if (!error) {
            setLocations(data || []);
            saveLocal('locations', data || []);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Locations load failed, using localStorage');
        }
      }
      const local = loadLocal('locations') || [];
      setLocations(local);
      setLoading(false);
    }
    load();
  }, []);

  const addLocation = useCallback(async (locationData) => {
    const newLoc = {
      ...locationData,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      is_favourite: false,
    };
    setLocations(prev => {
      const next = [newLoc, ...prev];
      saveLocal('locations', next);
      return next;
    });

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('locations')
        .insert(locationData)
        .select()
        .single();
      if (!error && data) {
        setLocations(prev => {
          const next = prev.map(l => l.id === newLoc.id ? data : l);
          saveLocal('locations', next);
          return next;
        });
      }
    }
    showToast(`${locationData.name} saved`);
  }, [showToast]);

  const updateLocation = useCallback(async (id, updates) => {
    setLocations(prev => {
      const next = prev.map(l => l.id === id ? { ...l, ...updates } : l);
      saveLocal('locations', next);
      return next;
    });
    if (isSupabaseConfigured) {
      await supabase.from('locations').update(updates).eq('id', id);
    }
  }, []);

  const toggleFavourite = useCallback(async (id) => {
    let newVal;
    setLocations(prev => {
      const next = prev.map(l => {
        if (l.id !== id) return l;
        newVal = !l.is_favourite;
        return { ...l, is_favourite: newVal };
      });
      saveLocal('locations', next);
      return next;
    });
    if (isSupabaseConfigured) {
      await supabase.from('locations').update({ is_favourite: newVal }).eq('id', id);
    }
  }, []);

  const deleteLocation = useCallback(async (id) => {
    setLocations(prev => {
      const next = prev.filter(l => l.id !== id);
      saveLocal('locations', next);
      return next;
    });
    if (isSupabaseConfigured) {
      await supabase.from('locations').delete().eq('id', id);
    }
    showToast('Location removed');
  }, [showToast]);

  return (
    <LocationsContext.Provider value={{
      locations,
      loading,
      addLocation,
      updateLocation,
      toggleFavourite,
      deleteLocation,
    }}>
      {children}
    </LocationsContext.Provider>
  );
}

export function useLocations() {
  const ctx = useContext(LocationsContext);
  if (!ctx) throw new Error('useLocations must be inside LocationsProvider');
  return ctx;
}
