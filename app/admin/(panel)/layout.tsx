import { redirect } from "next/navigation";
import { supabaseAction } from "@/lib/supabase/action";
import { supabaseAdmin, isServiceConfigured } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import AdminNav from "@/components/admin/AdminNav";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) {
    return (
      <section className="bg-ivory-texture px-5 py-24">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-gold-500/40 bg-white p-10 text-center shadow-golden">
          <p className="eyebrow justify-center">✦ Configurazione richiesta ✦</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-ink">Collega Supabase per attivare l&apos;admin</h1>
          <ol className="mx-auto mt-6 max-w-lg space-y-3 text-left text-[15px] text-ink-soft">
            <li><strong className="text-ink">1.</strong> Crea il progetto su supabase.com ed esegui <code>supabase/schema.sql</code> nel SQL Editor.</li>
            <li><strong className="text-ink">2.</strong> Copia <code>.env.example</code> in <code>.env.local</code> e incolla URL + chiavi API.</li>
            <li><strong className="text-ink">3.</strong> Crea l&apos;utente admin (Authentication → Users) e abilitalo con la query in fondo allo schema.</li>
            <li><strong className="text-ink">4.</strong> Riavvia il server e apri <code>/admin/login</code>.</li>
          </ol>
        </div>
      </section>
    );
  }
  const supa = supabaseAction();
  const { data } = await supa.auth.getUser();
  if (!data.user) redirect("/admin/login");

  if (!isServiceConfigured()) redirect("/admin/login");
  const admin = supabaseAdmin();
  const { data: profile } = await admin
    .from("profiles")
    .select("is_admin")
    .eq("id", data.user.id)
    .single();
  if (!profile?.is_admin) redirect("/admin/login");

  return (
    <section className="bg-ivory-texture py-6 lg:py-8">
      <div className="container-royal lg:flex lg:gap-8">
        <AdminNav email={data.user.email} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </section>
  );
}
