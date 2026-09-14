import { supabaseAction } from "@/lib/supabase/action";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AdminHeader, AdminCard } from "@/components/admin/ui";
import UsersManager from "@/components/admin/UsersManager";

export const metadata = { title: "Utenti" };
export const dynamic = "force-dynamic";

export default async function AdminUtentiPage() {
  const supa = supabaseAction();
  const { data: me } = await supa.auth.getUser();
  const admin = supabaseAdmin();
  const { data } = await admin.from("profiles").select("*").order("created_at", { ascending: false });

  return (
    <div>
      <AdminHeader
        eyebrow="Accessi"
        title="Utenti admin"
        intro="Promuovi o revoca amministratori, rimuovi accessi. Non puoi modificare il tuo stesso account."
      />
      <AdminCard>
        <p className="text-sm leading-relaxed text-ink-soft">
          Per aggiungere una persona: falla accedere una volta con il suo account Supabase
          (creato in Authentication → Users), poi promuovila qui a “admin”.
        </p>
      </AdminCard>
      <UsersManager initial={(data ?? []) as never} selfId={me.user?.id ?? ""} />
    </div>
  );
}
