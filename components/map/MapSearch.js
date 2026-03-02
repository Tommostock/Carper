'use client';

import { useState, useRef, useCallback } from 'react';
import { geocodeSearch } from '../../lib/nominatim';

export default function MapSearch({ onSelect }) {
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  const search = useCallback((q) => {
    setQuery(q);
    clearTimeout(debounceRef.current);
    if (q.trim().length < 2) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const res = await geocodeSearch(q);
      setResults(res.slice(0, 6));
      setLoading(false);
    }, 800);
  }, []);

  function handleSelect(result) {
    onSelect({
      name: result.display_name.split(',')[0].trim(),
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      area: result.address?.county || result.address?.state_district || '',
      nominatim_id: String(result.place_id),
      display_name: result.display_name,
    });
    setQuery('');
    setResults([]);
  }

  return (
    <div className="relative px-3 py-2 flex-shrink-0" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base" style={{ color: 'var(--text-muted)' }}>🔍</span>
        <input
          className="w-full pl-9 pr-4 rounded-xl text-sm"
          style={{
            height: 44, background: 'var(--surface2)', color: 'var(--text)',
            border: '1px solid var(--border)', fontSize: 16, outline: 'none',
          }}
          placeholder="Search UK fishing venues..."
          value={query}
          onChange={e => search(e.target.value)}
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--text-dim)' }}>...</span>
        )}
      </div>

      {results.length > 0 && (
        <div
          className="absolute left-3 right-3 top-full mt-1 rounded-xl overflow-hidden shadow-xl z-50"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          {results.map((r, i) => (
            <button
              key={r.place_id}
              onClick={() => handleSelect(r)}
              className="w-full text-left px-4 py-3 text-sm active:opacity-70"
              style={{
                color: 'var(--text)',
                borderBottom: i < results.length - 1 ? '1px solid var(--border)' : 'none',
              }}
            >
              <p className="font-medium truncate">{r.display_name.split(',')[0]}</p>
              <p className="text-xs truncate" style={{ color: 'var(--text-dim)' }}>{r.display_name}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
