import { supabaseAdmin } from "@/lib/supabase/admin";
import { AdminHeader } from "@/components/admin/ui";
import GalleryManager from "@/components/admin/GalleryManager";

export const metadata = { title: "Galleria" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;

export default async function AdminGalleriaPage({
  searchParams,
}: {
  searchParams: { page?: string; cat?: string; ev?: string; q?: string };
}) {
  const rawPage = Math.max(1, Number(searchParams.page) || 1);
  const cat = searchParams.cat ?? "";
  const ev = searchParams.ev ?? "";
  const q = (searchParams.q ?? "").trim();

  const admin = supabaseAdmin();

  // Costruisce la query con filtri opzionali
  const buildQuery = (offset: number) => {
    let query = admin
      .from("gallery")
      .select("*, gallery_categories(name)", { count: "exact" })
      .order("display_order")
      .range(offset, offset + PAGE_SIZE - 1);
    if (cat) query = query.eq("category_id", cat);
    if (ev) query = query.eq("event_id", ev);
    if (q) {
      query = query.or(
        [`title.ilike.%${q}%`, `description.ilike.%${q}%`].join(",")
      );
    }
    return query;
  };

  const [{ data: galleryData, count: total }, cats, events] = await Promise.all([
    buildQuery((rawPage - 1) * PAGE_SIZE),
    admin.from("gallery_categories").select("id,name").order("display_order"),
    admin.from("events").select("id,title").order("title"),
  ]);

  const totalCount = total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Se la pagina richiesta è fuori range e ci sono dati, riprendi l'ultima pagina valida
  let page = rawPage;
  let items = galleryData ?? [];
  if (items.length === 0 && rawPage > 1 && totalCount > 0) {
    page = totalPages;
    const { data } = await buildQuery((page - 1) * PAGE_SIZE);
    items = data ?? [];
  }

  return (
    <div>
      <AdminHeader
        eyebrow="Ricordi di luce"
        title="Galleria"
        intro="Upload multiplo con drag & drop su Supabase Storage. Riordina, modifica, cambia categoria o evento, nascondi."
      />
      <div className="mt-6">
        <GalleryManager
          initial={items as never}
          total={totalCount}
          page={page}
          cat={cat}
          ev={ev}
          q={q}
          pageSize={PAGE_SIZE}
          cats={(cats.data ?? []) as never}
          events={(events.data ?? []) as never}
        />
      </div>
    </div>
  );
}
