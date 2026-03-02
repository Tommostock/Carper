'use client';

import { useApp } from '../../lib/context/AppContext';

export default function DbStatusPill() {
  const { dbStatus } = useApp();

  if (dbStatus === 'checking') return null;

  const isConnected = dbStatus === 'connected';

  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{
      background: isConnected ? 'rgba(45,157,110,0.15)' : 'rgba(249,115,22,0.15)',
      color: isConnected ? 'var(--green)' : 'var(--orange)',
    }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'currentColor' }} />
      {isConnected ? 'Synced' : 'Local Only'}
    </span>
  );
}
