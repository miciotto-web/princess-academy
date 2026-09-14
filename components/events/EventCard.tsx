"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarHeart, Clock, Check, Building2, Cake, Gem, Home, Mic, Camera, Sparkles, Wand2, Heart, Crown } from "lucide-react";
import { Reveal } from "@/components/ui/decor";
import type { Evento } from "@/types";

const ICONS: Record<string, typeof Crown> = {
  crown: Crown,
  cake: Cake,
  rings: Gem,
  building: Building2,
  home: Home,
  mic: Mic,
  camera: Camera,
  sparkles: Sparkles,
  wand: Wand2,
  heart: Heart,
};

export function EventCard({ e, index = 0 }: { e: Evento; index?: number }) {
  const Icon = ICONS[e.icone] ?? Sparkles;
  return (
    <Reveal delay={(index % 3) * 0.09}>
      <article className="card-royal flex h-full flex-col">
        {e.foto && (
          <div className="relative h-52 overflow-hidden">
            <Image
              src={e.foto}
              alt={e.titolo}
              fill
              sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
              loading="lazy"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
            <span className="absolute bottom-3 left-5 rounded-full bg-ink/55 px-3.5 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.2em] text-gold-100 backdrop-blur">
              {e.categoria}
            </span>
          </div>
        )}
        <div className={`relative bg-gradient-to-br ${e.gradiente} p-7`}>
          <div className="texture-dots absolute inset-0 opacity-25" aria-hidden />
          <div className="relative flex items-start justify-between">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-gold-300/60 bg-white/15 text-gold-100 backdrop-blur">
              <Icon size={24} aria-hidden />
            </span>
            <span className="rounded-full bg-white/15 px-3.5 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur">
              {e.categoria}
            </span>
          </div>
          <h3 className="relative mt-5 font-display text-[28px] font-bold leading-tight text-white">{e.titolo}</h3>
          <p className="relative mt-1 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.18em] text-gold-100">
            <Clock size={14} /> {e.durata}
          </p>
        </div>
        <div className="flex flex-1 flex-col p-7">
          <p className="text-[15px] leading-relaxed text-ink-soft">{e.descrizione}</p>
          <ul className="mt-4 space-y-2">
            {e.servizi.slice(0, 4).map((s) => (
              <li key={s} className="flex items-center gap-2 text-sm text-ink-soft">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-princess-50 text-princess-600 ring-1 ring-princess-100">
                  <Check size={12} />
                </span>
                {s}
              </li>
            ))}
          </ul>
          {e.prezzo && (
            <p className="mt-4 font-display text-xl font-bold italic text-princess-700">{e.prezzo}</p>
          )}
          <div className="mt-6 flex gap-2.5 pt-1">
            <Link href="/prenota" className="btn-princess flex-1 !px-4 !py-3 text-[12px]">
              <CalendarHeart size={15} /> Prenota
            </Link>
            <Link href="/contatti" className="btn-outline flex-1 !px-4 !py-3 text-[12px]">
              Scopri <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </article>
    </Reveal>
  );
}
