import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://gfrfnnlasgepepocjddu.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseServiceRoleKey) {
  console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY no definida. Auth deshabilitada.');
}

/**
 * Cliente Supabase con service_role key.
 * Usado por el backend para leer/escribir sin restricciones de RLS.
 */
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: false,
    },
  }
);

/**
 * Devuelve un cliente Supabase configurado con el token de usuario.
 * Usado para operaciones que respetan RLS.
 */
export function createSupabaseClient(userToken?: string) {
  const anonKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_oHJGzVkRIj6t9rjzSjT1Pw_zVmPSonG';
  
  const client = createClient(supabaseUrl, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  if (userToken) {
    client.auth.setSession({
      access_token: userToken,
      refresh_token: '',
      user: null,
    } as any);
  }

  return client;
}
