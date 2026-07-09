import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Betaling geslaagd',
  description:
    'Je betaling is succesvol verwerkt. Je ontvangt binnen 48 uur je persoonlijk woningbodadvies per e-mail.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
