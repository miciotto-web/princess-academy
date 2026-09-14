import { supabaseAdmin } from "@/lib/supabase/admin";
import { AdminHeader } from "@/components/admin/ui";
import TimelineManager from "@/components/admin/TimelineManager";

export const metadata = { title: "Storia" };
export const dynamic = "force-dynamic";

export default async function AdminStoriaPage() {
  const admin = supabaseAdmin();
  const { data } = await admin.from("timeline").select("*").order("display_order");

  return (
    <div>
      <AdminHeader eyebrow="Timeline" title="Storia" intro="Crea, modifica, elimina, riordina con le frecce. Solo le tappe pubblicate appaiono in /storia." />
      <div className="mt-6">
        <TimelineManager initial={(data ?? []) as never} />
      </div>
    </div>
  );
}
