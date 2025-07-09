import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JuisteBod.nl - Het juiste bod op elke woning",
  description: "Krijg binnen 24 uur persoonlijk advies voor het perfecte bod op jouw droomwoning. Professioneel advies van experts, geen AI.",
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
      </body>
    </html>
  );
}
