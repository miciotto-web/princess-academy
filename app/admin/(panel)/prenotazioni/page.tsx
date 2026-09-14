import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AdminHeader } from "@/components/admin/ui";
import BookingCard from "@/components/admin/BookingCard";
import SearchInput from "@/components/admin/SearchInput";
import { BOOKING_STATUS } from "@/types/db";
import { cn } from "@/lib/utils";

export const metadata = { title: "Prenotazioni" };
export const dynamic = "force-dynamic";

const FILTRI = ["TUTTE", ...BOOKING_STATUS] as const;
const PAGE_SIZE = 20;

/**
 * Sanitizza il termine di ricerca per l'espressione PostgREST `or(...)`:
 * virgole e parentesi romperebbero la sintassi dei filtri, `%` e `_`
 * verrebbero interpretati come wildcard ilike. Sostituiti con spazi
 * (separano i termini, la ricerca resta leggibile).
 */
function safeIlike(q: string): string {
  return q.replace(/[,()%_]/g, " ").trim();
}

export default async function AdminPrenotazioniPage({
  searchParams,
}: {
  searchParams: { stato?: string; q?: string; page?: string };
}) {
  const filtro = (searchParams.stato ?? "TUTTE").toUpperCase();
  const statoAttivo =
    filtro !== "TUTTE" && (BOOKING_STATUS as readonly string[]).includes(filtro) ? filtro : "TUTTE";
  const q = (searchParams.q ?? "").trim();
  const admin = supabaseAdmin();

  // Costruisce la query lista con stato + ricerca (pattern Galleria: count "exact" + range).
  // Con count "exact" PostgREST restituisce il totale delle righe filtrate,
  // indipendentemente dal range: quel numero è il "di N" della paginazione.
  const buildQuery = (from: number) => {
    let query = admin
      .from("bookings")
      .select("*, princesses(name)", { count: "exact" })
      .order("created_at", { ascending: false });
    if (statoAttivo !== "TUTTE") {
      query = query.eq("status", statoAttivo);
    }
    const safeQ = q ? safeIlike(q) : "";
    if (safeQ) {
      query = query.or(
        [
          `first_name.ilike.%${safeQ}%`,
          `last_name.ilike.%${safeQ}%`,
          `email.ilike.%${safeQ}%`,
          `phone.ilike.%${safeQ}%`,
          `location.ilike.%${safeQ}%`,
          `message.ilike.%${safeQ}%`,
        ].join(",")
      );
    }
    return query.range(from, from + PAGE_SIZE - 1);
  };

  const rawPage = Math.max(1, Number(searchParams.page) || 1);
  const [{ data, count, error }, { data: all, error: countsError }] = await Promise.all([
    buildQuery((rawPage - 1) * PAGE_SIZE),
    // Conteggi per stato: sempre sul totale, mai sulla pagina corrente.
    admin.from("bookings").select("status"),
  ]);
  // Errore contatori non bloccante: i tab restano visibili senza numero.
  const counts: Record<string, number> = {};
  (all ?? []).forEach((b) => {
    counts[b.status] = (counts[b.status] ?? 0) + 1;
  });
  const totale = (all ?? []).length;

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Se la pagina richiesta è fuori range e ci sono dati, riprendi l'ultima pagina valida.
  let page = Math.min(rawPage, totalPages);
  let items = data ?? [];
  if (!error && items.length === 0 && rawPage > totalPages && total > 0) {
    const { data: retry } = await buildQuery((page - 1) * PAGE_SIZE);
    items = retry ?? [];
  }

  // URL condiviso da tab e paginazione: conserva sempre q + stato;
  // omette i parametri vuoti/di default (pattern GalleryManager.filterUrl).
  const url = (stato: string, nextQ: string, nextPage: number) => {
    const params = new URLSearchParams();
    if (stato !== "TUTTE") params.set("stato", stato);
    if (nextQ) params.set("q", nextQ);
    if (nextPage > 1) params.set("page", String(nextPage));
    const qs = params.toString();
    return qs ? `/admin/prenotazioni?${qs}` : "/admin/prenotazioni";
  };

  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  const pagerBtn =
    "inline-flex items-center gap-1.5 rounded-full border border-princess-200 px-4 py-2 text-[12px] font-bold uppercase tracking-[0.12em] text-princess-700 transition hover:bg-princess-50";

  return (
    <div>
      <AdminHeader
        eyebrow="Richieste"
        title="Prenotazioni"
        intro="Stato iniziale sempre NUOVA. Apri una richiesta per dati cliente, evento, Princess, messaggio, note e cambio stato."
      />
      <div className="mt-6">
        <SearchInput placeholder="Cerca per nome, email, telefono, luogo o messaggio..." className="max-w-sm" />
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Filtra per stato">
        {FILTRI.map((f) => (
          <Link
            key={f}
            href={url(f, q, 1)}
            role="tab"
            aria-selected={statoAttivo === f}
            className={cn(
              "rounded-full px-4 py-2 text-[12px] font-bold uppercase tracking-[0.14em] transition",
              statoAttivo === f
                ? "bg-princess-600 text-white shadow-royal"
                : "border border-princess-200 bg-white text-princess-700 hover:bg-princess-50"
            )}
          >
            {f === "TUTTE"
              ? `Tutte${countsError ? "" : ` (${totale})`}`
              : `${f}${countsError ? "" : ` (${counts[f] ?? 0})`}`}
          </Link>
        ))}
      </div>

      {error && (
        <p
          className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-6 text-center font-semibold text-red-700"
          role="alert"
        >
          Impossibile caricare le prenotazioni. Riprova tra poco o contatta il supporto tecnico.
        </p>
      )}

      {!error && (
        <>
          <ul className="mt-6 space-y-4">
            {items.map((b) => (
              <BookingCard key={b.id} b={b as never} />
            ))}
          </ul>
          {items.length === 0 && (
            <p className="mt-6 rounded-3xl border border-dashed border-gold-500/50 bg-white p-8 text-center text-ink-soft">
              {totale === 0
                ? "Nessuna richiesta ancora: condividi il form /prenota sul sito."
                : q
                  ? `Nessuna richiesta trovata per &quot;${q}&quot;${statoAttivo !== "TUTTE" ? ` con stato &quot;${statoAttivo}&quot;` : ""}.`
                  : `Nessuna richiesta con stato &quot;${statoAttivo}&quot;.`}
            </p>
          )}
        </>
      )}

      {!error && total > PAGE_SIZE && (
        <nav className="mt-6 flex flex-wrap items-center justify-between gap-3" aria-label="Paginazione prenotazioni">
          <Link
            href={url(statoAttivo, q, page - 1)}
            aria-disabled={page <= 1}
            className={cn(pagerBtn, page <= 1 && "pointer-events-none opacity-40")}
          >
            ← Precedente
          </Link>
          <span className="text-sm font-medium text-ink-mute">
            {rangeStart}–{rangeEnd} di {total}
          </span>
          <Link
            href={url(statoAttivo, q, page + 1)}
            aria-disabled={page >= totalPages}
            className={cn(pagerBtn, page >= totalPages && "pointer-events-none opacity-40")}
          >
            Successiva →
          </Link>
        </nav>
      )}
    </div>
  );
}
