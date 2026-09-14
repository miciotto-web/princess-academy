"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import CookieBanner from "@/components/legal/CookieBanner";
import Link from "next/link";
import { Sparkles } from "lucide-react";

/**
 * AppShell: gestisce il branch visuale tra area pubblica e area admin.
 *
 * Riceve `footer` come slot (Server Component renderizzato sul server)
 * per evitare l'import di `next/headers` dentro il bundle client.
 *
 * Sotto `/admin/*` (incluso `/admin/login` e il pannello):
 * - Navbar pubblica NON montata (evita duplicazione brand e padding artificiale)
 * - Footer pubblico NON montato
 * - CookieBanner NON montato (già gestito a monte / non perturba la UI di lavoro)
 * - CTA "Prenota" mobile NON montata (non copre i controlli admin)
 *
 * Sulle rotte pubbliche e `/auth/*`:
 * - Tutto montato normalmente.
 */
export type AppShellProps = {
  children: ReactNode;
  footer: ReactNode;
  socialUrls?: { instagram?: string; facebook?: string };
};

export default function AppShell({ children, footer, socialUrls }: AppShellProps) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") ?? false;

  if (isAdmin) {
    return <main id="contenuto">{children}</main>;
  }

  return (
    <>
      <Navbar socialUrls={socialUrls} />
      <main id="contenuto">{children}</main>
      {footer}
      <CookieBanner />
      <Link
        href="/prenota"
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-princess-600 to-princess-700 px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-royal transition hover:brightness-110 lg:hidden"
      >
        <Sparkles size={14} /> Prenota
      </Link>
    </>
  );
}
