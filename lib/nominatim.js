// Nominatim geocoding — free OpenStreetMap geocoder.
// Rate limit: max 1 request per second. User-Agent header required by ToS.

let lastRequestTime = 0;

async function enforceRateLimit() {
  const now = Date.now();
  const gap = now - lastRequestTime;
  if (gap < 1100) {
    await new Promise(resolve => setTimeout(resolve, 1100 - gap));
  }
  lastRequestTime = Date.now();
}

/**
 * Search for UK fishing venues by name.
 * Returns array of { display_name, lat, lon, place_id, type }
 */
export async function geocodeSearch(query) {
  if (!query || query.trim().length < 2) return [];
  await enforceRateLimit();

  // UK bounding box: roughly -8,49 to 2,61
  const params = new URLSearchParams({
    q: `${query.trim()}, UK`,
    format: 'json',
    limit: '6',
    countrycodes: 'gb',
    viewbox: '-8,49,2,61',
    bounded: '1',
    addressdetails: '1',
  });

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      {
        headers: {
          'User-Agent': 'Carper/1.0 personal fishing app (https://github.com)',
          'Accept-Language': 'en-GB,en',
        },
      }
    );
    if (!res.ok) throw new Error('Nominatim error');
    return await res.json();
  } catch (e) {
    console.error('Geocode search failed:', e);
    return [];
  }
}

/**
 * Reverse geocode lat/lng to a place name.
 */
export async function reverseGeocode(lat, lng) {
  await enforceRateLimit();
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      {
        headers: {
          'User-Agent': 'Carper/1.0 personal fishing app (https://github.com)',
        },
      }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}
