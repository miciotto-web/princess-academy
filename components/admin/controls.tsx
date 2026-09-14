"use client";

import { useState, useTransition } from "react";
import { Trash2, Loader2, Eye, EyeOff } from "lucide-react";

export function DeleteButton({
  label,
  onDelete,
}: {
  label: string;
  onDelete: () => Promise<{ ok: boolean; error?: string }>;
}) {
  const [confirm, setConfirm] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!confirm) {
    return (
      <button
        onClick={() => setConfirm(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-4 py-2 text-[12px] font-bold uppercase tracking-[0.12em] text-red-600 transition hover:bg-red-50"
        aria-label={`Elimina ${label}`}
      >
        <Trash2 size={14} /> Elimina
      </button>
    );
  }
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <button
        disabled={pending}
        onClick={() => start(async () => {
          const r = await onDelete();
          if (!r.ok) {
            setError(r.error ?? "Errore");
            setConfirm(false);
          }
        })}
        className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-4 py-2 text-[12px] font-bold uppercase tracking-[0.12em] text-white transition hover:bg-red-700 disabled:opacity-60"
      >
        {pending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
        Confermi?
      </button>
      <button
        onClick={() => setConfirm(false)}
        className="rounded-full px-3 py-2 text-[12px] font-semibold text-ink-mute hover:underline"
      >
        Annulla
      </button>
      {error && <span className="text-[12px] text-red-600">{error}</span>}
    </span>
  );
}

export function ToggleButton({
  active,
  activeLabel,
  inactiveLabel,
  onToggle,
}: {
  active: boolean;
  activeLabel: string;
  inactiveLabel: string;
  onToggle: (next: boolean) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <button
        disabled={pending}
        onClick={() => {
          setError(null);
          start(async () => {
            const r = await onToggle(!active);
            if (!r.ok) setError(r.error ?? "Errore");
          });
        }}
        className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-bold uppercase tracking-[0.12em] transition disabled:opacity-60 ${
          active
            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
            : "bg-ink/10 text-ink-soft hover:bg-ink/15"
        }`}
        aria-pressed={active}
      >
        {pending ? <Loader2 size={14} className="animate-spin" /> : active ? <Eye size={14} /> : <EyeOff size={14} />}
        {active ? activeLabel : inactiveLabel}
      </button>
      {error && <span className="text-[12px] text-red-600">{error}</span>}
    </span>
  );
}
