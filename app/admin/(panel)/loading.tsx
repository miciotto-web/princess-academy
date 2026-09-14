/**
 * Loading UI per l'area admin (route group app/admin/(panel)/).
 *
 * Viene mostrata automaticamente da Next.js durante il caricamento
 * di qualsiasi sottopagina forzata dynamic.
 *
 * Lo skeleton riproduce la struttura tipica delle pagine admin:
 * header (eyebrow + titolo + intro), barra ricerca e un pannello
 * con alcune righe placeholder.
 */

function Bar({ className }: { className?: string }) {
  return <div className={"h-3.5 animate-pulse rounded-full bg-ink/10 " + (className ?? "")} aria-hidden />;
}

export default function AdminLoading() {
  return (
    <div aria-busy="true" aria-live="polite">
      {/* Header: eyebrow + titolo + intro */}
      <div>
        <Bar className="h-3 w-28 bg-gold-500/30" />
        <Bar className="mt-3 h-8 w-56 bg-ink/15 sm:h-9" />
        <Bar className="mt-2.5 h-3 w-full max-w-xl bg-ink/10" />
      </div>

      {/* Barra ricerca */}
      <div className="mt-6 h-11 w-full max-w-sm animate-pulse rounded-full border border-ink/10 bg-ink/5" aria-hidden />

      {/* Pannello principale */}
      <div className="mt-4 rounded-[1.75rem] border border-ink/10 bg-white p-6 shadow-soft sm:p-7">
        <div className="grid gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-2xl border border-ink/5 bg-ivory/50 p-4"
              aria-hidden
            >
              {/* Thumbnail / icona */}
              <div className="h-12 w-12 shrink-0 animate-pulse rounded-2xl bg-ink/10" />
              {/* Testi */}
              <div className="min-w-0 flex-1 grid gap-2">
                <Bar className="h-3.5 w-2/5" />
                <Bar className="h-3 w-3/5 bg-ink/5" />
              </div>
              {/* Azioni */}
              <div className="flex shrink-0 items-center gap-2">
                <div className="h-9 w-9 animate-pulse rounded-full bg-ink/10" />
                <div className="h-9 w-9 animate-pulse rounded-full bg-ink/10" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Screen-reader only */}
      <span className="sr-only">Caricamento sezione admin…</span>
    </div>
  );
}
