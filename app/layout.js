import "./globals.css";
// Production CSP is generated from the exact exported script bytes by
// scripts/harden-export.mjs. Development remains compatible with Next HMR.

const siteUrl = "https://msempreendimentos.inf.br";
const generalContractor = {
  "@context": "https://schema.org",
  "@type": "GeneralContractor",
  name: "MS Empreendimentos LTDA",
  url: siteUrl,
  logo: `${siteUrl}/brand/ms-empreendimentos-logo-light.png`,
  image: `${siteUrl}/og.png`,
  telephone: "+557999253884",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Avenida Rosemary Vieira de Jesus, 1489, Piabeta",
    addressLocality: "Nossa Senhora do Socorro",
    addressRegion: "SE",
    addressCountry: "BR",
  },
  sameAs: ["https://www.instagram.com/ms.empreendimentos.48/"],
  description: "Projetos, construção, reformas, administração de obras e soluções imobiliárias em Sergipe. Atendimento com hora marcada.",
};

export const metadata = {
  title: "MS Empreendimentos | Construindo o presente",
  description:
    "Projetos, construção, reformas, administração de obras e soluções imobiliárias em Sergipe.",
  robots: { index: true, follow: true },
  alternates: { canonical: siteUrl },
  openGraph: {
    title: "MS Empreendimentos | Construindo o presente",
    description: "Projetos, construção, reformas, administração de obras e soluções imobiliárias em Sergipe.",
    url: siteUrl,
    siteName: "MS Empreendimentos",
    locale: "pt_BR",
    type: "website",
    images: [{ url: "https://msempreendimentos.inf.br/og.png", width: 1731, height: 909, alt: "MS Empreendimentos — Construindo o presente. Realizando o futuro." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MS Empreendimentos | Construindo o presente",
    description: "Projetos, construção, reformas, administração de obras e soluções imobiliárias em Sergipe.",
    images: ["https://msempreendimentos.inf.br/og.png"],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(generalContractor).replace(/</g, "\\u003c") }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
