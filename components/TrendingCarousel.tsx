'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { getTrending } from '@/services/tmdb';
import { Star, TrendingUp } from 'lucide-react';

const TIME_WINDOWS = [
    { id: 'day', label: 'Hoje' },
    { id: 'week', label: 'Semana' },
];

export function TrendingCarousel() {
    const [window, setWindow] = useState<'day' | 'week'>('day');
    const [items, setItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const containerRef = useRef<HTMLDivElement>(null);
    const positionRef = useRef(0);
    const isDraggingRef = useRef(false);
    const lastXRef = useRef(0);
    const reqRef = useRef<number>(0);
    const autoScrollSpeed = -0.7; // Slightly faster for better feel

    const CARD_WIDTH = 135;
    const GAP = 20; // Increased gap for better spacing
    const ITEM_FULL_WIDTH = CARD_WIDTH + GAP;

    useEffect(() => {
        async function load() {
            setIsLoading(true);
            try {
                const data = await getTrending(window);
                setItems(data.results.slice(0, 10));
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, [window]);

    // We use 5 sets to have a massive buffer on both sides
    const displayItems = [...items, ...items, ...items, ...items, ...items];
    const singleSetWidth = items.length * ITEM_FULL_WIDTH;

    const animate = useCallback(() => {
        if (!isDraggingRef.current) {
            positionRef.current += autoScrollSpeed;
        }

        // Infinite Loop Logic - Robust version
        // We stay within the range of the middle sets to avoid ever seeing the ends
        const totalContentWidth = displayItems.length * ITEM_FULL_WIDTH;

        // If we scroll too far left
        if (positionRef.current <= -singleSetWidth * 3) {
            positionRef.current += singleSetWidth;
        }
        // If we scroll too far right
        if (positionRef.current >= -singleSetWidth) {
            positionRef.current -= singleSetWidth;
        }

        if (containerRef.current) {
            containerRef.current.style.transform = `translate3d(${positionRef.current}px, 0, 0)`;
        }

        reqRef.current = requestAnimationFrame(animate);
    }, [singleSetWidth, displayItems.length]);

    useEffect(() => {
        if (items.length > 0) {
            // Start in the middle of our buffer
            positionRef.current = -singleSetWidth * 2;
            reqRef.current = requestAnimationFrame(animate);
        }
        return () => cancelAnimationFrame(reqRef.current);
    }, [items, animate, singleSetWidth]);

    const handleDown = (clientX: number) => {
        isDraggingRef.current = true;
        lastXRef.current = clientX;
    };

    const handleMove = (clientX: number) => {
        if (!isDraggingRef.current) return;
        const delta = clientX - lastXRef.current;
        lastXRef.current = clientX;
        positionRef.current += delta;
    };

    const handleUp = () => {
        isDraggingRef.current = false;
    };

    return (
        <section className="w-full mt-10 animate-fade-in-up overflow-hidden select-none">
            <div className="flex items-center justify-between mb-6 px-4 max-w-5xl mx-auto">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl border border-primary/20 shadow-sm">
                        <TrendingUp size={16} className="text-primary" />
                    </div>
                    <div className="text-left">
                        <h2 className="text-xs font-black uppercase tracking-widest leading-none">Tendências</h2>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Destaques da Comunidade</p>
                    </div>
                </div>

                <div className="flex bg-secondary/50 backdrop-blur-md p-1 rounded-xl border border-border">
                    {TIME_WINDOWS.map((w) => (
                        <button
                            key={w.id}
                            onClick={() => setWindow(w.id as any)}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${window === w.id
                                    ? 'bg-background text-foreground shadow-lg'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {w.label}
                        </button>
                    ))}
                </div>
            </div>

            <div
                className="relative w-full h-[240px] cursor-grab active:cursor-grabbing"
                onMouseDown={(e) => handleDown(e.clientX)}
                onMouseMove={(e) => handleMove(e.clientX)}
                onMouseUp={handleUp}
                onMouseLeave={handleUp}
                onTouchStart={(e) => handleDown(e.touches[0].clientX)}
                onTouchMove={(e) => handleMove(e.touches[0].clientX)}
                onTouchEnd={handleUp}
            >
                {/* Cinematic Fade Out */}
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background via-background/50 to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background via-background/50 to-transparent z-10 pointer-events-none" />

                <div
                    ref={containerRef}
                    className="absolute top-0 left-0 flex items-center will-change-transform"
                >
                    {isLoading ? (
                        Array.from({ length: 10 }).map((_, i) => (
                            <div
                                key={i}
                                className="flex-shrink-0 bg-secondary/50 rounded-[32px] animate-pulse"
                                style={{ width: CARD_WIDTH, height: CARD_WIDTH * 1.5, marginRight: GAP }}
                            />
                        ))
                    ) : (
                        displayItems.map((item, index) => (
                            <div
                                key={`${item.id}-${index}`}
                                className="relative flex-shrink-0 bg-secondary rounded-[32px] overflow-hidden border border-border group/card transition-all duration-500 hover:scale-[1.05] hover:border-primary/50 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
                                style={{ width: CARD_WIDTH, height: CARD_WIDTH * 1.5, marginRight: GAP }}
                            >
                                <img
                                    src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                                    alt=""
                                    className="w-full h-full object-cover pointer-events-none"
                                    draggable={false}
                                />

                                {/* Static Rank Overlay */}
                                <div className="absolute top-3 left-3 w-9 h-9 bg-black/80 backdrop-blur-md rounded-2xl flex items-center justify-center text-sm font-black italic text-white border border-white/10 shadow-xl group-hover:scale-110 transition-transform">
                                    {(index % 10) + 1}
                                </div>

                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 p-4 pt-12 flex flex-col justify-end">
                                    <span className="text-[10px] font-black uppercase text-white leading-tight line-clamp-2 mb-1">
                                        {item.title || item.name}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        <Star size={10} className="text-yellow-500 fill-yellow-500" />
                                        <span className="text-[10px] font-black text-white">{item.vote_average.toFixed(1)}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}
