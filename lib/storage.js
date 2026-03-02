// localStorage hybrid helpers — same pattern as Whisker Watch.
// Writes happen immediately to localStorage (sync), then async to Supabase.
// On load: try Supabase first, fall back to localStorage.

const KEYS = {
  items:      'carper_items',
  categories: 'carper_categories',
  locations:  'carper_locations',
  shopping:   'carper_shopping',
};

export function saveLocal(key, data) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEYS[key] || key, JSON.stringify(data));
  } catch (e) {
    console.warn('localStorage write failed:', e);
  }
}

export function loadLocal(key) {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEYS[key] || key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function clearLocal(key) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(KEYS[key] || key);
  } catch (e) {
    // ignore
  }
}
