"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, CalendarHeart, Sparkles } from "lucide-react";

const STARS = [
  { left: "8%", top: "22%", size: 18, delay: "0s" },
  { left: "16%", top: "64%", size: 12, delay: "1.1s" },
  { left: "26%", top: "30%", size: 14, delay: "0.5s" },
  { left: "38%", top: "72%", size: 11, delay: "2s" },
  { left: "52%", top: "18%", size: 13, delay: "0.9s" },
  { left: "63%", top: "66%", size: 16, delay: "1.6s" },
  { left: "74%", top: "26%", size: 12, delay: "0.3s" },
  { left: "84%", top: "58%", size: 18, delay: "1.9s" },
  { left: "92%", top: "30%", size: 12, delay: "0.7s" },
  { left: "47%", top: "44%", size: 10, delay: "2.4s" },
];

const PARTICLES = [
  { left: "14%", bottom: "12%", delay: "0s", dur: "9s" },
  { left: "32%", bottom: "8%", delay: "2.5s", dur: "11s" },
  { left: "58%", bottom: "10%", delay: "1.2s", dur: "10s" },
  { left: "76%", bottom: "14%", delay: "4s", dur: "12s" },
  { left: "88%", bottom: "9%", delay: "0.8s", dur: "9.5s" },
];

export default function MagicalHero() {
  const stars = useMemo(() => STARS, []);
  return (
    <section className="relative overflow-hidden hero-bg" aria-label="Benvenuti in Princess Academy">
      {/* texture luminosa */}
      <div className="texture-dots absolute inset-0 opacity-50" aria-hidden />
      {/* anelli circolari — eco del logo */}
      <div aria-hidden className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="h-[560px] w-[560px] rounded-full border border-gold-300/25 sm:h-[760px] sm:w-[760px]" />
      </div>
      <div aria-hidden className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="h-[420px] w-[420px] rounded-full border border-white/15 sm:h-[580px] sm:w-[580px]" />
      </div>
      <div aria-hidden className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="h-[300px] w-[300px] rounded-full border border-gold-200/20 sm:h-[400px] sm:w-[400px]" />
      </div>

      {/* stelle scintillanti */}
      {stars.map((s, i) => (
        <span
          key={i}
          aria-hidden
          className="absolute animate-twinkle select-none text-gold-100"
          style={{ left: s.left, top: s.top, fontSize: s.size, animationDelay: s.delay, textShadow: "0 0 14px rgba(240,222,164,.9)" }}
        >
          ✦
        </span>
      ))}
      {/* particelle lente */}
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          aria-hidden
          className="absolute h-1.5 w-1.5 rounded-full bg-gold-200/90 blur-[0.5px]"
          style={{
            left: p.left,
            bottom: p.bottom,
            animation: `drift ${p.dur} ease-in infinite`,
            animationDelay: p.delay,
            boxShadow: "0 0 10px rgba(240,222,164,.9)",
          }}
        />
      ))}

      <div className="container-royal relative flex flex-col items-center pb-20 pt-32 text-center sm:pt-40">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          {/* alone dietro il logo */}
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 -z-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/15 blur-3xl sm:h-96 sm:w-96"
          />
          <div className="relative animate-floaty">
            {/* disco bianco con filo oro + anello oro esterno staccato */}
            <div className="relative">
              <div
                aria-hidden
                className="absolute -inset-5 rounded-full border-2 border-gold-300/90 sm:-inset-7"
              />
              <div
                aria-hidden
                className="absolute -inset-5 rounded-full sm:-inset-7"
              >
                <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 animate-twinkle text-sm text-gold-200">✦</span>
                <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 animate-twinkle text-sm text-gold-200" style={{ animationDelay: "1.4s" }}>✦</span>
                <span className="absolute left-[-7px] top-1/2 -translate-y-1/2 animate-twinkle text-xs text-gold-200" style={{ animationDelay: "0.7s" }}>✦</span>
                <span className="absolute right-[-7px] top-1/2 -translate-y-1/2 animate-twinkle text-xs text-gold-200" style={{ animationDelay: "2s" }}>✦</span>
              </div>
              <div className="relative h-64 w-64 rounded-full border-4 border-gold-400 bg-white glow-gold sm:h-80 sm:w-80">
                <div className="absolute inset-3 sm:inset-4">
                  <Image src="/logo.png" alt="Logo ufficiale Princess Academy" fill sizes="(max-width:640px) 232px, 288px" priority className="object-contain" />
                </div>
              </div>
            </div>
            <span aria-hidden className="absolute -right-2 top-6 animate-twinkle text-2xl text-gold-200">
              ✦
            </span>
            <span aria-hidden className="absolute -left-3 bottom-10 animate-twinkle text-lg text-white" style={{ animationDelay: "1.2s" }}>
              ✦
            </span>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.7 }}
          className="mt-8 text-[12px] font-bold uppercase tracking-[0.42em] text-gold-200"
        >
          Princess Academy · Magical Party Experience
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.8 }}
          className="mt-4 max-w-3xl font-display text-5xl font-bold leading-[1.04] text-white sm:text-7xl"
        >
          Trasformiamo ogni festa{" "}
          <em className="bg-gradient-to-r from-gold-100 via-gold-300 to-gold-100 bg-clip-text italic text-transparent">
            in una favola.
          </em>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="mt-6 max-w-2xl text-[17px] leading-relaxed text-white/85"
        >
          Principesse vere, costumi sartoriali, musica e piccoli rituali d&apos;oro:
          un&apos;esperienza boutique pensata per bambini, famiglie e grandi eventi.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.62, duration: 0.7 }}
          className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Link href="/eventi" className="btn-gold min-w-[240px]">
            <Sparkles size={16} className="text-gold-300" />
            Scopri la nostra magia
          </Link>
          <Link href="/prenota" className="group inline-flex min-w-[240px] items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-princess-700 shadow-royal transition hover:-translate-y-0.5 hover:bg-gold-100">
            <CalendarHeart size={16} />
            Prenota un evento
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        <motion.dl
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-12 grid w-full max-w-2xl grid-cols-3 gap-3"
        >
          {[
            ["✨", "Esperienze da sogno"],
            ["10", "esperienze firma"],
            ["✨", "Momenti indimenticabili"],
          ].map(([n, l]) => (
            <div key={l} className="rounded-3xl border border-white/20 bg-white/10 px-4 py-5 backdrop-blur">
              <dt className="sr-only">{l}</dt>
              <dd className="font-display text-3xl font-bold text-gold-200">{n}</dd>
              <dd className="mt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/75">{l}</dd>
            </div>
          ))}
        </motion.dl>
      </div>

      <svg viewBox="0 0 1440 80" className="relative block w-full wave-fill" fill="currentColor" aria-hidden>
        <path d="M0,45 C240,80 480,10 720,35 C960,60 1200,75 1440,30 L1440,80 L0,80 Z" />
      </svg>
    </section>
  );
}
