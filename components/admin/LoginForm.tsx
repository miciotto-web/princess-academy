"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Image from "next/image";
import { Loader2, LogIn, MailCheck } from "lucide-react";
import { adminLogin } from "@/lib/actions/auth";
import { supabaseBrowser } from "@/lib/supabase/client";
import { siteUrl } from "@/lib/site";

const initial = { error: undefined as string | undefined };

export default function AdminLoginForm() {
  const [state, action] = useFormState(adminLogin, initial);
  const [recovering, setRecovering] = useState(false);
  const [recoverMsg, setRecoverMsg] = useState<string | null>(null);
  const [recoverErr, setRecoverErr] = useState<string | null>(null);
  const [recoverPending, setRecoverPending] = useState(false);

  async function handleRecover(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setRecoverMsg(null);
    setRecoverErr(null);
    setRecoverPending(true);
    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    if (!email) {
      setRecoverErr("Inserisci la tua email nel campo sopra.");
      setRecoverPending(false);
      return;
    }
    const supa = supabaseBrowser();
    const { error } = await supa.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl()}/auth/recovery-callback?next=/auth/update-password`,
    });
    setRecoverPending(false);
    if (error) {
      console.error("[PASSWORD RECOVERY ERROR]", error);
      setRecoverErr("Impossibile inviare il link. Riprova tra qualche minuto.");
    } else {
      setRecoverMsg("Link di recupero inviato! Controlla la tua casella email.");
    }
  }

  if (recovering) {
    return (
      <div className="card-royal p-8 sm:p-10">
        <div className="mx-auto flex flex-col items-center text-center">
          <span className="relative block h-24 w-24 drop-shadow-[0_6px_20px_rgba(212,175,55,0.45)]">
            <Image src="/logo.png" alt="Logo Princess Academy" fill sizes="96px" className="object-contain" />
          </span>
          <p className="eyebrow mt-5 justify-center">✦ Recupero password ✦</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-ink">Password dimenticata?</h1>
          <p className="mt-2 text-sm text-ink-soft">Inserisci l&apos;email associata al tuo account. Riceverai un link per impostare una nuova password.</p>
        </div>
        <form onSubmit={handleRecover} className="mt-8 grid gap-4">
          <div>
            <label className="label-royal" htmlFor="recover-email">Email</label>
            <input id="recover-email" name="email" type="email" required autoComplete="email" className="input-royal" placeholder="admin@princess-academy.it" />
          </div>
          {recoverMsg && (
            <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700" role="status">
              <MailCheck size={15} className="mb-1 inline-block" /> {recoverMsg}
            </div>
          )}
          {recoverErr && (
            <p className="rounded-2xl border border-princess-200 bg-princess-50 px-4 py-3 text-sm font-medium text-princess-700" role="alert">
              {recoverErr}
            </p>
          )}
          <button type="submit" disabled={recoverPending} className="btn-princess w-full !py-4 disabled:opacity-70">
            {recoverPending ? <Loader2 size={16} className="animate-spin" /> : <MailCheck size={16} />} Invia link di recupero
          </button>
          <button type="button" onClick={() => { setRecovering(false); setRecoverMsg(null); setRecoverErr(null); }} className="w-full text-center text-sm font-medium text-princess-600 transition hover:text-princess-700">
            ← Torna al login
          </button>
        </form>
      </div>
    );
  }

  return (
    <form action={action} className="card-royal p-8 sm:p-10">
      <div className="mx-auto flex flex-col items-center text-center">
        <span className="relative block h-24 w-24 drop-shadow-[0_6px_20px_rgba(212,175,55,0.45)]">
          <Image src="/logo.png" alt="Logo Princess Academy" fill sizes="96px" className="object-contain" />
        </span>
        <p className="eyebrow mt-5 justify-center">✦ Area riservata ✦</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-ink">Princess Academy Admin</h1>
        <p className="mt-2 text-sm text-ink-soft">Accedi con l&apos;account amministratore Supabase.</p>
      </div>
      <div className="mt-8 grid gap-4">
        <div>
          <label className="label-royal" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" className="input-royal" placeholder="admin@princess-academy.it" />
        </div>
        <div>
          <label className="label-royal" htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required autoComplete="current-password" className="input-royal" placeholder="••••••••" />
        </div>
        <button type="button" onClick={() => { setRecovering(true); setRecoverMsg(null); setRecoverErr(null); }} className="w-full text-right text-[13px] font-medium text-princess-600 transition hover:text-princess-700">
          Password dimenticata?
        </button>
        {state?.error && (
          <p className="rounded-2xl border border-princess-200 bg-princess-50 px-4 py-3 text-sm font-medium text-princess-700" role="alert">
            {state.error}
          </p>
        )}
        <SubmitButton />
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-princess w-full !py-4 disabled:opacity-70">
      {pending ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />} Accedi alla magia
    </button>
  );
}
