import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/** Client per Server Actions / Route Handlers (cookie scrivibili). */
export function supabaseAction() {
  const store = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value, options }) => {
            try {
              store.set(name, value, options);
            } catch {
              /* contesto read-only: ignorato */
            }
          });
        },
      },
    }
  );
}
