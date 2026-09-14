"use client";

import { useState, useTransition } from "react";
import { Loader2, Save } from "lucide-react";
import { AdminCard } from "@/components/admin/ui";
import { saveSetting } from "@/lib/actions/admin";

const ETICHETTE: Record<string, string> = {
  contact_email: "Email di contatto",
  contact_phone: "Telefono",
  contact_whatsapp: "WhatsApp",
  contact_address: "Indirizzo",
  contact_hours: "Orari",
};

export default function SettingsManager({ initial }: { initial: { key: string; value: string }[] }) {
  const [vals, setVals] = useState<Record<string, string>>(
    Object.fromEntries(initial.map((s) => [s.key, s.value]))
  );
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <AdminCard>
      <div className="grid gap-4">
        {initial.map((s) => (
          <div key={s.key}>
            <label className="label-royal" htmlFor={`s-${s.key}`}>
              {ETICHETTE[s.key] ?? s.key}
            </label>
            <input
              id={`s-${s.key}`}
              className="input-royal"
              value={vals[s.key] ?? ""}
              onChange={(e) => setVals((v) => ({ ...v, [s.key]: e.target.value }))}
            />
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-center gap-3">
        <button
          disabled={pending}
          onClick={() => {
            setMsg(null);
            start(async () => {
              for (const [k, v] of Object.entries(vals)) {
                const r = await saveSetting(k, v);
                if (!r.ok) {
                  setMsg(r.error ?? "Errore");
                  return;
                }
              }
              setMsg("✦ Impostazioni salvate.");
            });
          }}
          className="btn-princess !px-6 !py-3 text-[13px] disabled:opacity-60"
        >
          {pending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Salva tutto
        </button>
        {msg && <span className="text-sm text-ink-soft" role="status">{msg}</span>}
      </div>
    </AdminCard>
  );
}
