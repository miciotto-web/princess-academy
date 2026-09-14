import { createClient } from "@supabase/supabase-js";

/**
 * Client service-role: SOLO lato server (Server Actions / Route).
 * Bypassa RLS — usarlo solo dopo aver verificato che l'utente è admin.
 */
export function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export function isServiceConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
