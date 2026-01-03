// app/page.tsx
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Bem-vindo ao Nextep</h1>
        <p className="text-lg text-gray-400 mb-8">
          O seu hub inteligente de entretenimento.
        </p>
        <Link 
          href="/search"
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Ir para a Busca
        </Link>
      </div>
    </main>
  );
}
