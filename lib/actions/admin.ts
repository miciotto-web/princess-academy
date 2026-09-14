"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/guard";
import { slugify } from "@/lib/utils";
import type { BookingStatus } from "@/types/db";
import { ICONE_EVENTO, GRADIENTI_EVENTO, isGradientValido } from "@/lib/queries";

type Res = { ok: boolean; error?: string; id?: string; warning?: string };

async function guard() {
  const g = await requireAdmin();
  if (!g) return { error: "Non autorizzata. Effettua il login admin." as const, admin: null };
  return { error: null, admin: g.admin };
}

function toArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof v === "string")
    return v.split(/\n|,/).map((s) => s.trim()).filter(Boolean);
  return [];
}

/* ================= PRINCESS ================= */

export async function savePrincess(input: {
  id?: string;
  name: string;
  slug?: string;
  character_name?: string;
  role?: string;
  description?: string;
  biography?: string;
  specialties?: string[] | string;
  main_image?: string;
  social_instagram?: string;
  social_tiktok?: string;
  is_active?: boolean;
  display_order?: number;
}): Promise<Res> {
  const { error, admin } = await guard();
  if (error || !admin) return { ok: false, error: error ?? "Errore" };
  if (!input.name?.trim()) return { ok: false, error: "Il nome è obbligatorio." };

  // Slug manuale (normalizzato) oppure derivato dal nome.
  const manualSlug = input.slug?.trim() ? slugify(input.slug) : "";
  const autoSlug = slugify(input.name);

  const row: Record<string, unknown> = {
    name: input.name.trim(),
    character_name: input.character_name?.trim() || "",
    role: input.role?.trim() || "",
    description: input.description?.trim() || "",
    biography: input.biography?.trim() || "",
    specialties: toArray(input.specialties),
    main_image: input.main_image?.trim() || null,
    social_instagram: input.social_instagram?.trim() || null,
    social_tiktok: input.social_tiktok?.trim() || null,
    is_active: input.is_active ?? true,
    display_order: Number(input.display_order ?? 0),
  };

  let res;
  if (input.id) {
    // In modifica: slug manuale se fornito, altrimenti preservare quello esistente.
    row.slug = manualSlug || undefined;
    res = await admin
      .from("princesses")
      .update(row)
      .eq("id", input.id)
      .select("id, slug")
      .single();
  } else {
    // In creazione: slug manuale se fornito, altrimenti automatico dal nome.
    row.slug = manualSlug || autoSlug;
    res = await admin.from("princesses").insert(row).select("id, slug").single();
  }

  if (res.error) {
    if (res.error.code === "23505") {
      return { ok: false, error: "Slug già in uso. Scegli uno slug diverso." };
    }
    return { ok: false, error: "Salvataggio non riuscito: " + res.error.message };
  }
  revalidatePath("/admin/princess");
  revalidatePath("/princess");
  revalidatePath("/");
  return { ok: true, id: res.data.id };
}

export async function deletePrincess(id: string): Promise<Res> {
  const { error, admin } = await guard();
  if (error || !admin) return { ok: false, error: error ?? "Errore" };
  const { error: e } = await admin.from("princesses").delete().eq("id", id);
  if (e) return { ok: false, error: e.message };
  revalidatePath("/admin/princess");
  revalidatePath("/princess");
  return { ok: true };
}

export async function togglePrincess(id: string, active: boolean): Promise<Res> {
  const { error, admin } = await guard();
  if (error || !admin) return { ok: false, error: error ?? "Errore" };
  const { error: e } = await admin.from("princesses").update({ is_active: active }).eq("id", id);
  if (e) return { ok: false, error: e.message };
  revalidatePath("/admin/princess");
  revalidatePath("/princess");
  return { ok: true };
}

export async function uploadPrincessImage(princessId: string, formData: FormData): Promise<Res> {
  const { error, admin } = await guard();
  if (error || !admin) return { ok: false, error: error ?? "Errore" };
  const file = formData.get("file") as File | null;
  const check = validImage(file);
  if (check) return { ok: false, error: check };
  const path = `${princessId}/${Date.now()}-${(file as File).name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
  const { error: up } = await admin.storage.from("princess-images").upload(path, file as File, {
    contentType: (file as File).type,
  });
  if (up) return { ok: false, error: up.message };
  const { data } = admin.storage.from("princess-images").getPublicUrl(path);
  const { error: ins } = await admin.from("princess_images").insert({
    princess_id: princessId,
    file_url: data.publicUrl,
  });
  if (ins) return { ok: false, error: ins.message };
  revalidatePath("/admin/princess");
  return { ok: true };
}

export async function deletePrincessImage(id: string, fileUrl: string): Promise<Res> {
  const { error, admin } = await guard();
  if (error || !admin) return { ok: false, error: error ?? "Errore" };
  await admin.from("princess_images").delete().eq("id", id);
  const path = fileUrl.split("/princess-images/")[1];
  if (path) await admin.storage.from("princess-images").remove([path]);
  revalidatePath("/admin/princess");
  return { ok: true };
}

/**
 * Carica la foto principale di una Princess e aggiorna princesses.main_image.
 * Ritorna l'URL pubblico per consentire l'auto-fill del campo URL nella UI.
 */
export async function setPrincessMainImage(princessId: string, formData: FormData): Promise<Res & { url?: string }> {
  const { error, admin } = await guard();
  if (error || !admin) return { ok: false, error: error ?? "Errore" };
  const file = formData.get("file") as File | null;
  const check = validImage(file);
  if (check) return { ok: false, error: check };
  const safeName = (file as File).name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const path = `${princessId}/main-${Date.now()}-${safeName}`;
  const { error: up } = await admin.storage.from("princess-images").upload(path, file as File, {
    contentType: (file as File).type,
  });
  if (up) return { ok: false, error: up.message };
  const { data } = admin.storage.from("princess-images").getPublicUrl(path);
  const { error: upd } = await admin.from("princesses").update({ main_image: data.publicUrl }).eq("id", princessId);
  if (upd) return { ok: false, error: upd.message };
  revalidatePath("/admin/princess");
  revalidatePath("/princess");
  revalidatePath("/");
  return { ok: true, url: data.publicUrl };
}

/* ================= EVENTI ================= */

export async function saveEvent(input: {
  id?: string;
  title: string;
  description?: string;
  duration?: string;
  services?: string[] | string;
  price?: string;
  information?: string;
  availability?: string;
  category_id?: string | null;
  main_image?: string;
  display_order?: number;
  published?: boolean;
  icon?: string;
  gradient?: string;
}): Promise<Res> {
  const { error, admin } = await guard();
  if (error || !admin) return { ok: false, error: error ?? "Errore" };
  if (!input.title?.trim()) return { ok: false, error: "Il titolo è obbligatorio." };

  // Validazione whitelist lato server (FASE 2.9F).
  // L'icona sconosciuta -> sparkles; il gradiente non in whitelist -> "" (fallback ciclico a runtime).
  const icon = (ICONE_EVENTO as readonly string[]).includes(input.icon ?? "") ? input.icon ?? "" : undefined;
  const gradient = isGradientValido(input.gradient) ? input.gradient ?? "" : undefined;
  const iconSafe = (ICONE_EVENTO as readonly string[]).includes(icon ?? "") ? icon : "sparkles";
  const gradientSafe = isGradientValido(gradient) ? gradient : "";

  const row = {
    title: input.title.trim(),
    slug: slugify(input.title),
    description: input.description?.trim() || "",
    duration: input.duration?.trim() || "",
    services: toArray(input.services),
    price: input.price?.trim() || null,
    information: input.information?.trim() || "",
    availability: input.availability?.trim() || "Disponibile",
    category_id: input.category_id || null,
    main_image: input.main_image?.trim() || null,
    display_order: Number(input.display_order ?? 0),
    published: input.published ?? false,
    icon: iconSafe,
    gradient: gradientSafe,
  };
  let res;
  if (input.id) res = await admin.from("events").update(row).eq("id", input.id).select("id").single();
  else res = await admin.from("events").insert(row).select("id").single();
  if (res.error) return { ok: false, error: res.error.message };
  revalidatePath("/admin/eventi");
  revalidatePath("/eventi");
  revalidatePath("/");
  return { ok: true, id: res.data.id };
}

export async function deleteEvent(id: string): Promise<Res> {
  const { error, admin } = await guard();
  if (error || !admin) return { ok: false, error: error ?? "Errore" };
  const { error: e } = await admin.from("events").delete().eq("id", id);
  if (e) return { ok: false, error: e.message };
  revalidatePath("/admin/eventi");
  revalidatePath("/eventi");
  return { ok: true };
}

/**
 * Carica la foto principale di un Evento e aggiorna events.main_image.
 * Usa il bucket event-images (già creato nel seed). Ritorna l'URL pubblico.
 */
export async function uploadEventImage(eventId: string, formData: FormData): Promise<Res & { url?: string }> {
  const { error, admin } = await guard();
  if (error || !admin) return { ok: false, error: error ?? "Errore" };
  const file = formData.get("file") as File | null;
  const check = validImage(file);
  if (check) return { ok: false, error: check };
  const safeName = (file as File).name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const path = `${eventId}/main-${Date.now()}-${safeName}`;
  const { error: up } = await admin.storage.from("event-images").upload(path, file as File, {
    contentType: (file as File).type,
  });
  if (up) return { ok: false, error: up.message };
  const { data } = admin.storage.from("event-images").getPublicUrl(path);
  const { error: upd } = await admin.from("events").update({ main_image: data.publicUrl }).eq("id", eventId);
  if (upd) return { ok: false, error: upd.message };
  revalidatePath("/admin/eventi");
  revalidatePath("/eventi");
  revalidatePath("/");
  return { ok: true, url: data.publicUrl };
}

export async function saveEventCategory(input: { id?: string; name: string }): Promise<Res> {
  const { error, admin } = await guard();
  if (error || !admin) return { ok: false, error: error ?? "Errore" };
  if (!input.name?.trim()) return { ok: false, error: "Nome categoria obbligatorio." };
  const row = { name: input.name.trim(), slug: slugify(input.name) };
  const res = input.id
    ? await admin.from("event_categories").update(row).eq("id", input.id).select("id").single()
    : await admin.from("event_categories").insert(row).select("id").single();
  if (res.error) return { ok: false, error: res.error.message };
  revalidatePath("/admin/eventi");
  return { ok: true, id: res.data.id };
}

/* ================= GALLERIA ================= */

function validImage(file: File | null): string | null {
  if (!file || file.size === 0) return "Seleziona un file immagine.";
  if (!file.type.startsWith("image/")) return "Solo file immagine (JPG, PNG, WebP).";
  if (file.size > 8 * 1024 * 1024) return "File troppo grande (max 8 MB).";
  return null;
}

export async function uploadGallery(formData: FormData): Promise<Res & { count?: number; errors?: string[] }> {
  const { error, admin } = await guard();
  if (error || !admin) return { ok: false, error: error ?? "Errore" };
  const files = formData.getAll("files") as File[];
  const category_id = String(formData.get("category_id") ?? "") || null;
  const event_id = String(formData.get("event_id") ?? "") || null;
  if (files.length === 0) return { ok: false, error: "Seleziona almeno una foto." };
  if (files.length > 100) return { ok: false, error: "Max 100 foto per volta." };

  const { data: maxRow } = await admin
    .from("gallery")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)
    .single();
  let order = (maxRow?.display_order ?? 0) + 1;
  let count = 0;
  const uploadErrors: string[] = [];

  for (const file of files) {
    const bad = validImage(file);
    if (bad) {
      const errDetail = `${file.name}: ${bad}`;
      uploadErrors.push(errDetail);
      console.error("[GALLERY UPLOAD ERROR]", {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        validImageError: bad,
        count,
      });
      continue;
    }

    const path = `${Date.now()}-${count}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: up } = await admin.storage.from("gallery-images").upload(path, buffer, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });

    if (up) {
      const storageErrMsg = up.message || "Errore upload Storage";
      const errDetail = `${file.name} (Storage): ${storageErrMsg}`;
      uploadErrors.push(errDetail);
      const errObj = up as unknown as Record<string, unknown>;
      console.error("[GALLERY UPLOAD ERROR]", {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        storageError: {
          name: up.name,
          message: up.message,
          cause: errObj.cause,
          status: errObj.status,
          statusCode: errObj.statusCode,
        },
        count,
      });
      continue;
    }

    const { data } = admin.storage.from("gallery-images").getPublicUrl(path);
    const { error: ins } = await admin.from("gallery").insert({
      file_url: data.publicUrl,
      title: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").slice(0, 120),
      category_id,
      event_id,
      display_order: order++,
      published: true,
    });

    if (ins) {
      const insErrMsg = ins.message || "Errore insert DB";
      const errDetail = `${file.name} (DB): ${insErrMsg}`;
      uploadErrors.push(errDetail);
      console.error("[GALLERY UPLOAD ERROR]", {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        galleryInsertError: {
          code: ins.code,
          message: ins.message,
          details: ins.details,
          hint: ins.hint,
        },
        count,
      });
      continue;
    }

    count++;
  }

  revalidatePath("/admin/galleria");
  revalidatePath("/galleria");

  if (count === 0) {
    return {
      ok: false,
      error: uploadErrors[0] ?? "Nessuna foto caricata.",
      errors: uploadErrors,
    };
  }

  return {
    ok: true,
    count,
    errors: uploadErrors.length > 0 ? uploadErrors : undefined,
  };
}

export async function updateGallery(
  id: string,
  fields: { title?: string; description?: string; category_id?: string | null; event_id?: string | null; published?: boolean }
): Promise<Res> {
  const { error, admin } = await guard();
  if (error || !admin) return { ok: false, error: error ?? "Errore" };
  const { error: e } = await admin.from("gallery").update(fields).eq("id", id);
  if (e) return { ok: false, error: e.message };
  revalidatePath("/admin/galleria");
  revalidatePath("/galleria");
  return { ok: true };
}

export async function deleteGallery(id: string, fileUrl: string): Promise<Res> {
  const { error, admin } = await guard();
  if (error || !admin) return { ok: false, error: error ?? "Errore" };

  // 1. DELETE record DB — blocca in caso di errore.
  const { error: dbErr } = await admin.from("gallery").delete().eq("id", id);
  if (dbErr) {
    console.error("[GALLERY DELETE ERROR]", {
      id,
      code: dbErr.code,
      message: dbErr.message,
      details: dbErr.details,
      hint: dbErr.hint,
    });
    return { ok: false, error: dbErr.message ?? "Errore eliminazione foto." };
  }

  // 2. Storage remove — solo dopo DELETE DB riuscita.
  // Ricava il path robusto: rimuove query string prima dello split.
  const cleanUrl = fileUrl.split("?")[0];
  const path = cleanUrl.split("/gallery-images/")[1];
  if (!path) {
    console.warn("[GALLERY STORAGE DELETE WARNING]", {
      reason: "path non ricavabile dall'URL",
      fileUrl,
    });
  } else {
    const { error: storErr } = await admin.storage
      .from("gallery-images")
      .remove([path]);
    if (storErr) {
      console.warn("[GALLERY STORAGE DELETE WARNING]", {
        path,
        message: (storErr as { message?: string }).message,
        statusCode: (storErr as { statusCode?: string }).statusCode,
      });
      // Non blocca: il record DB è già stato eliminato correttamente.
    }
  }

  revalidatePath("/admin/galleria");
  revalidatePath("/galleria");
  return { ok: true };
}

export async function reorderGallery(ids: string[]): Promise<Res> {
  const { error, admin } = await guard();
  if (error || !admin) return { ok: false, error: error ?? "Errore" };
  for (let i = 0; i < ids.length; i++) {
    await admin.from("gallery").update({ display_order: i + 1 }).eq("id", ids[i]);
  }
  revalidatePath("/admin/galleria");
  revalidatePath("/galleria");
  return { ok: true };
}

/**
 * Scambia il display_order di due foto adiacenti.
 * Compatibile con la lista paginata: richiede solo i due ID,
 * non l'intero ordinamento.
 */
export async function swapGalleryOrder(idA: string, idB: string): Promise<Res> {
  const { error, admin } = await guard();
  if (error || !admin) return { ok: false, error: error ?? "Errore" };
  const [{ data: a }, { data: b }] = await Promise.all([
    admin.from("gallery").select("display_order").eq("id", idA).single(),
    admin.from("gallery").select("display_order").eq("id", idB).single(),
  ]);
  if (!a || !b) return { ok: false, error: "Immagine non trovata" };
  const orderA = a.display_order;
  const orderB = b.display_order;
  const [{ error: e1 }, { error: e2 }] = await Promise.all([
    admin.from("gallery").update({ display_order: orderB }).eq("id", idA),
    admin.from("gallery").update({ display_order: orderA }).eq("id", idB),
  ]);
  if (e1 || e2) return { ok: false, error: (e1 ?? e2)?.message ?? "Errore scambio ordine" };
  revalidatePath("/admin/galleria");
  revalidatePath("/galleria");
  return { ok: true };
}

/* ================= PRENOTAZIONI ================= */

export async function setBookingStatus(id: string, status: BookingStatus): Promise<Res> {
  const { error, admin } = await guard();
  if (error || !admin) return { ok: false, error: error ?? "Errore" };
  const { data: booking } = await admin
    .from("bookings")
    .select("email,first_name,event_type,event_date")
    .eq("id", id)
    .single();
  const { error: e } = await admin.from("bookings").update({ status }).eq("id", id);
  if (e) return { ok: false, error: e.message };
  // Conferma manuale → il cliente riceve l'ufficialità via email.
  if (status === "CONFERMATA" && booking) {
    const { notifyClientBookingConfirmed } = await import("@/lib/email");
    const emailSent = await notifyClientBookingConfirmed(
      booking.email,
      booking.first_name,
      booking.event_type,
      booking.event_date
    ).then(() => true).catch(() => false);
    
    if (!emailSent) {
      revalidatePath("/admin/prenotazioni");
      revalidatePath("/admin");
      return { ok: true, warning: "Stato aggiornato ma email NON inviata. Contatta il cliente manualmente." };
    }
  }
  revalidatePath("/admin/prenotazioni");
  revalidatePath("/admin");
  return { ok: true };
}

/** Cancellazione richiesta (diritto all'oblio GDPR): rimuove anche i servizi collegati. */
export async function deleteBooking(id: string): Promise<Res> {
  const { error, admin } = await guard();
  if (error || !admin) return { ok: false, error: error ?? "Errore" };
  const { error: e } = await admin.from("bookings").delete().eq("id", id);
  if (e) return { ok: false, error: e.message };
  revalidatePath("/admin/prenotazioni");
  revalidatePath("/admin");
  return { ok: true };
}

export async function setBookingNotes(id: string, notes: string): Promise<Res> {
  const { error, admin } = await guard();
  if (error || !admin) return { ok: false, error: error ?? "Errore" };
  const { error: e } = await admin.from("bookings").update({ admin_notes: notes }).eq("id", id);
  if (e) return { ok: false, error: e.message };
  revalidatePath("/admin/prenotazioni");
  return { ok: true };
}

/* ================= TIMELINE ================= */

export async function saveTimeline(input: {
  id?: string;
  year: string;
  title: string;
  description?: string;
  image?: string;
  display_order?: number;
  published?: boolean;
}): Promise<Res> {
  const { error, admin } = await guard();
  if (error || !admin) return { ok: false, error: error ?? "Errore" };
  if (!input.year?.trim() || !input.title?.trim()) return { ok: false, error: "Anno e titolo obbligatori." };
  const row = {
    year: input.year.trim(),
    title: input.title.trim(),
    description: input.description?.trim() || "",
    image: input.image?.trim() || null,
    display_order: Number(input.display_order ?? 0),
    published: input.published ?? true,
  };
  const res = input.id
    ? await admin.from("timeline").update(row).eq("id", input.id).select("id").single()
    : await admin.from("timeline").insert(row).select("id").single();
  if (res.error) return { ok: false, error: res.error.message };
  revalidatePath("/admin/storia");
  revalidatePath("/storia");
  return { ok: true, id: res.data.id };
}

export async function deleteTimeline(id: string): Promise<Res> {
  const { error, admin } = await guard();
  if (error || !admin) return { ok: false, error: error ?? "Errore" };
  const { error: e } = await admin.from("timeline").delete().eq("id", id);
  if (e) return { ok: false, error: e.message };
  revalidatePath("/admin/storia");
  revalidatePath("/storia");
  return { ok: true };
}

export async function reorderTimeline(ids: string[]): Promise<Res> {
  const { error, admin } = await guard();
  if (error || !admin) return { ok: false, error: error ?? "Errore" };
  for (let i = 0; i < ids.length; i++) {
    await admin.from("timeline").update({ display_order: i + 1 }).eq("id", ids[i]);
  }
  revalidatePath("/admin/storia");
  revalidatePath("/storia");
  return { ok: true };
}

export async function uploadTimelineImage(timelineId: string, formData: FormData): Promise<Res & { url?: string }> {
  const { error, admin } = await guard();
  if (error || !admin) return { ok: false, error: error ?? "Errore" };
  const file = formData.get("file") as File | null;
  const check = validImage(file);
  if (check) return { ok: false, error: check };
  const safeName = (file as File).name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const path = `timeline/${timelineId}/main-${Date.now()}-${safeName}`;
  const { error: up } = await admin.storage.from("site-assets").upload(path, file as File, {
    contentType: (file as File).type,
  });
  if (up) return { ok: false, error: up.message };
  const { data } = admin.storage.from("site-assets").getPublicUrl(path);
  const { error: upd } = await admin.from("timeline").update({ image: data.publicUrl }).eq("id", timelineId);
  if (upd) return { ok: false, error: upd.message };
  revalidatePath("/admin/storia");
  revalidatePath("/storia");
  return { ok: true, url: data.publicUrl };
}

/* ================= SOCIAL ================= */

import { buildWhatsAppUrl } from "@/lib/utils";

export async function saveSocial(input: {
  id?: string;
  name: string;
  url: string;
  icon?: string;
  description?: string;
  display_order?: number;
  active?: boolean;
  phone?: string;
  text?: string;
}): Promise<Res> {
  const { error, admin } = await guard();
  if (error || !admin) return { ok: false, error: error ?? "Errore" };
  if (!input.name?.trim()) return { ok: false, error: "Nome obbligatorio." };
  if (input.icon?.trim() !== "whatsapp" && !input.url?.trim()) {
    return { ok: false, error: "URL obbligatorio per i canali non WhatsApp." };
  }

  // Se è un canale WhatsApp, genera l'URL canonico wa.me lato server (seconda linea di difesa).
  let finalUrl = input.url.trim();
  if (input.icon?.trim() === "whatsapp") {
    try {
      finalUrl = buildWhatsAppUrl(input.phone ?? "", input.text);
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Numero WhatsApp non valido." };
    }
  }

  const row = {
    name: input.name.trim(),
    url: finalUrl,
    icon: input.icon?.trim() || "sparkles",
    description: input.description?.trim() || "",
    display_order: Number(input.display_order ?? 0),
    active: input.active ?? true,
  };
  const res = input.id
    ? await admin.from("social_links").update(row).eq("id", input.id).select("id").single()
    : await admin.from("social_links").insert(row).select("id").single();
  if (res.error) return { ok: false, error: res.error.message };
  revalidatePath("/admin/social");
  revalidatePath("/social");
  return { ok: true, id: res.data.id };
}

export async function deleteSocial(id: string): Promise<Res> {
  const { error, admin } = await guard();
  if (error || !admin) return { ok: false, error: error ?? "Errore" };
  const { error: e } = await admin.from("social_links").delete().eq("id", id);
  if (e) return { ok: false, error: e.message };
  revalidatePath("/admin/social");
  revalidatePath("/social");
  return { ok: true };
}

/* ================= CONTENUTI / IMPOSTAZIONI ================= */

export async function saveSetting(key: string, value: string): Promise<Res> {
  const { error, admin } = await guard();
  if (error || !admin) return { ok: false, error: error ?? "Errore" };
  const { error: e } = await admin.from("site_settings").upsert({ key, value });
  if (e) return { ok: false, error: e.message };
  revalidatePath("/admin/impostazioni");
  return { ok: true };
}

/* ================= CATEGORIE GALLERIA (album) ================= */

export async function saveGalleryCategory(input: { id?: string; name: string }): Promise<Res> {
  const { error, admin } = await guard();
  if (error || !admin) return { ok: false, error: error ?? "Errore" };
  if (!input.name?.trim()) return { ok: false, error: "Nome categoria obbligatorio." };
  const row = { name: input.name.trim(), slug: slugify(input.name) };
  const res = input.id
    ? await admin.from("gallery_categories").update(row).eq("id", input.id).select("id").single()
    : await admin.from("gallery_categories").insert(row).select("id").single();
  if (res.error) return { ok: false, error: res.error.message };
  revalidatePath("/admin/galleria");
  revalidatePath("/galleria");
  return { ok: true, id: res.data.id };
}

export async function deleteGalleryCategory(id: string): Promise<Res> {
  const { error, admin } = await guard();
  if (error || !admin) return { ok: false, error: error ?? "Errore" };
  const { count } = await admin.from("gallery").select("id", { count: "exact", head: true }).eq("category_id", id);
  if ((count ?? 0) > 0) return { ok: false, error: `Ci sono ancora ${count} foto in questo album: spostale prima di eliminarlo.` };
  const { error: e } = await admin.from("gallery_categories").delete().eq("id", id);
  if (e) return { ok: false, error: e.message };
  revalidatePath("/admin/galleria");
  revalidatePath("/galleria");
  return { ok: true };
}

export async function deleteEventCategory(id: string): Promise<Res> {
  const { error, admin } = await guard();
  if (error || !admin) return { ok: false, error: error ?? "Errore" };
  const { count } = await admin.from("events").select("id", { count: "exact", head: true }).eq("category_id", id);
  if ((count ?? 0) > 0) return { ok: false, error: `Ci sono ancora ${count} eventi in questa categoria: spostali prima.` };
  const { error: e } = await admin.from("event_categories").delete().eq("id", id);
  if (e) return { ok: false, error: e.message };
  revalidatePath("/admin/eventi");
  return { ok: true };
}

/* ================= UTENTI ADMIN ================= */

export async function setAdminRole(id: string, isAdmin: boolean, selfId: string): Promise<Res> {
  const g = await requireAdmin();
  if (!g) return { ok: false, error: "Non autorizzata." };
  if (id === selfId && !isAdmin) return { ok: false, error: "Non puoi revocare il tuo stesso ruolo admin." };
  const { error: e } = await g.admin.from("profiles").update({ is_admin: isAdmin }).eq("id", id);
  if (e) return { ok: false, error: e.message };
  revalidatePath("/admin/utenti");
  return { ok: true };
}

export async function removeAdminUser(id: string, selfId: string): Promise<Res> {
  const g = await requireAdmin();
  if (!g) return { ok: false, error: "Non autorizzata." };
  if (id === selfId) return { ok: false, error: "Non puoi eliminare il tuo stesso account." };
  const { error: e } = await g.admin.auth.admin.deleteUser(id);
  if (e) return { ok: false, error: e.message };
  await g.admin.from("profiles").delete().eq("id", id);
  revalidatePath("/admin/utenti");
  return { ok: true };
}
