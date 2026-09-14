import { supabaseServer, isSupabaseConfigured } from "@/lib/supabase/server";
import {
  CATEGORIE_GALLERIA,
  EVENTI,
  GALLERIA,
  PRINCESS_DEMO,
  STORIA,
} from "@/lib/data";
import type { Evento, GalleryItem, Princess, StoriaItem } from "@/types";

/**
 * Letture pubbliche: provano Supabase, con fallback ai dati demo
 * quando il DB non è configurato, non raggiungibile o ancora vuoto.
 * Così il frontend della Parte 1 resta intatto e si accende da solo
 * appena l'admin inserisce contenuti reali.
 */

const GRADIENTI = [
  "from-princess-500 via-princess-600 to-princess-800",
  "from-gold-400 via-princess-500 to-princess-700",
  "from-princess-300 via-princess-500 to-princess-800",
  "from-gold-500 via-princess-600 to-princess-900",
];

/**
 * Whitelist gradienti consentiti (FASE 2.9F).
 * Sono inclusi i 4 gradienti storici del progetto, i 2 nuovi da FASE 2.9F
 * e tutti i gradienti usati dai dati demo in lib/data.ts, così la build
 * rileva staticamente ogni classe Tailwind e non vengono mai generati
 * classi arbitrarie dal database.
 */
export const GRADIENTI_EVENTO = [
  "from-princess-500 via-princess-600 to-princess-800",
  "from-gold-400 via-princess-500 to-princess-700",
  "from-princess-300 via-princess-500 to-princess-800",
  "from-gold-500 via-princess-600 to-princess-900",
  "from-princess-700 via-ink to-ink",
  "from-gold-300 via-gold-500 to-princess-600",
  "from-ivory-dark via-gold-200 to-gold-500",
  "from-blush via-princess-300 to-princess-600",
  "from-princess-600 via-princess-700 to-ink",
  "from-princess-400 via-gold-400 to-princess-700",
] as const;

/** Whiteliste icone consentite (chiavi dell'EventCard ICONS). */
export const ICONE_EVENTO = [
  "crown",
  "cake",
  "rings",
  "building",
  "home",
  "mic",
  "camera",
  "sparkles",
  "wand",
  "heart",
] as const;

export function isGradientValido(g: string | null | undefined): boolean {
  return !!g && (GRADIENTI_EVENTO as readonly string[]).includes(g);
}

const INIZIALI = "ACDEFGILMNPRSTV";

export async function getPrincesses(): Promise<Princess[]> {
  if (!isSupabaseConfigured()) return PRINCESS_DEMO;
  const supa = supabaseServer();
  const { data, error } = await supa
    .from("princesses")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });
  if (error) throw new Error("Errore nel caricamento delle Princess");
  if (!data || data.length === 0) return PRINCESS_DEMO;
  return data.map((p, i) => ({
    slug: p.slug,
    nome: p.name,
    personaggio: p.character_name ?? "Principessa Academy",
    ruolo: p.role ?? "Principessa",
    descrizione: p.description ?? "",
    biografia: (p.biography ?? "").split(/\n\n+/).filter(Boolean),
    specialita: p.specialties ?? [],
    colori: {
      from: ["#F28CC6", "#E8CC76", "#F7B9DE", "#DFB954"][i % 4],
      to: ["#A50E66", "#C7147D", "#7E0C4F", "#5C0A3B"][i % 4],
    },
    iniziale: (p.name?.[0] ?? INIZIALI[i % INIZIALI.length]).toUpperCase(),
    foto: p.main_image ?? undefined,
    social: {
      ...(p.social_instagram ? { instagram: p.social_instagram } : {}),
      ...(p.social_tiktok ? { tiktok: p.social_tiktok } : {}),
    },
  }));
}

export async function getPrincess(slug: string): Promise<Princess | null> {
  if (!isSupabaseConfigured()) {
    return PRINCESS_DEMO.find((p) => p.slug === slug) ?? null;
  }
  const { data, error } = await supabaseServer()
    .from("princesses")
    .select("*, princess_images(file_url)")
    .eq("is_active", true)
    .eq("slug", slug)
    .single();
  if (error && error.code !== "PGRST116") throw new Error("Errore nel caricamento della Princess");
  if (!data) {
    const tutte = await getPrincesses();
    return tutte.find((p) => p.slug === slug) ?? null;
  }
  const extra = ((data.princess_images as { file_url: string }[] | null) ?? []).map((i) => i.file_url);
  const base = (await getPrincesses()).find((p) => p.slug === slug);
  if (!base) return null;
  return { ...base, fotoExtra: extra.length > 0 ? extra : undefined };
}

export async function getPrincessOptions(): Promise<{ id: string; nome: string }[]> {
  if (!isSupabaseConfigured()) return PRINCESS_DEMO.map((p) => ({ id: p.slug, nome: p.nome }));
  const supa = supabaseServer();
  const { data, error } = await supa
    .from("princesses")
    .select("id,name")
    .eq("is_active", true)
    .order("display_order");
  if (error) throw new Error("Errore nel caricamento delle Princess");
  if (!data || data.length === 0) return PRINCESS_DEMO.map((p) => ({ id: p.slug, nome: p.nome }));
  return data.map((p) => ({ id: p.id, nome: p.name }));
}

export async function getEvents(): Promise<Evento[]> {
  if (!isSupabaseConfigured()) return EVENTI;
  const supa = supabaseServer();
  const { data, error } = await supa
    .from("events")
    .select("*, event_categories(name)")
    .eq("published", true)
    .order("display_order", { ascending: true });
  if (error) throw new Error("Errore nel caricamento degli eventi");
  if (!data || data.length === 0) return EVENTI;
  return data.map((e, i) => ({
    slug: e.slug,
    titolo: e.title,
    categoria: e.event_categories?.name ?? "Esperienza",
    descrizione: e.description ?? "",
    dettagli: e.information ?? "",
    durata: e.duration ?? "",
    servizi: e.services ?? [],
    prezzo: e.price ?? undefined,
    disponibili: (e.availability ?? "") !== "Esaurito",
    icone: (ICONE_EVENTO as readonly string[]).includes(e.icon) ? e.icon : "sparkles",
    gradiente: isGradientValido(e.gradient) ? e.gradient : GRADIENTI[i % GRADIENTI.length],
    foto: e.main_image ?? undefined,
  }));
}

export async function getTimeline(): Promise<StoriaItem[]> {
  if (!isSupabaseConfigured()) return STORIA;
  const supa = supabaseServer();
  const { data, error } = await supa
    .from("timeline")
    .select("*")
    .eq("published", true)
    .order("display_order", { ascending: true });
  if (error) throw new Error("Errore nel caricamento della timeline");
  if (!data || data.length === 0) return STORIA;
  return data.map((t, i) => ({
    anno: t.year,
    titolo: t.title,
    descrizione: t.description ?? "",
    image: t.image ?? undefined,
    evidenza: i === 2,
  }));
}

export type SocialCard = {
  nome: string;
  handle: string;
  descrizione: string;
  cta: string;
  url: string;
  gradiente: string;
  icon?: string;
};

const SOCIAL_FALLBACK: SocialCard[] = [
  { nome: "Instagram", handle: "@princess.academy (demo)", descrizione: "Scopri ogni giorno nuovi momenti magici.", cta: "Seguici", url: "https://instagram.com", gradiente: "from-princess-500 via-princess-600 to-gold-500" },
  { nome: "TikTok", handle: "@princessacademy (demo)", descrizione: "Magie in 30 secondi dalle nostre Princess.", cta: "Guardaci", url: "https://tiktok.com", gradiente: "from-ink via-princess-700 to-princess-500" },
  { nome: "Facebook", handle: "Princess Academy (demo)", descrizione: "Eventi, date pubbliche e community.", cta: "Unisciti", url: "https://facebook.com", gradiente: "from-princess-600 via-princess-500 to-gold-400" },
  { nome: "YouTube", handle: "Princess Academy TV (demo)", descrizione: "Mini-spettacoli e fiabe della buonanotte.", cta: "Iscriviti", url: "https://youtube.com", gradiente: "from-gold-500 via-princess-600 to-princess-800" },
];

export async function getSocialCards(): Promise<SocialCard[]> {
  if (!isSupabaseConfigured()) return SOCIAL_FALLBACK;
  const supa = supabaseServer();
  const { data, error } = await supa
    .from("social_links")
    .select("*")
    .eq("active", true)
    .order("display_order", { ascending: true });
  if (error) throw new Error("Errore nel caricamento dei social");
  if (!data || data.length === 0) return SOCIAL_FALLBACK;
  return data.map((s, i) => ({
    nome: s.name,
    handle: s.url,
    descrizione: s.description ?? "",
    cta: "Seguici",
    url: s.url,
    gradiente: SOCIAL_FALLBACK[i % SOCIAL_FALLBACK.length].gradiente,
    icon: s.icon ?? undefined,
  }));
}

export async function getGallery(): Promise<GalleryItem[]> {
  if (!isSupabaseConfigured()) return GALLERIA;
  const supa = supabaseServer();
  const { data, error } = await supa
    .from("gallery")
    .select("*, gallery_categories(name), events(title)")
    .eq("published", true)
    .order("display_order", { ascending: true })
    .limit(60);
  if (error) throw new Error("Errore nel caricamento della galleria");
  if (!data || data.length === 0) return GALLERIA;
  const altezze = ["alta", "media", "bassa"] as const;
  return data.map((g, i) => ({
    id: g.id,
    titolo: g.title ?? "Ricordo magico",
    categoria: g.gallery_categories?.name ?? "Eventi",
    evento: g.events?.title ?? "Evento Academy",
    data: g.event_date ? String(g.event_date).slice(0, 4) : "",
    gradiente: GRADIENTI[i % GRADIENTI.length],
    icona: "sparkles",
    altezza: altezze[i % 3],
    foto: g.file_url ?? undefined,
    descrizione: g.description ?? undefined,
  }));
}

export async function getGalleryCategories(): Promise<string[]> {
  if (!isSupabaseConfigured()) return [...CATEGORIE_GALLERIA];
  const supa = supabaseServer();
  const { data, error } = await supa
    .from("gallery_categories")
    .select("name")
    .order("display_order", { ascending: true });
  // Errore reale di query: non nascoverlo con il fallback demo.
  if (error) throw new Error("Errore nel caricamento delle categorie galleria");
  // Query riuscita senza risultati: fallback demo lecito.
  if (!data || data.length === 0) return [...CATEGORIE_GALLERIA];
  return ["Tutti", ...data.map((c) => c.name)];
}

export async function getSiteSettings(): Promise<Record<string, string>> {
  const fallback: Record<string, string> = {
    contact_email: "magia@princess-academy.it",
    contact_phone: "+39 02 8736 0000",
    contact_whatsapp: "+39 345 000 0000",
    contact_address: "Via delle Fiabe 12, Milano",
    contact_hours: "Lun – Sab · 9:00 – 19:00",
  };
  if (!isSupabaseConfigured()) return fallback;
  const supa = supabaseServer();
  const { data, error } = await supa.from("site_settings").select("key,value");
  // Errore reale di query: non nasconderlo con il fallback demo.
  if (error) throw new Error("Errore nel caricamento delle impostazioni del sito");
  if (!data) return fallback;
  const out = { ...fallback };
  data.forEach((s) => {
    out[s.key] = s.value;
  });
  return out;
}

export async function getSiteContent(key: string, fallbackTitle: string, fallbackBody: string) {
  if (!isSupabaseConfigured()) return { title: fallbackTitle, body: fallbackBody };
  const supa = supabaseServer();
  // maybeSingle: restituisce { data: null, error: null } se la key non esiste
  // (fallback lecito), mentre gli errori reali restituiscono error valorizzato.
  const { data, error } = await supa.from("site_content").select("*").eq("key", key).maybeSingle();
  if (error) throw new Error("Errore nel caricamento del contenuto del sito");
  if (!data) return { title: fallbackTitle, body: fallbackBody };
  return { title: data.title, body: data.body };
}
