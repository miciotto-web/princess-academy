import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarHeart, Crown, Instagram, Music2, Sparkles, ArrowRight } from "lucide-react";
import { getPrincess, getPrincesses } from "@/lib/queries";
import { Reveal } from "@/components/ui/decor";
import { PrincessCard } from "@/components/princess/PrincessCard";

export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = await getPrincess(params.slug);
  return {
    title: p ? `${p.nome} — ${p.personaggio}` : "Princess",
    description: p?.descrizione ?? "Profilo Princess di Princess Academy.",
    alternates: { canonical: `/princess/${params.slug}` },
    openGraph: p
      ? {
          title: `${p.nome} — ${p.personaggio} | Princess Academy`,
          description: p.descrizione,
          images: [p.foto ?? "/logo.png"],
        }
      : undefined,
  };
}

export default async function PrincessDetailPage({ params }: { params: { slug: string } }) {
  const p = await getPrincess(params.slug);
  if (!p) notFound();
  const tutte = await getPrincesses();
  const altre = tutte.filter((x) => x.slug !== p.slug).slice(0, 3);

  return (
    <>
      <section className="relative overflow-hidden hero-bg pb-14 pt-32 sm:pt-40">
        <div className="texture-dots absolute inset-0 opacity-40" aria-hidden />
        <div className="container-royal relative">
          <Link href="/princess" className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.18em] text-white/90 backdrop-blur transition hover:bg-white hover:text-princess-700">
            <ArrowLeft size={15} /> Tutte le Princess
          </Link>
          <div className="mt-8 grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <Reveal>
              <div className="gold-frame !border-gold-300/60">
                <div
                  className="relative flex h-[420px] items-center justify-center overflow-hidden rounded-[1.4rem]"
                  style={{ background: `linear-gradient(160deg, ${p.colori.from}, ${p.colori.to})` }}
                >
                  {p.foto ? (
                    <Image src={p.foto} alt={`Ritratto di ${p.nome}`} fill sizes="(max-width:1024px) 100vw, 45vw" className="object-cover" priority />
                  ) : (
                    <>
                      <div className="texture-dots absolute inset-0 opacity-30" aria-hidden />
                      <span aria-hidden className="absolute left-8 top-6 animate-twinkle text-2xl text-white">✦</span>
                      <span aria-hidden className="absolute bottom-10 right-8 animate-twinkle text-lg text-gold-100" style={{ animationDelay: "1.4s" }}>✦</span>
                      <span className="flex h-52 w-52 items-center justify-center rounded-full border-[5px] border-gold-200/90 bg-white/15 font-display text-[110px] font-bold text-white backdrop-blur">
                        {p.iniziale}
                      </span>
                      <span className="absolute bottom-5 rounded-full bg-white/90 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-princess-700">
                        Ritratto dimostrativo
                      </span>
                    </>
                  )}
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="inline-flex items-center gap-2 rounded-full border border-gold-300/50 bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.26em] text-gold-100">
                <Crown size={13} /> {p.personaggio}
              </p>
              <h1 className="mt-4 font-display text-6xl font-bold text-white sm:text-7xl">{p.nome}</h1>
              <p className="mt-2 text-[12px] font-bold uppercase tracking-[0.28em] text-gold-200">{p.ruolo}</p>
              <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-white/85">{p.descrizione}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {p.specialita.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1.5 rounded-full border border-gold-300/40 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur">
                    <Sparkles size={13} className="text-gold-200" /> {s}
                  </span>
                ))}
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/prenota" className="btn-gold">
                  <CalendarHeart size={16} /> Prenota con {p.nome}
                </Link>
                {(p.social?.instagram || p.social?.tiktok) && (
                  <span className="inline-flex items-center gap-2">
                    {p.social?.instagram && (
                      <a href={p.social.instagram} target="_blank" rel="noreferrer" aria-label={`Instagram di ${p.nome}`} className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/25 text-white transition hover:bg-white hover:text-princess-700">
                        <Instagram size={18} />
                      </a>
                    )}
                    {p.social?.tiktok && (
                      <a href={p.social.tiktok} target="_blank" rel="noreferrer" aria-label={`TikTok di ${p.nome}`} className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/25 text-white transition hover:bg-white hover:text-princess-700">
                        <Music2 size={18} />
                      </a>
                    )}
                  </span>
                )}
              </div>
            </Reveal>
          </div>
        </div>
        <svg viewBox="0 0 1440 60" className="absolute bottom-0 left-0 w-full wave-fill" fill="currentColor" aria-hidden>
          <path d="M0,35 C240,60 480,5 720,25 C960,45 1200,60 1440,20 L1440,60 L0,60 Z" />
        </svg>
      </section>

      <section className="section-texture py-16" aria-label={`Biografia di ${p.nome}`}>
        <div className="container-royal grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <Reveal>
            <article className="rounded-[1.75rem] border border-ink/10 bg-card p-8 shadow-soft sm:p-10">
              <p className="eyebrow">✦ La sua storia</p>
              <h2 className="mt-3 font-display text-4xl font-bold text-ink">Biografia</h2>
              {p.biografia.map((par, i) => (
                <p key={i} className="mt-4 leading-relaxed text-ink-soft">
                  {par}
                </p>
              ))}
              {p.demo && (
                <div className="mt-6 rounded-2xl border border-gold-500/30 bg-gold-50/70 p-5 text-sm text-ink-soft">
                  ✦ Questo profilo è un segnaposto elegante: biografia, foto e social reali saranno inseriti dall&apos;admin.
                </div>
              )}
              <div className="mt-8 grid grid-cols-3 gap-3">
                {(p.fotoExtra && p.fotoExtra.length > 0
                  ? p.fotoExtra.slice(0, 6)
                  : [null, null, null]
                ).map((src, n) => (
                  <div
                    key={src ?? n}
                    className="relative flex h-28 items-center justify-center overflow-hidden rounded-2xl text-3xl text-white"
                    style={src ? undefined : { background: `linear-gradient(140deg, ${p.colori.from}, ${p.colori.to})` }}
                    role="img"
                    aria-label={src ? `Foto ${n + 1} di ${p.nome}` : `Foto aggiuntiva dimostrativa ${n + 1} di ${p.nome}`}
                  >
                    {src ? (
                      <Image src={src} alt={`Foto ${n + 1} di ${p.nome}`} fill sizes="200px" loading="lazy" className="object-cover" />
                    ) : (
                      "✦"
                    )}
                  </div>
                ))}
              </div>
            </article>
          </Reveal>
          <Reveal delay={0.1}>
            <aside className="rounded-[1.75rem] bg-gradient-to-b from-princess-600 to-princess-800 p-8 text-white shadow-royal">
              <Crown size={26} className="text-gold-200" />
              <h3 className="mt-3 font-display text-3xl font-bold">Specialità</h3>
              <ul className="mt-4 space-y-3">
                {p.specialita.map((s) => (
                  <li key={s} className="flex items-center gap-2.5 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-[15px]">
                    <span className="text-gold-200">✦</span> {s}
                  </li>
                ))}
              </ul>
              <Link
                href="/prenota"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-[12.5px] font-bold uppercase tracking-[0.16em] text-princess-700 transition hover:-translate-y-0.5"
              >
                Richiedi {p.nome} <ArrowRight size={15} />
              </Link>
            </aside>
          </Reveal>
        </div>

        <div className="container-royal mt-16">
          <h2 className="text-center font-display text-4xl font-bold text-ink">Continua a sognare</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {altre.map((a, i) => (
              <PrincessCard key={a.slug} p={a} index={i} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
