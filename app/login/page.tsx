'use client';

import { createClient } from '@/lib/supabase';
import { useState } from 'react';
import { getTraktAuthUrl } from '@/services/trakt';

export default function LoginPage() {
    const [loading, setLoading] = useState(false);

    const handleTraktLogin = () => {
        setLoading(true);
        const authUrl = getTraktAuthUrl();
        window.location.href = authUrl;
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white p-4">
            <div className="w-full max-w-md bg-[#1a1a1a] rounded-2xl p-8 border border-white/10 shadow-2xl">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent italic tracking-tighter mb-2">
                        Nextep
                    </h1>
                    <p className="text-gray-400">Entre para sincronizar seu progresso</p>
                </div>

                <button
                    onClick={handleTraktLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-4 px-6 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-red-900/20"
                >
                    {loading ? (
                        <div className="w-6 h-6 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <span>Conectar com Trakt.tv</span>
                        </>
                    )}
                </button>

                <p className="mt-8 text-xs text-center text-gray-500 leading-relaxed">
                    Ao entrar, você concorda em centralizar sua experiência de entretenimento com o Nextep.
                </p>
            </div>
        </div>
    );
}
