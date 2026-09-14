"use server";

import { redirect } from "next/navigation";
import { supabaseAction } from "@/lib/supabase/action";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { supabaseAdmin, isServiceConfigured } from "@/lib/supabase/admin";

export async function adminLogin(_prev: { error?: string } | null, formData: FormData) {
  if (!isSupabaseConfigured()) return { error: "Supabase non configurato: compila .env.local (vedi .env.example)." };
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Inserisci email e password." };

  const supa = supabaseAction();
  const { error } = await supa.auth.signInWithPassword({ email, password });
  if (error) return { error: "Credenziali non valide o utente inesistente." };

  // bootstrap profilo + verifica ruolo admin
  if (isServiceConfigured()) {
    const admin = supabaseAdmin();
    const { data: user } = await supa.auth.getUser();
    if (user.user) {
      const upsertRes = await admin.from("profiles").upsert(
        { id: user.user.id, email: user.user.email },
        { onConflict: "id", ignoreDuplicates: false }
      );
      console.error("[ADMIN LOGIN UPSERT DIAG]", {
        userId: user.user.id,
        userEmail: user.user.email,
        upsertErrorCode: upsertRes.error?.code,
        upsertErrorMessage: upsertRes.error?.message,
        upsertErrorDetails: upsertRes.error?.details,
        upsertErrorHint: upsertRes.error?.hint,
        upsertStatus: upsertRes.status,
        upsertStatusText: upsertRes.statusText,
      });
      const { data: profile } = await admin
        .from("profiles")
        .select("is_admin")
        .eq("id", user.user.id)
        .single();
      if (!profile?.is_admin) {
        await supa.auth.signOut();
        return { error: "Account esistente ma non autorizzato come amministratore. Contatta la proprietaria." };
      }
    }
  }
  redirect("/admin");
}

export async function adminLogout() {
  if (!isSupabaseConfigured()) redirect("/admin/login");
  const supa = supabaseAction();
  await supa.auth.signOut();
  redirect("/admin/login");
}
