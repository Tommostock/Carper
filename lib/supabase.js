import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Debug logging
if (typeof window !== 'undefined') {
  console.log('Supabase URL:', supabaseUrl ? '✓ set' : '✗ NOT set');
  console.log('Supabase Key:', supabaseAnonKey ? '✓ set' : '✗ NOT set');
}

// Singleton client — safe to import anywhere
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);
