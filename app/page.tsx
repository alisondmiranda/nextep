import Link from 'next/link';
import { cookies } from 'next/headers';
import { TrendingCarousel } from '@/components/TrendingCarousel';
import { BackgroundWall } from '@/components/BackgroundWall';

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('trakt_token');
  const isLoggedIn = !!token;

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center p-6 pt-16 pb-6 relative transition-colors duration-300 overflow-x-hidden">
      {/* Background Layer */}
      <BackgroundWall />

      {/* Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse pointer-events-none z-0" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 text-center max-w-5xl w-full animate-fade-in flex flex-col items-center">
        <div className="inline-block px-4 py-1.5 bg-secondary border border-border rounded-full text-[10px] font-black tracking-[0.2em] text-blue-500 uppercase mb-8">
          O Futuro do Entretenimento
        </div>

        {/* Logo with safe padding for the italic 'p' */}
        <div className="px-6 mb-4 max-w-full overflow-visible">
          <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter leading-tight p-2 flex justify-center">
            <span className="text-gradient block px-6 pb-2 relative">Nextep</span>
          </h1>
        </div>

        <p className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed font-medium max-w-2xl mx-auto">
          Centralize seus serviços, acompanhe seu progresso e <span className="text-foreground font-extrabold">economize</span>.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Link
            href="/search"
            className="w-full sm:w-auto px-12 py-5 bg-foreground text-background font-black rounded-[24px] hover:scale-[1.05] transition-all active:scale-[0.98] shadow-2xl shadow-foreground/10 text-sm uppercase tracking-widest"
          >
            Explorar Catálogo
          </Link>

          {!isLoggedIn ? (
            <Link
              href="/login"
              className="w-full sm:w-auto px-12 py-5 bg-secondary text-foreground font-black rounded-[24px] hover:bg-secondary/80 border border-border transition-all active:scale-[0.98] text-sm uppercase tracking-widest"
            >
              Conectar Trakt.tv
            </Link>
          ) : (
            <div className="w-full sm:w-auto px-12 py-5 bg-green-500/10 border border-green-500/20 text-green-600 font-black rounded-[24px] flex items-center gap-3 text-sm uppercase tracking-widest">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
              Trakt Ativo
            </div>
          )}
        </div>

        {/* Full-width Carousel Area */}
        <div className="w-full">
          <TrendingCarousel />
        </div>
      </div>

      <footer className="mt-auto pt-16 flex flex-col items-center gap-4 pb-8">
        <div className="h-px w-20 bg-border opacity-50" />
        <span className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Nextep Engine © 2026</span>
      </footer>
    </main>
  );
}
