import { createClient } from '@supabase/supabase-js';

// Temporary: hardcode credentials to test if env var reading is the issue
let supabaseUrl = 'https://wvgkkmtjwmkdhhdollaz.supabase.co';
let supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2Z2trbXRqd21rZGhoZG9sbGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NjM3NTIsImV4cCI6MjA4ODAzOXc1Mn0.pDG6FN1FQzRnUDwFaUHMPUetNf_8j6AtrxszCK54vtA';

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
// Redeploy trigger
// Redeploy with corrected Supabase credentials
