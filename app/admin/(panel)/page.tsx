import Link from "next/link";
import { Crown, CalendarHeart, Camera, Inbox, ArrowRight, Sparkles } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const admin = supabaseAdmin();

  const [bookings, events, princesses, gallery] = await Promise.all([
    admin.from("bookings").select("id,first_name,last_name,event_type,status,created_at", { count: "exact" }).order("created_at", { ascending: false }).limit(5),
    admin.from("events").select("id,title,published", { count: "exact" }).order("created_at", { ascending: false }).limit(4),
    admin.from("princesses").select("id,name,is_active", { count: "exact" }).order("display_order").limit(6),
    admin.from("gallery").select("id,title", { count: "exact" }).order("created_at", { ascending: false }).limit(4),
  ]);

  const nuove = await admin.from("bookings").select("id", { count: "exact", head: true }).eq("status", "NUOVA");

  const stats = [
    { icon: Inbox, label: "Richieste nuove", value: nuove.count ?? 0, href: "/admin/prenotazioni", hot: (nuove.count ?? 0) > 0 },
    { icon: CalendarHeart, label: "Eventi", value: events.count ?? 0, href: "/admin/eventi" },
    { icon: Crown, label: "Princess", value: princesses.count ?? 0, href: "/admin/princess" },
    { icon: Camera, label: "Foto", value: gallery.count ?? 0, href: "/admin/galleria" },
  ];

  return (
    <div>
      <p className="eyebrow">✦ Pannello di controllo ✦</p>
      <h1 className="mt-2 font-display text-4xl font-bold text-ink sm:text-5xl">Princess Academy Admin</h1>
      <p className="mt-2 text-ink-soft">Statistiche reali dal database Supabase.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card-royal group p-6">
            <s.icon size={24} className="text-princess-600" aria-hidden />
            <p className="mt-3 font-display text-4xl font-bold text-ink">{s.value}</p>
            <p className="mt-1 flex items-center gap-1 text-[12px] font-bold uppercase tracking-[0.18em] text-ink-soft">
              {s.label}
              {s.hot && <span className="ml-1 rounded-full bg-princess-600 px-2 py-0.5 text-[10px] text-white">da leggere</span>}
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-[1.75rem] border border-ink/10 bg-white p-6 shadow-soft">
          <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-ink">
            <Inbox size={20} className="text-princess-600" /> Ultime prenotazioni
          </h2>
          <ul className="mt-4 space-y-2.5">
            {(bookings.data ?? []).map((b) => (
              <li key={b.id}>
                <Link href="/admin/prenotazioni" className="flex items-center justify-between gap-3 rounded-2xl bg-ivory px-4 py-3 transition hover:bg-princess-50">
                  <span>
                    <span className="block font-semibold text-ink">{b.first_name} {b.last_name}</span>
                    <span className="block text-[13px] text-ink-mute">{b.event_type} · {new Date(b.created_at).toLocaleDateString("it-IT")}</span>
                  </span>
                  <span className="rounded-full bg-princess-600 px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.14em] text-white">
                    {b.status}
                  </span>
                </Link>
              </li>
            ))}
            {(bookings.data ?? []).length === 0 && (
              <li className="rounded-2xl bg-ivory p-5 text-center text-sm text-ink-mute">
                Nessuna richiesta ancora — condividi il form <Link href="/prenota" className="font-semibold text-princess-700 underline">/prenota</Link>.
              </li>
            )}
          </ul>
        </section>

        <div className="space-y-6">
          <section className="rounded-[1.75rem] border border-ink/10 bg-white p-6 shadow-soft">
            <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-ink">
              <CalendarHeart size={20} className="text-princess-600" /> Ultimi eventi
            </h2>
            <ul className="mt-4 space-y-2">
              {(events.data ?? []).map((e) => (
                <li key={e.id} className="flex items-center justify-between rounded-2xl bg-ivory px-4 py-2.5 text-[15px]">
                  <span className="font-medium text-ink">{e.title}</span>
                  <span className={`rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.14em] ${e.published ? "bg-emerald-100 text-emerald-800" : "bg-gold-100 text-gold-700"}`}>
                    {e.published ? "Pubblicato" : "Bozza"}
                  </span>
                </li>
              ))}
              {(events.data ?? []).length === 0 && <li className="text-sm text-ink-mute">Nessun evento — crealo da <Link href="/admin/eventi" className="underline">Eventi</Link>.</li>}
            </ul>
          </section>
          <section className="rounded-[1.75rem] border border-gold-500/30 bg-gradient-to-br from-white to-gold-50 p-6 shadow-golden">
            <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-ink">
              <Sparkles size={20} className="text-gold-600" /> Azioni rapide
            </h2>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <Link href="/admin/galleria" className="btn-princess !px-5 !py-2.5 text-[12px]">Carica foto</Link>
              <Link href="/admin/princess" className="btn-admin-primary !px-5 !py-2.5 text-[12px]">Nuova Princess</Link>
              <Link href="/admin/prenotazioni" className="btn-admin-primary !px-5 !py-2.5 text-[12px]">Leggi richieste</Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
