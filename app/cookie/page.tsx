import type { Metadata } from "next";
import Link from "next/link";
import { Cookie, ArrowRight } from "lucide-react";
import { PageHero, Reveal } from "@/components/ui/decor";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Quali cookie usa Princess Academy: solo tecnici, nessuna profilazione.",
  alternates: { canonical: "/cookie" },
};

const RIGHE = [
  { nome: "pa-cookie-consent", tipo: "Tecnico · locale", scopo: "Ricorda la tua scelta sul banner (tutto / solo essenziali).", durata: "12 mesi" },
  { nome: "sb-*-auth-token", tipo: "Tecnico · Supabase", scopo: "Mantiene l'accesso all'area riservata /admin.", durata: "Sessione / 7 giorni" },
  { nome: "next-*", tipo: "Tecnico · Next.js", scopo: "Sicurezza e funzionamento del sito.", durata: "Sessione" },
];

export default function CookiePage() {
  return (
    <>
      <PageHero
        eyebrow="Dolce trasparenza"
        title={<>Cookie <em className="text-gold-200">Policy</em></>}
        intro="Solo biscotti tecnici: nessuna profilazione, nessuna pubblicità, nessun tracciamento di terze parti."
      />
      <section className="section-texture py-14" aria-label="Cookie policy">
        <div className="container-royal max-w-3xl">
          <Reveal>
            <article className="overflow-hidden rounded-[1.75rem] border border-ink/10 bg-card shadow-soft">
              <div className="flex items-center gap-3 bg-gradient-to-r from-princess-600 to-princess-500 p-6 text-white sm:p-8">
                <Cookie size={26} className="text-gold-200" />
                <h2 className="font-display text-2xl font-bold">I nostri cookie, uno per uno</h2>
              </div>
              <ul className="divide-y divide-ink/10">
                {RIGHE.map((r) => (
                  <li key={r.nome} className="grid gap-1 p-6 sm:grid-cols-[1fr_1fr] sm:p-8">
                    <div>
                      <p className="font-mono text-[15px] font-bold text-ink">{r.nome}</p>
                      <p className="text-[13px] uppercase tracking-[0.14em] text-gold-700">{r.tipo} · {r.durata}</p>
                    </div>
                    <p className="text-[15px] leading-relaxed text-ink-soft">{r.scopo}</p>
                  </li>
                ))}
              </ul>
              <div className="bg-page p-6 sm:p-8">
                <h2 className="font-display text-2xl font-bold text-ink">Cambiare idea</h2>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
                  Puoi cancellare la scelta in qualsiasi momento svuotando i dati del sito dal tuo browser:
                  il banner ricomparirà alla prossima visita. Per domande: <Link href="/privacy" className="font-semibold text-princess-700 underline">Privacy Policy</Link>.
                </p>
                <Link href="/" className="btn-princess mt-5">Torna alla Home <ArrowRight size={15} /></Link>
              </div>
            </article>
          </Reveal>
        </div>
      </section>
    </>
  );
}
