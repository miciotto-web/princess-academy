"use client";

import { useState, useTransition } from "react";
import { Loader2, Save, StickyNote } from "lucide-react";
import { setBookingStatus, setBookingNotes, deleteBooking } from "@/lib/actions/admin";
import { DeleteButton } from "@/components/admin/controls";
import { BOOKING_STATUS, type BookingStatus } from "@/types/db";
import { cn } from "@/lib/utils";
import { Select } from "@/components/ui/Select";

export type BRow = {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  event_date: string;
  event_time: string;
  location: string;
  event_type: string;
  guests: string | null;
  children_age: string | null;
  duration: string | null;
  servizi: string | null;
  message: string | null;
  status: BookingStatus;
  admin_notes: string | null;
  princesses?: { name: string } | null;
};

const STATUS_STYLE: Record<BookingStatus, string> = {
  NUOVA: "bg-princess-600 text-white",
  CONTATTATA: "bg-sky-100 text-sky-800",
  "IN TRATTATIVA": "bg-gold-100 text-gold-700",
  CONFERMATA: "bg-emerald-100 text-emerald-800",
  COMPLETATA: "bg-ink/10 text-ink",
  ANNULLATA: "bg-red-100 text-red-700",
};

export function StatusPill({ status }: { status: BookingStatus }) {
  return (
    <span className={cn("rounded-full px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.14em]", STATUS_STYLE[status])}>
      {status}
    </span>
  );
}

export default function BookingCard({ b }: { b: BRow }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [notes, setNotes] = useState(b.admin_notes ?? "");
  const [saved, setSaved] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);
  const [status, setStatus] = useState(b.status);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [statusWarning, setStatusWarning] = useState<string | null>(null);

  return (
    <li className="rounded-[1.5rem] border border-ink/10 bg-white p-5 shadow-soft">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full flex-wrap items-center gap-3 text-left" aria-expanded={open}>
        <div className="min-w-0 flex-1">
          <p className="font-display text-[22px] font-bold text-ink">
            {b.first_name} {b.last_name}
          </p>
          <p className="truncate text-sm text-ink-mute">
            {b.event_type} · {b.event_date} · {b.location}
          </p>
        </div>
        <StatusPill status={status} />
        <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-princess-700">
          {open ? "Chiudi" : "Apri"}
        </span>
      </button>

      {open && (
        <div className="mt-4 grid gap-4 border-t border-ink/10 pt-4 sm:grid-cols-2">
          <dl className="space-y-2 text-[14px]">
            <Dato k="Email" v={b.email} />
            <Dato k="Telefono" v={b.phone} />
            <Dato k="Data / ora" v={`${b.event_date} · ${b.event_time}`} />
            <Dato k="Luogo" v={b.location} />
            <Dato k="Invitati" v={b.guests ?? "—"} />
            <Dato k="Età bambini" v={b.children_age ?? "—"} />
            <Dato k="Princess" v={b.princesses?.name ?? "Sorprendeteci ✨"} />
            <Dato k="Durata" v={b.duration ?? "—"} />
            <Dato k="Servizi" v={b.servizi ?? "—"} />
            <Dato k="Richiesta del" v={new Date(b.created_at).toLocaleString("it-IT")} />
          </dl>
          <div>
            <p className="label-royal">Messaggio del cliente</p>
            <p className="rounded-2xl bg-ivory p-4 text-[14px] leading-relaxed text-ink-soft">
              {b.message || "—"}
            </p>
            <div className="mt-4">
              <label className="label-royal" htmlFor={`st-${b.id}`}>Stato richiesta</label>
              <Select
                id={`st-${b.id}`}
                value={status}
                disabled={pending}
                onChange={(next) => {
                  const n = next as BookingStatus;
                  const prev = status;
                  setStatus(n);
                  setStatusError(null);
                  setStatusWarning(null);
                  start(async () => {
                    const r = await setBookingStatus(b.id, n);
                    if (!r.ok) {
                      setStatus(prev);
                      setStatusError(r.error ?? "Errore aggiornamento stato");
                    } else if (r.warning) {
                      setStatusWarning(r.warning);
                    }
                  });
                }}
                options={BOOKING_STATUS.map((s) => ({ value: s, label: s }))}
              />
              {statusError && <p className="mt-1 text-xs text-princess-700">{statusError}</p>}
              {statusWarning && (
                <div className="mt-3 rounded-2xl border border-gold-500 bg-gold-50 p-3 text-[13px] font-medium text-gold-900" role="alert">
                  ⚠️ {statusWarning}
                </div>
              )}
            </div>
            <div className="mt-4">
              <label className="label-royal flex items-center gap-1.5" htmlFor={`nt-${b.id}`}>
                <StickyNote size={13} /> Note private admin
              </label>
              <textarea
                id={`nt-${b.id}`}
                rows={3}
                className="input-royal"
                value={notes}
                onChange={(e) => { setNotes(e.target.value); setSaved(false); }}
                placeholder="Solo per noi: budget, callback, dettagli location…"
              />
              <button
                disabled={pending}
                onClick={() => {
                  setSaved(false);
                  setNotesError(null);
                  start(async () => {
                    const r = await setBookingNotes(b.id, notes);
                    if (r.ok) setSaved(true);
                    else setNotesError(r.error ?? "Errore salvataggio note");
                  });
                }}
                className="btn-outline mt-2 !px-5 !py-2.5 text-[12px] disabled:opacity-60"
              >
                {pending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {saved ? "Salvate ✦" : "Salva note"}
              </button>
              {notesError && <p className="mt-1 text-[12px] text-red-600">{notesError}</p>}
              <div className="mt-4 border-t border-ink/10 pt-3">
                <DeleteButton label={`richiesta di ${b.first_name} ${b.last_name}`} onDelete={() => deleteBooking(b.id)} />
                <p className="mt-1.5 text-[12px] text-ink-mute">Elimina definitivamente (diritto all&apos;oblio GDPR).</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}

function Dato({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-28 shrink-0 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-mute">{k}</dt>
      <dd className="min-w-0 flex-1 break-words text-ink">{v}</dd>
    </div>
  );
}
