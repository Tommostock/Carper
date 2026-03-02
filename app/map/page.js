'use client';

import dynamic from 'next/dynamic';

// Leaflet requires window — must disable SSR
const MapPage = dynamic(() => import('../../components/map/MapPage'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
      Loading map...
    </div>
  ),
});

export default function MapRoute() {
  return (
    <div className="flex flex-col flex-1 overflow-hidden relative">
      <MapPage />
    </div>
  );
}
