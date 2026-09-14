"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { UploadCloud, Loader2, ArrowUp, ArrowDown, Pencil, X, Check, Plus, FolderHeart, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { DeleteButton, ToggleButton } from "@/components/admin/controls";
import { uploadGallery, updateGallery, deleteGallery, swapGalleryOrder, saveGalleryCategory, deleteGalleryCategory } from "@/lib/actions/admin";
import SearchInput from "@/components/admin/SearchInput";
import { Select } from "@/components/ui/Select";

export type GRow = {
  id: string;
  file_url: string;
  thumbnail_url: string | null;
  title: string | null;
  description: string | null;
  event_date: string | null;
  event_id: string | null;
  category_id: string | null;
  display_order: number;
  published: boolean;
  gallery_categories?: { name: string } | null;
};

export default function GalleryManager({
  initial,
  cats,
  events,
  total,
  page,
  cat,
  ev,
  q,
  pageSize,
}: {
  initial: GRow[];
  cats: { id: string; name: string }[];
  events: { id: string; title: string }[];
  total: number;
  page: number;
  cat: string;
  ev: string;
  q: string;
  pageSize: number;
}) {
  const [items, setItems] = useState(initial);
  const [drag, setDrag] = useState(false);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [uploadCat, setUploadCat] = useState("");
  const [editing, setEditing] = useState<GRow | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Sincronizza items quando cambiano i prop (cambio pagina/filtro dal server)
  useEffect(() => { setItems(initial); }, [initial]);

  // Costruisce l'URL con i filtri e la pagina richiesta
  const filterUrl = (nextCat: string, nextEv: string, nextPage: number) => {
    const params = new URLSearchParams();
    if (nextPage > 1) params.set("page", String(nextPage));
    if (nextCat) params.set("cat", nextCat);
    if (nextEv) params.set("ev", nextEv);
    if (q) params.set("q", q);
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  const send = (files: FileList | File[]) => {
    const arr = Array.from(files);
    if (arr.length === 0) return;
    setMsg(null);
    start(async () => {
      const fd = new FormData();
      arr.slice(0, 100).forEach((f) => fd.append("files", f));
      fd.set("category_id", uploadCat);
      const r = await uploadGallery(fd);
      if (r.ok) {
        setMsg(`✦ Caricate ${r.count ?? 0} foto su Supabase Storage.`);
        router.refresh();
      } else {
        setMsg(r.error ?? "Upload fallito");
      }
    });
  };

  const move = (index: number, dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= items.length) return;
    const a = items[index];
    const b = items[j];
    // Swap ottimistico nella vista corrente
    const next = [...items];
    [next[index], next[j]] = [next[j], next[index]];
    setItems(next);
    start(async () => {
      const r = await swapGalleryOrder(a.id, b.id);
      if (!r.ok) {
        setItems(items); // rollback allo stato precedente
        setMsg(r.error ?? "Errore scambio ordine");
      } else {
        router.refresh(); // ricarica dati dal server per coerenza
      }
    });
  };

  return (
    <div>
      {/* Upload */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); send(e.dataTransfer.files); }}
        className={`rounded-[1.75rem] border-2 border-dashed p-8 text-center transition sm:p-10 ${
          drag ? "border-princess-500 bg-princess-50" : "border-gold-500/50 bg-white"
        }`}
      >
        <UploadCloud size={36} className="mx-auto text-princess-600" />
        <p className="mt-3 font-display text-2xl font-bold text-ink">Trascina qui 1, 10, 50 o 100 foto</p>
        <p className="mt-1 text-sm text-ink-soft">oppure selezionale dal dispositivo — JPG, PNG, WebP (max 8 MB l&apos;una)</p>
        <div className="mx-auto mt-4 flex max-w-md flex-col gap-2 sm:flex-row">
          <Select
            value={uploadCat}
            onChange={(v) => setUploadCat(v)}
            placeholder="Categoria: da definire"
            emptyLabel="Categoria: da definire"
            options={cats.map((c) => ({ value: c.id, label: c.name }))}
            aria-label="Categoria per le foto caricate"
            className="sm:max-w-xs"
          />
          <label className="btn-princess cursor-pointer !px-6 !py-3 text-[13px]">
            {pending ? <Loader2 size={15} className="animate-spin" /> : null} Scegli foto
            <input type="file" accept="image/*" multiple className="hidden" disabled={pending}
              onChange={(e) => { if (e.target.files) send(e.target.files); e.target.value = ""; }} />
          </label>
        </div>
        {msg && <p className="mt-3 text-sm font-medium text-princess-700" role="status">{msg}</p>}
      </div>

      <AlbumManager cats={cats} onMsg={setMsg} />

      {/* Filtri e ricerca */}
      <div className="mt-5 rounded-[1.5rem] border border-ink/10 bg-white p-5 shadow-soft">
        <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-ink-mute">
          <Filter size={15} className="text-princess-600" /> Cerca e filtra galleria
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <SearchInput placeholder="Cerca per titolo o descrizione..." className="min-w-[200px] max-w-xs" />
          <Select
            value={cat}
            onChange={(v) => router.push(filterUrl(v, ev, 1))}
            placeholder="Tutte le categorie"
            emptyLabel="Tutte le categorie"
            options={cats.map((c) => ({ value: c.id, label: c.name }))}
            aria-label="Filtra per categoria"
            className="min-w-[180px] max-w-xs"
          />
          <Select
            value={ev}
            onChange={(v) => router.push(filterUrl(cat, v, 1))}
            placeholder="Tutti gli eventi"
            emptyLabel="Tutti gli eventi"
            options={events.map((e) => ({ value: e.id, label: e.title }))}
            aria-label="Filtra per evento"
            className="min-w-[180px] max-w-xs"
          />
          {(cat || ev || q) && (
            <Link href="/admin/galleria" className="inline-flex items-center gap-1 rounded-full border border-princess-200 px-4 py-2 text-[12px] font-bold uppercase tracking-[0.12em] text-princess-700 hover:bg-princess-50">
              <X size={13} /> Reset
            </Link>
          )}
        </div>
      </div>

      {/* Griglia */}
      <p className="mt-5 text-sm text-ink-mute">
        {total} foto totali{cat || ev ? ` · ${items.length} nella vista filtrata` : ""} · pagina {page} di {Math.max(1, Math.ceil(total / pageSize))}
      </p>
      <ul className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((g, i) => (
          <li key={g.id} className="overflow-hidden rounded-[1.5rem] border border-ink/10 bg-white shadow-soft">
            <div className="relative h-48">
              <Image src={g.thumbnail_url ?? g.file_url} alt={g.title ?? "Foto galleria"} fill sizes="400px" className="object-cover" />
              {!g.published && (
                <span className="absolute left-3 top-3 rounded-full bg-ink/70 px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.14em] text-white">Nascosta</span>
              )}
              <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.14em] text-princess-700">
                {g.gallery_categories?.name ?? "—"}
              </span>
            </div>
            <div className="p-4">
              <p className="truncate font-semibold text-ink">{g.title || "Senza titolo"}</p>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <button onClick={() => move(i, -1)} disabled={i === 0} className="rounded-full border border-ink/10 p-2 hover:bg-ivory disabled:opacity-30" aria-label="Sposta prima"><ArrowUp size={15} /></button>
                <button onClick={() => move(i, 1)} disabled={i === items.length - 1} className="rounded-full border border-ink/10 p-2 hover:bg-ivory disabled:opacity-30" aria-label="Sposta dopo"><ArrowDown size={15} /></button>
                <button onClick={() => setEditing(g)} className="inline-flex items-center gap-1 rounded-full border border-princess-200 px-3 py-2 text-[11.5px] font-bold uppercase text-princess-700 hover:bg-princess-50" aria-label={`Modifica ${g.title}`}>
                  <Pencil size={13} /> Modifica
                </button>
                <ToggleButton active={g.published} activeLabel="Online" inactiveLabel="Nascosta" onToggle={(n) => updateGallery(g.id, { published: n })} />
                <DeleteButton
                  label={g.title ?? "foto"}
                  onDelete={async () => {
                    const r = await deleteGallery(g.id, g.file_url);
                    if (r.ok) router.refresh();
                    return r;
                  }}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
      {items.length === 0 && (
        <p className="mt-4 rounded-3xl border border-dashed border-gold-500/50 bg-white p-8 text-center text-ink-soft">
          {total === 0 ? "Galleria vuota — carica le prime foto: appariranno subito in /galleria." : "Nessuna foto in questa pagina."}
        </p>
      )}

      {/* Paginazione */}
      {total > pageSize && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href={filterUrl(cat, ev, page - 1)}
            aria-disabled={page <= 1}
            className={`inline-flex items-center gap-1.5 rounded-full border border-princess-200 px-4 py-2 text-[12px] font-bold uppercase tracking-[0.12em] text-princess-700 transition hover:bg-princess-50 ${page <= 1 ? "pointer-events-none opacity-40" : ""}`}
          >
            <ChevronLeft size={14} /> Precedente
          </Link>
          <span className="text-sm font-medium text-ink-mute">
            Pagina {page} di {Math.ceil(total / pageSize)}
          </span>
          <Link
            href={filterUrl(cat, ev, page + 1)}
            aria-disabled={page >= Math.ceil(total / pageSize)}
            className={`inline-flex items-center gap-1.5 rounded-full border border-princess-200 px-4 py-2 text-[12px] font-bold uppercase tracking-[0.12em] text-princess-700 transition hover:bg-princess-50 ${page >= Math.ceil(total / pageSize) ? "pointer-events-none opacity-40" : ""}`}
          >
            Successiva <ChevronRight size={14} />
          </Link>
        </div>
      )}

      {editing && (
        <EditModal item={editing} cats={cats} events={events} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}

function AlbumManager({ cats, onMsg }: { cats: { id: string; name: string }[]; onMsg: (m: string | null) => void }) {
  const [name, setName] = useState("");
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);
  const router = useRouter();

  const submitEdit = (id: string, value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      onMsg("Nome categoria obbligatorio.");
      return;
    }
    start(async () => {
      const r = await saveGalleryCategory({ id, name: trimmed });
      if (!r.ok) {
        onMsg(r.error ?? "Errore");
      } else {
        router.refresh();
      }
      setEditing(null);
    });
  };

  return (
    <div className="mt-5 rounded-[1.5rem] border border-ink/10 bg-white p-5 shadow-soft">
      <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-ink-mute">
        <FolderHeart size={15} className="text-princess-600" /> Album fotografici ({cats.length})
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {cats.map((c) => {
          const isEditing = editing?.id === c.id;
          return (
            <span key={c.id} className="inline-flex items-center gap-2 rounded-full border border-gold-500/40 bg-gold-50 py-1.5 pl-4 pr-2 text-sm font-medium text-ink">
              {isEditing ? (
                <input
                  autoFocus
                  disabled={pending}
                  className="w-28 rounded-full border border-princess-300 bg-white px-2 py-0.5 text-sm font-medium text-ink outline-none focus:border-princess-500 focus:ring-2 focus:ring-princess-200"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); submitEdit(c.id, editing.name); }
                    if (e.key === "Escape") setEditing(null);
                  }}
                  aria-label={`Rinomina album ${c.name}`}
                />
              ) : (
                c.name
              )}
              {isEditing ? (
                <>
                  <button
                    onClick={() => submitEdit(c.id, editing.name)}
                    disabled={pending}
                    className="rounded-full px-2 text-ink-mute transition hover:bg-princess-50 hover:text-princess-700 disabled:opacity-60"
                    aria-label={`Conferma rinomina album ${c.name}`}
                    title="Conferma"
                  >
                    {pending ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    className="rounded-full px-2 text-ink-mute transition hover:bg-ivory hover:text-ink"
                    aria-label="Annulla rinomina"
                    title="Annulla"
                  >
                    <X size={13} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setEditing({ id: c.id, name: c.name })}
                    disabled={pending}
                    className="rounded-full px-2 text-ink-mute transition hover:bg-princess-50 hover:text-princess-700 disabled:opacity-60"
                    aria-label={`Rinomina album ${c.name}`}
                    title={`Rinomina ${c.name}`}
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => {
                      onMsg(null);
                      start(async () => {
                        const r = await deleteGalleryCategory(c.id);
                        if (!r.ok) {
                          onMsg(r.error ?? "Errore");
                        } else {
                          router.refresh();
                        }
                      });
                    }}
                    className="rounded-full px-2 text-ink-mute transition hover:bg-red-50 hover:text-red-600"
                    aria-label={`Elimina album ${c.name}`}
                    title={`Elimina ${c.name}`}
                  >
                    ×
                  </button>
                </>
              )}
            </span>
          );
        })}
      </div>
      <form
        className="mt-4 flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          const trimmed = name.trim();
          if (!trimmed) return;
          onMsg(null);
          start(async () => {
            const r = await saveGalleryCategory({ name: trimmed });
            if (!r.ok) {
              onMsg(r.error ?? "Errore");
            } else {
              setName("");
              router.refresh();
            }
          });
        }}
      >
        <input
          required
          className="input-royal sm:max-w-xs"
          placeholder="Nuovo album…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-label="Nome nuovo album"
        />
        <button type="submit" disabled={pending} className="btn-outline !px-5 !py-2.5 text-[12px] disabled:opacity-60">
          {pending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Aggiungi album
        </button>
      </form>
    </div>
  );
}

function EditModal({ item, cats, events, onClose }: { item: GRow; cats: { id: string; name: string }[]; events: { id: string; title: string }[]; onClose: () => void }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [f, setF] = useState({
    title: item.title ?? "",
    description: item.description ?? "",
    category_id: item.category_id ?? "",
    event_id: item.event_id ?? "",
  });
  const set = (k: keyof typeof f, v: string) => setF((s) => ({ ...s, [k]: v }));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/60 p-5" role="dialog" aria-modal="true" aria-label={`Modifica ${item.title}`}>
      <form
        className="w-full max-w-lg rounded-[1.75rem] bg-white p-7 shadow-royal"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          start(async () => {
            const r = await updateGallery(item.id, {
              title: f.title,
              description: f.description,
              category_id: f.category_id || null,
              event_id: f.event_id || null,
            });
            if (!r.ok) setError(r.error ?? "Errore");
            else onClose();
          });
        }}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-ink">Modifica foto</h2>
          <button type="button" onClick={onClose} aria-label="Chiudi" className="rounded-full border border-ink/10 p-2 hover:bg-ivory"><X size={18} /></button>
        </div>
        <div className="relative mt-4 h-44 overflow-hidden rounded-2xl">
          <Image src={item.file_url} alt={item.title ?? "Foto"} fill sizes="500px" className="object-cover" />
        </div>
        <div className="mt-4 grid gap-3">
          <div><label className="label-royal">Titolo</label><input className="input-royal" value={f.title} onChange={(e) => set("title", e.target.value)} /></div>
          <div><label className="label-royal">Descrizione</label><textarea rows={2} className="input-royal" value={f.description} onChange={(e) => set("description", e.target.value)} /></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="label-royal">Categoria</label>
              <Select
                value={f.category_id}
                onChange={(v) => set("category_id", v)}
                placeholder="—"
                emptyLabel="—"
                options={cats.map((c) => ({ value: c.id, label: c.name }))}
              />
            </div>
            <div><label className="label-royal">Evento</label>
              <Select
                value={f.event_id}
                onChange={(v) => set("event_id", v)}
                placeholder="—"
                emptyLabel="—"
                options={events.map((ev) => ({ value: ev.id, label: ev.title }))}
              />
            </div>
          </div>
        </div>
        {error && <p className="mt-3 text-sm text-princess-700">{error}</p>}
        <div className="mt-5 flex gap-3">
          <button type="submit" disabled={pending} className="btn-princess !px-6 !py-3 text-[13px] disabled:opacity-60">
            {pending ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Salva
          </button>
          <button type="button" onClick={onClose} className="btn-outline !px-6 !py-3 text-[13px]">Annulla</button>
        </div>
      </form>
    </div>
  );
}
