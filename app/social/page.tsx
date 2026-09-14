import type { Metadata } from "next";
import { Instagram, Facebook, Music2, Youtube, ArrowUpRight, Sparkles } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { PageHero, Reveal } from "@/components/ui/decor";
import { WhatsAppIcon } from "@/components/ui/icons";
import { getSocialCards } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Seguici nel mondo della magia",
  description: "I canali social ufficiali di Princess Academy.",
  alternates: { canonical: "/social" },
};

const CTA_PER_NOME: Record<string, string> = {
  instagram: "Seguici",
  tiktok: "Guardaci",
  facebook: "Unisciti",
  youtube: "Iscriviti",
};

type SocialIconKey = "instagram" | "facebook" | "tiktok" | "youtube" | "whatsapp";

const ICON_COMPONENT: Record<SocialIconKey, ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>> = {
  instagram: Instagram,
  facebook: Facebook,
  tiktok: Music2,
  youtube: Youtube,
  whatsapp: WhatsAppIcon,
};

function icona(icon: string | undefined) {
  const key = (icon ?? "instagram") as SocialIconKey;
  return ICON_COMPONENT[key] ?? Instagram;
}

function cta(nome: string, icon: string | undefined) {
  if (icon === "whatsapp") return "Scrivici";
  const n = nome.toLowerCase();
  for (const [k, v] of Object.entries(CTA_PER_NOME)) if (n.includes(k)) return v;
  return "Seguici";
}

export default async function SocialPage() {
  const canali = await getSocialCards();
  return (
    <>
      <PageHero
        eyebrow="Community"
        title={<>Seguici nel mondo <em className="text-gold-200">della magia</em></>}
        intro="Scopri i nostri canali ufficiali e unisciti alla community."
      />
      <section className="section-texture py-16" aria-label="Canali social">
        <div className="container-royal grid gap-6 sm:grid-cols-2">
          {canali.map((c, i) => {
            const Icon = icona(c.icon);
            return (
              <Reveal key={c.nome} delay={(i % 2) * 0.08}>
                <article className="card-royal group p-8 sm:p-10">
                  <div className="flex items-start justify-between">
                    <span className={`inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br ${c.gradiente} text-white shadow-royal`}>
                      <Icon size={28} aria-hidden />
                    </span>
                    <Sparkles size={20} className="text-gold-500" aria-hidden />
                  </div>
                  <p className="mt-6 break-all text-[11.5px] font-bold uppercase tracking-[0.28em] text-princess-600">{c.handle}</p>
                  <h2 className="mt-2 font-display text-4xl font-bold text-ink">{c.nome}</h2>
                  <p className="mt-3 leading-relaxed text-ink-soft">{c.descrizione}</p>
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${cta(c.nome, c.icon)} Princess Academy su ${c.nome}`}
                    className="btn-princess mt-6"
                  >
                    {cta(c.nome, c.icon)} <ArrowUpRight size={16} />
                  </a>
                </article>
              </Reveal>
            );
          })}
        </div>
        <p className="container-royal mt-8 text-center text-sm text-ink-mute">
          ✦ Utilizziamo i loghi ufficiali delle piattaforme senza alterazioni creative. ✦
        </p>
      </section>
    </>
  );
}
