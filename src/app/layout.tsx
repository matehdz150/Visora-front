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

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ??
      process.env.NEXT_PUBLIC_APP_URL ??
      "https://visora.cloud"
  ),
  applicationName: "Visora",
  title: {
    default: "Visora — Image moderation API",
    template: "%s — Visora",
  },
  description:
    "Detect nudity, violence, weapons, drugs, hate symbols, gambling, and unsafe content using a single API.",
  icons: {
    icon: [
      { url: "/visora-icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/visora-icon.svg",
    apple: "/visora-icon.svg",
  },
  openGraph: {
    title: "Visora — Image moderation API",
    description:
      "Detect nudity, violence, weapons, drugs, hate symbols, gambling, and unsafe content using a single API.",
    siteName: "Visora",
    type: "website",
    images: ["/visora-icon.svg"],
  },
  twitter: {
    card: "summary",
    title: "Visora — Image moderation API",
    description:
      "Detect nudity, violence, weapons, drugs, hate symbols, gambling, and unsafe content using a single API.",
    images: ["/visora-icon.svg"],
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
      <body>{children}</body>
    </html>
  );
}
