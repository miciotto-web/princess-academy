# Princess Academy — Magical Party Experience

Web application production-ready per **Princess Academy**: sito pubblico fiabesco
(fucsia · oro · avorio, disegnato attorno al logo ufficiale in `public/logo.svg`)
+ backend Supabase + area admin completa.

Stack: **Next.js 14 · TypeScript · React · Tailwind CSS · Supabase (PostgreSQL,
Auth, Storage) · React Hook Form + Zod · Framer Motion · Lucide Icons**.

---

## 1. Installazione

```bash
cd princess-academy
npm install
```

## 2. Configurazione — variabili d'ambiente

```bash
cp .env.example .env.local
```

Compila `.env.local` (mai committare: è ignorato da `.gitignore`):

| Variabile | Dove trovarla | Obbligatoria |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Dominio production (canonical, sitemap, OG) | Consigliata |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API | Sì (per DB) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → API → `anon public` | Sì (per DB) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → API → `service_role` (solo server!) | Sì (per admin) |
| `RESEND_API_KEY` | https://resend.com → API Keys | No (solo email) |
| `EMAIL_FROM` | Mittente verificato, es. `Princess Academy <magia@…>` | No (solo email) |
| `EMAIL_ADMIN` | Casella che riceve le nuove richieste | No (solo email) |

Senza variabili Supabase il sito funziona con **dati demo** e `/admin` mostra
la guida alla configurazione. Senza variabili email, le prenotazioni funzionano
comunque (notifiche saltate in silenzio).

## 3. Supabase — database

1. Crea il progetto su https://supabase.com
2. Apri **SQL Editor** ed esegui tutto `supabase/schema.sql`: crea 13 tabelle,
   RLS, 4 bucket storage (`princess-images`, `gallery-images`, `event-images`,
   `site-assets`) e i seed (categorie, impostazioni, contenuti).
3. Verifica in **Table Editor** e **Storage** che tutto esista.

## 4. Authentication — primo admin

1. Supabase → **Authentication → Users → Add user** (email + password).
2. Esegui nel SQL Editor (query in fondo allo schema):
   ```sql
   update public.profiles set is_admin = true where email = 'tua@email.it';
   ```
   (il profilo si crea al primo login; se non esiste, inseriscilo con l'UUID Auth).
3. Apri `/admin/login` e accedi. Altri utenti si gestiscono da `/admin/utenti`.

## 5. Storage

I bucket sono pubblici in **lettura**, scrittura solo admin (policy in schema).
Upload da admin (galleria multipla fino a 100 foto, foto Princess): max 8 MB,
solo `image/*`, validati client + server. Le immagini pubbliche usano
`next/image` (AVIF/WebP, lazy, `sizes`) con `remotePatterns` per
`*.supabase.co` già in `next.config.mjs`.

## 6. Admin — mappa

`/admin` dashboard (statistiche reali + ultime attività) ·
`/admin/princess` · `/admin/eventi` (+ categorie) · `/admin/galleria`
(+ album) · `/admin/prenotazioni` (filtri per stato, note, cancellazione GDPR) ·
`/admin/storia` · `/admin/social` · `/admin/contenuti` · `/admin/impostazioni` ·
`/admin/utenti`.

## 7. Email

Provider HTTP stile Resend (`lib/email.ts`, nessuna dipendenza extra):
nuova richiesta → email all'admin + conferma di **ricezione** al cliente
(mai conferma evento); passaggio a **CONFERMATA** → email di conferma.
Errori email non bloccano mai la prenotazione (`Promise.allSettled`).

## 8. Sviluppo locale / Build / Deploy

```bash
npm run dev        # http://localhost:3000
npm run lint       # ESLint (zero warning)
npm run typecheck  # tsc --noEmit
npm run build      # build production
npm start          # serve la build
```

Deploy: qualsiasi hosting Next.js (Vercel consigliato — imposta le env del
punto 2). `sitemap.ts`/`robots.ts` usano `NEXT_PUBLIC_SITE_URL`.

## 9. GDPR, SEO, accessibilità

Privacy (`/privacy`), Cookie (`/cookie` + banner con scelta), consenso
obbligatorio con timestamp (`privacy_accepted_at`), cancellazione richieste
dall'admin, RLS anti-lettura pubblica prenotazioni, anti-spam (5 richieste/ora
per email), header di sicurezza in `next.config.mjs`, metadata/OG/Twitter/
canonical/sitemap/robots/JSON-LD, H1 unico per pagina, alt/aria/focus/keyboard,
skeleton di caricamento ed empty state (“Non ci sono ancora fotografie in
questa galleria.”).

## 10. Test rapido (checklist 20 punti)

1 sito · 2 chi siamo · 3 storia · 4 princess · 5 eventi · 6 galleria+lightbox ·
7 prenotazione (stato NUOVA) · 8 social · 9 login admin · 10 CRUD princess ·
11 CRUD eventi · 12 upload foto · 13 album · 14 stati richieste · 15 social ·
16 contenuti · 17 timeline · 18 tabelle Supabase · 19 utenti · 20 storage.

## 11. Demo offline per il cliente

Cartella `../princess-academy-offline` (export statico, dati demo, zero rete)
e zip `../Princess-Academy-DEMO-offline.zip` (0,9 MB): estrarre, doppio click
su `AVVIA-DEMO-CLIENTE.bat` (richiede Node.js), si apre su
http://localhost:8080. Rigenerare dopo modifiche al sito pubblico ripetendo
l'export dalla copia offline.
