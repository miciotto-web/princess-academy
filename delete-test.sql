-- Verifica pre-eliminazione
SELECT key, title FROM public.site_content WHERE key = 'test_content';

-- Elimina il contenuto di test
DELETE FROM public.site_content WHERE key = 'test_content';

-- Verifica assenza
SELECT key, title FROM public.site_content WHERE key = 'test_content';
