-- =============================================================
-- PRINCESS ACADEMY — Schema Supabase (Parte 2)
-- Eseguire nel SQL Editor del dashboard Supabase (una sola volta).
-- Crea tabelle, RLS, bucket storage e dati di base (categorie,
-- impostazioni, contenuti). NON crea dati demo per princess/eventi/
-- galleria: quelli si inseriscono dall'area /admin.
-- =============================================================

-- ---------- Funzioni di servizio ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------- profiles (collegato a auth.users) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and is_admin = true);
$$;

-- ---------- Categorie eventi / galleria ----------
create table if not exists public.event_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.gallery_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- events ----------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  title text not null,
  slug text not null unique,
  description text not null default '',
  main_image text,
  duration text not null default '',
  services text[] not null default '{}',
  price text,
  information text not null default '',
  availability text not null default 'Disponibile',
  category_id uuid references public.event_categories(id) on delete set null,
  display_order int not null default 0,
  published boolean not null default false
);
drop trigger if exists trg_events_updated on public.events;
create trigger trg_events_updated before update on public.events
  for each row execute function public.set_updated_at();

-- ---------- princesses ----------
create table if not exists public.princesses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  slug text not null unique,
  character_name text not null default '',
  role text not null default '',
  description text not null default '',
  biography text not null default '',
  specialties text[] not null default '{}',
  main_image text,
  social_instagram text,
  social_tiktok text,
  is_active boolean not null default true,
  display_order int not null default 0
);
drop trigger if exists trg_princesses_updated on public.princesses;
create trigger trg_princesses_updated before update on public.princesses
  for each row execute function public.set_updated_at();

create table if not exists public.princess_images (
  id uuid primary key default gen_random_uuid(),
  princess_id uuid not null references public.princesses(id) on delete cascade,
  file_url text not null,
  title text,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- gallery ----------
create table if not exists public.gallery (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  file_url text not null,
  thumbnail_url text,
  title text not null default '',
  description text not null default '',
  event_date date,
  event_id uuid references public.events(id) on delete set null,
  category_id uuid references public.gallery_categories(id) on delete set null,
  display_order int not null default 0,
  published boolean not null default true
);

-- ---------- bookings ----------
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  event_date date not null,
  event_time text not null,
  location text not null,
  event_type text not null,
  guests text,
  children_age text,
  princess_id uuid references public.princesses(id) on delete set null,
  duration text,
  servizi text,
  message text,
  status text not null default 'NUOVA'
    check (status in ('NUOVA','CONTATTATA','IN TRATTATIVA','CONFERMATA','COMPLETATA','ANNULLATA')),
  admin_notes text,
  privacy_accepted boolean not null default false,
  privacy_accepted_at timestamptz
);

create table if not exists public.booking_services (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  service_name text not null,
  created_at timestamptz not null default now()
);

-- ---------- timeline ----------
create table if not exists public.timeline (
  id uuid primary key default gen_random_uuid(),
  year text not null,
  title text not null,
  description text not null default '',
  image text,
  display_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- social_links ----------
create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null,
  icon text not null default 'sparkles',
  description text not null default '',
  display_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- site_content / site_settings ----------
create table if not exists public.site_content (
  key text primary key,
  title text not null default '',
  body text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

-- ---------- Indici ----------
create index if not exists idx_events_order on public.events(display_order);
create index if not exists idx_princesses_order on public.princesses(display_order);
create index if not exists idx_princess_images_princess on public.princess_images(princess_id, display_order);
create index if not exists idx_gallery_order on public.gallery(display_order);
create index if not exists idx_bookings_status on public.bookings(status, created_at desc);
create index if not exists idx_timeline_order on public.timeline(display_order);
create index if not exists idx_social_order on public.social_links(display_order);

-- =============================================================
-- ROW LEVEL SECURITY
-- Pubblico: legge solo contenuti pubblicati/attivi.
-- Prenotazioni: il pubblico può solo INSERIRE (mai leggere);
-- solo admin legge/gestisce tutto (via policy + service role).
-- =============================================================
alter table public.profiles enable row level security;
alter table public.event_categories enable row level security;
alter table public.gallery_categories enable row level security;
alter table public.events enable row level security;
alter table public.princesses enable row level security;
alter table public.princess_images enable row level security;
alter table public.gallery enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_services enable row level security;
alter table public.timeline enable row level security;
alter table public.social_links enable row level security;
alter table public.site_content enable row level security;
alter table public.site_settings enable row level security;

-- ----- Letture pubbliche (drop per riesecuzione sicura) -----
drop policy if exists "public read event_categories" on public.event_categories;
drop policy if exists "public read gallery_categories" on public.gallery_categories;
drop policy if exists "public read published events" on public.events;
drop policy if exists "public read active princesses" on public.princesses;
drop policy if exists "public read princess images" on public.princess_images;
drop policy if exists "public read published gallery" on public.gallery;
drop policy if exists "public read published timeline" on public.timeline;
drop policy if exists "public read active social" on public.social_links;
drop policy if exists "public read site_content" on public.site_content;
drop policy if exists "public read site_settings" on public.site_settings;
drop policy if exists "public insert bookings" on public.bookings;
drop policy if exists "public insert booking_services" on public.booking_services;
drop policy if exists "admin all event_categories" on public.event_categories;
drop policy if exists "admin all gallery_categories" on public.gallery_categories;
drop policy if exists "admin all events" on public.events;
drop policy if exists "admin all princesses" on public.princesses;
drop policy if exists "admin all princess_images" on public.princess_images;
drop policy if exists "admin all gallery" on public.gallery;
drop policy if exists "admin all bookings" on public.bookings;
drop policy if exists "admin all booking_services" on public.booking_services;
drop policy if exists "admin all timeline" on public.timeline;
drop policy if exists "admin all social_links" on public.social_links;
drop policy if exists "admin all site_content" on public.site_content;
drop policy if exists "admin all site_settings" on public.site_settings;
drop policy if exists "own profile read" on public.profiles;
drop policy if exists "own profile insert" on public.profiles;
drop policy if exists "public read buckets" on storage.objects;
drop policy if exists "admin write buckets" on storage.objects;
create policy "public read event_categories" on public.event_categories for select to anon, authenticated using (true);
create policy "public read gallery_categories" on public.gallery_categories for select to anon, authenticated using (true);
create policy "public read published events" on public.events for select to anon, authenticated using (published = true);
create policy "public read active princesses" on public.princesses for select to anon, authenticated using (is_active = true);
create policy "public read princess images" on public.princess_images for select to anon, authenticated
  using (exists (select 1 from public.princesses p where p.id = princess_id and p.is_active = true));
create policy "public read published gallery" on public.gallery for select to anon, authenticated using (published = true);
create policy "public read published timeline" on public.timeline for select to anon, authenticated using (published = true);
create policy "public read active social" on public.social_links for select to anon, authenticated using (active = true);
create policy "public read site_content" on public.site_content for select to anon, authenticated using (true);
create policy "public read site_settings" on public.site_settings for select to anon, authenticated using (true);

-- ----- Prenotazioni: insert pubblico, mai read -----
create policy "public insert bookings" on public.bookings for insert to anon, authenticated
  with check (privacy_accepted = true);
create policy "public insert booking_services" on public.booking_services for insert to anon, authenticated
  with check (true);

-- ----- Admin (authenticated + is_admin) -----
create policy "admin all event_categories" on public.event_categories for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin all gallery_categories" on public.gallery_categories for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin all events" on public.events for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin all princesses" on public.princesses for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin all princess_images" on public.princess_images for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin all gallery" on public.gallery for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin all bookings" on public.bookings for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin all booking_services" on public.booking_services for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin all timeline" on public.timeline for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin all social_links" on public.social_links for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin all site_content" on public.site_content for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin all site_settings" on public.site_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ----- profiles -----
create policy "own profile read" on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "own profile insert" on public.profiles for insert to authenticated with check (id = auth.uid());

-- =============================================================
-- STORAGE: 4 bucket pubblici in lettura, scrittura solo admin
-- =============================================================
insert into storage.buckets (id, name, public) values
  ('princess-images','princess-images', true),
  ('gallery-images','gallery-images', true),
  ('event-images','event-images', true),
  ('site-assets','site-assets', true)
on conflict (id) do nothing;

create policy "public read buckets" on storage.objects for select to anon, authenticated
  using (bucket_id in ('princess-images','gallery-images','event-images','site-assets'));
create policy "admin write buckets" on storage.objects for all to authenticated
  using (bucket_id in ('princess-images','gallery-images','event-images','site-assets') and public.is_admin())
  with check (bucket_id in ('princess-images','gallery-images','event-images','site-assets') and public.is_admin());

-- =============================================================
-- SEED di base (categorie, impostazioni, contenuti)
-- =============================================================
insert into public.event_categories (name, slug, display_order) values
  ('Firma Academy','firma-academy',1), ('Compleanni','compleanni',2),
  ('Matrimoni','matrimoni',3), ('Eventi Aziendali','eventi-aziendali',4),
  ('Feste private','feste-private',5), ('Eventi pubblici','eventi-pubblici',6),
  ('Meet & Greet','meet-greet',7), ('Spettacoli','spettacoli',8),
  ('Animazione','animazione',9), ('Personalizzati','personalizzati',10)
on conflict (slug) do nothing;

insert into public.gallery_categories (name, slug, display_order) values
  ('Eventi','eventi',1), ('Princess Party','princess-party',2),
  ('Compleanni','compleanni',3), ('Matrimoni','matrimoni',4),
  ('Eventi Aziendali','eventi-aziendali',5), ('Spettacoli','spettacoli',6)
on conflict (slug) do nothing;

insert into public.site_settings (key, value) values
  ('contact_email','magia@princess-academy.it'),
  ('contact_phone','+39 02 8736 0000'),
  ('contact_whatsapp','+39 345 000 0000'),
  ('contact_address','Via delle Fiabe 12, Milano'),
  ('contact_hours','Lun – Sab · 9:00 – 19:00')
on conflict (key) do nothing;

insert into public.site_content (key, title, body) values
  ('home_intro','Benvenuti nel mondo di Princess Academy',
   'Siamo un atelier della festa: ingressi scenografici, trucco delicato, giochi educativi e rituali doro come lincoronazione finale.')
on conflict (key) do nothing;

-- =============================================================
-- CREARE IL PRIMO ADMIN (dopo la prima registrazione via /admin/login):
--   1. Registra l'utente dal pannello Auth di Supabase (o via login).
--   2. Esegui: update public.profiles set is_admin = true where email = 'tua@email.it';
-- In alternativa via SQL diretto con l'UUID dell'utente Auth.
-- =============================================================
