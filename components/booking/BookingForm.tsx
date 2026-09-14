"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Send, PartyPopper, Loader2, Wand2 } from "lucide-react";
import { bookingSchema, type BookingInput } from "@/lib/validations";
import { TIPOLOGIE_EVENTO } from "@/lib/data";
import { submitBooking } from "@/lib/actions/public";

const inputCls = "input-royal";
const labelCls = "label-royal";

export default function BookingForm({ princessOptions = [] }: { princessOptions?: { id: string; nome: string }[] }) {
  const [stato, setStato] = useState<"idle" | "invio" | "ok" | "errore">("idle");
  const [avviso, setAvviso] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { tipologia: "", princess: "", durata: "", servizi: "" },
  });

  const onSubmit = async (data: BookingInput) => {
    setStato("invio");
    setAvviso(null);
    const r = await submitBooking(data);
    if (r.ok) {
      setAvviso(r.demo ? "Modalità dimostrativa: collega Supabase per salvare davvero la richiesta." : null);
      setStato("ok");
      reset();
      setTimeout(() => setStato("idle"), 12000);
    } else {
      setAvviso(r.error ?? "Invio non riuscito.");
      setStato("errore");
    }
  };

  return (
    <div className="card-royal p-7 sm:p-10">
      <div className="mb-8 flex items-center gap-4">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-princess-500 to-princess-700 p-3.5 text-gold-200 shadow-royal">
          <Wand2 size={22} />
        </span>
        <div>
          <h2 className="font-display text-3xl font-bold text-ink">Raccontaci la tua favola</h2>
          <p className="text-sm text-ink-soft">Rispondiamo entro 24 ore lavorative, con proposta e disponibilità.</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {stato === "ok" ? (
          <motion.div
            key="ok"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl border border-gold-500/40 bg-gradient-to-br from-princess-50 to-gold-50 p-10 text-center"
            role="status"
          >
            <PartyPopper size={36} className="mx-auto text-princess-600" />
            <h3 className="mt-4 font-display text-3xl font-bold text-princess-700">La tua richiesta è stata ricevuta!</h3>
            <p className="mx-auto mt-3 max-w-md text-ink-soft">
              Grazie! La tua richiesta è registrata come <strong>NUOVA</strong> e ti ricontatteremo prestissimo.
              {avviso && <span className="mt-2 block text-sm text-gold-700">{avviso}</span>}
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="grid gap-5 sm:grid-cols-2"
          >
            <div>
              <label className={labelCls} htmlFor="nome">Nome *</label>
              <input id="nome" className={inputCls} placeholder="Es. Sofia" {...register("nome")} aria-invalid={!!errors.nome} />
              {errors.nome && <p className="mt-1 text-sm text-princess-600">{errors.nome.message}</p>}
            </div>
            <div>
              <label className={labelCls} htmlFor="cognome">Cognome *</label>
              <input id="cognome" className={inputCls} placeholder="Es. Rossi" {...register("cognome")} />
              {errors.cognome && <p className="mt-1 text-sm text-princess-600">{errors.cognome.message}</p>}
            </div>
            <div>
              <label className={labelCls} htmlFor="email">Email *</label>
              <input id="email" type="email" className={inputCls} placeholder="tu@email.it" {...register("email")} />
              {errors.email && <p className="mt-1 text-sm text-princess-600">{errors.email.message}</p>}
            </div>
            <div>
              <label className={labelCls} htmlFor="telefono">Telefono *</label>
              <input id="telefono" type="tel" className={inputCls} placeholder="+39 ..." {...register("telefono")} />
              {errors.telefono && <p className="mt-1 text-sm text-princess-600">{errors.telefono.message}</p>}
            </div>
            <div>
              <label className={labelCls} htmlFor="dataEvento">Data evento *</label>
              <input id="dataEvento" type="date" className={inputCls} {...register("dataEvento")} />
              {errors.dataEvento && <p className="mt-1 text-sm text-princess-600">{errors.dataEvento.message}</p>}
            </div>
            <div>
              <label className={labelCls} htmlFor="orario">Orario *</label>
              <input id="orario" type="time" className={inputCls} {...register("orario")} />
              {errors.orario && <p className="mt-1 text-sm text-princess-600">{errors.orario.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls} htmlFor="luogo">Luogo *</label>
              <input id="luogo" className={inputCls} placeholder="Città, indirizzo o nome location" {...register("luogo")} />
              {errors.luogo && <p className="mt-1 text-sm text-princess-600">{errors.luogo.message}</p>}
            </div>
            <div>
              <label className={labelCls} htmlFor="tipologia">Tipologia evento *</label>
              <select id="tipologia" className={inputCls} {...register("tipologia")}>
                <option value="">Seleziona…</option>
                {TIPOLOGIE_EVENTO.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {errors.tipologia && <p className="mt-1 text-sm text-princess-600">{errors.tipologia.message}</p>}
            </div>
            <div>
              <label className={labelCls} htmlFor="princess">Princess desiderata</label>
              <select id="princess" className={inputCls} {...register("princess")}>
                <option value="">Sorprendetemi ✨</option>
                {princessOptions.map((p) => (
                  <option key={p.id} value={p.nome}>{p.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="invitati">Numero invitati</label>
              <input id="invitati" inputMode="numeric" className={inputCls} placeholder="Es. 15 bambini" {...register("invitati")} />
            </div>
            <div>
              <label className={labelCls} htmlFor="etaBambini">Età bambini</label>
              <input id="etaBambini" className={inputCls} placeholder="Es. 4–7 anni" {...register("etaBambini")} />
            </div>
            <div>
              <label className={labelCls} htmlFor="durata">Durata</label>
              <select id="durata" className={inputCls} {...register("durata")}>
                <option value="">Da definire</option>
                <option>1,5 ore</option>
                <option>2 ore</option>
                <option>3 ore</option>
                <option>Intera giornata</option>
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="servizi">Servizi aggiuntivi</label>
              <input id="servizi" className={inputCls} placeholder="Torta, allestimento, foto…" {...register("servizi")} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls} htmlFor="messaggio">Messaggio</label>
              <textarea id="messaggio" rows={4} className={inputCls} placeholder="Raccontaci il tema, i colori, i sogni della festeggiata…" {...register("messaggio")} />
              {errors.messaggio && <p className="mt-1 text-sm text-princess-600">{errors.messaggio.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-gold-500/30 bg-gold-50/60 p-4 text-sm text-ink-soft">
                <input type="checkbox" className="mt-1 h-4 w-4 accent-[#C7147D]" {...register("privacy")} />
                <span>
                  Ho letto la <a href="/privacy" target="_blank" rel="noreferrer" className="font-semibold text-princess-700 underline">Privacy Policy</a> e
                  acconsento al trattamento dei dati per essere ricontattata/o. *
                </span>
              </label>
              {errors.privacy && <p className="mt-1 text-sm text-princess-600">{errors.privacy.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <button type="submit" disabled={stato === "invio"} className="btn-princess w-full !py-4 text-[15px] disabled:opacity-70">
                {stato === "invio" ? (
                  <>
                    <Loader2 size={17} className="animate-spin" /> Invio della magia…
                  </>
                ) : (
                  <>
                    <Send size={16} /> Invia richiesta
                  </>
                )}
              </button>
              <p className="mt-3 text-center text-[13px] text-ink-mute">Nessun pagamento ora — solo una richiesta, la magia dopo.</p>
              {stato === "errore" && avviso && (
                <p className="mt-2 rounded-2xl bg-princess-50 px-4 py-3 text-center text-sm font-medium text-princess-700" role="alert">{avviso}</p>
              )}
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
