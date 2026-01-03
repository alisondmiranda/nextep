'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeSwitcher() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    const toggleTheme = () => {
        if (theme === 'light') setTheme('dark');
        else if (theme === 'dark') setTheme('system');
        else setTheme('light');
    };

    const getIcon = () => {
        if (theme === 'light') return <Sun size={14} className="text-yellow-500" />;
        if (theme === 'dark') return <Moon size={14} className="text-blue-400" />;
        return <Monitor size={14} className="text-purple-400" />;
    };

    return (
        <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-9 h-9 bg-secondary hover:bg-secondary/80 border border-border rounded-xl transition-all active:scale-[0.95] shadow-sm flex-shrink-0"
            title={`Tema: ${theme === 'light' ? 'Claro' : theme === 'dark' ? 'Escuro' : 'Sistema'}`}
        >
            {getIcon()}
        </button>
    );
}
