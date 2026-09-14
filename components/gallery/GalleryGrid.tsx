"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Camera, Expand } from "lucide-react";
import { Reveal } from "@/components/ui/decor";
import Lightbox from "@/components/gallery/Lightbox";
import type { GalleryItem } from "@/types";
import { cn } from "@/lib/utils";

const ALT = { alta: "row-span-2 min-h-[380px]", media: "min-h-[260px]", bassa: "min-h-[210px]" } as const;

export default function GalleryGrid({
  initial,
  categorie,
}: {
  initial: GalleryItem[];
  categorie: string[];
}) {
  const [filtro, setFiltro] = useState("Tutti");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const items = useMemo(
    () => (filtro === "Tutti" ? initial : initial.filter((g) => g.categoria === filtro)),
    [filtro, initial]
  );
  const reali = initial.filter((g) => g.foto).length;

  return (
    <>
      <div className="flex flex-wrap justify-center gap-2" role="tablist" aria-label="Filtra per categoria">
        {categorie.map((c) => (
          <button
            key={c}
            role="tab"
            aria-selected={filtro === c}
            onClick={() => {
              setFiltro(c);
              setLightbox(null);
            }}
            className={cn(
              "rounded-full px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.16em] transition-all",
              filtro === c
                ? "bg-princess-600 text-white shadow-royal"
                : "border border-princess-200 bg-white text-princess-700 hover:border-princess-400 hover:bg-princess-50"
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <p className="mt-6 text-center text-sm text-ink-mute" role="status">
        {items.length === 0
          ? "Non ci sono ancora fotografie in questa galleria."
          : <>{items.length} ricordi {filtro !== "Tutti" && `in “${filtro}”`}</>}
        {reali === 0 && items.length > 0 && " ✦ Segnaposto eleganti — foto reali in arrivo"}
      </p>

      {items.length === 0 && (
        <div className="mx-auto mt-8 max-w-md rounded-[2rem] border border-dashed border-gold-500/50 bg-white p-10 text-center">
          <p aria-hidden className="text-3xl text-gold-500">✦</p>
          <p className="mt-3 font-display text-2xl font-bold text-ink">La magia si sta preparando</p>
          <p className="mt-2 text-ink-soft">Torneremo presto con nuovi ricordi da favola.</p>
        </div>
      )}

      <div className="mt-8 grid row-auto grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((g, i) => (
          <Reveal key={g.id} delay={Math.min((i % 6) * 0.06, 0.3)} className={cn(g.altezza === "alta" && "row-span-2")}>
            <button
              onClick={() => setLightbox(i)}
              className={cn(
                "group relative block w-full overflow-hidden rounded-[1.6rem] border border-gold-500/25 text-left shadow-soft transition-all duration-500 hover:-translate-y-1 hover:shadow-royal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-princess-400",
                ALT[g.altezza]
              )}
              aria-label={`Apri ${g.titolo} in lightbox`}
            >
              {g.foto ? (
                <Image
                  src={g.foto}
                  alt={g.titolo}
                  fill
                  sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                  loading="lazy"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
              ) : (
                <>
                  <div className={cn("absolute inset-0 bg-gradient-to-br", g.gradiente)} />
                  <div className="texture-dots absolute inset-0 opacity-25" aria-hidden />
                  <span aria-hidden className="absolute right-6 top-5 animate-twinkle text-xl text-white/85">✦</span>
                </>
              )}
              <span
                className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent"
                aria-hidden
              />
              <span className="absolute left-5 top-5 rounded-full bg-white/15 px-3.5 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur">
                {g.categoria}
              </span>
              <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
                <span>
                  <span className="block font-display text-2xl font-bold leading-tight text-white">{g.titolo}</span>
                  <span className="mt-1 block text-[11.5px] font-semibold uppercase tracking-[0.22em] text-gold-200">
                    {g.evento}{g.data ? ` · ${g.data}` : ""}
                  </span>
                </span>
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold-300/60 bg-white/15 text-white backdrop-blur transition group-hover:bg-princess-600">
                  <Expand size={17} />
                </span>
              </span>
            </button>
          </Reveal>
        ))}
      </div>

      {reali === 0 && (
        <div className="mx-auto mt-10 flex max-w-xl items-center gap-3 rounded-3xl border border-gold-500/30 bg-white p-5 text-sm text-ink-soft shadow-golden">
          <Camera size={20} className="shrink-0 text-princess-600" />
          <p>
            Le fotografie reali saranno caricate dall&apos;area admin con titolo, descrizione, data,
            evento, categoria e ordinamento personalizzato.
          </p>
        </div>
      )}

      <Lightbox
        items={items}
        index={lightbox}
        onClose={() => setLightbox(null)}
        onNavigate={setLightbox}
      />
    </>
  );
}
