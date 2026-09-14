"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";

const KEY = "pa-cookie-consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const choose = (v: "all" | "essential") => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ scelta: v, data: new Date().toISOString() }));
    } catch {
      /* storage non disponibile: nascondi comunque */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Informativa cookie"
      className="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-2xl rounded-[1.5rem] border border-gold-500/40 bg-white/98 p-5 shadow-royal backdrop-blur sm:p-6"
    >
      <p className="flex items-center gap-2 font-display text-xl font-bold text-ink">
        <Cookie size={20} className="text-princess-600" /> Un biscotto magico? 🍪
      </p>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        Usiamo solo cookie tecnici e preferenze salvate sul tuo dispositivo (es. questa scelta).
        Niente profilazione, niente pubblicità. Dettagli in{" "}
        <Link href="/cookie" className="font-semibold text-princess-700 underline">Cookie Policy</Link>
        {" "}e <Link href="/privacy" className="font-semibold text-princess-700 underline">Privacy Policy</Link>.
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button onClick={() => choose("all")} className="btn-princess flex-1 !py-2.5 text-[12.5px]">
          Accetta tutto
        </button>
        <button onClick={() => choose("essential")} className="btn-outline flex-1 !py-2.5 text-[12.5px]">
          Solo essenziali
        </button>
      </div>
    </div>
  );
}
