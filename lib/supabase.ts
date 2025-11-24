import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMsg = 'Missing Supabase environment variables. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel.';
  console.error('Missing Supabase environment variables:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    url: supabaseUrl ? 'Set' : 'Missing',
    key: supabaseAnonKey ? 'Set' : 'Missing',
  });
  
  // In development, show a more visible error
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.error(errorMsg);
  }
}

// Validate that URLs are valid
if (supabaseUrl && !supabaseUrl.startsWith('http')) {
  console.error('Invalid NEXT_PUBLIC_SUPABASE_URL. Must start with http:// or https://');
}

export const supabase = createBrowserClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);
