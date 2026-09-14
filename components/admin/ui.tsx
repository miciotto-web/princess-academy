import type { ReactNode } from "react";

export function AdminHeader({
  eyebrow,
  title,
  intro,
  action,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="eyebrow">✦ {eyebrow} ✦</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-ink">{title}</h1>
        {intro && <p className="mt-1.5 max-w-xl text-[15px] text-ink-soft">{intro}</p>}
      </div>
      {action}
    </div>
  );
}

export function AdminCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[1.75rem] border border-ink/10 bg-white p-6 shadow-soft sm:p-7">
      {children}
    </div>
  );
}

export function EmptyState({ text, href, cta }: { text: string; href: string; cta: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-gold-500/50 bg-gold-50/50 p-8 text-center">
      <p className="text-2xl" aria-hidden>✦</p>
      <p className="mt-2 text-ink-soft">{text}</p>
      <a href={href} className="btn-outline mt-4 !px-5 !py-2.5 text-[12px]">
        {cta}
      </a>
    </div>
  );
}
