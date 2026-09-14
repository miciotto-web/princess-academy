import type { Metadata } from "next";
import { Mail, Phone, MessageCircle, Clock, ShieldCheck, CalendarHeart } from "lucide-react";
import { PageHero, Reveal } from "@/components/ui/decor";
import BookingForm from "@/components/booking/BookingForm";
import { getPrincessOptions, getSiteSettings } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Prenota la tua magia",
  description: "Richiedi disponibilità per il tuo evento Princess Academy.",
  alternates: { canonical: "/prenota" },
};

const STEPS = [
  { n: "01", t: "Raccontaci tutto", d: "Data, luogo, età e tema: più dettagli, più magia su misura." },
  { n: "02", t: "Proposta in 24h", d: "Disponibilità, cast consigliato e preventivo trasparente." },
  { n: "03", t: "La favola inizia", d: "Scaletta scritta, prova costumi e regia il giorno dell'evento." },
];

export default async function PrenotaPage() {
  const [princessOptions, settings] = await Promise.all([getPrincessOptions(), getSiteSettings()]);
  return (
    <>
      <PageHero
        eyebrow="Disponibilità & preventivi"
        title={<>Prenota la tua <em className="text-gold-200">magia</em></>}
        intro="Compila il form: ti risponderemo entro 24 ore lavorative. Nessun pagamento ora — solo l'inizio della favola."
      />
      <section className="section-texture py-14 sm:py-20" aria-label="Modulo di prenotazione">
        <div className="container-royal grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-5">
            <Reveal>
              <div className="rounded-[1.75rem] bg-gradient-to-br from-princess-600 to-princess-800 p-8 text-white shadow-royal">
                <CalendarHeart size={28} className="text-gold-200" />
                <h2 className="mt-3 font-display text-3xl font-bold">Come funziona</h2>
                <ol className="mt-5 space-y-4">
                  {STEPS.map((s) => (
                    <li key={s.n} className="flex gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                      <span className="font-display text-2xl font-bold text-gold-200">{s.n}</span>
                      <span>
                        <span className="block font-semibold">{s.t}</span>
                        <span className="block text-sm text-white/75">{s.d}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="rounded-[1.75rem] border border-gold-500/30 bg-card p-8 shadow-golden">
                <h2 className="font-display text-2xl font-bold text-ink">Preferisci parlarne?</h2>
                <ul className="mt-4 space-y-3 text-[15px] text-ink-soft">
                  <li className="flex items-center gap-3"><Mail size={16} className="text-princess-600" /> {settings.contact_email}</li>
                  <li className="flex items-center gap-3"><Phone size={16} className="text-princess-600" /> {settings.contact_phone}</li>
                  <li className="flex items-center gap-3"><MessageCircle size={16} className="text-princess-600" /> WhatsApp {settings.contact_whatsapp}</li>
                  <li className="flex items-center gap-3"><Clock size={16} className="text-princess-600" /> {settings.contact_hours}</li>
                </ul>
                <p className="mt-5 flex items-start gap-2 rounded-2xl bg-princess-50 p-4 text-[13px] text-princess-800">
                  <ShieldCheck size={16} className="mt-0.5 shrink-0" />
                  I tuoi dati restano al sicuro: li usiamo solo per ricontattarti. Informativa completa in footer.
                </p>
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.08}>
            <BookingForm princessOptions={princessOptions} />
          </Reveal>
        </div>
      </section>
    </>
  );
}
