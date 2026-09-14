"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Instagram, Facebook, Music2, Menu, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/layout/ThemeToggle";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/storia", label: "La nostra storia" },
  { href: "/princess", label: "Le nostre Princess" },
  { href: "/eventi", label: "Eventi" },
  { href: "/galleria", label: "Galleria" },
  { href: "/social", label: "Social" },
  { href: "/contatti", label: "Contatti" },
];

export default function Navbar({ socialUrls }: { socialUrls?: { instagram?: string; facebook?: string } }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-gold-500/25 bg-page/90 shadow-soft backdrop-blur-xl"
          : "bg-gradient-to-b from-ink/45 to-transparent"
      )}
    >
      {/* sottile filo oro superiore */}
      <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
      <div className="container-royal flex h-[72px] items-center justify-between gap-4">
        <Link href="/" className="group flex items-center gap-3" aria-label="Princess Academy — Home">
          <span className="relative block h-14 w-14 shrink-0 drop-shadow-[0_4px_14px_rgba(212,175,55,0.5)]">
            <Image src="/logo.png" alt="Logo Princess Academy" fill sizes="56px" priority className="object-contain" />
          </span>
          <span className="leading-tight">
            <span
              className={cn(
                "block font-display text-[19px] font-bold tracking-[0.08em] transition-colors",
                scrolled ? "text-princess-700" : "text-white"
              )}
            >
              PRINCESS ACADEMY
            </span>
            <span
              className={cn(
                "block text-[10px] font-medium uppercase tracking-[0.34em] transition-colors",
                scrolled ? "text-gold-600" : "text-gold-200"
              )}
            >
              Magical Party Experience
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigazione principale">
          {LINKS.slice(0, 6).map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-full px-3.5 py-2 text-[12.5px] font-semibold uppercase tracking-[0.12em] transition-all",
                pathname === l.href
                  ? scrolled
                    ? "bg-princess-50 text-princess-700 ring-1 ring-princess-200"
                    : "bg-white/15 text-white ring-1 ring-white/30"
                  : scrolled
                    ? "text-ink-soft hover:bg-princess-50 hover:text-princess-700"
                    : "text-white/90 hover:bg-white/10 hover:text-white"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <div className={cn("mr-1 hidden items-center gap-1 xl:flex", scrolled ? "text-princess-600" : "text-white/85")}>
            <a href={socialUrls?.instagram ?? "#"} target="_blank" rel="noreferrer" aria-label="Instagram" className="rounded-full p-2 transition hover:bg-princess-600 hover:text-white">
              <Instagram size={17} />
            </a>
            <a href={socialUrls?.facebook ?? "#"} target="_blank" rel="noreferrer" aria-label="Facebook" className="rounded-full p-2 transition hover:bg-princess-600 hover:text-white">
              <Facebook size={17} />
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noreferrer" aria-label="TikTok" className="rounded-full p-2 transition hover:bg-princess-600 hover:text-white">
              <Music2 size={17} />
            </a>
          </div>
          <ThemeToggle />
          <Link
            href="/prenota"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-princess-600 to-princess-500 px-6 py-3 text-[12.5px] font-bold uppercase tracking-[0.14em] text-white shadow-royal transition hover:-translate-y-0.5 hover:from-princess-700 hover:to-princess-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
          >
            <Sparkles size={15} className="text-gold-200" />
            Prenota un evento
          </Link>
        </div>

        <button
          className={cn(
            "inline-flex h-11 w-11 items-center justify-center rounded-full border transition lg:hidden",
            scrolled ? "border-princess-200 text-princess-700" : "border-white/30 text-white"
          )}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Chiudi menu" : "Apri menu"}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="overflow-hidden border-t border-gold-500/20 bg-ivory/95 backdrop-blur-xl lg:hidden"
            aria-label="Menu mobile"
          >
            <div className="space-y-1 px-5 py-5">
              {[...LINKS, { href: "/prenota", label: "Prenota" }].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "flex items-center justify-between rounded-2xl px-4 py-3 font-display text-lg font-semibold transition",
                    pathname === l.href
                      ? "bg-princess-600 text-white shadow-royal"
                      : "text-ink hover:bg-princess-50 hover:text-princess-700"
                  )}
                >
                  {l.label}
                  <span className="text-gold-500">✦</span>
                </Link>
              ))}
              <div className="flex items-center justify-center px-4 pt-4">
                <ThemeToggle />
              </div>
              <p className="px-4 pt-3 text-center text-[11px] uppercase tracking-[0.3em] text-gold-600">
                Magical Party Experience
              </p>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
