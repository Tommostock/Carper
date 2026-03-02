'use client';

import DbStatusPill from '../ui/DbStatusPill';

export default function Header({ title = 'Carper', right }) {
  return (
    <header className="flex items-center justify-between px-4 h-14 flex-shrink-0 border-b" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="flex items-center gap-2">
        <span className="text-xl">🎣</span>
        <span className="text-base font-bold tracking-tight" style={{ color: 'var(--text)' }}>{title}</span>
        <DbStatusPill />
      </div>
      {right && <div className="flex items-center gap-2">{right}</div>}
    </header>
  );
}
