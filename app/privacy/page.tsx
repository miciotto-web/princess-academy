import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { PageHero, Reveal } from "@/components/ui/decor";
import { getSiteSettings } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Come Princess Academy tratta i dati personali (GDPR).",
  alternates: { canonical: "/privacy" },
};

export default async function PrivacyPage() {
  const s = await getSiteSettings();
  return (
    <>
      <PageHero
        eyebrow="Trasparenza"
        title={<>Privacy <em className="text-gold-200">Policy</em></>}
        intro="Come trattiamo i tuoi dati, in parole semplici. Ultimo aggiornamento: 2026."
      />
      <section className="section-texture py-14" aria-label="Privacy policy">
        <div className="container-royal max-w-3xl">
          <Reveal>
            <article className="rounded-[1.75rem] border border-ink/10 bg-card p-8 shadow-soft sm:p-10">
              <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.24em] text-princess-600">
                <ShieldCheck size={15} /> Titolare del trattamento
              </p>
              <p className="mt-3 leading-relaxed text-ink-soft">
                Princess Academy — {s.contact_address} — email {s.contact_email}, telefono {s.contact_phone}.
              </p>
              <h2 className="mt-8 font-display text-2xl font-bold text-ink">1. Quali dati raccogliamo</h2>
              <p className="mt-2 leading-relaxed text-ink-soft">
                Solo il minimo necessario per ricontattarti: nome, cognome, email, telefono e i dettagli
                dell&apos;evento (data, orario, luogo, tipologia, invitati, messaggio). Non raccogliamo dati
                sanitari, biometrici o di profilazione.
              </p>
              <h2 className="mt-8 font-display text-2xl font-bold text-ink">2. Perché li usiamo</h2>
              <p className="mt-2 leading-relaxed text-ink-soft">
                Base giuridica: il tuo <strong>consenso esplicito</strong> (checkbox obbligatoria nel form,
                con timestamp registrato) e le misure precontrattuali (preparare la proposta per il tuo evento).
              </p>
              <h2 className="mt-8 font-display text-2xl font-bold text-ink">3. Per quanto li conserviamo</h2>
              <p className="mt-2 leading-relaxed text-ink-soft">
                Richieste di preventivo: fino a <strong>24 mesi</strong> dall&apos;ultimo contatto, poi cancellate.
                Eventi confermati: fino a <strong>10 anni</strong> per obblighi fiscali. Puoi chiedere la
                cancellazione anticipata in qualsiasi momento (diritto all&apos;oblio).
              </p>
              <h2 className="mt-8 font-display text-2xl font-bold text-ink">4. Dove vivono i dati</h2>
              <p className="mt-2 leading-relaxed text-ink-soft">
                Database Supabase (UE possibile su richiesta del piano) e notifiche email transazionali
                (provider configurato in <code>RESEND_API_KEY</code>). Nessuna vendita a terzi, nessun
                trasferimento per marketing.
              </p>
              <h2 className="mt-8 font-display text-2xl font-bold text-ink">5. I tuoi diritti</h2>
              <p className="mt-2 leading-relaxed text-ink-soft">
                Accesso, rettifica, cancellazione, limitazione, portabilità e opposizione: scrivi a{" "}
                {s.contact_email} e risponderemo entro 30 giorni. Reclami al Garante per la protezione
                dei dati personali.
              </p>
              <h2 className="mt-8 font-display text-2xl font-bold text-ink">6. Minori</h2>
              <p className="mt-2 leading-relaxed text-ink-soft">
                I form sono compilati da genitori/tutori o organizzatori adulti. Le foto dei minori in
                galleria sono pubblicate solo con consenso scritto delle famiglie.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/prenota" className="btn-princess">Prenota un evento <ArrowRight size={15} /></Link>
                <Link href="/cookie" className="btn-outline">Leggi la Cookie Policy</Link>
              </div>
            </article>
          </Reveal>
        </div>
      </section>
    </>
  );
}
