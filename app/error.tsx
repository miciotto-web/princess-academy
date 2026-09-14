"use client";

import Link from "next/link";
import { TriangleAlert, RotateCcw, Sparkles } from "lucide-react";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="bg-ivory-texture px-5 py-24 text-center">
      <div className="mx-auto max-w-lg rounded-[2rem] border border-gold-500/40 bg-white p-10 shadow-golden">
        <TriangleAlert size={36} className="mx-auto text-princess-600" />
        <p className="eyebrow mt-4 justify-center">✦ Oh, la bacchetta si è inceppata ✦</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-ink">Qualcosa non ha funzionato</h1>
        <p className="mt-3 text-ink-soft">
          Non preoccuparti: nessun dato è andato perso. Riprova tra un momento
          o torna alla Home.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button onClick={reset} className="btn-princess">
            <RotateCcw size={15} /> Riprova
          </button>
          <Link href="/" className="btn-outline">
            <Sparkles size={15} /> Torna alla Home
          </Link>
        </div>
      </div>
    </section>
  );
}
