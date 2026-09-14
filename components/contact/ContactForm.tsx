"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send, Loader2, PartyPopper } from "lucide-react";
import { contactSchema, type ContactInput } from "@/lib/validations";

/** Form contatto dimostrativo: apre il client email con messaggio precompilato. */
export default function ContactForm({ to }: { to: string }) {
  const [inviato, setInviato] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = (d: ContactInput) => {
    const subject = encodeURIComponent(`Richiesta dal sito — ${d.nome}`);
    const body = encodeURIComponent(`${d.messaggio}\n\n— ${d.nome} (${d.email})`);
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    setInviato(true);
    reset();
    setTimeout(() => setInviato(false), 8000);
  };

  if (inviato) {
    return (
      <div className="mt-6 rounded-3xl border border-gold-500/40 bg-gradient-to-br from-princess-50 to-gold-50 p-10 text-center" role="status">
        <PartyPopper size={32} className="mx-auto text-princess-600" />
        <p className="mt-3 font-display text-2xl font-bold text-princess-700">Si è aperto il tuo client email!</p>
        <p className="mt-2 text-ink-soft">Completa l&apos;invio da lì — ti risponderemo entro 24 ore lavorative.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 grid gap-4">
      <div>
        <label className="label-royal" htmlFor="c-nome">Nome *</label>
        <input id="c-nome" className="input-royal" placeholder="Il tuo nome" {...register("nome")} />
        {errors.nome && <p className="mt-1 text-sm text-princess-600">{errors.nome.message}</p>}
      </div>
      <div>
        <label className="label-royal" htmlFor="c-email">Email *</label>
        <input id="c-email" type="email" className="input-royal" placeholder="tu@email.it" {...register("email")} />
        {errors.email && <p className="mt-1 text-sm text-princess-600">{errors.email.message}</p>}
      </div>
      <div>
        <label className="label-royal" htmlFor="c-msg">Messaggio *</label>
        <textarea id="c-msg" rows={5} className="input-royal" placeholder="Ciao Princess Academy, vi scrivo per…" {...register("messaggio")} />
        {errors.messaggio && <p className="mt-1 text-sm text-princess-600">{errors.messaggio.message}</p>}
      </div>
      <button type="submit" className="btn-princess w-full">
        <Send size={15} /> Contattaci
      </button>
    </form>
  );
}

export function ContactSending() {
  return <Loader2 size={16} className="animate-spin" />;
}
