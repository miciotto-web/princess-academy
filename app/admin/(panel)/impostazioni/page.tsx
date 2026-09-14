import { supabaseAdmin } from "@/lib/supabase/admin";
import { AdminHeader } from "@/components/admin/ui";
import SettingsManager from "@/components/admin/SettingsManager";

export const metadata = { title: "Impostazioni" };
export const dynamic = "force-dynamic";

export default async function AdminImpostazioniPage() {
  const admin = supabaseAdmin();
  const { data } = await admin.from("site_settings").select("*").order("key");

  return (
    <div>
      <AdminHeader
        eyebrow="Coordinate"
        title="Impostazioni"
        intro="Email, telefono, WhatsApp, indirizzo e orari mostrati in Contatti e Footer."
      />
      <div className="mt-6">
        <SettingsManager initial={(data ?? []) as never} />
      </div>
    </div>
  );
}
