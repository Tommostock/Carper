'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/inventory', label: 'Tackle',   icon: '🎣' },
  { href: '/shopping',  label: 'Shopping', icon: '🛒' },
  { href: '/map',       label: 'Map',      icon: '📍' },
  { href: '/photos',    label: 'Photos',   icon: '📷' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex-shrink-0 border-t safe-bottom"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="flex h-14">
        {TABS.map(tab => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[44px] transition-opacity"
              style={{ color: active ? 'var(--accent)' : 'var(--text-dim)' }}
            >
              <span className="text-xl leading-none">{tab.icon}</span>
              <span className="text-[10px] font-medium tracking-wide">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
