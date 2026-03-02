import { createClient } from '@supabase/supabase-js';

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Strip whitespace from environment variables
if (supabaseUrl) supabaseUrl = supabaseUrl.trim();
if (supabaseAnonKey) supabaseAnonKey = supabaseAnonKey.trim();

// Debug logging
if (typeof window !== 'undefined') {
  console.log('Supabase URL:', supabaseUrl ? '✓ set' : '✗ NOT set');
  console.log('Supabase Key:', supabaseAnonKey ? '✓ set' : '✗ NOT set');
  if (supabaseAnonKey) {
    console.log('Key length:', supabaseAnonKey.length);
    console.log('Key starts with:', supabaseAnonKey.substring(0, 20) + '...');
    console.log('Key ends with:', '...' + supabaseAnonKey.substring(supabaseAnonKey.length - 20));
  }
}

// Singleton client — safe to import anywhere
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Test query on init
if (typeof window !== 'undefined' && supabase) {
  supabase
    .from('categories')
    .select('*')
    .limit(1)
    .then((res) => {
      if (res.error) {
        console.error('Supabase test query failed:', res.error.message);
      } else {
        console.log('✓ Supabase connection successful!', res.data?.length, 'rows');
      }
    })
    .catch((err) => console.error('Supabase test query error:', err));
}
