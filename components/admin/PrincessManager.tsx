"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Loader2, X, ImagePlus, UploadCloud, Check } from "lucide-react";
import { DeleteButton, ToggleButton } from "@/components/admin/controls";
import {
  savePrincess,
  deletePrincess,
  togglePrincess,
  uploadPrincessImage,
  deletePrincessImage,
  setPrincessMainImage,
} from "@/lib/actions/admin";
import { isValidHttpUrl, slugify } from "@/lib/utils";

export type PrincessRow = {
  id: string;
  name: string;
  slug: string;
  character_name: string | null;
  role: string | null;
  description: string | null;
  biography: string | null;
  specialties: string[] | null;
  main_image: string | null;
  social_instagram: string | null;
  social_tiktok: string | null;
  is_active: boolean;
  display_order: number;
  princess_images?: { id: string; file_url: string; title: string | null }[];
};

const EMPTY: PrincessRow = {
  id: "",
  name: "",
  slug: "",
  character_name: "",
  role: "",
  description: "",
  biography: "",
  specialties: [],
  main_image: "",
  social_instagram: "",
  social_tiktok: "",
  is_active: true,
  display_order: 0,
};

export default function PrincessManager({ initial }: { initial: PrincessRow[] }) {
  const [editing, setEditing] = useState<PrincessRow | "new" | null>(null);

  return (
    <div>
      <button onClick={() => setEditing("new")} className="btn-princess !px-6 !py-3 text-[13px]">
        <Plus size={16} /> Nuova Princess
      </button>

      {editing && (
        <div className="mt-6">
          <PrincessForm
            value={editing === "new" ? EMPTY : editing}
            onClose={() => setEditing(null)}
          />
        </div>
      )}

      <ul className="mt-6 space-y-4">
        {initial.map((p) => (
          <li key={p.id} className="rounded-[1.5rem] border border-ink/10 bg-white p-5 shadow-soft">
            <div className="flex flex-wrap items-center gap-4">
              <span className="relative block h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-gold-500/60 bg-princess-50">
                {p.main_image ? (
                  <Image src={p.main_image} alt={p.name} fill sizes="64px" className="object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center font-display text-2xl font-bold text-princess-600">
                    {p.name[0]}
                  </span>
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-2xl font-bold text-ink">{p.name}</p>
                <p className="truncate text-sm text-ink-mute">
                  {p.character_name} · {p.role} · ordine {p.display_order}
                </p>
              </div>
              <ToggleButton active={p.is_active} activeLabel="Visibile" inactiveLabel="Nascosta" onToggle={(n) => togglePrincess(p.id, n)} />
              <button onClick={() => setEditing(p)} className="rounded-full border border-princess-200 px-4 py-2 text-[12px] font-bold uppercase tracking-[0.12em] text-princess-700 hover:bg-princess-50">
                Modifica
              </button>
              <DeleteButton label={p.name} onDelete={() => deletePrincess(p.id)} />
            </div>
            <ImageManager princessId={p.id} images={p.princess_images ?? []} />
          </li>
        ))}
        {initial.length === 0 && (
          <li className="rounded-3xl border border-dashed border-gold-500/50 bg-white p-8 text-center text-ink-soft">
            Nessuna Princess nel database — creane una: apparirà subito nel sito.
          </li>
        )}
      </ul>
    </div>
  );
}

function PrincessForm({ value, onClose }: { value: PrincessRow; onClose: () => void }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  // File principale selezionato PRIMA del salvataggio (solo in "Nuova Princess").
  // Persiste in memoria del client finché l'utente clicca "Salva Princess".
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  // Preview locale (blob URL) per il file selezionato prima del salvataggio.
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Cleanup blob URL quando cambia o quando il componente si smonta.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);
  const [form, setForm] = useState({
    name: value.name,
    slug: value.slug ?? "",
    character_name: value.character_name ?? "",
    role: value.role ?? "",
    description: value.description ?? "",
    biography: value.biography ?? "",
    specialties: (value.specialties ?? []).join("\n"),
    main_image: value.main_image ?? "",
    social_instagram: value.social_instagram ?? "",
    social_tiktok: value.social_tiktok ?? "",
    display_order: String(value.display_order ?? 0),
    is_active: value.is_active,
  });
  const set = (k: keyof typeof form, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const input = "input-royal";
  const label = "label-royal";

  // Slug automatico derivato dal nome, come preview/placeholder.
  // Se l'admin ha già uno slug personalizzato, non sovrascrivemai: uso il suo.
  const autoSlug = (() => {
    const manual = form.slug.trim();
    if (manual) return manual;
    const base = form.name.trim() || value.name;
    return slugify(base);
  })();

  return (
    <form
      className="rounded-[1.5rem] border border-gold-500/40 bg-gradient-to-b from-white to-gold-50/50 p-6 shadow-golden sm:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        start(async () => {
          const r = await savePrincess({
            id: value.id || undefined,
            name: form.name,
            slug: form.slug,
            character_name: form.character_name,
            role: form.role,
            description: form.description,
            biography: form.biography,
            specialties: form.specialties,
            main_image: form.main_image,
            social_instagram: form.social_instagram,
            social_tiktok: form.social_tiktok,
            display_order: Number(form.display_order) || 0,
            is_active: form.is_active,
          });
          if (!r.ok) {
            setError(r.error ?? "Errore");
            return;
          }
          // Princess salvata. Se abbiamo un file principale in attesa (caso "Nuova Princess"),
          // caricalo adesso usando l'id appena ottenuto.
          const newId = r.id ?? value.id;
          if (pendingFile && newId) {
            const fd = new FormData();
            fd.set("file", pendingFile);
            const ur = await setPrincessMainImage(newId, fd);
            if (!ur.ok) {
              // Princess creata correttamente, ma upload immagine fallito.
              // Mostriamo un warning non bloccante: la Princess è valida, l'utente può
              // ricaricare l'immagine da Modifica.
              setError(
                `Princess creata, ma caricamento immagine fallito: ${ur.error ?? "errore"}. Riprova da Modifica.`
              );
              router.refresh();
              return;
            }
          }
          onClose();
          router.refresh();
        });
      }}
    >
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-ink">{value.id ? `Modifica ${value.name}` : "Nuova Princess"}</h2>
        <button type="button" onClick={onClose} aria-label="Chiudi" className="rounded-full border border-ink/10 p-2 hover:bg-white">
          <X size={18} />
        </button>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div><label className={label} htmlFor="p-nome">Nome *</label><input id="p-nome" className={input} value={form.name} onChange={(e) => set("name", e.target.value)} required /></div>
        <div>
          <label className={label} htmlFor="p-slug">Slug</label>
          <input
            id="p-slug"
            className={input}
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
            placeholder={autoSlug}
            spellCheck={false}
            autoComplete="off"
          />
          <p className="mt-1 text-[12px] text-ink-mute">Se lasci vuoto, verrà generato automaticamente dal nome.</p>
          {autoSlug && (
            <p className="mt-1 text-[12px] text-ink-soft">
              <span className="font-medium text-ink-mute">Anteprima:</span>{" "}
              <code className="rounded bg-ivory px-1.5 py-0.5 text-[11px] text-princess-700">/{autoSlug}</code>
            </p>
          )}
        </div>
        <div><label className={label} htmlFor="p-pg">Nome personaggio</label><input id="p-pg" className={input} value={form.character_name} onChange={(e) => set("character_name", e.target.value)} placeholder="La Principessa del Mattino" /></div>
        <div><label className={label} htmlFor="p-ruolo">Ruolo</label><input id="p-ruolo" className={input} value={form.role} onChange={(e) => set("role", e.target.value)} /></div>
        <div><label className={label} htmlFor="p-ordine">Ordine</label><input id="p-ordine" className={input} inputMode="numeric" value={form.display_order} onChange={(e) => set("display_order", e.target.value)} /></div>
        <div className="sm:col-span-2"><label className={label} htmlFor="p-desc">Descrizione breve</label><textarea id="p-desc" rows={2} className={input} value={form.description} onChange={(e) => set("description", e.target.value)} /></div>
        <div className="sm:col-span-2"><label className={label} htmlFor="p-bio">Biografia (paragrafi separati da riga vuota)</label><textarea id="p-bio" rows={4} className={input} value={form.biography} onChange={(e) => set("biography", e.target.value)} /></div>
        <div className="sm:col-span-2"><label className={label} htmlFor="p-spec">Specialità (una per riga)</label><textarea id="p-spec" rows={3} className={input} value={form.specialties} onChange={(e) => set("specialties", e.target.value)} /></div>
        <div className="sm:col-span-2">
          <label className={label} htmlFor="p-img">Foto principale — URL</label>
          <input id="p-img" className={input} value={form.main_image} onChange={(e) => set("main_image", e.target.value)} placeholder="https://…/princess-images/…" />
          {isValidHttpUrl(form.main_image) && (
            <div className="relative mt-3 h-40 w-full overflow-hidden rounded-2xl border border-ink/10">
              <Image src={form.main_image} alt={`Anteprima ${form.name}`} fill sizes="400px" className="object-cover" />
            </div>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {value.id ? (
              // ─── Princess esistente: upload immediato via setPrincessMainImage ───
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-princess-200 px-4 py-2 text-[12px] font-bold uppercase tracking-[0.12em] text-princess-700 transition hover:bg-princess-50 disabled:opacity-60">
                {uploading ? <Loader2 size={13} className="animate-spin" /> : <UploadCloud size={13} />} Carica immagine
                <input type="file" accept="image/*" className="sr-only" disabled={uploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploadError(null);
                    setUploading(true);
                    start(async () => {
                      const fd = new FormData();
                      fd.set("file", file);
                      const r = await setPrincessMainImage(value.id, fd);
                      setUploading(false);
                      if (!r.ok) setUploadError(r.error ?? "Upload fallito");
                      else if (r.url) {
                        set("main_image", r.url);
                        router.refresh();
                      }
                    });
                    e.target.value = "";
                  }}
                />
              </label>
            ) : (
              // ─── Nuova Princess: file in stato pending, verrà caricato dopo savePrincess ───
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-princess-200 px-4 py-2 text-[12px] font-bold uppercase tracking-[0.12em] text-princess-700 transition hover:bg-princess-50 disabled:opacity-60">
                {pendingFile ? <Check size={13} /> : <UploadCloud size={13} />}
                {pendingFile ? "Immagine selezionata" : "Carica immagine (opzionale)"}
                <input type="file" accept="image/*" className="sr-only" disabled={pending}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploadError(null);
                    // Rilascia eventuale blob precedente
                    if (previewUrl) URL.revokeObjectURL(previewUrl);
                    setPendingFile(file);
                    setPreviewUrl(URL.createObjectURL(file));
                    e.target.value = "";
                  }}
                />
              </label>
            )}
            <span className="text-[12px] text-ink-mute">
              {value.id
                ? "oppure incolla un URL sopra."
                : pendingFile
                  ? "L'immagine verrà caricata quando salvi la Princess."
                  : "oppure incolla un URL sopra."}
            </span>
            {!value.id && pendingFile && (
              <button
                type="button"
                onClick={() => {
                  if (previewUrl) URL.revokeObjectURL(previewUrl);
                  setPendingFile(null);
                  setPreviewUrl(null);
                }}
                className="rounded-full border border-ink/10 px-3 py-1 text-[11px] font-bold uppercase text-ink-mute hover:bg-ink/5"
                aria-label="Rimuovi immagine selezionata"
              >
                Rimuovi
              </button>
            )}
          </div>
          {!value.id && previewUrl && (
            <div className="relative mt-3 h-40 w-full overflow-hidden rounded-2xl border border-ink/10">
              <Image src={previewUrl} alt={`Anteprima ${form.name || "nuova Princess"}`} fill sizes="400px" className="object-cover" unoptimized />
            </div>
          )}
          {uploadError && <p className="mt-1 text-[12px] text-red-600">{uploadError}</p>}
        </div>
        <div><label className={label} htmlFor="p-ig">Instagram (URL)</label><input id="p-ig" className={input} value={form.social_instagram} onChange={(e) => set("social_instagram", e.target.value)} /></div>
        <div><label className={label} htmlFor="p-tt">TikTok (URL)</label><input id="p-tt" className={input} value={form.social_tiktok} onChange={(e) => set("social_tiktok", e.target.value)} /></div>
        <label className="flex cursor-pointer items-center gap-3 sm:col-span-2">
          <input type="checkbox" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)} className="h-4 w-4 accent-[#C7147D]" />
          <span className="text-sm font-medium text-ink">Visibile sul sito (Attiva)</span>
        </label>
      </div>
      {error && <p className="mt-4 rounded-2xl bg-princess-50 px-4 py-3 text-sm text-princess-700" role="alert">{error}</p>}
      <div className="mt-5 flex gap-3">
        <button type="submit" disabled={pending} className="btn-princess !px-6 !py-3 text-[13px] disabled:opacity-60">
          {pending ? <Loader2 size={15} className="animate-spin" /> : null} Salva Princess
        </button>
        <button type="button" onClick={onClose} className="btn-outline !px-6 !py-3 text-[13px]">Annulla</button>
      </div>
    </form>
  );
}

function ImageManager({ princessId, images: initialImages }: { princessId: string; images: { id: string; file_url: string; title: string | null }[] }) {
  const [images, setImages] = useState(initialImages);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="mt-4 rounded-2xl bg-ivory p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-ink-mute">Foto aggiuntive ({images.length})</p>
      <div className="mt-3 flex flex-wrap gap-2.5">
        {images.map((img) => (
          <span key={img.id} className="relative block h-20 w-20 overflow-hidden rounded-2xl border border-gold-500/40">
            <Image src={img.file_url} alt={img.title ?? "Foto Princess"} fill sizes="80px" className="object-cover" />
            <button
              onClick={() => {
                setError(null);
                start(async () => {
                  const r = await deletePrincessImage(img.id, img.file_url);
                  if (!r.ok) {
                    setError(r.error ?? "Errore eliminazione foto");
                  } else {
                    setImages((prev) => prev.filter((i) => i.id !== img.id));
                  }
                });
              }}
              className="absolute right-1 top-1 rounded-full bg-ink/70 px-2 py-0.5 text-[11px] font-bold text-white hover:bg-red-600"
              aria-label="Elimina foto aggiuntiva"
            >
              ×
            </button>
          </span>
        ))}
        <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-princess-300 text-princess-600 transition hover:bg-princess-50">
          {pending ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={18} />}
          <span className="px-1 text-center text-[10px] font-bold uppercase">Aggiungi</span>
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={pending}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const fd = new FormData();
              fd.set("file", file);
              setError(null);
              start(async () => {
                const r = await uploadPrincessImage(princessId, fd);
                if (!r.ok) setError(r.error ?? "Upload fallito");
              });
              e.target.value = "";
            }}
          />
        </label>
      </div>
      {error && <p className="mt-2 text-[13px] text-princess-700">{error}</p>}
    </div>
  );
}
