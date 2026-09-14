"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Loader2, X, UploadCloud, Sparkles, Wand2 } from "lucide-react";
import { DeleteButton, ToggleButton } from "@/components/admin/controls";
import { saveEvent, deleteEvent, saveEventCategory, deleteEventCategory, uploadEventImage } from "@/lib/actions/admin";
import { isValidHttpUrl } from "@/lib/utils";
import { EventIconPicker, EventGradientPicker, EventPreview, type IconKey, type GradientKey } from "@/components/admin/EventDesignFields";
import { Select } from "@/components/ui/Select";

export type EventRow = {
  id: string;
  title: string;
  description: string | null;
  duration: string | null;
  services: string[] | null;
  price: string | null;
  information: string | null;
  availability: string | null;
  category_id: string | null;
  main_image: string | null;
  display_order: number;
  published: boolean;
  icon: string | null;
  gradient: string | null;
  event_categories?: { name: string } | null;
};

export type CatRow = { id: string; name: string; slug: string };

export default function EventManager({ initial, cats }: { initial: EventRow[]; cats: CatRow[] }) {
  const [editing, setEditing] = useState<EventRow | "new" | null>(null);
  const [catName, setCatName] = useState("");
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <button onClick={() => setEditing("new")} className="btn-princess !px-6 !py-3 text-[13px]">
          <Plus size={16} /> Nuovo evento
        </button>
      </div>

      <div className="mt-6 rounded-[1.5rem] border border-ink/10 bg-white p-5 shadow-soft">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-ink-mute">
          Categorie ({cats.length}) — modificabili, usate dal sito
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {cats.map((c) => (
            <span key={c.id} className="inline-flex items-center gap-2 rounded-full border border-gold-500/40 bg-gold-50 py-1.5 pl-4 pr-2 text-sm font-medium text-ink">
              {c.name}
              <button
                onClick={() => {
                  setMsg(null);
                  start(async () => {
                    const r = await deleteEventCategory(c.id);
                    if (!r.ok) {
                      setMsg(r.error ?? "Errore");
                    } else {
                      router.refresh();
                    }
                  });
                }}
                className="rounded-full px-2 text-ink-mute transition hover:bg-red-50 hover:text-red-600"
                aria-label={`Elimina categoria ${c.name}`}
                title={`Elimina ${c.name}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <form
          className="mt-4 flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            const trimmed = catName.trim();
            if (!trimmed) return;
            setMsg(null);
            start(async () => {
              const r = await saveEventCategory({ name: trimmed });
              if (!r.ok) {
                setMsg(r.error ?? "Errore");
              } else {
                setCatName("");
                router.refresh();
              }
            });
          }}
        >
          <input
            required
            className="input-royal sm:max-w-xs"
            placeholder="Nuova categoria…"
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
            aria-label="Nome nuova categoria evento"
          />
          <button type="submit" disabled={pending} className="btn-outline !px-5 !py-2.5 text-[12px] disabled:opacity-60">
            {pending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Aggiungi categoria
          </button>
        </form>
        {msg && <p className="mt-2 text-sm text-princess-700">{msg}</p>}
      </div>

      {editing && (
        <div className="mt-6">
          <EventForm cats={cats} value={editing === "new" ? null : editing} onClose={() => setEditing(null)} />
        </div>
      )}

      <ul className="mt-6 space-y-4">
        {initial.map((e) => (
          <li key={e.id} className="rounded-[1.5rem] border border-ink/10 bg-white p-5 shadow-soft">
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-display text-2xl font-bold text-ink">{e.title}</p>
                <p className="truncate text-sm text-ink-mute">
                  {e.event_categories?.name ?? "Senza categoria"} · {e.duration} {e.price ? `· ${e.price}` : ""}
                </p>
              </div>
              <ToggleButton
                active={e.published}
                activeLabel="Pubblicato"
                inactiveLabel="Bozza"
                onToggle={async (n) =>
                  saveEvent({ id: e.id, title: e.title, published: n })
                }
              />
              <button onClick={() => setEditing(e)} className="rounded-full border border-princess-200 px-4 py-2 text-[12px] font-bold uppercase tracking-[0.12em] text-princess-700 hover:bg-princess-50">
                Modifica
              </button>
              <DeleteButton label={e.title} onDelete={() => deleteEvent(e.id)} />
            </div>
          </li>
        ))}
        {initial.length === 0 && (
          <li className="rounded-3xl border border-dashed border-gold-500/50 bg-white p-8 text-center text-ink-soft">
            Nessun evento — creane uno: apparirà in /eventi.
          </li>
        )}
      </ul>
    </div>
  );
}

function EventForm({ cats, value, onClose }: { cats: CatRow[]; value: EventRow | null; onClose: () => void }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [f, setF] = useState({
    title: value?.title ?? "",
    description: value?.description ?? "",
    duration: value?.duration ?? "",
    services: (value?.services ?? []).join("\n"),
    price: value?.price ?? "",
    information: value?.information ?? "",
    availability: value?.availability ?? "Disponibile",
    category_id: value?.category_id ?? "",
    main_image: value?.main_image ?? "",
    display_order: String(value?.display_order ?? 0),
    published: value?.published ?? false,
    icon: (value?.icon as IconKey | null) ?? "sparkles",
    gradient: (value?.gradient as GradientKey | null) ?? "",
  });
  const set = (k: keyof typeof f, v: string | boolean) => setF((s) => ({ ...s, [k]: v }));
  const input = "input-royal";
  const label = "label-royal";

  return (
    <form
      className="rounded-[1.5rem] border border-gold-500/40 bg-gradient-to-b from-white to-gold-50/50 p-6 shadow-golden sm:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        start(async () => {
          const r = await saveEvent({
            id: value?.id,
            title: f.title,
            description: f.description,
            duration: f.duration,
            services: f.services,
            price: f.price,
            information: f.information,
            availability: f.availability,
            category_id: f.category_id || null,
            main_image: f.main_image,
            display_order: Number(f.display_order) || 0,
            published: f.published,
            icon: f.icon,
            gradient: f.gradient,
          });
          if (!r.ok) setError(r.error ?? "Errore");
          else onClose();
        });
      }}
    >
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-ink">{value ? `Modifica ${value.title}` : "Nuovo evento"}</h2>
        <button type="button" onClick={onClose} aria-label="Chiudi" className="rounded-full border border-ink/10 p-2 hover:bg-white"><X size={18} /></button>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div><label className={label}>Titolo *</label><input className={input} value={f.title} onChange={(e) => set("title", e.target.value)} required /></div>
        <div><label className={label}>Categoria</label>
          <Select
            value={f.category_id}
            onChange={(v) => set("category_id", v)}
            emptyLabel="— Nessuna —"
            placeholder="— Nessuna —"
            options={cats.map((c) => ({ value: c.id, label: c.name }))}
          />
        </div>
        <div className="sm:col-span-2"><label className={label}>Descrizione</label><textarea rows={3} className={input} value={f.description} onChange={(e) => set("description", e.target.value)} /></div>
        <div><label className={label}>Durata</label><input className={input} value={f.duration} onChange={(e) => set("duration", e.target.value)} placeholder="2 – 3 ore" /></div>
        <div><label className={label}>Prezzo (opzionale)</label><input className={input} value={f.price} onChange={(e) => set("price", e.target.value)} placeholder="da € 390" /></div>
        <div className="sm:col-span-2"><label className={label}>Servizi (uno per riga)</label><textarea rows={3} className={input} value={f.services} onChange={(e) => set("services", e.target.value)} /></div>
        <div className="sm:col-span-2"><label className={label}>Informazioni / disponibilità</label><textarea rows={2} className={input} value={f.information} onChange={(e) => set("information", e.target.value)} /></div>
        <div><label className={label}>Disponibilità</label><input className={input} value={f.availability} onChange={(e) => set("availability", e.target.value)} /></div>
        <div><label className={label}>Ordine</label><input className={input} inputMode="numeric" value={f.display_order} onChange={(e) => set("display_order", e.target.value)} /></div>
        <div className="sm:col-span-2 mt-2 border-t border-gold-500/30 pt-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-ink-mute"><Sparkles size={12} className="mr-1 inline" /> Personalizzazione visuale (FASE 2.9F)</p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <EventIconPicker value={f.icon} onChange={(v) => set("icon", v)} />
            <EventGradientPicker value={f.gradient} onChange={(v) => set("gradient", v)} />
          </div>
          <div className="mt-4">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-ink-mute"><Wand2 size={12} className="mr-1 inline" /> Anteprima live</p>
            <EventPreview icon={f.icon} gradient={f.gradient} title={f.title || "Titolo evento"} category={cats.find((c) => c.id === f.category_id)?.name ?? "Categoria"} />
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className={label}>Immagine principale — URL</label>
          <input className={input} value={f.main_image} onChange={(e) => set("main_image", e.target.value)} placeholder="https://…/event-images/…" />
          {isValidHttpUrl(f.main_image) && (
            <div className="relative mt-3 h-40 w-full overflow-hidden rounded-2xl border border-ink/10">
              <Image src={f.main_image} alt={`Anteprima ${f.title}`} fill sizes="400px" className="object-cover" />
            </div>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-princess-200 px-4 py-2 text-[12px] font-bold uppercase tracking-[0.12em] text-princess-700 transition hover:bg-princess-50 disabled:opacity-60">
              {uploading ? <Loader2 size={13} className="animate-spin" /> : <UploadCloud size={13} />} Carica immagine
              <input type="file" accept="image/*" className="hidden" disabled={uploading || !value?.id}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file || !value?.id) return;
                  setUploadError(null);
                  setUploading(true);
                  start(async () => {
                    const fd = new FormData();
                    fd.set("file", file);
                    const r = await uploadEventImage(value.id, fd);
                    setUploading(false);
                    if (!r.ok) setUploadError(r.error ?? "Upload fallito");
                    else if (r.url) set("main_image", r.url);
                  });
                  e.target.value = "";
                }}
              />
            </label>
            <span className="text-[12px] text-ink-mute">oppure incolla un URL sopra. {value?.id ? "" : "Salva l'evento prima di caricare."}</span>
          </div>
          {uploadError && <p className="mt-1 text-[12px] text-red-600">{uploadError}</p>}
        </div>
        <label className="flex cursor-pointer items-center gap-3 sm:col-span-2">
          <input type="checkbox" checked={f.published} onChange={(e) => set("published", e.target.checked)} className="h-4 w-4 accent-[#C7147D]" />
          <span className="text-sm font-medium text-ink">Pubblicato sul sito</span>
        </label>
      </div>
      {error && <p className="mt-4 rounded-2xl bg-princess-50 px-4 py-3 text-sm text-princess-700" role="alert">{error}</p>}
      <div className="mt-5 flex gap-3">
        <button type="submit" disabled={pending} className="btn-princess !px-6 !py-3 text-[13px] disabled:opacity-60">
          {pending ? <Loader2 size={15} className="animate-spin" /> : null} Salva evento
        </button>
        <button type="button" onClick={onClose} className="btn-outline !px-6 !py-3 text-[13px]">Annulla</button>
      </div>
    </form>
  );
}
