"use client";

import { useState, useTransition } from "react";
import { ShieldCheck, ShieldOff, Trash2, Loader2 } from "lucide-react";
import { setAdminRole, removeAdminUser } from "@/lib/actions/admin";

export type ProfileRow = { id: string; email: string | null; is_admin: boolean; created_at: string };

export default function UsersManager({ initial, selfId }: { initial: ProfileRow[]; selfId: string }) {
  const [users, setUsers] = useState(initial);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <ul className="mt-6 space-y-3">
      {users.map((u) => (
        <li key={u.id} className="flex flex-wrap items-center gap-3 rounded-[1.5rem] border border-ink/10 bg-white p-5 shadow-soft">
          <span className={`inline-flex h-11 w-11 items-center justify-center rounded-full font-display text-xl font-bold ${u.is_admin ? "bg-princess-600 text-gold-200" : "bg-ivory text-ink-soft"}`}>
            {(u.email?.[0] ?? "?").toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-ink">{u.email ?? "—"}</p>
            <p className="text-[13px] text-ink-mute">
              {u.is_admin ? "Amministratore" : "Utente standard"} · dal {new Date(u.created_at).toLocaleDateString("it-IT")}
              {u.id === selfId && " · (tu)"}
            </p>
          </div>
          <button
            disabled={pending || (u.id === selfId && u.is_admin)}
            onClick={() => {
              const prev = users;
              setError(null);
              setUsers((list) => list.map((x) => x.id === u.id ? { ...x, is_admin: !x.is_admin } : x));
              start(async () => {
                const r = await setAdminRole(u.id, !u.is_admin, selfId);
                if (!r.ok) {
                  setUsers(prev);
                  setError(r.error ?? "Errore aggiornamento ruolo");
                }
              });
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-gold-500/40 px-4 py-2 text-[12px] font-bold uppercase tracking-[0.12em] text-gold-700 transition hover:bg-gold-50 disabled:opacity-40"
            title={u.is_admin ? "Revoca ruolo admin" : "Rendi admin"}
          >
            {pending ? <Loader2 size={14} className="animate-spin" /> : u.is_admin ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
            {u.is_admin ? "Revoca admin" : "Rendi admin"}
          </button>
          {u.id !== selfId && (
            <button
              disabled={pending}
              onClick={() => {
                if (!confirm(`Eliminare definitivamente ${u.email}?`)) return;
                setError(null);
                start(async () => {
                  const r = await removeAdminUser(u.id, selfId);
                  if (!r.ok) {
                    setError(r.error ?? "Errore rimozione utente");
                  } else {
                    setUsers((list) => list.filter((x) => x.id !== u.id));
                  }
                });
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-4 py-2 text-[12px] font-bold uppercase tracking-[0.12em] text-red-600 transition hover:bg-red-50 disabled:opacity-40"
            >
              <Trash2 size={14} /> Rimuovi
            </button>
          )}
        </li>
      ))}
      {error && <li className="text-[13px] text-red-600">{error}</li>}
      {users.length === 0 && (
        <li className="rounded-3xl border border-dashed border-gold-500/50 bg-white p-8 text-center text-ink-soft">
          Nessun utente registrato.
        </li>
      )}
    </ul>
  );
}
