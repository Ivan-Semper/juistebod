import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Pagina niet gevonden',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAF9F6' }}>
      <div className="max-w-md mx-auto text-center p-8">
        <div className="bg-white/80 rounded-2xl shadow-lg p-10 backdrop-blur-sm">
          <h1 className="text-7xl font-bold mb-4" style={{ color: '#1F3C88' }}>404</h1>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Pagina niet gevonden</h2>
          <p className="text-gray-600 mb-8">
            De pagina die je zoekt bestaat niet of is verplaatst.
          </p>
          <Link
            href="/"
            className="inline-block text-white font-semibold py-3 px-8 rounded-lg transition-colors hover:opacity-90"
            style={{ backgroundColor: '#1F3C88' }}
          >
            Terug naar Home
          </Link>
        </div>
      </div>
    </div>
  );
}
