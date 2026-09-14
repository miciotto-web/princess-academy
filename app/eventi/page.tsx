import type { Metadata } from "next";
import { PageHero } from "@/components/ui/decor";
import { EventCard } from "@/components/events/EventCard";
import { getEvents } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Eventi",
  description: "Princess Party, compleanni, matrimoni, eventi aziendali, spettacoli e molto altro.",
  alternates: { canonical: "/eventi" },
};

export default async function EventiPage() {
  const eventi = await getEvents();
  return (
    <>
      <PageHero
        eyebrow="Le esperienze"
        title={<>Scegli la tua <em className="text-gold-200">esperienza</em></>}
        intro="Categorie modificabili dall'admin. Ogni evento include descrizione, durata, servizi, prezzo opzionale e CTA Scopri / Prenota."
      />
      <section className="section-texture py-16 sm:py-20" aria-label="Catalogo eventi">
        <div className="container-royal grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {eventi.map((e, i) => (
            <EventCard key={e.slug} e={e} index={i} />
          ))}
        </div>
      </section>
    </>
  );
}
