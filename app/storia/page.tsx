import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarHeart } from "lucide-react";
import { PageHero, Reveal } from "@/components/ui/decor";
import { getTimeline } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "La nostra storia",
  description: "Una storia fatta di magia: la timeline di Princess Academy.",
  alternates: { canonical: "/storia" },
};

export default async function StoriaPage() {
  const tappe = await getTimeline();
  return (
    <>
      <PageHero
        eyebrow="La nostra storia"
        title={<>Una storia fatta <em className="text-gold-200">di magia</em></>}
        intro="Timeline dimostrativa modificabile dall'area admin: crea, modifica, elimina e riordina ogni tappa."
      />
      <section className="section-texture py-16 sm:py-20" aria-label="Timeline">
        <div className="container-royal max-w-4xl">
          <ol className="relative space-y-8 before:absolute before:bottom-4 before:left-[19px] before:top-4 before:w-px before:bg-gradient-to-b before:from-gold-400 before:via-princess-300 before:to-gold-400 sm:before:left-[23px]">
            {tappe.map((t, i) => (
              <Reveal key={t.anno} delay={Math.min(i * 0.06, 0.3)}>
                <li className="relative flex gap-5 sm:gap-7">
                  <span
                    className={cn(
                      "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 sm:h-12 sm:w-12",
                      t.evidenza
                        ? "border-gold-300 bg-princess-600 text-gold-100 shadow-royal"
                        : "border-gold-500/50 bg-card text-princess-600 shadow-golden"
                    )}
                    aria-hidden
                  >
                    ✦
                  </span>
                  <article
                    className={cn(
                      "flex-1 rounded-[1.6rem] border bg-card p-6 sm:p-8",
                      t.evidenza
                        ? "border-gold-500/50 shadow-golden"
                        : "border-ink/10 shadow-soft"
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-princess-600 px-4 py-1.5 font-display text-lg font-bold text-white">
                        {t.anno}
                      </span>
                      <span className="rounded-full border border-gold-500/40 px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.2em] text-gold-700">
                        Tappa {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h2 className="mt-4 font-display text-3xl font-bold text-ink">{t.titolo}</h2>
                    <p className="mt-2 leading-relaxed text-ink-soft">{t.descrizione}</p>
                    {t.image ? (
                      <div className="relative mt-5 h-48 w-full overflow-hidden rounded-2xl sm:h-56">
                        <Image
                          src={t.image}
                          alt={`Fotografia della tappa ${t.anno} — ${t.titolo}`}
                          fill
                          sizes="(max-width: 768px) 100vw, 700px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="mt-5 flex h-28 items-center justify-center overflow-hidden rounded-2xl placeholder-art">
                        <span className="font-display text-5xl" aria-hidden>❧</span>
                        <span className="sr-only">Fotografia segnaposto per {t.anno}</span>
                      </div>
                    )}
                    {!t.image && (
                      <p className="mt-3 text-[12px] uppercase tracking-[0.2em] text-ink-mute">
                        Fotografia segnaposto — sostituibile da admin
                      </p>
                    )}
                  </article>
                </li>
              </Reveal>
            ))}
          </ol>

          <Reveal className="mt-14 rounded-[2rem] border border-gold-500/40 bg-card p-8 text-center shadow-golden sm:p-10">
            <p className="eyebrow justify-center">✦ E la favola continua ✦</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">
              Vuoi entrare anche tu nella nostra storia?
            </h2>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/prenota" className="btn-princess">
                <CalendarHeart size={16} /> Prenota un evento
              </Link>
              <Link href="/princess" className="btn-outline">
                Conosci le Princess <ArrowRight size={15} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
