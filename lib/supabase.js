import { createClient } from '@supabase/supabase-js';

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Strip whitespace from environment variables (in case of formatting issues)
if (supabaseUrl) supabaseUrl = supabaseUrl.trim();
if (supabaseAnonKey) supabaseAnonKey = supabaseAnonKey.trim();

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

