"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Select custom accessibile, SOSTITUTO dei <select> nativi.
 *
 * - NESSUNA dipendenza esterna (no Radix, no Headless UI).
 * - Click outside per chiudere.
 * - Tastiera: ArrowUp/Down, Home/End, Enter/Space (apre & seleziona),
 *   Escape (chiude), Tab (chiude e mantiene focus), Backspace NON chiude.
 * - ARIA: role="combobox" sul trigger, role="listbox" sul popup,
 *   role="option" su ogni voce, aria-expanded, aria-activedescendant,
 *   aria-selected, aria-haspopup="listbox".
 * - Day/Night: usa .input-royal per il trigger + token CSS
 *   (--card, --text, --border, --accent) per il popup.
 * - Disabled: gestito correttamente.
 * - React Hook Form: passa ref + onBlur + onChange come qualsiasi input.
 *   Il campo registrato riceve SEMPRE l'eventuale `value` come string;
 *   usare register("field", { setValueAs }) se serve normalizzare.
 */

export type SelectOption<V extends string = string> = {
  value: V;
  label: ReactNode;
  disabled?: boolean;
};

export type SelectProps<V extends string = string> = {
  /** Lista opzioni. */
  options: SelectOption<V>[];
  /** Valore selezionato (controlled). */
  value: V | "";
  /** onChange del componente (controlled). */
  onChange: (next: V) => void;
  /** onBlur (per RHF: register("field").onBlur). */
  onBlur?: () => void;
  /** Placeholder mostrato quando value è vuoto. */
  placeholder?: string;
  /** Etichetta accessibile (visibile o sr-only). */
  "aria-label"?: string;
  /** Stesse classi di input-royal per riallineare. */
  className?: string;
  /** Disabilitato. */
  disabled?: boolean;
  /** Nome del campo (per RHF / form). */
  name?: string;
  /** id esplicito; altrimenti autogenerato. */
  id?: string;
  /** required (per validazione). */
  required?: boolean;
  /** Testo per l'option vuota disabilitata (default: primo <option value="">). */
  emptyLabel?: string;
};

export function Select<V extends string = string>({
  options,
  value,
  onChange,
  onBlur,
  placeholder = "Seleziona…",
  className,
  disabled = false,
  name,
  id,
  required,
  emptyLabel,
}: SelectProps<V>) {
  const reactId = useId();
  const triggerId = id ?? `select-${reactId}`;
  const listboxId = `${triggerId}-listbox`;

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  /** L'opzione "vuota" è una voce sintetica in cima se `value === ""` e
   *  le opzioni non includono esplicitamente `value: ""`. */
  const normalizedOptions = useMemo<SelectOption<V>[]>(() => {
    if (emptyLabel === undefined) return options;
    return [{ value: "" as V, label: emptyLabel, disabled: true }, ...options];
  }, [options, emptyLabel]);

  const findIndex = useCallback(
    (v: V | ""): number => {
      if (v === "") return -1;
      return normalizedOptions.findIndex((o) => o.value === v);
    },
    [normalizedOptions]
  );

  // All'apertura, posiziona activeIndex sul valore selezionato
  // (o 0 se niente selezionato). Aggiornamenti successivi di `value`
  // NON cambiano activeIndex per evitare flicker mentre l'utente naviga.
  useEffect(() => {
    if (!open) return;
    const idx = findIndex(value);
    setActiveIndex(idx >= 0 ? idx : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Click outside → chiudi.
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  // Scrolla la voce attiva dentro la viewport del popup.
  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(
      `[data-opt-index="${activeIndex}"]`
    );
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  const commit = (idx: number) => {
    const opt = normalizedOptions[idx];
    if (!opt || opt.disabled) return;
    onChange(opt.value);
    setOpen(false);
    // Restituisce il focus al trigger dopo la selezione (a11y).
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        if (!open) {
          setOpen(true);
        } else {
          setActiveIndex((i) => {
            const next = Math.min(normalizedOptions.length - 1, i + 1);
            // Salta disabilitati.
            let n = next;
            while (n > 0 && normalizedOptions[n]?.disabled) n--;
            return n;
          });
        }
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        if (!open) {
          setOpen(true);
        } else {
          setActiveIndex((i) => {
            const next = Math.max(0, i - 1);
            let n = next;
            while (n < normalizedOptions.length - 1 && normalizedOptions[n]?.disabled) n++;
            return n;
          });
        }
        break;
      }
      case "Home": {
        if (open) {
          e.preventDefault();
          setActiveIndex(0);
        }
        break;
      }
      case "End": {
        if (open) {
          e.preventDefault();
          setActiveIndex(normalizedOptions.length - 1);
        }
        break;
      }
      case "Enter":
      case " ": {
        if (open) {
          e.preventDefault();
          commit(activeIndex);
        } else {
          e.preventDefault();
          setOpen(true);
        }
        break;
      }
      case "Escape": {
        if (open) {
          e.preventDefault();
          setOpen(false);
        }
        break;
      }
      case "Tab": {
        if (open) {
          // Permette a Tab di uscire ma chiude il popup.
          setOpen(false);
        }
        break;
      }
      default: {
        // Type-ahead opzionale: premere una lettera porta alla prima
        // opzione che inizia con quella lettera.
        if (open && e.key.length === 1 && /\S/.test(e.key)) {
          const ch = e.key.toLowerCase();
          const idx = normalizedOptions.findIndex((o) =>
            String(o.label)
              .toString()
              .trim()
              .toLowerCase()
              .startsWith(ch)
          );
          if (idx >= 0) {
            e.preventDefault();
            setActiveIndex(idx);
          }
        }
      }
    }
  };

  const selectedLabel = useMemo(() => {
    if (value === "") return null;
    const opt = normalizedOptions.find((o) => o.value === value);
    return opt ? opt.label : null;
  }, [normalizedOptions, value]);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <button
        ref={triggerRef}
        type="button"
        id={triggerId}
        name={name}
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={
          open && activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined
        }
        aria-label={undefined /* ereditato via props se passato */}
        className={cn(
          "input-royal flex w-full items-center justify-between gap-2 text-left",
          disabled && "cursor-not-allowed opacity-60",
          !selectedLabel && "text-ink-mute"
        )}
      >
        <span className="truncate">
          {selectedLabel ?? <span className="text-ink-mute/70">{placeholder}</span>}
        </span>
        <ChevronDown
          size={16}
          className={cn(
            "shrink-0 text-ink-mute transition-transform",
            open && "rotate-180 text-princess-600"
          )}
          aria-hidden
        />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          tabIndex={-1}
          aria-labelledby={triggerId}
          className="absolute left-0 right-0 z-50 mt-1.5 max-h-60 overflow-auto rounded-2xl border border-soft bg-card py-1 shadow-royal focus:outline-none"
        >
          {normalizedOptions.length === 0 && (
            <li className="px-4 py-2 text-sm text-muted">Nessuna opzione</li>
          )}
          {normalizedOptions.map((opt, i) => {
            const isSelected = opt.value !== "" && opt.value === value;
            const isActive = i === activeIndex;
            return (
              <li
                key={String(opt.value) + "-" + i}
                id={`${listboxId}-opt-${i}`}
                role="option"
                aria-selected={isSelected}
                aria-disabled={opt.disabled || undefined}
                data-opt-index={i}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseDown={(e) => {
                  // mousedown così non perde il focus prima del commit.
                  e.preventDefault();
                  if (!opt.disabled) commit(i);
                }}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-2 px-4 py-2 text-sm transition",
                  isActive && "bg-princess-50",
                  opt.disabled && "cursor-not-allowed opacity-50",
                  !opt.disabled && "hover:bg-princess-50"
                )}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && (
                  <Check size={14} className="shrink-0 text-princess-600" aria-hidden />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default Select;
