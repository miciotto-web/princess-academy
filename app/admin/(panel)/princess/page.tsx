import { supabaseAdmin } from "@/lib/supabase/admin";
import { AdminHeader } from "@/components/admin/ui";
import PrincessManager from "@/components/admin/PrincessManager";
import SearchInput from "@/components/admin/SearchInput";

export const metadata = { title: "Princess" };
export const dynamic = "force-dynamic";

export default async function AdminPrincessPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = (searchParams.q ?? "").trim();
  const admin = supabaseAdmin();

  let query = admin
    .from("princesses")
    .select("*, princess_images(id,file_url,title)")
    .order("display_order", { ascending: true });
  if (q) {
    query = query.or(
      [
        `name.ilike.%${q}%`,
        `character_name.ilike.%${q}%`,
        `slug.ilike.%${q}%`,
        `description.ilike.%${q}%`,
        `biography.ilike.%${q}%`,
      ].join(",")
    );
  }
  const { data } = await query;

  return (
    <div>
      <AdminHeader
        eyebrow="Il cast"
        title="Princess"
        intro="Crea, modifica, elimina, pubblica o nascondi. L'ordine decide la posizione nel sito."
      />
      <div className="mt-6">
        <SearchInput placeholder="Cerca per nome, personaggio, slug o descrizione..." className="max-w-sm" />
      </div>
      <div className="mt-4">
        <PrincessManager initial={(data ?? []) as never} />
      </div>
    </div>
  );
}
