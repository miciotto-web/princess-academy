"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "day" | "night";

/**
 * Toggle ☀️ Giorno / 🌙 Notte Magica.
 *
 * - Legge/scrive il tema su <html data-theme> e in localStorage ("pa-theme").
 * - Prima visita: rispetta prefers-color-scheme (già risolta dallo script anti-flash).
 * - Dopo la prima scelta manuale: rispetta sempre la scelta salvata.
 * - Montato solo nel layout pubblica (Navbar): non impatta l'area admin.
 */
export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("day");
  const [mounted, setMounted] = useState(false);

  // Al mount, leggiamo il tema già impostato dallo script anti-flash (o di sistema).
  useEffect(() => {
    const current =
      (document.documentElement.getAttribute("data-theme") as Theme | null) ?? "day";
    setTheme(current === "night" ? "night" : "day");
    setMounted(true);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "day" ? "night" : "day";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("pa-theme", next);
    } catch {
      /* localStorage non disponibile: la scelta resta solo per la sessione */
    }
  };

  const isNight = theme === "night";

  // Evita hydration mismatch: finché non siamo montati, non renderizziamo l'icona.
  if (!mounted) {
    return (
      <span
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gold-500/40"
        aria-hidden
      />
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      role="switch"
      aria-checked={isNight}
      aria-label={isNight ? "Attiva modalità Giorno" : "Attiva modalità Notte Magica"}
      title={isNight ? "Passa al tema Giorno" : "Passa al tema Notte Magica"}
      className="group inline-flex h-11 w-11 items-center justify-center rounded-full border border-gold-500/40 bg-card text-gold-600 transition-all duration-300 hover:border-gold-300 hover:text-gold-300 hover:shadow-golden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-princess-400"
    >
      {/* Sole → visibile di giorno; Luna → visibile di notte.
          L'icona "in uscita" scala verso l'alto, quella "in entrata" scende. */}
      <span className="relative inline-flex h-5 w-5 items-center justify-center">
        <Sun
          size={20}
          className={
            "absolute transition-all duration-300 " +
            (isNight
              ? "rotate-90 scale-0 opacity-0"
              : "rotate-0 scale-100 opacity-100 group-hover:text-gold-300")
          }
          aria-hidden
        />
        <Moon
          size={20}
          className={
            "absolute transition-all duration-300 " +
            (isNight
              ? "rotate-0 scale-100 opacity-100 group-hover:text-gold-200"
              : "-rotate-90 scale-0 opacity-0")
          }
          aria-hidden
        />
      </span>
      <span className="sr-only">
        {isNight ? "Modalità Notte Magica attiva" : "Modalità Giorno attiva"}
      </span>
    </button>
  );
}
