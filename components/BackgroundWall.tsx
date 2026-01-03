'use client';

import { useEffect, useState } from 'react';
import { getTrending } from '@/services/tmdb';

export function BackgroundWall() {
    const [posters, setPosters] = useState<string[]>([]);

    useEffect(() => {
        async function load() {
            try {
                const data = await getTrending('week');
                const paths = data.results
                    .filter(i => i.poster_path)
                    .map(i => `https://image.tmdb.org/t/p/w300${i.poster_path}`);
                setPosters(paths);
            } catch (err) {
                console.error(err);
            }
        }
        load();
    }, []);

    if (posters.length === 0) return null;

    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none opacity-[0.15] dark:opacity-[0.1]">
            <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background z-10" />

            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 w-[120%] h-[120%] -rotate-12 -translate-x-10 -translate-y-10 blur-[2px]">
                {Array.from({ length: 4 }).map((_, rowIndex) => (
                    <div key={rowIndex} className={`flex flex-col gap-4 ${rowIndex % 2 === 0 ? 'animate-float-slow' : 'animate-float-slower'}`}>
                        {posters.map((path, i) => (
                            <div
                                key={`${rowIndex}-${i}`}
                                className="aspect-[2/3] rounded-xl bg-secondary overflow-hidden border border-white/5"
                            >
                                <img src={path} alt="" className="w-full h-full object-cover grayscale opacity-50" />
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Finishing Texture: Grain */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
        </div>
    );
}
