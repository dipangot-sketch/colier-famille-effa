import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Colier Famille Effa",
  description: "Plateforme familiale privée — Colier Famille Effa",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#14151f",
};

/*
  Les polices sont chargées via balises <link> plutôt que via
  next/font/google : elles sont ainsi récupérées par le navigateur de
  la personne qui visite le site, pas par le serveur de build. Chaque
  thème choisit parmi ce jeu de polices (simple, élégante, manuscrite,
  moderne) — voir prisma/seed-data/themes.ts.
*/
const GOOGLE_FONTS_HREF =
  "https://fonts.googleapis.com/css2?" +
  [
    "family=Inter:wght@400;500;600;700",
    "family=Cormorant+Garamond:wght@400;500;600;700",
    "family=Playfair+Display:wght@400;600;700",
    "family=Dancing+Script:wght@500;600;700",
    "family=Space+Grotesk:wght@400;500;600;700",
    "family=Poppins:wght@400;500;600;700",
  ].join("&") +
  "&display=swap";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={GOOGLE_FONTS_HREF} />
      </head>
      <body>{children}</body>
    </html>
  );
}
