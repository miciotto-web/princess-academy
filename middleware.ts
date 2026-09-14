import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/** Protegge /admin: senza sessione → /admin/login (login sempre libero). */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/admin") || pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next(); // pagina admin mostrerà la guida setup
  }
  const res = NextResponse.next();
  const supa = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (toSet) => toSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options)),
      },
    }
  );
  const { data } = await supa.auth.getUser();
  if (!data.user) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }
  return res;
}

export const config = { matcher: ["/admin/:path*"] };
