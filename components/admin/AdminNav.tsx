"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Crown,
  CalendarHeart,
  Camera,
  Inbox,
  ScrollText,
  Share2,
  Settings,
  Users,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { adminLogout } from "@/lib/actions/auth";

const MENU = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/princess", label: "Princess", icon: Crown },
  { href: "/admin/eventi", label: "Eventi", icon: CalendarHeart },
  { href: "/admin/galleria", label: "Galleria", icon: Camera },
  { href: "/admin/prenotazioni", label: "Prenotazioni", icon: Inbox },
  { href: "/admin/storia", label: "Storia", icon: ScrollText },
  { href: "/admin/social", label: "Social", icon: Share2 },
  { href: "/admin/impostazioni", label: "Impostazioni", icon: Settings },
  { href: "/admin/utenti", label: "Utenti", icon: Users },
];

export default function AdminNav({ email }: { email?: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = (
    <nav className="space-y-1" aria-label="Menu amministrazione">
      {MENU.map((m) => {
        const active = m.exact ? pathname === m.href : pathname.startsWith(m.href);
        return (
          <Link
            key={m.href}
            href={m.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-2xl px-4 py-3 text-[14px] font-semibold transition",
              active
                ? "bg-princess-600 text-white shadow-royal"
                : "text-ink-soft hover:bg-princess-50 hover:text-princess-700"
            )}
            aria-current={active ? "page" : undefined}
          >
            <m.icon size={18} className={active ? "text-gold-200" : "text-gold-600"} />
            {m.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <div className="mb-6 flex items-center justify-between lg:hidden">
        <p className="font-display text-2xl font-bold text-ink">Admin</p>
        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-princess-200 text-princess-700"
          aria-expanded={open}
          aria-label={open ? "Chiudi menu admin" : "Apri menu admin"}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open && <div className="mb-6 rounded-[1.5rem] border border-ink/10 bg-white p-4 shadow-soft lg:hidden">{links}</div>}

      <aside className="sticky top-4 hidden w-72 shrink-0 self-start rounded-[1.75rem] border border-gold-500/25 bg-white p-5 shadow-soft lg:block">
        <Link href="/admin" className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-princess-600 to-princess-800 p-4 text-white">
          <span className="relative block h-12 w-12 shrink-0">
            <Image src="/logo.png" alt="Logo Princess Academy" fill sizes="48px" className="object-contain" />
          </span>
          <span>
            <span className="block font-display text-[17px] font-bold leading-tight">PRINCESS ACADEMY</span>
            <span className="block text-[10px] uppercase tracking-[0.28em] text-gold-200">Admin</span>
          </span>
        </Link>
        <div className="mt-4">{links}</div>
        <div className="mt-4 rounded-2xl bg-ivory p-4 text-[13px] text-ink-soft">
          <p className="truncate font-semibold text-ink">{email ?? "Admin"}</p>
          <form action={adminLogout}>
            <button className="mt-2 inline-flex items-center gap-1.5 font-semibold text-princess-700 hover:underline">
              <LogOut size={14} /> Esci
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
