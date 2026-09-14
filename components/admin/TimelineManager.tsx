"use client";

import { useState, useEffect, useTransition } from "react";
import { Plus, Loader2, X, ArrowUp, ArrowDown, UploadCloud, Check } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { DeleteButton, ToggleButton } from "@/components/admin/controls";
import { saveTimeline, deleteTimeline, reorderTimeline, uploadTimelineImage } from "@/lib/actions/admin";

export type TRow = {
  id: string;
  year: string;
  title: string;
  description: string | null;
  image: string | null;
  display_order: number;
  published: boolean;
};

export default function TimelineManager({ initial }: { initial: TRow[] }) {
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState<TRow | "new" | null>(null);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Sincronizza lo stato locale quando il Server Component ri-esegue
  // (es. dopo router.refresh() post-salvataggio o post-cancellazione).
  useEffect(() => {
    setItems(initial);
  }, [initial]);

  const move = (i: number, dir: -1 | 1) => {
    const next = [...items];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    const prev = items;
    setItems(next);
    start(async () => {
      const r = await reorderTimeline(next.map((t) => t.id));
      if (!r.ok) {
        setItems(prev);
        setError(r.error ?? "Errore riordinamento");
      }
    });
  };

  return (
    <div>
      <button onClick={() => setEditing("new")} className="btn-princess !px-6 !py-3 text-[13px]">
        <Plus size={16} /> Nuova tappa
      </button>
      {editing && <TForm value={editing === "new" ? null : editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); router.refresh(); }} />}
      {error && <p className="mt-3 text-[13px] text-red-600">{error}</p>}
      <ol className="mt-6 space-y-4">
        {items.map((t, i) => (
          <li key={t.id} className="flex gap-3 rounded-[1.5rem] border border-ink/10 bg-white p-5 shadow-soft">
            <div className="flex flex-col gap-1">
              <button onClick={() => move(i, -1)} disabled={i === 0 || pending} className="rounded-full border border-ink/10 p-1.5 hover:bg-ivory disabled:opacity-30" aria-label="Sposta prima"><ArrowUp size={14} /></button>
              <button onClick={() => move(i, 1)} disabled={i === items.length - 1 || pending} className="rounded-full border border-ink/10 p-1.5 hover:bg-ivory disabled:opacity-30" aria-label="Sposta dopo"><ArrowDown size={14} /></button>
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-princess-600 px-3.5 py-1 font-display text-[16px] font-bold text-white">{t.year}</span>
                <span className="font-display text-[22px] font-bold text-ink">{t.title}</span>
              </p>
              <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{t.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <ToggleButton active={t.published} activeLabel="Pubblicata" inactiveLabel="Bozza" onToggle={(n) => saveTimeline({ id: t.id, year: t.year, title: t.title, image: t.image ?? undefined, published: n })} />
                <button onClick={() => setEditing(t)} className="rounded-full border border-princess-200 px-4 py-2 text-[12px] font-bold uppercase tracking-[0.12em] text-princess-700 hover:bg-princess-50">Modifica</button>
                <DeleteButton
                  label={t.title}
                  onDelete={async () => {
                    const r = await deleteTimeline(t.id);
                    if (r.ok) router.refresh();
                    return r;
                  }}
                />
              </div>
            </div>
          </li>
        ))}
      </ol>
      {items.length === 0 && <p className="mt-4 rounded-3xl border border-dashed border-gold-500/50 bg-white p-8 text-center text-ink-soft">Timeline vuota — il sito mostra la timeline dimostrativa finché non aggiungi tappe reali.</p>}
    </div>
  );
}

function TForm({ value, onClose, onSaved }: { value: TRow | null; onClose: () => void; onSaved: () => void }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [f, setF] = useState({
    year: value?.year ?? "",
    title: value?.title ?? "",
    description: value?.description ?? "",
    image: value?.image ?? "",
    display_order: String(value?.display_order ?? 0),
    published: value?.published ?? true,
  });
  const set = (k: keyof typeof f, v: string | boolean) => setF((s) => ({ ...s, [k]: v }));

  // Cleanup blob URL quando il componente si smonta o cambia l'anteprima.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Reset blob se si apre un'altra tappa.
  useEffect(() => {
    return () => {
      setPendingFile(null);
      setPreviewUrl(null);
    };
  }, [value?.id]);

  const setPending = (file: File | null) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPendingFile(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  return (
    <form
      className="mt-6 rounded-[1.5rem] border border-gold-500/40 bg-gradient-to-b from-white to-gold-50/50 p-6 shadow-golden"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        start(async () => {
          const r = await saveTimeline({
            id: value?.id, year: f.year, title: f.title, description: f.description,
            image: f.image, display_order: Number(f.display_order) || 0, published: f.published,
          });
          if (!r.ok) { setError(r.error ?? "Errore"); return; }
          const newId = r.id ?? value?.id;
          if (pendingFile && newId) {
            const fd = new FormData();
            fd.set("file", pendingFile);
            const ur = await uploadTimelineImage(newId, fd);
            if (!ur.ok) {
              setError(`Tappa creata, ma caricamento immagine fallito: ${ur.error ?? "errore"}. Riprova da Modifica.`);
              onSaved();
              return;
            }
          }
          onSaved();
        });
      }}
    >
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-ink">{value ? "Modifica tappa" : "Nuova tappa"}</h2>
        <button type="button" onClick={onClose} aria-label="Chiudi" className="rounded-full border border-ink/10 p-2 hover:bg-white"><X size={18} /></button>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-[140px_1fr_140px]">
        <div><label className="label-royal">Anno *</label><input className="input-royal" value={f.year} onChange={(e) => set("year", e.target.value)} required placeholder="2026" /></div>
        <div><label className="label-royal">Titolo *</label><input className="input-royal" value={f.title} onChange={(e) => set("title", e.target.value)} required /></div>
        <div><label className="label-royal">Ordine</label><input className="input-royal" inputMode="numeric" value={f.display_order} onChange={(e) => set("display_order", e.target.value)} /></div>
      </div>
      <div className="mt-4"><label className="label-royal">Descrizione</label><textarea rows={3} className="input-royal" value={f.description} onChange={(e) => set("description", e.target.value)} /></div>
      <div className="mt-4">
        <label className="label-royal">Immagine</label>
        <input
          className="input-royal"
          value={f.image}
          onChange={(e) => set("image", e.target.value)}
          placeholder="https://…/site-assets/timeline/…"
        />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-princess-200 px-4 py-2 text-[12px] font-bold uppercase tracking-[0.12em] text-princess-700 transition hover:bg-princess-50 disabled:opacity-60">
            {pendingFile ? <Check size={13} /> : <UploadCloud size={13} />}
            {pendingFile ? "Immagine selezionata" : "Carica foto (opzionale)"}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={pending}
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setPending(file);
                e.target.value = "";
              }}
            />
          </label>
          {pendingFile && (
            <button
              type="button"
              onClick={() => setPending(null)}
              className="rounded-full border border-ink/10 px-3 py-1 text-[11px] font-bold uppercase text-ink-mute hover:bg-ink/5"
            >
              Rimuovi
            </button>
          )}
          <span className="text-[12px] text-ink-mute">
            {pendingFile
              ? "L'immagine verrà caricata quando salvi la tappa."
              : "oppure incolla un URL sopra."}
          </span>
        </div>
        {(previewUrl || f.image) && (
          <div className="relative mt-3 h-40 w-full overflow-hidden rounded-2xl border border-ink/10">
            <Image
              src={(previewUrl || f.image) as string}
              alt={`Anteprima ${f.title || "tappa"}`}
              fill
              sizes="400px"
              className="object-cover"
              unoptimized={!!previewUrl}
            />
          </div>
        )}
      </div>
      <label className="mt-4 flex cursor-pointer items-center gap-3">
        <input type="checkbox" checked={f.published} onChange={(e) => set("published", e.target.checked)} className="h-4 w-4 accent-[#C7147D]" />
        <span className="text-sm font-medium text-ink">Pubblicata sul sito</span>
      </label>
      {error && <p className="mt-3 text-sm text-princess-700">{error}</p>}
      <div className="mt-5 flex gap-3">
        <button type="submit" disabled={pending} className="btn-princess !px-6 !py-3 text-[13px] disabled:opacity-60">
          {pending ? <Loader2 size={15} className="animate-spin" /> : null} Salva tappa
        </button>
        <button type="button" onClick={onClose} className="btn-outline !px-6 !py-3 text-[13px]">Annulla</button>
      </div>
    </form>
  );
}
