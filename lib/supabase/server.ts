import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/** Client per Server Components / Route Handlers (rispetta RLS dell'utente). */
export function supabaseServer() {
  const store = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: () => {
          /* in Server Component la scrittura cookie non è permessa: no-op */
        },
      },
    }
  );
}

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
