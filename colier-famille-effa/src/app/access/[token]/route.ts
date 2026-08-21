import { NextRequest, NextResponse } from "next/server";
import { resolveQrToken } from "@/lib/auth/qr";
import { setPendingProfile } from "@/lib/auth/pendingProfile";

/**
 * Parcours (Partie 4 §3-4, Partie 6 §5-7, Partie 8 §4) :
 * scan du QR → vérification du token → redirection vers l'écran de
 * connexion du profil correspondant. Le QR ne remplace jamais le mot
 * de passe : il indique seulement la destination.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const resolution = await resolveQrToken(token);

  const url = request.nextUrl.clone();

  switch (resolution.status) {
    case "VALID":
      await setPendingProfile(resolution.profileSlug);
      url.pathname = "/login";
      url.search = "";
      return NextResponse.redirect(url);

    case "REVOKED":
      url.pathname = "/login/invalid";
      url.search = "?reason=revoked";
      return NextResponse.redirect(url);

    case "PROFILE_INACTIVE":
      url.pathname = "/login/invalid";
      url.search = "?reason=inactive";
      return NextResponse.redirect(url);

    case "INVALID":
    default:
      url.pathname = "/login/invalid";
      url.search = "?reason=invalid";
      return NextResponse.redirect(url);
  }
}
