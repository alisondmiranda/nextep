// services/tmdb.ts

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

interface SearchResult {
  id: number;
  title?: string; // Filmes têm 'title'
  name?: string; // Séries têm 'name'
  media_type: 'movie' | 'tv' | 'person';
  poster_path: string | null;
  release_date?: string; // Data de lançamento para filmes
  first_air_date?: string; // Data de lançamento para séries
  overview: string;
}

interface SearchResponse {
  page: number;
  results: SearchResult[];
  total_pages: number;
  total_results: number;
}

/**
 * Realiza uma busca universal por filmes e séries na API do TMDB.
 * @param query O termo de busca.
 * @returns Uma promessa que resolve para a lista de resultados da busca.
 * @throws Lança um erro se a chave da API não estiver configurada ou se a requisição falhar.
 */
export async function searchMulti(query: string): Promise<SearchResponse> {
  if (!TMDB_API_KEY) {
    throw new Error('A chave da API do TMDB (NEXT_PUBLIC_TMDB_API_KEY) não está configurada.');
  }

  const url = new URL(`${TMDB_BASE_URL}/search/multi`);
  url.searchParams.append('api_key', TMDB_API_KEY);
  url.searchParams.append('query', query);
  url.searchParams.append('include_adult', 'false');
  url.searchParams.append('language', 'pt-BR');
  url.searchParams.append('page', '1');

  try {
    const response = await fetch(url.toString());

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro na API do TMDB:', errorData);
      throw new Error(`Erro ao buscar dados do TMDB: ${response.statusText}`);
    }

    return response.json() as Promise<SearchResponse>;
  } catch (error) {
    console.error('Falha ao conectar com o TMDB:', error);
    throw new Error('Não foi possível conectar à API do TMDB. Verifique sua conexão ou a chave da API.');
  }
}
