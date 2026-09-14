"use client";

import {
  Crown,
  Cake,
  Gem,
  Building2,
  Home,
  Mic,
  Camera,
  Sparkles,
  Wand2,
  Heart,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * FASE 2.9F — Campi admin per icona e gradiente degli eventi.
 * Le whitelist sono allineate con ICONE_EVENTO e GRADIENTI_EVENTO in
 * lib/queries.ts: tutti i gradienti elencati sono classi Tailwind reali
 * così che la build li rilevi staticamente (niente classi arbitrarie dal DB).
 */

export type IconKey =
  | "crown"
  | "cake"
  | "rings"
  | "building"
  | "home"
  | "mic"
  | "camera"
  | "sparkles"
  | "wand"
  | "heart";

/**
 * I gradienti sono stringhe arbitrarie ma validate a runtime da
 * isGradientValido() in lib/queries.ts (whitelist). Tipo stringa,
 * non unione: la whitelist può crescere senza rompere i client.
 */
export type GradientKey = string;

const ICON_DEF: { key: IconKey; label: string; Icon: typeof Crown }[] = [
  { key: "crown", label: "Corona", Icon: Crown },
  { key: "cake", label: "Torta", Icon: Cake },
  { key: "rings", label: "Anelli", Icon: Gem },
  { key: "building", label: "Edificio", Icon: Building2 },
  { key: "home", label: "Casa", Icon: Home },
  { key: "mic", label: "Microfono", Icon: Mic },
  { key: "camera", label: "Fotocamera", Icon: Camera },
  { key: "sparkles", label: "Scintille (predefinita)", Icon: Sparkles },
  { key: "wand", label: "Bacchetta", Icon: Wand2 },
  { key: "heart", label: "Cuore", Icon: Heart },
];

const GRADIENT_DEF: { key: GradientKey; label: string; desc: string }[] = [
  { key: "from-princess-500 via-princess-600 to-princess-800", label: "Rosa classico", desc: "rosa → rosa → rosa scuro" },
  { key: "from-gold-400 via-princess-500 to-princess-700", label: "Rosa oro", desc: "oro → rosa → rosa" },
  { key: "from-princess-300 via-princess-500 to-princess-800", label: "Rosa delicato", desc: "rosa chiaro → rosa → rosa scuro" },
  { key: "from-gold-500 via-princess-600 to-princess-900", label: "Oro intenso", desc: "oro → rosa → rosa profondo" },
  { key: "from-princess-700 via-ink to-ink", label: "Rosa inchiostro", desc: "rosa scuro → inchiostro → inchiostro" },
  { key: "from-gold-300 via-gold-500 to-princess-600", label: "Oro rosa", desc: "oro chiaro → oro → rosa" },
];

export function EventIconPicker({ value, onChange }: { value: IconKey; onChange: (v: IconKey) => void }) {
  return (
    <fieldset>
      <legend className="label-royal">Icona</legend>
      <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Scelta icona evento">
        {ICON_DEF.map(({ key, label, Icon }) => {
          const selected = value === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              aria-label={label}
              aria-pressed={selected}
              title={label}
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-xl border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-princess-400",
                selected
                  ? "border-princess-500 bg-princess-600 text-white shadow-soft"
                  : "border-ink/15 bg-white text-ink-soft hover:border-princess-300 hover:text-princess-700"
              )}
            >
              <Icon size={18} aria-hidden />
            </button>
          );
        })}
      </div>
      <p className="mt-1.5 text-[11px] text-ink-mute">
        Selezionata: <span className="font-semibold text-ink">{ICON_DEF.find((i) => i.key === value)?.label ?? "Scintille"}</span>
      </p>
    </fieldset>
  );
}

export function EventGradientPicker({ value, onChange }: { value: GradientKey | ""; onChange: (v: GradientKey | "") => void }) {
  const automatico = value === "";
  return (
    <fieldset>
      <legend className="label-royal">Gradiente</legend>
      <div className="mt-2 space-y-2" role="group" aria-label="Scelta gradiente evento">
        <button
          type="button"
          onClick={() => onChange("")}
          aria-pressed={automatico}
          className={cn(
            "flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-[12px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-princess-400",
            automatico ? "border-princess-500 bg-princess-50 font-semibold text-princess-700" : "border-ink/15 bg-white text-ink-soft hover:border-princess-300"
          )}
        >
          <span className="inline-flex items-center gap-2"><RotateCcw size={13} /> Automatico</span>
          <span className="text-[11px] text-ink-mute">ciclico</span>
        </button>
        {GRADIENT_DEF.map((g) => {
          const selected = value === g.key;
          return (
            <button
              key={g.key}
              type="button"
              onClick={() => onChange(g.key)}
              aria-label={`${g.label}: ${g.desc}`}
              aria-pressed={selected}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-princess-400",
                selected ? "border-princess-500 bg-princess-50 shadow-soft" : "border-ink/15 bg-white hover:border-princess-300"
              )}
            >
              <span className={cn("inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white shadow-soft bg-gradient-to-br", g.key)} aria-hidden>
                <Sparkles size={14} />
              </span>
              <span className="min-w-0">
                <span className="block text-[12.5px] font-semibold text-ink">{g.label}</span>
                <span className="block text-[11px] text-ink-mute">{g.desc}</span>
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function EventPreview({
  icon,
  gradient,
  title,
  category,
}: {
  icon: IconKey;
  gradient: GradientKey | "";
  title: string;
  category: string;
}) {
  const Icon = ICON_DEF.find((i) => i.key === icon)?.Icon ?? Sparkles;
  const fallback = "from-princess-500 via-princess-600 to-princess-800";
  const g = gradient || fallback;
  return (
    <div className="overflow-hidden rounded-2xl border border-ink/10 shadow-soft">
      <div className={cn("relative flex items-center gap-4 p-5 bg-gradient-to-br", g)}>
        <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-gold-300/60 bg-white/15 text-gold-100 backdrop-blur" aria-hidden>
          <Icon size={26} />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-100">{category}</p>
          <h3 className="mt-0.5 truncate font-display text-xl font-bold leading-tight text-white">{title || "Titolo evento"}</h3>
          <p className="mt-0.5 text-[11px] font-medium text-white/70">icona: {icon} · {gradient ? "gradiente scelto" : "gradiente automatico"}</p>
        </div>
      </div>
    </div>
  );
}
