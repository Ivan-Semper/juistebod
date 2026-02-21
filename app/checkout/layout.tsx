import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Afrekenen',
  description:
    'Vul je gegevens in en betaal veilig voor je persoonlijk woningbodadvies. Ontvang binnen 24 uur professioneel advies van een vastgoeddeskundige.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
