import "./globals.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { resolveSiteOrigin } from "./site-origin.mjs";

const siteOrigin = resolveSiteOrigin();

// Production CSP is generated from the exact exported script bytes by
// scripts/harden-export.mjs. Development remains compatible with Next HMR.

export const metadata = {
  title: "MS Empreendimentos | Construindo o presente",
  description:
    "Projetos, construção, reformas, administração de obras e soluções imobiliárias em Sergipe.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "MS Empreendimentos | Construindo o presente",
    description: "Projetos, construção, reformas, administração de obras e soluções imobiliárias em Sergipe.",
    url: siteOrigin,
    siteName: "MS Empreendimentos",
    locale: "pt_BR",
    type: "website",
    images: [{ url: `${siteOrigin}/og.png`, width: 1731, height: 909, alt: "MS Empreendimentos — Construindo o presente. Realizando o futuro." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MS Empreendimentos | Construindo o presente",
    description: "Projetos, construção, reformas, administração de obras e soluções imobiliárias em Sergipe.",
    images: [`${siteOrigin}/og.png`],
  },
};

export const viewport = {
  themeColor: "#17191b",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="referrer" content="no-referrer" />
      </head>
      <body>{children}</body>
    </html>
  );
}
