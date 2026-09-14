/**
 * Sistema email transazionale (provider-agnostico via API HTTP stile Resend).
 * Configurazione: RESEND_API_KEY, EMAIL_FROM, EMAIL_ADMIN.
 * Se non configurato, le email vengono saltate in silenzio (log server)
 * senza mai bloccare la prenotazione.
 */

type MailPayload = { to: string; subject: string; html: string };

function shell(titolo: string, corpo: string, nota: string) {
  return `<!doctype html><html lang="it"><body style="margin:0;padding:0;background:#FFFBF4;font-family:Georgia,serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
    <div style="text-align:center;padding:24px;border-radius:24px;background:linear-gradient(135deg,#A50E66,#D63384);color:#fff;">
      <div style="font-size:12px;letter-spacing:4px;color:#F0DEA4;">✦ PRINCESS ACADEMY ✦</div>
      <h1 style="margin:12px 0 0;font-size:28px;">${titolo}</h1>
    </div>
    <div style="background:#fff;border:1px solid #F0DEA4;border-radius:24px;padding:28px;margin-top:16px;color:#2B2B30;font-size:15px;line-height:1.7;">
      ${corpo}
      <p style="margin-top:20px;padding-top:16px;border-top:1px solid #F0DEA4;font-size:13px;color:#8A8A94;">${nota}</p>
    </div>
    <p style="text-align:center;font-size:12px;color:#8A8A94;margin-top:16px;">Princess Academy · Magical Party Experience</p>
  </div></body></html>`;
}

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export async function sendEmail({ to, subject, html }: MailPayload): Promise<boolean> {
  if (!isEmailConfigured()) {
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: process.env.EMAIL_FROM, to, subject, html }),
    });
    if (!res.ok) {
      console.error("[email:error]", res.status, await res.text().catch(() => ""));
      return false;
    }
    return true;
  } catch (e) {
    console.error("[email:error]", e);
    return false;
  }
}

export type BookingMailData = {
  nome: string;
  cognome: string;
  email: string;
  telefono: string;
  dataEvento: string;
  orario: string;
  luogo: string;
  tipologia: string;
  princess?: string;
  messaggio?: string;
};

export async function notifyAdminNewBooking(d: BookingMailData) {
  const admin = process.env.EMAIL_ADMIN;
  if (!admin) return false;
  const righe = [
    ["Nome", `${d.nome} ${d.cognome}`],
    ["Email", d.email],
    ["Telefono", d.telefono],
    ["Data / ora", `${d.dataEvento} · ${d.orario}`],
    ["Luogo", d.luogo],
    ["Tipologia", d.tipologia],
    ["Princess", d.princess || "Sorprendeteci ✨"],
    ["Messaggio", d.messaggio || "—"],
  ]
    .map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#8A8A94;font-size:13px;text-transform:uppercase;letter-spacing:1px;">${k}</td><td style="padding:6px 0;font-weight:bold;">${String(v).replace(/</g, "&lt;")}</td></tr>`)
    .join("");
  return sendEmail({
    to: admin,
    subject: `✦ Nuova richiesta: ${d.tipologia} — ${d.dataEvento}`,
    html: shell(
      "Nuova richiesta ricevuta",
      `<p>È arrivata una nuova richiesta dal sito (stato: <strong>NUOVA</strong>).</p><table>${righe}</table><p>Gestiscila da <strong>/admin/prenotazioni</strong>.</p>`,
      "Email automatica — non rispondere direttamente, usa i recapiti del cliente."
    ),
  });
}

export async function confirmClientBookingReceived(d: BookingMailData) {
  return sendEmail({
    to: d.email,
    subject: "Abbiamo ricevuto la tua richiesta ✦ Princess Academy",
    html: shell(
      "La tua richiesta è stata ricevuta!",
      `<p>Ciao ${d.nome}, grazie per averci scelto! Abbiamo ricevuto la tua richiesta per <strong>${d.tipologia}</strong> del <strong>${d.dataEvento}</strong>.</p>
       <p><strong>Importante:</strong> questa email conferma solo la ricezione — <u>l&apos;evento non è ancora confermato</u>. Ti ricontatteremo entro 24 ore lavorative con disponibilità e proposta su misura.</p>
       <p style="font-style:italic;color:#A50E66;">“Trasformiamo ogni festa in una favola.”</p>`,
      "Hai ricevuto questa email perché hai inviato una richiesta su Princess Academy."
    ),
  });
}

export async function notifyClientBookingConfirmed(to: string, nome: string, tipologia: string, dataEvento: string) {
  return sendEmail({
    to,
    subject: "Il tuo evento è confermato ✦ Princess Academy",
    html: shell(
      "È ufficiale: si parte!",
      `<p>Ciao ${nome}, bellissime notizie: il tuo <strong>${tipologia}</strong> del <strong>${dataEvento}</strong> è <strong>confermato</strong>! La tua Princess ti aspetta. Ti ricontatteremo a breve con gli ultimi dettagli.</p>`,
      "Email inviata manualmente dall&apos;amministratore di Princess Academy."
    ),
  });
}
