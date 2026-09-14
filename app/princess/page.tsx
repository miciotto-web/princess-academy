import type { Metadata } from "next";
import { PageHero } from "@/components/ui/decor";
import { PrincessCard } from "@/components/princess/PrincessCard";
import { getPrincesses } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Le nostre Princess",
  description: "Conosci le Princess di Princess Academy: profili, specialità e storie.",
  alternates: { canonical: "/princess" },
};

export default async function PrincessPage() {
  const princesses = await getPrincesses();
  const demo = princesses.every((p) => p.demo);
  return (
    <>
      <PageHero
        eyebrow="Il cast"
        title={<>Le nostre <em className="text-gold-200">Princess</em></>}
        intro="Profili dimostrativi con struttura illimitata: foto, ruolo, biografia, specialità e social. Aggiungine quante vuoi dall'admin."
      />
      <section className="section-texture py-16 sm:py-20" aria-label="Elenco Princess">
        <div className="container-royal">
          {demo && (
            <p className="mx-auto max-w-2xl rounded-full border border-gold-500/30 bg-gold-50 px-6 py-3 text-center text-sm text-ink-soft">
              ✦ Dati dimostrativi — nessun nome, biografia o fotografia reale. Segnaposto eleganti in attesa del cast vero. ✦
            </p>
          )}
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {princesses.map((p, i) => (
              <PrincessCard key={p.slug} p={p} index={i} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
