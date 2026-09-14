"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

export default function SearchInput({
  placeholder,
  className,
}: {
  placeholder: string;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [value, setValue] = useState(params.get("q") ?? "");

  // Debounce 300ms: aggiorna l'URL solo dopo che l'utente smette di scrivere
  useEffect(() => {
    const t = setTimeout(() => {
      const currentQ = params.get("q") ?? "";
      if (value === currentQ) return; // evita loop

      const next = new URLSearchParams(params);
      if (value.trim()) {
        next.set("q", value.trim());
      } else {
        next.delete("q");
      }
      next.delete("page"); // reset pagina quando cambia ricerca
      const qs = next.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    }, 300);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Sincronizza il valore locale solo quando la query nell'URL cambia
  // realmente (es. altri filtri, navigazione), senza reagire alla digitazione.
  useEffect(() => {
    const urlQ = params.get("q") ?? "";
    setValue((prev) => (prev === urlQ ? prev : urlQ));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.toString()]);

  const clear = () => {
    setValue("");
  };

  return (
    <div className={`relative ${className ?? ""}`}>
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="input-royal pl-9 pr-9"
        aria-label={placeholder}
      />
      {value && (
        <button
          type="button"
          onClick={clear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-mute transition hover:text-ink"
          aria-label="Cancella ricerca"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}
