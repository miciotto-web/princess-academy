"use client";

import { useState, useTransition, useMemo } from "react";
import { Plus, Loader2, X, Instagram, Facebook, Music2, Youtube } from "lucide-react";
import { DeleteButton, ToggleButton } from "@/components/admin/controls";
import { saveSocial, deleteSocial } from "@/lib/actions/admin";
import { Select } from "@/components/ui/Select";
import { WhatsAppIcon } from "@/components/ui/icons";
import { buildWhatsAppUrl, parseWhatsAppUrl } from "@/lib/utils";

export type SRow = {
  id: string;
  name: string;
  url: string;
  icon: string;
  description: string | null;
  display_order: number;
  active: boolean;
};

const ICONS = ["instagram", "facebook", "tiktok", "youtube", "whatsapp"];

const ICON_LABELS: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  youtube: "YouTube",
  whatsapp: "WhatsApp",
};

function IconGlyph({ icon }: { icon: string }) {
  const cls = "text-princess-600";
  if (icon === "instagram") return <Instagram size={22} className={cls} />;
  if (icon === "facebook") return <Facebook size={22} className={cls} />;
  if (icon === "tiktok") return <Music2 size={22} className={cls} />;
  if (icon === "youtube") return <Youtube size={22} className={cls} />;
  if (icon === "whatsapp") return <WhatsAppIcon size={22} className={cls} />;
  return <Instagram size={22} className={cls} />;
}

export default function SocialManager({ initial }: { initial: SRow[] }) {
  const [editing, setEditing] = useState<SRow | "new" | null>(null);

  return (
    <div>
      <button onClick={() => setEditing("new")} className="btn-princess !px-6 !py-3 text-[13px]">
        <Plus size={16} /> Nuovo canale
      </button>
      {editing && <SForm value={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}
      <ul className="mt-6 space-y-4">
        {initial.map((s) => (
          <li key={s.id} className="flex flex-wrap items-center gap-4 rounded-[1.5rem] border border-ink/10 bg-white p-5 shadow-soft">
            <IconGlyph icon={s.icon} />
            <div className="min-w-0 flex-1">
              <p className="font-display text-[22px] font-bold text-ink">{s.name}</p>
              <p className="truncate text-sm text-ink-mute">{s.url} · ordine {s.display_order}</p>
            </div>
            <ToggleButton active={s.active} activeLabel="Attivo" inactiveLabel="Disattivo" onToggle={(n) => saveSocial({ id: s.id, name: s.name, url: s.url, active: n })} />
            <button onClick={() => setEditing(s)} className="rounded-full border border-princess-200 px-4 py-2 text-[12px] font-bold uppercase tracking-[0.12em] text-princess-700 hover:bg-princess-50">Modifica</button>
            <DeleteButton label={s.name} onDelete={() => deleteSocial(s.id)} />
          </li>
        ))}
      </ul>
      {initial.length === 0 && <p className="mt-4 rounded-3xl border border-dashed border-gold-500/50 bg-white p-8 text-center text-ink-soft">Nessun canale — il sito mostra le card dimostrative finché non li aggiungi.</p>}
    </div>
  );
}

function SForm({ value, onClose }: { value: SRow | null; onClose: () => void }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [f, setF] = useState({
    name: value?.name ?? "",
    url: value?.url ?? "",
    icon: value?.icon ?? "instagram",
    description: value?.description ?? "",
    display_order: String(value?.display_order ?? 0),
    active: value?.active ?? true,
  });
  const set = (k: keyof typeof f, v: string | boolean) => setF((s) => ({ ...s, [k]: v }));

  // Stato separato per i campi WhatsApp: numero e messaggio precompilato.
  const initialWa = value?.icon === "whatsapp" ? parseWhatsAppUrl(value?.url) : null;
  const [phone, setPhone] = useState<string>(initialWa?.phone ?? "");
  const [waText, setWaText] = useState<string>(initialWa?.text ?? "");

  const isWhatsApp = f.icon === "whatsapp";

  // Anteprima live dell'URL wa.me (validità + render).
  const waPreview = useMemo(() => {
    if (!isWhatsApp) return null;
    if (!phone.trim()) return { ok: false, url: "" as string, reason: "Inserisci il numero WhatsApp." };
    try {
      return { ok: true as const, url: buildWhatsAppUrl(phone, waText) };
    } catch (e) {
      return { ok: false as const, url: "" as string, reason: e instanceof Error ? e.message : "Numero non valido." };
    }
  }, [isWhatsApp, phone, waText]);

  return (
    <form
      className="mt-6 rounded-[1.5rem] border border-gold-500/40 bg-gradient-to-b from-white to-gold-50/50 p-6 shadow-golden"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);

        if (isWhatsApp) {
          if (!phone.trim()) {
            setError("Numero WhatsApp obbligatorio.");
            return;
          }
          try {
            buildWhatsAppUrl(phone, waText);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Numero WhatsApp non valido.");
            return;
          }
        }

        start(async () => {
          const r = await saveSocial({
            id: value?.id,
            name: f.name,
            url: f.url,
            icon: f.icon,
            description: f.description,
            display_order: Number(f.display_order) || 0,
            active: f.active,
            ...(isWhatsApp ? { phone, text: waText } : {}),
          });
          if (!r.ok) setError(r.error ?? "Errore");
          else onClose();
        });
      }}
    >
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-ink">{value ? "Modifica canale" : "Nuovo canale"}</h2>
        <button type="button" onClick={onClose} aria-label="Chiudi" className="rounded-full border border-ink/10 p-2 hover:bg-white"><X size={18} /></button>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div><label className="label-royal">Nome *</label><input className="input-royal" value={f.name} onChange={(e) => set("name", e.target.value)} required placeholder="Instagram" /></div>

        {isWhatsApp ? (
          <>
            <div>
              <label className="label-royal">Numero WhatsApp *</label>
              <input
                className="input-royal"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                inputMode="tel"
                autoComplete="tel"
                placeholder="+39 333 1234567"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label-royal">Messaggio precompilato (opzionale)</label>
              <textarea
                rows={2}
                className="input-royal"
                value={waText}
                onChange={(e) => setWaText(e.target.value.slice(0, 500))}
                placeholder="Ciao, vorrei informazioni sui vostri servizi."
                maxLength={500}
              />
              <p className="mt-1 text-right text-[11px] text-ink-mute">{waText.length}/500</p>
            </div>
            <div className="sm:col-span-2">
              <p className="label-royal">Anteprima link generato</p>
              <div className="rounded-2xl border border-ink/10 bg-ink/5 px-4 py-3 font-mono text-[12px] break-all text-ink-soft">
                {waPreview && waPreview.ok ? waPreview.url : <span className="italic text-ink-mute">{(waPreview && !waPreview.ok) ? waPreview.reason : "—"}</span>}
              </div>
            </div>
          </>
        ) : (
          <div><label className="label-royal">URL *</label><input className="input-royal" value={f.url} onChange={(e) => set("url", e.target.value)} required placeholder="https://instagram.com/…" /></div>
        )}

        <div><label className="label-royal">Icona</label>
          <Select
            value={f.icon}
            onChange={(v) => set("icon", v)}
            options={ICONS.map((i) => ({
              value: i,
              label: (
                <span className="flex items-center gap-2">
                  <IconGlyph icon={i} />
                  <span>{ICON_LABELS[i] ?? i}</span>
                </span>
              ),
            }))}
          />
        </div>
        <div><label className="label-royal">Ordine</label><input className="input-royal" inputMode="numeric" value={f.display_order} onChange={(e) => set("display_order", e.target.value)} /></div>
        <div className="sm:col-span-2"><label className="label-royal">Descrizione</label><textarea rows={2} className="input-royal" value={f.description} onChange={(e) => set("description", e.target.value)} /></div>
        <label className="flex cursor-pointer items-center gap-3 sm:col-span-2">
          <input type="checkbox" checked={f.active} onChange={(e) => set("active", e.target.checked)} className="h-4 w-4 accent-[#C7147D]" />
          <span className="text-sm font-medium text-ink">Attivo sul sito</span>
        </label>
      </div>
      {error && <p className="mt-3 text-sm text-princess-700">{error}</p>}
      <div className="mt-5 flex gap-3">
        <button type="submit" disabled={pending} className="btn-princess !px-6 !py-3 text-[13px] disabled:opacity-60">
          {pending ? <Loader2 size={15} className="animate-spin" /> : null} Salva canale
        </button>
        <button type="button" onClick={onClose} className="btn-outline !px-6 !py-3 text-[13px]">Annulla</button>
      </div>
    </form>
  );
}
