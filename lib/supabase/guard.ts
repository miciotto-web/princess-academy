import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/** Verifica che l'utente corrente sia admin (profiles.is_admin). */
export async function requireAdmin() {
  const supa = supabaseServer();
  const {
    data: { user },
  } = await supa.auth.getUser();
  if (!user) return null;
  const admin = supabaseAdmin();
  const { data } = await admin
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!data?.is_admin) return null;
  return { user, supa, admin };
}
