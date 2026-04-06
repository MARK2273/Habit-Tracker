import { supabase } from './supabase';

export const runDiagnostics = async () => {
  console.log('--- Starting Supabase Diagnostics ---');
  
  // 1. Check basic fetch to Supabase URL
  try {
    const url = import.meta.env.VITE_SUPABASE_URL;
    console.log(`Checking connectivity to: ${url}`);
    const response = await fetch(`${url}/rest/v1/`, {
      headers: {
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
      }
    });
    console.log(`Connection Status: ${response.status} ${response.statusText}`);
  } catch (err: any) {
    console.error('CRITICAL: Failed to reach Supabase server.', err);
    if (err.message === 'Failed to fetch') {
      console.warn('Possible causes: Ad-blocker, No Internet, or CORS block.');
    }
  }

  // 2. Check Auth service specifically
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Auth check failed:', error.message);
    } else {
      console.log('Session check completed. Active session:', !!session);
    }
  } catch (err) {
    console.error('Auth service unreachable:', err);
  }

  console.log('--- Diagnostics Finished ---');
};
