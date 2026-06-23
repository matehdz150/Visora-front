import type { Metadata, Viewport } from "next";
import { Sora, JetBrains_Mono } from "next/font/google";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  "https://visoracloud.com";

const siteDescription =
  "Visora is the trust layer for every image — moderate unsafe content, anonymize faces and PII, and verify identities from a single API.";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Visora",
  alternateName: "Visora Cloud",
  url: siteUrl,
  logo: siteUrl + "/visora-icon-512.png",
  sameAs: ["https://www.npmjs.com/package/@visoracloud/client"],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Visora",
  alternateName: "Visora Cloud",
  url: siteUrl,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Visora",
  title: {
    default: "Visora — Moderation, redaction & identity verification API",
    template: "%s — Visora",
  },
  description: siteDescription,
  alternates: {
    canonical: "/",
  },
  keywords: [
    "image moderation API",
    "content moderation API",
    "image redaction API",
    "identity verification API",
    "KYC API",
    "face match API",
    "AI moderation",
    "brand safety API",
    "moderation webhooks",
  ],
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/visora-icon.svg", type: "image/svg+xml" },
      { url: "/visora-icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/visora-icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/visora-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/visora-icon-48.png",
    apple: [{ url: "/visora-icon-180.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "Visora — Moderation, redaction & identity verification API",
    description: siteDescription,
    siteName: "Visora",
    url: siteUrl,
    type: "website",
    images: [
      {
        url: "/visora-og.png",
        width: 1200,
        height: 630,
        alt: "Visora — image moderation, redaction & identity verification API",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Visora — Moderation, redaction & identity verification API",
    description: siteDescription,
    images: ["/visora-og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <body>
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([organizationJsonLd, websiteJsonLd]),
          }}
        />
        {children}
      </body>
    </html>
  );
}
