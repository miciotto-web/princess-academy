"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Reveal({
  children,
  delay = 0,
  className,
  y = 28,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "center",
  tone = "light",
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: string;
  align?: "center" | "left";
  tone?: "light" | "dark";
}) {
  return (
    <Reveal
      className={cn(
        "max-w-3xl",
        align === "center" ? "mx-auto text-center" : "text-left"
      )}
    >
      <p className="eyebrow justify-center">
        <span className="text-gold-500">✦</span> {eyebrow} <span className="text-gold-500">✦</span>
      </p>
      <h2
        className={cn(
          "mt-4 font-display text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl",
          tone === "light" ? "text-ink" : "text-white"
        )}
      >
        {title}
      </h2>
      {intro && (
        <p className={cn("mt-5 text-[17px] leading-relaxed", tone === "light" ? "text-ink-soft" : "text-white/80")}>
          {intro}
        </p>
      )}
    </Reveal>
  );
}

export function GoldDivider({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-4", className)} aria-hidden>
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold-500 sm:w-28" />
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gold-500/50 bg-white text-gold-600 shadow-golden">
        ✦
      </span>
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold-500 sm:w-28" />
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: string;
}) {
  return (
    <section className="relative overflow-hidden hero-bg pb-16 pt-36 sm:pb-20 sm:pt-44">
      <div className="texture-dots absolute inset-0 opacity-40" aria-hidden />
      <div
        aria-hidden
        className="absolute -left-24 top-10 h-72 w-72 rounded-full border border-gold-300/40 sm:h-96 sm:w-96"
      />
      <div
        aria-hidden
        className="absolute -right-24 bottom-0 h-72 w-72 rounded-full border border-gold-300/40 sm:h-96 sm:w-96"
      />
      {[
        { left: "12%", top: "30%", d: "0s" },
        { left: "28%", top: "68%", d: "0.8s" },
        { left: "55%", top: "24%", d: "1.6s" },
        { left: "74%", top: "60%", d: "0.4s" },
        { left: "88%", top: "32%", d: "2.1s" },
      ].map((s, i) => (
        <span
          key={i}
          aria-hidden
          className="absolute animate-twinkle text-gold-200"
          style={{ left: s.left, top: s.top, animationDelay: s.d }}
        >
          ✦
        </span>
      ))}
      <div className="container-royal relative text-center">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <p className="inline-flex items-center gap-2 rounded-full border border-gold-300/50 bg-white/10 px-5 py-2 text-[11px] font-bold uppercase tracking-[0.32em] text-gold-100 backdrop-blur">
            <span className="text-gold-200">✦</span> {eyebrow}
          </p>
          <h1 className="mx-auto mt-6 max-w-3xl font-display text-5xl font-bold leading-[1.05] text-white sm:text-6xl">
            {title}
          </h1>
          {intro && <p className="mx-auto mt-5 max-w-2xl text-[17px] leading-relaxed text-white/85">{intro}</p>}
          <div className="mx-auto mt-7 h-px w-40 bg-gradient-to-r from-transparent via-gold-300 to-transparent" />
        </motion.div>
      </div>
      <svg viewBox="0 0 1440 70" className="absolute bottom-0 left-0 w-full wave-fill" fill="currentColor" aria-hidden>
        <path d="M0,40 C240,75 480,5 720,30 C960,55 1200,70 1440,25 L1440,70 L0,70 Z" />
      </svg>
    </section>
  );
}
