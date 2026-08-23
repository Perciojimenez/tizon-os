import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gfrfnnlasgepepocjddu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_oHJGzVkRIj6t9rjzSjT1Pw_zVmPSonG';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
});
