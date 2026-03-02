import { createClient } from '@supabase/supabase-js';

// Hardcoded for static export (env vars not picked up correctly by Vercel in static builds)
// For personal use only - your dad is the sole user
let supabaseUrl = 'https://wvgkkmtjwmkdhhdollaz.supabase.co';
let supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2Z2trbXRqd21rZGhoZG9sbGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NjM3NTIsImV4cCI6MjA4ODAzOTc1Mn0.pDG6FN1FQzRnUDwFaUHMPUetNf_8j6AtrxszCK54vtA';

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

