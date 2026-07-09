import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import StructuredData from "./components/StructuredData";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Serif display-font voor koppen: geeft de site een premium, redactionele uitstraling
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "JuisteBod.nl - Persoonlijk woningbodadvies | Het juiste bod op elke woning",
    template: "%s | JuisteBod.nl",
  },
  description: "Krijg binnen 48 uur persoonlijk bodadvies van een ervaren makelaar. Vergelijk je woning, ontvang een slimme biedstrategie en bied met vertrouwen. Voor €199,95 excl. BTW.",
  metadataBase: new URL('https://juistebod.nl'),
  alternates: {
    canonical: 'https://juistebod.nl',
  },
  keywords: [
    'woningbodadvies', 'bod uitbrengen', 'huis bieden', 'biedadvies woning',
    'hoeveel bieden op huis', 'persoonlijk bodadvies', 'woningmarkt advies',
    'aankoopadvies woning', 'bodstrategie', 'JuisteBod',
  ],
  openGraph: {
    title: 'JuisteBod.nl - Persoonlijk woningbodadvies',
    description: 'Krijg binnen 48 uur persoonlijk bodadvies van een ervaren makelaar. Vergelijk je woning, ontvang een slimme biedstrategie en bied met vertrouwen.',
    url: 'https://juistebod.nl',
    siteName: 'JuisteBod.nl',
    locale: 'nl_NL',
    type: 'website',
    images: [
      {
        url: '/landing_page_photos/margaret-polinder-3DsMhQF9aB0-unsplash.jpg',
        width: 1200,
        height: 630,
        alt: 'JuisteBod - Persoonlijk woningbodadvies voor jouw droomwoning',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JuisteBod.nl - Persoonlijk woningbodadvies',
    description: 'Krijg binnen 48 uur persoonlijk bodadvies van een ervaren makelaar. Voor €199,95 excl. BTW.',
    images: ['/landing_page_photos/margaret-polinder-3DsMhQF9aB0-unsplash.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body className={`${inter.variable} ${fraunces.variable} antialiased`}>
        <StructuredData />
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
