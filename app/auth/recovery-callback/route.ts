import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Route handler server-side per il flusso Password Recovery (PKCE).
 *
 * Supabase, dopo la verifica del link inviato via email, reindirizza qui con
 * `?code=...&next=...`. Il codice PKCE viene scambiato per una sessione sul
 * server (dove il code verifier è conservato tramite cookie @supabase/ssr),
 * poi si reindirizza l'utente alla pagina di aggiornamento password.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/auth/update-password";

  if (!code) {
    return NextResponse.redirect(
      `${origin}/admin/login?error=${encodeURIComponent(
        "Link di recupero non valido: codice mancante.",
      )}`,
    );
  }

  let cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookies) {
          cookiesToSet = cookies;
        },
      },
    },
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (!error) {
    const response = NextResponse.redirect(`${origin}${next}`);
    cookiesToSet.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2]);
    });
    return response;
  }

  return NextResponse.redirect(
    `${origin}/admin/login?error=${encodeURIComponent(
      error.message ?? "Link di recupero non valido o scaduto.",
    )}`,
  );
}
