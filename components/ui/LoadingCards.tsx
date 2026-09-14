export default function LoadingCards({ righe = "Prime stelle in arrivo…" }: { righe?: string }) {
  return (
    <div className="container-royal py-16" aria-busy="true" aria-label="Caricamento contenuti">
      <div className="mx-auto max-w-md rounded-full border border-gold-500/30 bg-gold-50 px-6 py-3 text-center text-sm text-ink-soft">
        <span className="mr-2 inline-block animate-twinkle text-gold-600">✦</span>
        {righe}
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="animate-pulse overflow-hidden rounded-[1.75rem] border border-ink/10 bg-white">
            <div className="h-52 bg-gradient-to-br from-princess-100 via-blush to-gold-100" />
            <div className="space-y-3 p-6">
              <div className="h-5 w-2/3 rounded-full bg-ink/10" />
              <div className="h-4 w-full rounded-full bg-ink/5" />
              <div className="h-4 w-5/6 rounded-full bg-ink/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
