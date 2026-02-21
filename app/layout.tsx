import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JuisteBod.nl - Het juiste bod op elke woning",
  description: "Krijg binnen 24 uur persoonlijk advies voor het perfecte bod op jouw droomwoning. Professioneel advies van experts, geen AI.",
  metadataBase: new URL('https://juistebod.nl'),
  openGraph: {
    title: 'JuisteBod.nl - Het juiste bod op elke woning',
    description: 'Krijg binnen 24 uur persoonlijk advies voor het perfecte bod op jouw droomwoning. Professioneel advies van experts.',
    url: 'https://juistebod.nl',
    siteName: 'JuisteBod.nl',
    locale: 'nl_NL',
    type: 'website',
    images: [
      {
        url: '/images/hero-photo-1.jpg',
        width: 1200,
        height: 630,
        alt: 'JuisteBod - Persoonlijk woningbodadvies',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JuisteBod.nl - Het juiste bod op elke woning',
    description: 'Krijg binnen 24 uur persoonlijk advies voor het perfecte bod op jouw droomwoning.',
    images: ['/images/hero-photo-1.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body className={inter.className}>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
