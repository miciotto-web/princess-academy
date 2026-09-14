import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Crown, Sparkles, CalendarHeart, Camera, Wand2, Star } from "lucide-react";
import MagicalHero from "@/components/hero/MagicalHero";
import { GoldDivider, Reveal, SectionHeading } from "@/components/ui/decor";
import { PrincessCard } from "@/components/princess/PrincessCard";
import { EventCard } from "@/components/events/EventCard";
import { getEvents, getPrincesses, getSiteContent } from "@/lib/queries";

export const metadata: Metadata = {
  title: { absolute: "Princess Academy | Magical Party Experience" },
  description: "Princess Academy trasforma feste ed eventi in esperienze magiche e indimenticabili.",
  alternates: { canonical: "/" },
};

const PERCORSO = [
  { icon: Sparkles, t: "Scopri la storia", d: "Una piccola Academy nata tra costumi cuciti a mano e grandi sogni.", href: "/storia" },
  { icon: Crown, t: "Conosci le Princess", d: "Interpreti formate, eleganti e dolcissime con ogni bambino.", href: "/princess" },
  { icon: Wand2, t: "Scegli l'esperienza", d: "Dieci format firma, dai compleanni ai grandi spettacoli.", href: "/eventi" },
  { icon: Camera, t: "Guarda le foto", d: "Un assaggio di coroncine, valzer e neve di stelle.", href: "/galleria" },
  { icon: CalendarHeart, t: "Prenota", d: "Raccontaci la data: al resto pensiamo noi.", href: "/prenota" },
];

export default async function HomePage() {
  const [princesses, eventi, intro] = await Promise.all([
    getPrincesses(),
    getEvents(),
    getSiteContent(
      "home_intro",
      "Benvenuti nel mondo di Princess Academy",
      "Siamo un atelier della festa: ingressi scenografici, trucco delicato, giochi educativi e rituali d'oro come l'incoronazione finale. Niente caos, niente volumi alti: solo grazia, teatro e attenzione maniacale ai dettagli."
    ),
  ]);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EventVenue",
    name: "Princess Academy — Magical Party Experience",
    description: "Princess Academy trasforma feste ed eventi in esperienze magiche e indimenticabili.",
    slogan: "Trasformiamo ogni festa in una favola.",
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <MagicalHero />

      {/* INTRO */}
      <section className="section-texture py-20 sm:py-24" aria-label="Benvenuti nel mondo di Princess Academy">
        <div className="container-royal grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <div className="gold-frame">
              <div className="relative overflow-hidden rounded-[1.4rem] bg-gradient-to-br from-princess-500 via-princess-600 to-princess-800 px-8 py-14 text-center shadow-royal">
                <div className="texture-dots absolute inset-0 opacity-30" aria-hidden />
                <p aria-hidden className="animate-twinkle text-2xl text-gold-200">✦ ✦ ✦</p>
                <p className="relative mt-4 font-display text-4xl font-bold italic leading-tight text-white">
                  “Ogni bambina merita
                  <br />
                  di sentirsi protagonista,
                  <br />
                  almeno per un giorno.”
                </p>
                <p className="relative mt-6 text-[11px] font-bold uppercase tracking-[0.32em] text-gold-200">
                  Il giuramento Academy
                </p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="eyebrow">✦ Benvenuti nel mondo di Princess Academy</p>
            <h2 className="mt-4 font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">
              Non animazione.
              <br />
              <em className="text-princess-600">Un&apos;esperienza boutique</em> da favola.
            </h2>
            <p className="mt-5 text-[17px] leading-relaxed text-ink-soft">
              {intro.body}
            </p>
            <ul className="mt-6 space-y-3">
              {["Costumi sartoriali e trucco ipoallergenico", "Scaletta scritta sull'età dei bambini", "Coordinamento con location e genitori"].map((x) => (
                <li key={x} className="flex items-center gap-3 text-[15px] font-medium text-ink">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gold-100 text-gold-700 ring-1 ring-gold-500/40">
                    <Star size={13} />
                  </span>
                  {x}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/storia" className="btn-princess">
                La nostra storia <ArrowRight size={16} />
              </Link>
              <Link href="/princess" className="btn-outline">
                Conosci le Princess
              </Link>
            </div>
          </Reveal>
        </div>
        <GoldDivider className="mt-16" />
      </section>

      {/* PERCORSO */}
      <section className="bg-page py-20" aria-label="Il percorso magico">
        <div className="container-royal">
          <SectionHeading
            eyebrow="Il percorso"
            title={<>Da un sogno a <em className="text-princess-600">un ricordo indelebile</em></>}
            intro="Hero → Storia → Princess → Esperienze → Foto → Prenota: la CTA resta sempre a un tocco di bacchetta."
          />
          <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {PERCORSO.map((s, i) => (
              <Reveal key={s.t} delay={i * 0.07}>
                <Link
                  href={s.href}
                  className="card-royal group flex h-full flex-col p-6"
                  aria-label={s.t}
                >
                  <span className="font-display text-4xl font-bold text-gold-400/70">0{i + 1}</span>
                  <s.icon size={26} className="mt-3 text-princess-600" aria-hidden />
                  <span className="mt-3 font-display text-xl font-bold text-ink">{s.t}</span>
                  <span className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{s.d}</span>
                  <span className="mt-4 inline-flex items-center gap-1 text-[12px] font-bold uppercase tracking-[0.18em] text-princess-600">
                    Vai <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* PRINCESS */}
      <section className="princess-section py-20" aria-label="Le nostre Princess">
        <div className="container-royal">
          <SectionHeading
            eyebrow="Le nostre Princess"
            title={<>Protagoniste <em className="text-princess-600">dal cuore d&apos;oro</em></>}
            intro="Nomi e volti dimostrativi in attesa del cast reale — lo stile resta quello Academy: grazia, teatro, dolcezza."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {princesses.map((p, i) => (
              <PrincessCard key={p.slug} p={p} index={i} />
            ))}
          </div>
          <Reveal className="mt-10 text-center">
            <Link href="/princess" className="btn-princess">
              Tutte le Princess <ArrowRight size={16} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* EVENTI */}
      <section className="bg-page py-20" aria-label="Le esperienze">
        <div className="container-royal">
          <SectionHeading
            eyebrow="Esperienze firma"
            title={<>Dieci modi per <em className="text-princess-600">vivere la favola</em></>}
            intro="Dai compleanni ai matrimoni, dai family day ai mini-musical da palco."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {eventi.slice(0, 6).map((e, i) => (
              <EventCard key={e.slug} e={e} index={i} />
            ))}
          </div>
          <Reveal className="mt-10 text-center">
            <Link href="/eventi" className="btn-outline">
              Tutti gli eventi <ArrowRight size={16} />
            </Link>
          </Reveal>
        </div>
        <GoldDivider className="mt-16" />
      </section>

      {/* CTA finale */}
      <section className="relative overflow-hidden hero-bg py-20" aria-label="Prenota la tua magia">
        <div className="texture-dots absolute inset-0 opacity-40" aria-hidden />
        <div className="container-royal relative flex flex-col items-center text-center">
          <Reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-gold-200">✦ Ultimo passo della favola</p>
            <h2 className="mt-4 font-display text-4xl font-bold leading-tight text-white sm:text-6xl">
              La data è tua.
              <br />
              La magia è nostra.
            </h2>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-white/85">
              Raccontaci tema, età e location: ti risponderemo entro 24 ore lavorative
              con disponibilità e proposta su misura.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/prenota" className="btn-gold">
                <CalendarHeart size={16} /> Prenota la tua magia
              </Link>
              <Link
                href="/galleria"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-princess-700 transition hover:-translate-y-0.5"
              >
                <Camera size={16} /> Guarda le foto
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
