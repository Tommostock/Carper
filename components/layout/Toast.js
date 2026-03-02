'use client';

import { useApp } from '../../lib/context/AppContext';

const ICONS = { info: 'ℹ️', success: '✓', error: '✕', warning: '⚠️' };

export default function Toast() {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-24 left-0 right-0 z-40 flex flex-col items-center gap-2 pointer-events-none px-4" style={{ bottom: 'calc(72px + env(safe-area-inset-bottom, 0px))' }}>
      {toasts.map(toast => (
        <div
          key={toast.id}
          onClick={() => dismissToast(toast.id)}
          className="pointer-events-auto flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium max-w-xs w-full"
          style={{
            background: toast.type === 'error' ? 'var(--red)' : toast.type === 'warning' ? 'var(--orange)' : 'var(--surface2)',
            color: (toast.type === 'error' || toast.type === 'warning') ? 'white' : 'var(--text)',
            border: '1px solid var(--border)',
          }}
        >
          <span>{ICONS[toast.type] || ICONS.info}</span>
          <span className="flex-1">{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
