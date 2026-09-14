import type { Metadata } from "next";
import { Mail, Phone, MessageCircle, MapPin, Clock } from "lucide-react";
import { PageHero, Reveal } from "@/components/ui/decor";
import ContactForm from "@/components/contact/ContactForm";
import { getSiteSettings } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Contatti",
  description: "Email, telefono, WhatsApp e indirizzo di Princess Academy.",
  alternates: { canonical: "/contatti" },
};

export default async function ContattiPage() {
  const s = await getSiteSettings();
  const RIGHE = [
    { icon: Mail, t: "Email", v: s.contact_email },
    { icon: Phone, t: "Telefono", v: s.contact_phone },
    { icon: MessageCircle, t: "WhatsApp", v: s.contact_whatsapp },
    { icon: MapPin, t: "Dove siamo", v: s.contact_address },
    { icon: Clock, t: "Orari", v: s.contact_hours },
  ];

  return (
    <>
      <PageHero
        eyebrow="Scrivici o chiamaci"
        title={<>Contattaci, <em className="text-gold-200">la magia</em> risponde</>}
        intro="Email, telefono, WhatsApp e form diretto. Mappa opzionale integrabile quando l'indirizzo sarà definitivo."
      />
      <section className="section-texture py-16" aria-label="Contatti">
        <div className="container-royal grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          <Reveal>
            <div className="card-royal p-8">
              <h2 className="font-display text-3xl font-bold text-ink">Le nostre coordinate</h2>
              <ul className="mt-6 space-y-3">
                {RIGHE.map((r) => (
                  <li key={r.t} className="flex items-center gap-4 rounded-2xl border border-ink/10 bg-page px-5 py-4">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-princess-600 text-gold-200">
                      <r.icon size={18} />
                    </span>
                    <span>
                      <span className="block text-[11px] font-bold uppercase tracking-[0.24em] text-ink-mute">{r.t}</span>
                      <span className="block font-semibold text-ink">{r.v}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 overflow-hidden rounded-2xl border border-gold-500/30 bg-gradient-to-br from-gold-50 to-princess-50 p-8 text-center">
                <MapPin size={24} className="mx-auto text-princess-600" />
                <p className="mt-2 font-display text-xl font-bold italic text-ink">Mappa interattiva in arrivo</p>
                <p className="mt-1 text-sm text-ink-soft">Integramo Google Maps quando l&apos;indirizzo sarà definitivo.</p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="card-royal p-8">
              <h2 className="font-display text-3xl font-bold text-ink">Scrivici subito</h2>
              <p className="mt-1 text-sm text-ink-soft">Il form apre il tuo client email con messaggio già pronto per noi.</p>
              <ContactForm to={s.contact_email} />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
