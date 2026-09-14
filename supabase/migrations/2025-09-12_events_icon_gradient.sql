-- =============================================================
-- FASE 2.9F — Personalizzazione Eventi (icona + gradiente)
-- Eseguire nel Supabase SQL Editor, una sola volta.
-- Aggiunge le colonne `icon` e `gradient` alla tabella `events`
-- con default sicuri per retrocompatibilità.
-- =============================================================

alter table public.events
  add column if not exists icon text not null default 'sparkles',
  add column if not exists gradient text not null default '';

-- Gli eventi esistenti ereditano automaticamente:
--   icon = 'sparkles'
--   gradient = ''  (che a runtime attiva il fallback ciclico in lib/queries.ts)
