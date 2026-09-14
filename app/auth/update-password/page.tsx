"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Lock, CheckCircle, AlertTriangle, ArrowRight } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);
  const [hashError, setHashError] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("error=")) {
      const params = new URLSearchParams(hash.replace("#", ""));
      const desc = params.get("error_description") ?? "Link non valido o scaduto.";
      setHashError(desc);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("La password deve contenere almeno 6 caratteri.");
      return;
    }
    if (password !== confirm) {
      setError("Le due password non coincidono.");
      return;
    }

    setPending(true);
    const supa = supabaseBrowser();
    const { error: updateError } = await supa.auth.updateUser({ password });
    setPending(false);

    if (updateError) {
      setError(updateError.message ?? "Aggiornamento non riuscito. Riprova.");
    } else {
      setSuccess(true);
    }
  }

  if (hashError) {
    return (
      <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-royal-sheen px-5 py-24">
        <div className="texture-dots absolute inset-0 opacity-40" aria-hidden />
        <div className="relative w-full max-w-md">
          <div className="card-royal p-8 sm:p-10">
            <div className="mx-auto flex flex-col items-center text-center">
              <span className="relative block h-24 w-24 drop-shadow-[0_6px_20px_rgba(212,175,55,0.45)]">
                <Image src="/logo.png" alt="Logo Princess Academy" fill sizes="96px" className="object-contain" />
              </span>
              <p className="eyebrow mt-5 justify-center">✦ Link non valido ✦</p>
              <h1 className="mt-2 font-display text-4xl font-bold text-ink">Oops!</h1>
              <div className="mt-5 rounded-2xl border border-gold-500/30 bg-gold-50/70 p-5 text-sm text-ink-soft">
                <AlertTriangle size={18} className="mb-2 inline-block text-princess-600" />
                <p>{hashError}</p>
              </div>
              <p className="mt-4 text-sm text-ink-soft">
                Puoi richiedere un nuovo link di recupero dalla pagina di login.
              </p>
              <Link href="/admin/login" className="btn-princess mt-6">
                Torna al login <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (success) {
    return (
      <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-royal-sheen px-5 py-24">
        <div className="texture-dots absolute inset-0 opacity-40" aria-hidden />
        <div className="relative w-full max-w-md">
          <div className="card-royal p-8 sm:p-10">
            <div className="mx-auto flex flex-col items-center text-center">
              <span className="relative block h-24 w-24 drop-shadow-[0_6px_20px_rgba(212,175,55,0.45)]">
                <Image src="/logo.png" alt="Logo Princess Academy" fill sizes="96px" className="object-contain" />
              </span>
              <p className="eyebrow mt-5 justify-center">✦ Password aggiornata ✦</p>
              <h1 className="mt-2 font-display text-4xl font-bold text-ink">Fatto!</h1>
              <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-5 text-sm font-medium text-green-700">
                <CheckCircle size={18} className="mb-2 inline-block" />
                <p>La tua password è stata aggiornata con successo.</p>
              </div>
              <Link href="/admin/login" className="btn-princess mt-6">
                Accedi ora <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-royal-sheen px-5 py-24">
      <div className="texture-dots absolute inset-0 opacity-40" aria-hidden />
      <div className="relative w-full max-w-md">
        <div className="card-royal p-8 sm:p-10">
          <div className="mx-auto flex flex-col items-center text-center">
            <span className="relative block h-24 w-24 drop-shadow-[0_6px_20px_rgba(212,175,55,0.45)]">
              <Image src="/logo.png" alt="Logo Princess Academy" fill sizes="96px" className="object-contain" />
            </span>
            <p className="eyebrow mt-5 justify-center">✦ Nuova password ✦</p>
            <h1 className="mt-2 font-display text-4xl font-bold text-ink">Aggiorna la password</h1>
            <p className="mt-2 text-sm text-ink-soft">Scegli una nuova password sicura per il tuo account admin.</p>
          </div>
          <form onSubmit={handleSubmit} className="mt-8 grid gap-4">
            <div>
              <label className="label-royal" htmlFor="new-password">Nuova password</label>
              <input
                id="new-password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                className="input-royal"
                placeholder="Minimo 6 caratteri"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="label-royal" htmlFor="confirm-password">Conferma password</label>
              <input
                id="confirm-password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                className="input-royal"
                placeholder="Ripeti la password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            {error && (
              <p className="rounded-2xl border border-princess-200 bg-princess-50 px-4 py-3 text-sm font-medium text-princess-700" role="alert">
                {error}
              </p>
            )}
            <button type="submit" disabled={pending} className="btn-princess w-full !py-4 disabled:opacity-70">
              {pending ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />} Aggiorna password
            </button>
            <Link href="/admin/login" className="w-full text-center text-sm font-medium text-princess-600 transition hover:text-princess-700">
              ← Torna al login
            </Link>
          </form>
        </div>
      </div>
    </section>
  );
}
