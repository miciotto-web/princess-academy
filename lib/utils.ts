export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/**
 * Converte una stringa in uno slug URL-safe: NFD (rimozione accenti),
 * minuscolo, solo [a-z0-9-], trattini compressi, cap 80 caratteri.
 */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

/** Valida un URL inserito manualmente: accetta solo http/https ben formati. */
export function isValidHttpUrl(s: string): boolean {
  if (!s?.trim()) return false;
  try {
    const u = new URL(s.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Costruisce un link wa.me canonico a partire da un numero di telefono
 * (con o senza prefisso internazionale) e da un eventuale messaggio precompilato.
 *
 * - Rimuove spazi, trattini, parentesi, punti; tiene solo `+` e cifre.
 * - Valida che la parte numerica (senza `+`) sia lunga 7-15 cifre (range E.164).
 * - Restituisce `https://wa.me/{digits}` (+ `?text={encodeURIComponent(msg)}` se presente).
 *
 * Lancia `Error` se il numero non è valido o vuoto.
 */
export function buildWhatsAppUrl(phone: string, text?: string): string {
  if (!phone || !phone.trim()) throw new Error("Numero WhatsApp obbligatorio.");
  const cleaned = phone.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");
  const digits = cleaned.replace(/^\+/, "");
  if (!/^\d{7,15}$/.test(digits)) {
    throw new Error("Numero WhatsApp non valido (atteso formato internazionale, 7-15 cifre).");
  }
  const base = `https://wa.me/${digits}`;
  const msg = text?.trim();
  if (msg) return `${base}?text=${encodeURIComponent(msg)}`;
  return base;
}

/**
 * Parsa un URL WhatsApp (wa.me o api.whatsapp.com/send) e ritorna numero e messaggio.
 * Ritorna `null` se l'URL non è riconoscibile come link WhatsApp.
 */
export function parseWhatsAppUrl(url: string | null | undefined): { phone: string; text: string } | null {
  if (!url) return null;
  const waMe = url.match(/^https?:\/\/wa\.me\/(\d+)(?:[?&#]text=([^&#]*))?/i);
  if (waMe) {
    return {
      phone: `+${waMe[1]}`,
      text: waMe[2] ? decodeURIComponent(waMe[2]) : "",
    };
  }
  const api = url.match(/^https?:\/\/api\.whatsapp\.com\/send\?(?:[^&#]*&)*phone=(\d+)(?:&(?:[^&#]*&)*text=([^&#]*))?/i);
  if (api) {
    return {
      phone: `+${api[1]}`,
      text: api[2] ? decodeURIComponent(api[2]) : "",
    };
  }
  return null;
}
