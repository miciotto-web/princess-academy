"use server";

import { bookingSchema } from "@/lib/validations";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { notifyAdminNewBooking, confirmClientBookingReceived } from "@/lib/email";

export type SubmitResult = { ok: boolean; demo?: boolean; error?: string };

const MAX_PER_HOUR = 5;

/**
 * Crea una richiesta di prenotazione con stato iniziale NUOVA
 * (mai confermata automaticamente). Include anti-spam basilare
 * (max 5 richieste/ora per email) e notifiche email best-effort:
 * l'invio email non blocca mai la prenotazione.
 */
export async function submitBooking(raw: unknown): Promise<SubmitResult> {
  const parsed = bookingSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Controlla i campi evidenziati e riprova." };
  }
  const d = parsed.data;

  // Senza Supabase: comportamento dimostrativo.
  if (!isSupabaseConfigured()) {
    await new Promise((r) => setTimeout(r, 900));
    return { ok: true, demo: true };
  }

  try {
    const admin = supabaseAdmin();

    // Anti-spam: troppe richieste recenti dalla stessa email.
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await admin
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("email", d.email)
      .gte("created_at", hourAgo);
    if ((count ?? 0) >= MAX_PER_HOUR) {
      return { ok: false, error: "Hai già inviato diverse richieste di recente. Contattaci pure direttamente per urgenze." };
    }

    // Risolvi princess desiderata (nome → id), se corrisponde al cast reale.
    let princess_id: string | null = null;
    if (d.princess && d.princess !== "") {
      const { data: match } = await admin
        .from("princesses")
        .select("id,name")
        .ilike("name", d.princess.split(" — ")[0].trim())
        .limit(1)
        .single();
      princess_id = match?.id ?? null;
    }

    const { data: booking, error } = await admin
      .from("bookings")
      .insert({
        first_name: d.nome,
        last_name: d.cognome,
        email: d.email,
        phone: d.telefono,
        event_date: d.dataEvento,
        event_time: d.orario,
        location: d.luogo,
        event_type: d.tipologia,
        guests: d.invitati || null,
        children_age: d.etaBambini || null,
        princess_id,
        duration: d.durata || null,
        servizi: d.servizi || null,
        message: d.messaggio || null,
        status: "NUOVA",
        privacy_accepted: true,
        privacy_accepted_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error || !booking) {
      return { ok: false, error: "Invio non riuscito. Riprova tra poco o contattaci direttamente." };
    }

    if (d.servizi && d.servizi.trim() !== "") {
      await admin.from("booking_services").insert(
        d.servizi.split(/[,;]+/).map((s) => ({
          booking_id: booking.id,
          service_name: s.trim().slice(0, 120),
        })).filter((r) => r.service_name !== "")
      );
    }

    // Notifiche best-effort (non bloccano, non espongono errori tecnici).
    const mailData = {
      nome: d.nome,
      cognome: d.cognome,
      email: d.email,
      telefono: d.telefono,
      dataEvento: d.dataEvento,
      orario: d.orario,
      luogo: d.luogo,
      tipologia: d.tipologia,
      princess: d.princess,
      messaggio: d.messaggio,
    };
    await Promise.allSettled([
      notifyAdminNewBooking(mailData),
      confirmClientBookingReceived(mailData),
    ]);

    return { ok: true };
  } catch {
    return { ok: false, error: "Errore di connessione. Riprova tra poco." };
  }
}
