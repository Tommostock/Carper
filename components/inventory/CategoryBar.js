'use client';

export default function CategoryBar({ categories, activeId, onSelect, itemCounts }) {
  const all = [{ id: null, name: 'All', icon: '✦' }, ...categories];

  return (
    <div
      className="flex gap-2 px-4 py-2 overflow-x-auto no-scrollbar flex-shrink-0 border-b"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      {all.map(cat => {
        const active = activeId === cat.id;
        const count = cat.id === null
          ? Object.values(itemCounts || {}).reduce((s, v) => s + v, 0)
          : (itemCounts?.[cat.id] ?? 0);

        return (
          <button
            key={cat.id ?? 'all'}
            onClick={() => onSelect(cat.id)}
            className="flex items-center gap-1.5 px-3 rounded-xl whitespace-nowrap transition-all flex-shrink-0"
            style={{
              height: 36,
              background: active ? 'var(--accent)' : 'var(--surface2)',
              color: active ? 'white' : 'var(--text-muted)',
              border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
              fontSize: 13,
              fontWeight: active ? 600 : 400,
            }}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
            {count > 0 && (
              <span
                className="text-[10px] px-1 rounded"
                style={{
                  background: active ? 'rgba(255,255,255,0.25)' : 'var(--border)',
                  color: active ? 'white' : 'var(--text-dim)',
                }}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
