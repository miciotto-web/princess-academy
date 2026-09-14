export type Princess = {
  slug: string;
  nome: string;
  personaggio: string;
  ruolo: string;
  descrizione: string;
  biografia: string[];
  specialita: string[];
  colori: { from: string; to: string };
  iniziale: string;
  social?: { instagram?: string; tiktok?: string };
  demo?: boolean;
  /** Foto principale reale da Supabase Storage (se presente). */
  foto?: string;
  /** Foto aggiuntive reali (dettaglio). */
  fotoExtra?: string[];
};

export type Evento = {
  slug: string;
  titolo: string;
  categoria: string;
  descrizione: string;
  dettagli: string;
  durata: string;
  servizi: string[];
  prezzo?: string;
  disponibili: boolean;
  icone: string;
  gradiente: string;
  /** Immagine reale da Supabase Storage (se presente). */
  foto?: string;
};

export type StoriaItem = {
  anno: string;
  titolo: string;
  descrizione: string;
  image?: string;
  evidenza?: boolean;
};

export type GalleryItem = {
  id: string;
  titolo: string;
  categoria: string;
  evento: string;
  data: string;
  gradiente: string;
  icona: string;
  altezza: "alta" | "media" | "bassa";
  /** URL foto reale da Supabase Storage; se assente, segnaposto elegante. */
  foto?: string;
  descrizione?: string;
};
