"use client";

import { TriangleAlert, RotateCcw } from "lucide-react";

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="rounded-[1.75rem] border border-princess-200 bg-white p-10 text-center shadow-soft">
      <TriangleAlert size={32} className="mx-auto text-princess-600" />
      <h1 className="mt-3 font-display text-3xl font-bold text-ink">Si è verificato un errore</h1>
      <p className="mx-auto mt-2 max-w-md text-ink-soft">
        Riprova a caricare questa sezione. Se il problema persiste, controlla la
        configurazione Supabase in <code>.env.local</code>.
      </p>
      <button onClick={reset} className="btn-princess mt-6 !px-6 !py-3 text-[13px]">
        <RotateCcw size={15} /> Ricarica sezione
      </button>
    </div>
  );
}
