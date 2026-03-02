'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { isSupabaseConfigured } from '../supabase';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [dbStatus, setDbStatus] = useState('checking'); // 'connected' | 'local' | 'checking'

  useEffect(() => {
    setDbStatus(isSupabaseConfigured ? 'connected' : 'local');
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 2800) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <AppContext.Provider value={{ toasts, showToast, dismissToast, dbStatus, setDbStatus }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
