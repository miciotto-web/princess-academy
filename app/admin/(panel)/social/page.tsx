import { supabaseAdmin } from "@/lib/supabase/admin";
import { AdminHeader } from "@/components/admin/ui";
import SocialManager from "@/components/admin/SocialManager";

export const metadata = { title: "Social" };
export const dynamic = "force-dynamic";

export default async function AdminSocialPage() {
  const admin = supabaseAdmin();
  const { data } = await admin.from("social_links").select("*").order("display_order");

  return (
    <div>
      <AdminHeader eyebrow="Community" title="Social" intro="Crea, modifica, elimina, riordina con il campo ordine, attiva o disattiva ogni canale." />
      <div className="mt-6">
        <SocialManager initial={(data ?? []) as never} />
      </div>
    </div>
  );
}
