'use client';

import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useLocations } from '../../lib/context/LocationsContext';
import MapSearch from './MapSearch';
import SaveLocationSheet from './SaveLocationSheet';
import LocationListDrawer from './LocationListDrawer';

// Map centred on Essex/East London — primary fishing area
const DEFAULT_CENTER = [51.55, 0.15];
const DEFAULT_ZOOM = 9;

export default function MapPage() {
  const mapRef    = useRef(null);
  const leafletRef = useRef(null);
  const markersRef = useRef({});

  const { locations, addLocation, toggleFavourite } = useLocations();
  const [saveSheet, setSaveSheet]   = useState({ open: false, prefill: null });
  const [listOpen, setListOpen]     = useState(false);
  const [mapReady, setMapReady]     = useState(false);

  // Initialise Leaflet once
  useEffect(() => {
    if (leafletRef.current) return;
    const L = require('leaflet');

    const map = L.map(mapRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    // Tap on map → offer to save location
    map.on('click', (e) => {
      setSaveSheet({ open: true, prefill: { lat: e.latlng.lat, lng: e.latlng.lng } });
    });

    leafletRef.current = map;
    setMapReady(true);

    return () => {
      map.remove();
      leafletRef.current = null;
    };
  }, []);

  // Create a custom pin icon
  const makeIcon = useCallback((isFavourite) => {
    const L = require('leaflet');
    const color = isFavourite ? '#f4c430' : '#2d9d6e';
    return L.divIcon({
      className: '',
      html: `<div style="
        width:28px;height:28px;
        background:${color};
        border:3px solid white;
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        box-shadow:0 2px 8px rgba(0,0,0,0.5);
      "></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
      popupAnchor: [0, -30],
    });
  }, []);

  // Sync markers when locations change
  useEffect(() => {
    if (!mapReady || !leafletRef.current) return;
    const L = require('leaflet');
    const map = leafletRef.current;

    // Remove old markers
    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};

    // Add markers for all locations
    locations.forEach(loc => {
      const marker = L.marker([loc.lat, loc.lng], { icon: makeIcon(loc.is_favourite) })
        .addTo(map)
        .bindPopup(`
          <div style="min-width:160px">
            <strong style="font-size:14px">${loc.name}</strong>
            ${loc.area ? `<br><span style="font-size:12px;color:#9ca3af">${loc.area} · ${loc.type}</span>` : ''}
            ${loc.notes ? `<br><span style="font-size:12px;color:#9ca3af;margin-top:4px;display:block">${loc.notes}</span>` : ''}
            <div style="margin-top:8px;display:flex;gap:8px;align-items:center">
              <span style="font-size:18px;cursor:pointer" onclick="window._carperFav('${loc.id}')">${loc.is_favourite ? '★' : '☆'}</span>
            </div>
          </div>
        `);
      markersRef.current[loc.id] = marker;
    });

    // Global handler for favourite toggle from popup
    window._carperFav = (id) => toggleFavourite(id);

    return () => { delete window._carperFav; };
  }, [locations, mapReady, makeIcon, toggleFavourite]);

  // Pan to a location from search or list
  const panTo = useCallback((loc) => {
    if (!leafletRef.current) return;
    leafletRef.current.flyTo([loc.lat, loc.lng], 13, { duration: 1.2 });
    // Open its popup if it has a marker
    if (loc.id && markersRef.current[loc.id]) {
      markersRef.current[loc.id].openPopup();
    }
  }, []);

  // Search result selected → prefill save sheet
  function handleSearchSelect(result) {
    setSaveSheet({ open: true, prefill: result });
    if (leafletRef.current) {
      leafletRef.current.flyTo([result.lat, result.lng], 13, { duration: 1.2 });
    }
  }

  return (
    <>
      <MapSearch onSelect={handleSearchSelect} />

      {/* Map fills remaining space */}
      <div ref={mapRef} className="flex-1" style={{ zIndex: 0 }} />

      {/* FAB buttons */}
      <div className="absolute bottom-20 right-4 flex flex-col gap-2" style={{ zIndex: 10 }}>
        <button
          onClick={() => setListOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-medium text-sm shadow-lg"
          style={{ background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)' }}
        >
          ☰ Locations
        </button>
      </div>

      <SaveLocationSheet
        open={saveSheet.open}
        onClose={() => setSaveSheet({ open: false, prefill: null })}
        prefill={saveSheet.prefill}
        onSave={addLocation}
      />

      <LocationListDrawer
        open={listOpen}
        onClose={() => setListOpen(false)}
        onLocSelect={panTo}
      />
    </>
  );
}
