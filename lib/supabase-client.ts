import { createBrowserClient } from '@supabase/ssr'

// Browser-side Supabase client.
// Used only for onAuthStateChange listener in auth-context.
// All data fetching goes through /api/* routes — never query DB directly from browser.
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
