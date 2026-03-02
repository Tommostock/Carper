'use client';

import { useState, useEffect, useMemo } from 'react';
import { useLocations } from '../../lib/context/LocationsContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { formatWeight, formatDate } from '../../lib/utils';
import Header from '../layout/Header';
import PhotoUploadSheet from './PhotoUploadSheet';
import PhotoLightbox from './PhotoLightbox';
import EmptyState from '../ui/EmptyState';

export default function PhotosPage() {
  const { locations } = useLocations();
  const [photos, setPhotos]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filterLocId, setFilterLocId] = useState('all');
  const [showUpload, setShowUpload] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);

  useEffect(() => {
    async function loadPhotos() {
      setLoading(true);
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('catch_photos')
          .select('*, locations(name)')
          .order('caught_at', { ascending: false });
        if (!error && data) {
          // Attach public URLs
          const withUrls = data.map(p => ({
            ...p,
            url: p.storage_key
              ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/carper-photos/${p.storage_key}`
              : null,
          }));
          setPhotos(withUrls);
          setLoading(false);
          return;
        }
      }
      setPhotos([]);
      setLoading(false);
    }
    loadPhotos();
  }, []);

  function handleUploaded(photo) {
    // Attach location name from context
    const loc = locations.find(l => l.id === photo.location_id);
    setPhotos(prev => [{ ...photo, locations: { name: loc?.name || 'Unknown' } }, ...prev]);
  }

  // Group by location
  const grouped = useMemo(() => {
    const filtered = filterLocId === 'all' ? photos : photos.filter(p => p.location_id === filterLocId);
    const groups = {};
    filtered.forEach(p => {
      const key = p.location_id || 'unknown';
      if (!groups[key]) groups[key] = { name: p.locations?.name || 'Unknown', photos: [] };
      groups[key].photos.push(p);
    });
    return Object.values(groups);
  }, [photos, filterLocId]);

  return (
    <>
      <Header
        title="Catch Photos"
        right={
          locations.length > 0 && (
            <select
              className="text-xs rounded-lg px-2 py-1.5"
              style={{ background: 'var(--surface2)', color: 'var(--text-muted)', border: '1px solid var(--border)', fontSize: 13 }}
              value={filterLocId}
              onChange={e => setFilterLocId(e.target.value)}
            >
              <option value="all">All lakes</option>
              {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          )
        }
      />

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-16">
            <span style={{ color: 'var(--text-muted)' }}>Loading photos...</span>
          </div>
        ) : grouped.length === 0 ? (
          <EmptyState
            icon="📷"
            title="No catch photos yet"
            message="Tap the camera button to add your first catch memory"
          />
        ) : (
          <div className="px-4 py-4 space-y-6">
            {grouped.map(group => (
              <div key={group.name}>
                <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>
                  📍 {group.name}
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {group.photos.map(photo => (
                    <button
                      key={photo.id}
                      onClick={() => setLightboxPhoto(photo)}
                      className="relative rounded-xl overflow-hidden aspect-square active:opacity-80"
                      style={{ background: 'var(--surface2)' }}
                    >
                      {photo.url ? (
                        <img
                          src={photo.url}
                          alt={photo.caption || 'Catch'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">📷</div>
                      )}
                      {/* Weight overlay */}
                      {(photo.weight_lb || photo.weight_oz) && (
                        <div
                          className="absolute bottom-0 left-0 right-0 px-1.5 py-1 text-[10px] font-bold"
                          style={{ background: 'rgba(0,0,0,0.65)', color: 'var(--accent2)' }}
                        >
                          {formatWeight(photo.weight_lb, photo.weight_oz)}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowUpload(true)}
        className="absolute bottom-20 right-4 flex items-center justify-center rounded-full shadow-lg"
        style={{
          width: 56, height: 56,
          background: 'var(--accent)',
          color: 'white',
          fontSize: 24,
          zIndex: 10,
          bottom: 'calc(72px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        📷
      </button>

      <PhotoUploadSheet
        open={showUpload}
        onClose={() => setShowUpload(false)}
        locations={locations}
        onUploaded={handleUploaded}
      />

      <PhotoLightbox
        photo={lightboxPhoto}
        onClose={() => setLightboxPhoto(null)}
      />
    </>
  );
}
