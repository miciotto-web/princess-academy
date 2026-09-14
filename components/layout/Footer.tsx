import Link from "next/link";
import Image from "next/image";
import { Instagram, Facebook, Music2, Mail, Phone, MapPin, Heart, Sparkles } from "lucide-react";
import { getSiteSettings, getSocialCards } from "@/lib/queries";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/storia", label: "La nostra storia" },
  { href: "/princess", label: "Le nostre Princess" },
  { href: "/eventi", label: "Eventi" },
  { href: "/galleria", label: "Galleria" },
  { href: "/prenota", label: "Prenota" },
  { href: "/social", label: "Social" },
  { href: "/contatti", label: "Contatti" },
];

export default async function Footer() {
  const [s, socialCards] = await Promise.all([getSiteSettings(), getSocialCards()]);
  const socialUrls = {
    instagram: socialCards.find((c) => c.icon === "instagram")?.url,
    facebook: socialCards.find((c) => c.icon === "facebook")?.url,
  };

  return (
    <footer className="relative overflow-hidden bg-page-alt text-body">
      <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
      {/* alone di luce */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(closest-side, var(--accent), transparent)" }}
      />
      <div className="container-royal relative grid gap-12 py-16 lg:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-4">
            <span className="relative block h-24 w-24 shrink-0 drop-shadow-[0_6px_20px_rgba(212,175,55,0.45)]">
              <Image src="/logo.png" alt="Logo Princess Academy" fill sizes="96px" className="object-contain" />
            </span>
            <span>
              <span className="block font-display text-2xl font-bold tracking-[0.08em]">PRINCESS ACADEMY</span>
              <span className="block text-[11px] font-medium uppercase tracking-[0.34em] text-gold-300">
                Magical Party Experience
              </span>
            </span>
          </Link>
          <p className="mt-5 max-w-sm font-display text-xl italic leading-relaxed text-body/85">
            &ldquo;Trasformiamo ogni festa in una favola — con grazia, musica e un pizzico di polvere di stelle.&rdquo;
          </p>
          <div className="mt-6 flex gap-2">
            {[
              { icon: Instagram, label: "Instagram", href: socialUrls.instagram },
              { icon: Facebook, label: "Facebook", href: socialUrls.facebook },
              { icon: Music2, label: "TikTok", href: "#" },
            ].map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gold-500/40 text-gold-200 transition hover:-translate-y-0.5 hover:border-gold-300 hover:bg-gold-500 hover:text-page-alt"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        <nav aria-label="Link footer">
          <h3 className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.3em] text-gold-300">
            <Sparkles size={14} /> Esplora la magia
          </h3>
          <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 lg:grid-cols-1">
            {NAV.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-[15px] text-body/75 transition hover:text-gold-200">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 className="text-[12px] font-bold uppercase tracking-[0.3em] text-gold-300">Contattaci</h3>
          <ul className="mt-5 space-y-3 text-[15px] text-body/75">
            <li className="flex items-center gap-3">
              <Mail size={16} className="text-gold-300" /> {s.contact_email}
            </li>
            <li className="flex items-center gap-3">
              <Phone size={16} className="text-gold-300" /> {s.contact_phone}
            </li>
            <li className="flex items-center gap-3">
              <MapPin size={16} className="text-gold-300" /> {s.contact_address}
            </li>
          </ul>
          <Link
            href="/prenota"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-400 to-gold-500 px-6 py-3 text-[12.5px] font-bold uppercase tracking-[0.16em] text-ink shadow-golden transition hover:-translate-y-0.5 hover:brightness-105"
          >
            Prenota la tua magia
          </Link>
        </div>
      </div>

      <div className="relative border-t border-ink/10">
        <div className="container-royal flex flex-col items-center justify-between gap-3 py-6 text-[13px] text-body/55 sm:flex-row">
          <p>© {new Date().getFullYear()} Princess Academy · Tutti i diritti riservati</p>
          <p className="flex items-center gap-4">
            <Link href="/privacy" className="transition hover:text-gold-200">
              Privacy
            </Link>
            <Link href="/cookie" className="transition hover:text-gold-200">
              Cookie Policy
            </Link>
            <Link href="/admin" className="transition hover:text-gold-200" aria-label="Area riservata admin">
              Admin
            </Link>
            <span className="inline-flex items-center gap-1">
              Fatto con <Heart size={13} className="text-princess-300" /> e stelle
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
