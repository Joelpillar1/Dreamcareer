import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 
  import.meta.env?.VITE_SUPABASE_URL || 
  import.meta.env?.SUPABASE_URL ||
  'https://bafwkfxkyvnjzieonqwd.supabase.co';

export const SUPABASE_ANON_KEY = 
  import.meta.env?.VITE_SUPABASE_ANON_KEY || 
  import.meta.env?.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhZndrZnhreXZuanppZW9ucXdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ5MDUwMTcsImV4cCI6MjExMDQ4MTAxN30.TbWWEQm2hLWvnFItvBYhsszhojWVxbU9uHNuvGQ0uRU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
