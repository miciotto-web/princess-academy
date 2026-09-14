"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Share2, Expand } from "lucide-react";
import type { GalleryItem } from "@/types";

export default function Lightbox({
  items,
  index,
  onClose,
  onNavigate,
}: {
  items: GalleryItem[];
  index: number | null;
  onClose: () => void;
  onNavigate: (i: number) => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [shared, setShared] = useState(false);
  const item = index !== null ? items[index] : null;

  useEffect(() => {
    setZoom(1);
    setShared(false);
  }, [index]);

  const prev = useCallback(() => {
    if (index === null) return;
    onNavigate((index - 1 + items.length) % items.length);
  }, [index, items.length, onNavigate]);

  const next = useCallback(() => {
    if (index === null) return;
    onNavigate((index + 1) % items.length);
  }, [index, items.length, onNavigate]);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, onClose, prev, next]);

  const share = async () => {
    try {
      const url = `${window.location.origin}/galleria#${item?.id ?? ""}`;
      if (navigator.share) {
        await navigator.share({ title: item?.titolo ?? "Princess Academy", url });
      } else {
        await navigator.clipboard.writeText(url);
      }
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      /* utente ha annullato */
    }
  };

  return (
    <AnimatePresence>
      {item && index !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex flex-col bg-ink/95 backdrop-blur"
          role="dialog"
          aria-modal="true"
          aria-label={`Lightbox — ${item.titolo}`}
        >
          <div className="flex items-center justify-between px-5 py-4 text-white">
            <p className="text-sm">
              <span className="font-display text-lg font-bold italic text-gold-200">{item.titolo}</span>
              <span className="ml-3 text-white/60">
                {index + 1} / {items.length} · {item.categoria}
              </span>
            </p>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setZoom((z) => Math.min(2.5, +(z + 0.5).toFixed(1)))} className="rounded-full p-2.5 transition hover:bg-white/15" aria-label="Ingrandisci">
                <ZoomIn size={19} />
              </button>
              <button onClick={() => setZoom((z) => Math.max(1, +(z - 0.5).toFixed(1)))} className="rounded-full p-2.5 transition hover:bg-white/15" aria-label="Riduci">
                <ZoomOut size={19} />
              </button>
              <button
                onClick={() => document.documentElement.requestFullscreen?.().catch(() => {})}
                className="hidden rounded-full p-2.5 transition hover:bg-white/15 sm:block"
                aria-label="Schermo intero"
              >
                <Expand size={19} />
              </button>
              <button onClick={share} className="rounded-full p-2.5 transition hover:bg-white/15" aria-label="Condividi">
                <Share2 size={19} />
              </button>
              <button onClick={onClose} className="rounded-full bg-princess-600 p-2.5 transition hover:bg-princess-500" aria-label="Chiudi">
                <X size={19} />
              </button>
            </div>
          </div>
          {shared && <p className="px-5 pb-1 text-sm text-gold-200">Link copiato — condividi la magia ✦</p>}

          <div className="relative flex flex-1 items-center justify-center overflow-hidden px-14 pb-6">
            <button onClick={prev} className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 p-3 text-white backdrop-blur transition hover:bg-princess-600" aria-label="Immagine precedente">
              <ChevronLeft size={22} />
            </button>
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: zoom }}
              transition={{ duration: 0.35 }}
              className={`relative flex h-full max-h-[68vh] w-full max-w-3xl items-center justify-center overflow-hidden rounded-[2rem] border-2 border-gold-400/60 bg-gradient-to-br ${item.gradiente} shadow-royal`}
            >
              {item.foto ? (
                <>
                  <Image src={item.foto} alt={item.titolo} fill sizes="90vw" className="object-contain bg-ink" />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 to-transparent p-5 pt-10 text-center">
                    <span className="block font-display text-2xl font-bold italic text-white">{item.titolo}</span>
                    <span className="mt-1 block text-[11px] font-bold uppercase tracking-[0.24em] text-gold-200">
                      {item.evento}{item.data ? ` · ${item.data}` : ""}
                    </span>
                    {item.descrizione && <span className="mt-2 block text-sm text-white/80">{item.descrizione}</span>}
                  </span>
                </>
              ) : (
                <>
                  <div className="texture-dots absolute inset-0 opacity-25" aria-hidden />
                  <div className="relative px-8 py-10 text-center">
                    <p aria-hidden className="animate-twinkle text-2xl text-white/90">✦</p>
                    <p className="mt-3 font-display text-4xl font-bold italic text-white sm:text-5xl">{item.titolo}</p>
                    <p className="mt-3 text-[12px] font-bold uppercase tracking-[0.28em] text-gold-100">
                      {item.evento} · {item.data}
                    </p>
                    <p className="mx-auto mt-4 max-w-md text-sm text-white/75">
                      Segnaposto elegante in attesa delle fotografie reali — la cornice oro e i toni fucsia restano invariati.
                    </p>
                  </div>
                </>
              )}
            </motion.div>
            <button onClick={next} className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 p-3 text-white backdrop-blur transition hover:bg-princess-600" aria-label="Immagine successiva">
              <ChevronRight size={22} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
