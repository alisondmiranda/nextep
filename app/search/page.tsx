// app/search/page.tsx
'use client';

import { useState } from 'react';
import { searchMulti } from '@/services/tmdb'; // Usando alias @ que precisa ser configurado

// Definindo um tipo mais simples para o estado inicial, para evitar erros de tipo complexo.
interface SearchResultItem {
  id: number;
  title?: string;
  name?: string;
  media_type: string;
  poster_path: string | null;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await searchMulti(query);
      // Filtrando pessoas dos resultados, conforme foco em Filmes e Séries
      const filteredResults = response.results.filter(
        (item) => item.media_type === 'movie' || item.media_type === 'tv'
      );
      setResults(filteredResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Busca Universal</h1>
      
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por filmes e séries..."
          className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button 
          type="submit" 
          className="w-full mt-4 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-500"
          disabled={isLoading}
        >
          {isLoading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {error && <p className="text-red-500 mt-6 text-center">{error}</p>}

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {results.map((item) => (
          <div key={item.id} className="bg-gray-800 rounded-lg overflow-hidden">
            <img 
              src={item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '/placeholder.png'} 
              alt={`Poster de ${item.title || item.name}`}
              className="w-full h-auto"
            />
            <div className="p-3">
              <h3 className="font-bold truncate">{item.title || item.name}</h3>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
