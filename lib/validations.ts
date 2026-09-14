import { z } from "zod";

const nonVuoto = (msg: string) => z.string().trim().min(1, msg);

export const bookingSchema = z.object({
  nome: z.string().trim().min(2, "Inserisci il nome"),
  cognome: z.string().trim().min(2, "Inserisci il cognome"),
  email: z.string().trim().toLowerCase().email("Email non valida").max(160),
  telefono: z
    .string()
    .trim()
    .regex(/^[+()\-.\s\d]{6,25}$/, "Telefono non valido")
    .refine((v) => (v.match(/\d/g) ?? []).length >= 6, "Telefono non valido"),
  dataEvento: nonVuoto("Scegli la data").refine((v) => {
    const d = new Date(`${v}T00:00:00`);
    if (Number.isNaN(d.getTime())) return false;
    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);
    return d >= oggi;
  }, "La data non può essere nel passato"),
  orario: nonVuoto("Indica l'orario").regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Orario non valido"),
  luogo: z.string().trim().min(3, "Indica il luogo").max(220),
  tipologia: nonVuoto("Scegli la tipologia"),
  invitati: z.string().trim().max(60).optional(),
  etaBambini: z.string().trim().max(60).optional(),
  princess: z.string().trim().max(120).optional(),
  durata: z.string().trim().max(60).optional(),
  servizi: z.string().trim().max(500).optional(),
  messaggio: z.string().trim().max(2000, "Messaggio troppo lungo (max 2000 caratteri)").optional(),
  privacy: z.literal(true, {
    errorMap: () => ({ message: "Devi accettare la privacy policy" }),
  }),
});

export type BookingInput = z.infer<typeof bookingSchema>;

export const contactSchema = z.object({
  nome: z.string().trim().min(2, "Inserisci il nome").max(120),
  email: z.string().trim().toLowerCase().email("Email non valida").max(160),
  messaggio: z.string().trim().min(10, "Raccontaci qualcosa in più (min 10 caratteri)").max(2000),
});

export type ContactInput = z.infer<typeof contactSchema>;
