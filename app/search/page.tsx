// app/search/page.tsx
'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { searchMulti, discoverContent, GENRES } from '@/services/tmdb';
import Link from 'next/link';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { RangeSlider } from '@/components/ui/RangeSlider';
import {
  Search,
  Filter,
  Calendar,
  Users,
  Clapperboard,
  Tv,
  Sparkles,
  X,
  Check,
  Info,
  ChevronRight,
  Star,
  ArrowUpDown,
  Vote,
  ArrowUp,
  ArrowDown,
  Loader2
} from 'lucide-react';

interface SearchResultItem {
  id: number;
  title?: string;
  name?: string;
  media_type: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  vote_count?: number;
  overview?: string;
}

const AGE_RATINGS = [
  { id: '10', label: '10+' },
  { id: '12', label: '12+' },
  { id: '14', label: '14+' },
  { id: '16', label: '16+' },
  { id: '18', label: '18+' },
];

const SORT_OPTIONS = [
  { id: 'popularity', label: 'Popularidade' },
  { id: 'vote_average', label: 'Avaliação' },
  { id: 'primary_release_date', label: 'Lançamento' },
  { id: 'original_title', label: 'Título' },
  { id: 'vote_count', label: 'Votos' },
];

const FILTER_CONTAINER_CLASS = "space-y-2";
const LABEL_CLASS = "text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2 mb-1.5";
const INPUT_BASE_CLASS = "w-full bg-secondary border border-border rounded-xl text-[11px] font-bold transition-all outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/5";
const BUTTON_BASE_CLASS = "flex items-center justify-center gap-2 rounded-xl text-[11px] font-bold transition-all border";

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showGenreModal, setShowGenreModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SearchResultItem | null>(null);

  // Filters
  const [mediaTypes, setMediaTypes] = useState<string[]>([]);
  const [isAnime, setIsAnime] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [matchAllGenres, setMatchAllGenres] = useState(false);

  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');

  const [voteRange, setVoteRange] = useState({ min: 0, max: 10 });
  const [voteCountRange, setVoteCountRange] = useState({ min: 0, max: 20000 });
  const [yearRange, setYearRange] = useState({ min: 1900, max: 2026 });

  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef(null);

  // Sorting
  const [sortByField, setSortByField] = useState('popularity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const toggleMediaType = (type: string) => {
    setMediaTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const toggleGenre = (id: string) => {
    setSelectedGenres(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);
  };

  // Main Fetcher
  const fetchContent = useCallback(async (isInitial = true) => {
    if (isInitial) {
      setIsLoading(true);
      setPage(1);
    } else {
      setIsFetchingMore(true);
    }

    try {
      const currentPage = isInitial ? 1 : page + 1;

      if (query.trim().length >= 2) {
        // Search ignores pagination for now as per current tmdb.ts searchMulti implementation
        // But we could expand it later. For now, search results are limited to page 1.
        if (!isInitial) {
          setHasMore(false);
          return;
        }
        const response = await searchMulti(query);
        let data = response.results.filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv');
        setResults(data);
        setHasMore(false);
      } else {
        const typesToFetch = mediaTypes.length > 0 ? mediaTypes : ['movie', 'tv'];
        const primaryType = typesToFetch.includes('movie') ? 'movie' : 'tv';
        const sortString = `${sortByField}.${sortOrder}`;

        const response = await discoverContent({
          type: primaryType as any,
          genres: isAnime ? [...selectedGenres, '16'] : selectedGenres,
          combineAllGenres: matchAllGenres,
          language: isAnime ? 'ja' : '',
          yearFrom: yearRange.min.toString(),
          yearTo: yearRange.max.toString(),
          minAgeRating: minAge,
          maxAgeRating: maxAge,
          minVote: voteRange.min.toString(),
          maxVote: voteRange.max.toString(),
          minVoteCount: voteCountRange.min.toString(),
          maxVoteCount: voteCountRange.max > 19999 ? undefined : voteCountRange.max.toString(),
          sortBy: sortString,
          page: currentPage
        });

        const newResults = response.results.map((r: any) => ({ ...r, media_type: r.media_type || primaryType }));

        if (isInitial) {
          setResults(newResults);
        } else {
          setResults(prev => [...prev, ...newResults]);
          setPage(currentPage);
        }

        setHasMore(response.page < response.total_pages && newResults.length > 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  }, [query, mediaTypes, selectedGenres, matchAllGenres, minAge, maxAge, yearRange, isAnime, voteRange, voteCountRange, sortByField, sortOrder, page]);

  // Handle Filter Changes
  useEffect(() => {
    const timer = setTimeout(() => fetchContent(true), 400);
    return () => clearTimeout(timer);
  }, [query, mediaTypes, selectedGenres, matchAllGenres, minAge, maxAge, yearRange, isAnime, voteRange, voteCountRange, sortByField, sortOrder]);

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !isFetchingMore && query.trim().length < 2) {
          fetchContent(false);
        }
      },
      { threshold: 0.5 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, isFetchingMore, fetchContent, query]);

  const activeGenresList = useMemo(() => {
    const list = mediaTypes.includes('tv') ? GENRES.TV : GENRES.MOVIE;
    return Array.from(new Map(list.map(item => [item.id, item])).values());
  }, [mediaTypes]);

  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="flex relative items-start">

        {/* Sidebar */}
        <aside className={`fixed lg:sticky top-0 inset-y-0 left-0 z-40 w-72 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${showFilters ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-5 space-y-6 h-screen overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <Link href="/" className="text-xl font-bold text-gradient italic tracking-tighter block leading-none mb-1 px-1">Nextep</Link>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Advanced Search</span>
              </div>
              <button onClick={() => setShowFilters(false)} className="lg:hidden p-2 hover:bg-secondary rounded-lg">
                <X size={18} />
              </button>
            </div>

            <div className={FILTER_CONTAINER_CLASS}>
              <label className={LABEL_CLASS}><Clapperboard size={12} /> Formato</label>
              <div className="grid grid-cols-2 gap-2">
                {[{ id: 'movie', label: 'Filmes', icon: Clapperboard }, { id: 'tv', label: 'Séries', icon: Tv }].map((t) => (
                  <button key={t.id} onClick={() => toggleMediaType(t.id)} className={`${BUTTON_BASE_CLASS} py-2 ${mediaTypes.includes(t.id) ? 'bg-primary border-primary text-primary-foreground shadow-lg' : 'bg-secondary/40 border-transparent hover:border-border text-muted-foreground'}`}>
                    <t.icon size={12} /> {t.label}
                  </button>
                ))}
              </div>
              <button onClick={() => setIsAnime(!isAnime)} className={`${BUTTON_BASE_CLASS} w-full justify-between px-3.5 py-2.5 ${isAnime ? 'bg-purple-600 border-purple-600 text-white shadow-lg' : 'bg-secondary/40 border-transparent hover:border-border text-muted-foreground'}`}>
                <div className="flex items-center gap-3"><Sparkles size={14} /> Focar em Animes</div>
                {isAnime ? <Check size={16} /> : <div className="w-4 h-4 rounded-full border border-current opacity-20" />}
              </button>
            </div>

            <div className={FILTER_CONTAINER_CLASS}>
              <label className={LABEL_CLASS}><ArrowUpDown size={12} /> Ordenar</label>
              <div className="flex gap-2">
                <select value={sortByField} onChange={(e) => setSortByField(e.target.value)} className={`${INPUT_BASE_CLASS} flex-1 p-2.5 appearance-none`} style={{ backgroundImage: 'none' }}>
                  {SORT_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                </select>
                <button onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} className={`${BUTTON_BASE_CLASS} w-11 bg-secondary hover:bg-secondary/80 border-border`}>
                  {sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                </button>
              </div>
            </div>

            <div className={FILTER_CONTAINER_CLASS}>
              <div className="flex items-center justify-between">
                <label className={LABEL_CLASS + " mb-0"}><Star size={12} className="text-primary mr-2" /> Estilos</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => setMatchAllGenres(!matchAllGenres)} className={`w-6 h-3 rounded-full relative transition-all ${matchAllGenres ? 'bg-primary' : 'bg-muted'}`}>
                    <div className={`absolute top-0.5 w-2 h-2 rounded-full bg-white transition-all shadow-sm ${matchAllGenres ? 'left-3.5' : 'left-0.5'}`} />
                  </button>
                  <Info size={10} className="text-muted-foreground" />
                </div>
              </div>
              <button onClick={() => setShowGenreModal(true)} className={`${BUTTON_BASE_CLASS} w-full justify-between px-3.5 py-2.5 bg-secondary hover:bg-secondary/80 border-border hover:border-primary/30 group`}>
                <span className="flex items-center gap-2"><Filter size={12} className="text-muted-foreground group-hover:text-primary transition-colors" /> {selectedGenres.length === 0 ? 'Explorar' : `${selectedGenres.length} selecionados`}</span>
                <ChevronRight size={12} />
              </button>
            </div>

            <div className="space-y-6 pt-2">
              <div className={FILTER_CONTAINER_CLASS}>
                <label className={LABEL_CLASS}><Star size={12} className="text-yellow-500" /> Nota Média</label>
                <RangeSlider min={0} max={10} step={0.1} value={voteRange} onChange={setVoteRange} />
              </div>
              <div className={FILTER_CONTAINER_CLASS}>
                <label className={LABEL_CLASS}><Vote size={12} /> Votos</label>
                <RangeSlider min={0} max={20000} step={500} value={voteCountRange} onChange={setVoteCountRange} />
              </div>
              <div className={FILTER_CONTAINER_CLASS}>
                <label className={LABEL_CLASS}><Calendar size={12} /> Ano</label>
                <RangeSlider min={1900} max={2026} step={1} value={yearRange} onChange={setYearRange} />
              </div>
            </div>

            <div className={FILTER_CONTAINER_CLASS}>
              <label className={LABEL_CLASS}><Users size={12} /> Faixa Etária</label>
              <div className="grid grid-cols-2 gap-2">
                <select value={minAge} onChange={(e) => setMinAge(e.target.value)} className={`${INPUT_BASE_CLASS} p-2.5`}>
                  <option value="">Livre</option>
                  {AGE_RATINGS.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
                <select value={maxAge} onChange={(e) => setMaxAge(e.target.value)} className={`${INPUT_BASE_CLASS} p-2.5`}>
                  <option value="">Sem limite</option>
                  {AGE_RATINGS.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
              </div>
            </div>

            <button onClick={() => { setSelectedGenres([]); setMediaTypes([]); setIsAnime(false); setMinAge(''); setMaxAge(''); setVoteRange({ min: 0, max: 10 }); setVoteCountRange({ min: 0, max: 20000 }); setYearRange({ min: 1900, max: 2026 }); setSortByField('popularity'); setSortOrder('desc'); }} className="w-full py-2 hover:text-destructive text-[9px] font-black uppercase tracking-[0.2em] transition-colors mt-6 opacity-60 hover:opacity-100">
              Resetar Tudo
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <section className="flex-1 px-6 py-4 lg:px-10 lg:py-6 min-h-screen relative">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 animate-fade-in">
            <div className="flex items-center gap-4">
              <button onClick={() => setShowFilters(true)} className="lg:hidden p-2.5 bg-secondary rounded-2xl hover:bg-secondary/80 border border-border shadow-sm"><Filter size={16} className="text-primary" /></button>
              <h1 className="text-xl font-black tracking-tighter">{query.trim() ? <>Busca: <span className="text-primary">{query}</span></> : 'Explorar'}</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative group flex-1 md:w-[280px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={14} />
                <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Pesquisar..." className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-xs placeholder:text-muted-foreground/60" />
              </div>
              <ThemeSwitcher />
            </div>
          </header>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 3xl:grid-cols-10 gap-x-3 gap-y-6">
            {isLoading && results.length === 0 ? (
              Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="space-y-2 animate-pulse">
                  <div className="aspect-[2/3] bg-secondary rounded-[16px]" />
                  <div className="h-1.5 bg-secondary rounded-full w-2/3 mx-auto" />
                </div>
              ))
            ) : results.length > 0 ? (
              results.map((item) => (
                <div key={`${item.media_type}-${item.id}`} className="group flex flex-col gap-2 animate-fade-in">
                  <div className="aspect-[2/3] relative rounded-[16px] overflow-hidden bg-secondary border border-border shadow-sm transition-all duration-500 hover:scale-[1.04] group-hover:shadow-[0_10px_20px_rgba(0,0,0,0.15)] group-hover:border-primary/40">
                    <img src={item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://placehold.co/500x750/111/444?text=Nextep'} alt={item.title || item.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" loading="lazy" />
                    <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 w-fit"><span className="px-1.5 py-0.5 bg-black/70 backdrop-blur-xl rounded-md text-[7px] font-black uppercase tracking-widest text-white border border-white/5 shadow-xl w-fit">{item.media_type === 'movie' ? 'Filme' : 'Série'}</span></div>
                    {item.vote_average && item.vote_average > 0 && (<div className="absolute top-2 right-2 px-1.5 py-0.5 bg-yellow-400 text-black rounded-md text-[8px] font-black flex items-center gap-0.5 shadow-lg border border-yellow-500/20 z-10 w-fit"><Star size={8} fill="currentColor" /> {item.vote_average.toFixed(1)}</div>)}
                    <div className="absolute inset-x-0 bottom-0 py-4 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-3"><button onClick={() => setSelectedItem(item)} className="w-full py-2.5 bg-white text-black font-black rounded-xl text-[8px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-2xl active:scale-95">Ver Detalhes</button></div>
                  </div>
                  <div className="px-1 text-center flex flex-col gap-0.5">
                    <h3 className="font-black text-[10px] line-clamp-1 group-hover:text-primary transition-colors tracking-tight uppercase leading-tight">{item.title || item.name}</h3>
                    <div className="flex items-center justify-center gap-2 opacity-40"><span className="text-[8px] font-black uppercase tracking-widest">{(item.release_date || item.first_air_date)?.split('-')[0] || 'Prod.'}</span></div>
                  </div>
                </div>
              ))
            ) : null}
          </div>

          {/* Observer Target & Loading State */}
          <div ref={observerTarget} className="w-full py-20 flex flex-col items-center justify-center gap-4">
            {isFetchingMore && (
              <>
                <Loader2 className="animate-spin text-primary" size={32} />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Carregando mais tesouros...</p>
              </>
            )}
            {!hasMore && results.length > 0 && <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-30">Você chegou ao fim do vasto universo.</p>}
            {results.length === 0 && !isLoading && (
              <div className="py-20 text-center space-y-4 opacity-30 animate-fade-in"><Sparkles size={64} className="mx-auto text-primary mb-4" /><p className="text-xl font-black italic tracking-tighter">Nenhum tesouro encontrado.</p></div>
            )}
          </div>
        </section>
      </div>

      {/* Modals remain the same ... */}
      {showGenreModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/90 backdrop-blur-xl" onClick={() => setShowGenreModal(false)} />
          <div className="relative bg-card border border-border w-full max-w-3xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-fade-in">
            <div className="p-8 border-b border-border flex items-center justify-between bg-primary/5">
              <div>
                <h2 className="text-2xl font-black flex items-center gap-3 tracking-tighter"><Sparkles size={24} className="text-primary" /> Catálogo de Estilos</h2>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Refine por gênero cinematográfico</p>
              </div>
              <button onClick={() => setShowGenreModal(false)} className="p-3 bg-secondary hover:bg-muted rounded-full transition-all"><X size={20} /></button>
            </div>
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-card">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {activeGenresList.map(g => (
                  <button key={g.id} onClick={() => toggleGenre(g.id.toString())} className={`group flex items-center gap-3 px-5 py-4 rounded-xl text-xs font-bold transition-all border ${selectedGenres.includes(g.id.toString()) ? 'bg-primary border-primary text-primary-foreground shadow-xl scale-[1.02]' : 'bg-secondary/40 border-transparent hover:border-border text-muted-foreground hover:text-foreground'}`}>
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${selectedGenres.includes(g.id.toString()) ? 'border-primary-foreground bg-primary-foreground/20' : 'border-muted-foreground group-hover:border-foreground'}`}>{selectedGenres.includes(g.id.toString()) && <Check size={12} strokeWidth={3} />}</div>
                    {g.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-8 bg-secondary/20 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <button onClick={() => setSelectedGenres([])} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-destructive transition-colors">Desmarcar Tudo ({selectedGenres.length})</button>
              <button onClick={() => setShowGenreModal(false)} className="w-full sm:w-auto px-10 py-5 bg-foreground text-background font-black rounded-2xl text-[11px] uppercase tracking-widest hover:scale-[1.05] transition-all shadow-xl">Aplicar Estilos</button>
            </div>
          </div>
        </div>
      )}

      {selectedItem && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/95 backdrop-blur-2xl" onClick={() => setSelectedItem(null)} />
          <div className="relative bg-card border border-border w-full max-w-5xl rounded-[48px] shadow-[0_0_100px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-fade-in">
            <div className="w-full md:w-5/12 aspect-[2/3] md:aspect-auto relative bg-secondary">
              <img src={selectedItem.poster_path ? `https://image.tmdb.org/t/p/w1280${selectedItem.poster_path}` : 'https://placehold.co/1280x1920/111/444?text=Nextep'} alt={selectedItem.title || selectedItem.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 p-8 md:p-14 overflow-y-auto custom-scrollbar flex flex-col relative">
              <button onClick={() => setSelectedItem(null)} className="absolute top-8 right-8 p-3 bg-secondary/80 hover:bg-secondary rounded-full backdrop-blur-md transition-all border border-border z-10"><X size={24} /></button>
              <div className="space-y-8 my-auto">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">{selectedItem.media_type === 'movie' ? 'Cinema' : 'Série de TV'}</span>
                    <div className="group relative">
                      <span className="px-3 py-1 bg-yellow-400 text-black rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg">TMDB {selectedItem.vote_average?.toFixed(1)}</span>
                    </div>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-[0.9] mb-4">{selectedItem.title || selectedItem.name}</h2>
                  <div className="flex items-center gap-4">
                    <p className="text-muted-foreground font-black uppercase tracking-[0.2em] text-xs">Lançamento: <span className="text-foreground">{selectedItem.release_date || selectedItem.first_air_date || 'N/A'}</span></p>
                    <div className="h-4 w-px bg-border" /><p className="text-muted-foreground font-black uppercase tracking-[0.2em] text-xs">Votos: <span className="text-foreground">{selectedItem.vote_count || 0}</span></p>
                  </div>
                </div>
                <div className="space-y-4"><h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground border-b border-border pb-2 w-fit">Resumo da Obra</h3><p className="text-xl leading-relaxed font-medium text-foreground/90">{selectedItem.overview || 'Sinopse não disponível em português para este título.'}</p></div>
                <div className="pt-10 flex flex-col sm:flex-row gap-4">
                  <button className="flex-1 py-6 bg-foreground text-background font-black rounded-[24px] flex items-center justify-center gap-3 hover:scale-[1.03] active:scale-[0.97] transition-all shadow-2xl text-sm uppercase tracking-widest">Onde Assistir?</button>
                  <button className="flex-1 py-6 bg-secondary text-foreground font-black rounded-[24px] flex items-center justify-center gap-3 border border-border hover:bg-secondary/80 transition-all text-sm uppercase tracking-widest">Salvar na Watchlist</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
