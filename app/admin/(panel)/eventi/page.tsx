import { supabaseAdmin } from "@/lib/supabase/admin";
import { AdminHeader } from "@/components/admin/ui";
import EventManager from "@/components/admin/EventManager";
import SearchInput from "@/components/admin/SearchInput";

export const metadata = { title: "Eventi" };
export const dynamic = "force-dynamic";

export default async function AdminEventiPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = (searchParams.q ?? "").trim();
  const admin = supabaseAdmin();

  let eventsQuery = admin
    .from("events")
    .select("*, event_categories(name)")
    .order("display_order");
  if (q) {
    eventsQuery = eventsQuery.or(
      [
        `title.ilike.%${q}%`,
        `description.ilike.%${q}%`,
        `information.ilike.%${q}%`,
        `event_categories.name.ilike.%${q}%`,
      ].join(",")
    );
  }

  const [events, cats] = await Promise.all([
    eventsQuery,
    admin.from("event_categories").select("*").order("display_order"),
  ]);

  return (
    <div>
      <AdminHeader eyebrow="Esperienze" title="Eventi" intro="CRUD completo + categorie. Solo gli eventi pubblicati appaiono in /eventi." />
      <div className="mt-6">
        <SearchInput placeholder="Cerca per titolo, descrizione, dettagli o categoria..." className="max-w-sm" />
      </div>
      <div className="mt-4">
        <EventManager initial={(events.data ?? []) as never} cats={(cats.data ?? []) as never} />
      </div>
    </div>
  );
}
