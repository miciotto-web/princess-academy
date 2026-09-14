"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Crown } from "lucide-react";
import { Reveal } from "@/components/ui/decor";
import type { Princess } from "@/types";

export function PrincessCard({ p, index = 0 }: { p: Princess; index?: number }) {
  return (
    <Reveal delay={(index % 4) * 0.08}>
      <article className="card-royal group h-full">
        <div className="relative overflow-hidden">
          <div
            className="relative flex h-80 items-center justify-center overflow-hidden transition-transform duration-700 group-hover:scale-[1.04]"
            style={{ background: `linear-gradient(150deg, ${p.colori.from}, ${p.colori.to})` }}
          >
            {p.foto ? (
              <Image
                src={p.foto}
                alt={`Ritratto di ${p.nome}`}
                fill
                sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
                loading="lazy"
                className="object-cover"
              />
            ) : (
              <span role="img" aria-label={`Ritratto placeholder di ${p.nome}`} className="relative flex h-full w-full items-center justify-center">
                <span className="texture-dots absolute inset-0 opacity-30" aria-hidden />
                <span aria-hidden className="absolute left-6 top-5 animate-twinkle text-xl text-white/90">✦</span>
                <span aria-hidden className="absolute bottom-8 right-7 animate-twinkle text-sm text-gold-100" style={{ animationDelay: "1.3s" }}>✦</span>
                <span className="relative flex h-36 w-36 items-center justify-center rounded-full border-4 border-gold-300/80 bg-white/15 font-display text-7xl font-bold text-white backdrop-blur-sm">
                  {p.iniziale}
                </span>
              </span>
            )}
          </div>
          <span className="absolute left-5 top-5 rounded-full border border-gold-300/60 bg-ink/45 px-4 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.22em] text-gold-100 backdrop-blur">
            {p.personaggio}
          </span>
          {p.demo && (
            <span className="absolute right-5 top-5 rounded-full bg-white/90 px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.18em] text-princess-700">
              Demo
            </span>
          )}
        </div>
        <div className="p-7 text-center">
          <Crown size={18} className="mx-auto text-gold-500" aria-hidden />
          <h3 className="mt-2 font-display text-3xl font-bold text-ink">{p.nome}</h3>
          <p className="mt-1 text-[11.5px] font-bold uppercase tracking-[0.24em] text-princess-600">{p.ruolo}</p>
          <div className="mx-auto mt-4 h-px w-16 bg-gradient-to-r from-transparent via-gold-500 to-transparent" />
          <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">{p.descrizione}</p>
          <Link
            href={`/princess/${p.slug}`}
            className="btn-outline mt-6 w-full"
            aria-label={`Scopri la storia di ${p.nome}`}
          >
            Scopri la sua storia <ArrowRight size={15} />
          </Link>
        </div>
      </article>
    </Reveal>
  );
}
