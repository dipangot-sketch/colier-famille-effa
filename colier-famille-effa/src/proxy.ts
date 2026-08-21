import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "cfe_session";

const PROTECTED_PREFIXES = ["/profile", "/select-profile", "/super-admin"];
const PUBLIC_SUPER_ADMIN_PATHS = new Set(["/super-admin/login"]);

/**
 * RÈGLE ABSOLUE (Partie 6 §45, §57 ; Partie 8 §26-27) :
 * ce middleware ne fait qu'une pré-vérification rapide (présence du
 * cookie) pour éviter un aller-retour inutile vers une page protégée.
 * Il ne remplace JAMAIS la vérification réelle : chaque page et chaque
 * server action revérifie la session et les permissions en base via
 * getCurrentUser()/requireAuth()/requireRole(). Cacher une route ici
 * ne suffirait pas à la protéger.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_SUPER_ADMIN_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const hasSessionCookie = request.cookies.has(SESSION_COOKIE_NAME);
  if (!hasSessionCookie) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = pathname.startsWith("/super-admin") ? "/super-admin/login" : "/login";
    loginUrl.search = "";
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/select-profile", "/super-admin/:path*"],
};
