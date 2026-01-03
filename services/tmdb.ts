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

export interface SearchResponse {
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

/**
 * Obtém os conteúdos que estão em alta (trending).
 * @param window 'day' ou 'week' (TMDB suporta esses dois nativamente)
 */
export async function getTrending(window: 'day' | 'week' = 'day'): Promise<SearchResponse> {
  if (!TMDB_API_KEY) {
    throw new Error('A chave da API do TMDB não está configurada.');
  }

  const url = new URL(`${TMDB_BASE_URL}/trending/all/${window}`);
  url.searchParams.append('api_key', TMDB_API_KEY);
  url.searchParams.append('language', 'pt-BR');

  try {
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Erro ao buscar trending do TMDB');
    return response.json();
  } catch (error) {
    console.error('Falha ao conectar com o TMDB:', error);
    throw new Error('Não foi possível carregar as tendências.');
  }
}

/**
 * Busca avançada usando o endpoint de Discover.
 */
export async function discoverContent(params: {
  type: 'movie' | 'tv';
  genres?: string[];
  combineAllGenres?: boolean;
  yearFrom?: string;
  yearTo?: string;
  minAgeRating?: string;
  maxAgeRating?: string;
  minVote?: string;
  maxVote?: string;
  minVoteCount?: string;
  maxVoteCount?: string;
  sortBy?: string;
  language?: string;
  page?: number;
}) {
  if (!TMDB_API_KEY) throw new Error('API Key faltante');

  const url = new URL(`${TMDB_BASE_URL}/discover/${params.type}`);
  url.searchParams.append('api_key', TMDB_API_KEY);
  url.searchParams.append('language', 'pt-BR');
  if (params.page) url.searchParams.append('page', params.page.toString());

  const sortValue = params.sortBy || 'popularity.desc';
  url.searchParams.append('sort_by', sortValue);

  if (params.genres && params.genres.length > 0) {
    const separator = params.combineAllGenres ? ',' : '|';
    url.searchParams.append('with_genres', params.genres.join(separator));
  }

  if (params.language) url.searchParams.append('with_original_language', params.language);
  if (params.minVote) url.searchParams.append('vote_average.gte', params.minVote);
  if (params.maxVote) url.searchParams.append('vote_average.lte', params.maxVote);
  if (params.minVoteCount) url.searchParams.append('vote_count.gte', params.minVoteCount);
  if (params.maxVoteCount) url.searchParams.append('vote_count.lte', params.maxVoteCount);

  if (params.type === 'movie') {
    if (params.yearTo) url.searchParams.append('primary_release_date.lte', `${params.yearTo}-12-31`);
    if (params.yearFrom) url.searchParams.append('primary_release_date.gte', `${params.yearFrom}-01-01`);

    url.searchParams.append('certification_country', 'BR');
    if (params.minAgeRating) url.searchParams.append('certification.gte', params.minAgeRating);
    if (params.maxAgeRating) url.searchParams.append('certification.lte', params.maxAgeRating);

  } else {
    if (params.yearTo) url.searchParams.append('first_air_date.lte', `${params.yearTo}-12-31`);
    if (params.yearFrom) url.searchParams.append('first_air_date.gte', `${params.yearFrom}-01-01`);
  }

  try {
    const response = await fetch(url.toString());
    return response.json();
  } catch (error) {
    throw new Error('Erro ao filtrar conteúdos.');
  }
}

export const GENRES = {
  MOVIE: [
    { id: 28, name: 'Ação' },
    { id: 12, name: 'Aventura' },
    { id: 16, name: 'Animação' },
    { id: 35, name: 'Comédia' },
    { id: 80, name: 'Crime' },
    { id: 99, name: 'Documentário' },
    { id: 18, name: 'Drama' },
    { id: 10751, name: 'Família' },
    { id: 14, name: 'Fantasia' },
    { id: 36, name: 'História' },
    { id: 27, name: 'Terror' },
    { id: 10402, name: 'Música' },
    { id: 9648, name: 'Mistério' },
    { id: 10749, name: 'Romance' },
    { id: 878, name: 'Ficção Científica' },
    { id: 10770, name: 'Cinema TV' },
    { id: 53, name: 'Suspense' },
    { id: 10752, name: 'Guerra' },
    { id: 37, name: 'Faroeste' },
  ],
  TV: [
    { id: 10759, name: 'Ação e Aventura' },
    { id: 16, name: 'Animação' },
    { id: 35, name: 'Comédia' },
    { id: 80, name: 'Crime' },
    { id: 99, name: 'Documentário' },
    { id: 18, name: 'Drama' },
    { id: 10751, name: 'Família' },
    { id: 10762, name: 'Kids' },
    { id: 9648, name: 'Mistério' },
    { id: 10763, name: 'News' },
    { id: 10764, name: 'Reality' },
    { id: 10765, name: 'Sci-Fi & Fantasy' },
    { id: 10766, name: 'Soap' },
    { id: 10767, name: 'Talk' },
    { id: 10768, name: 'War & Politics' },
    { id: 37, name: 'Western' },
  ]
};
