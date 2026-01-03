import { NextResponse } from 'next/server';
import { exchangeCodeForToken, getTraktUserProfile } from '@/services/trakt';
import { createClient } from '@/lib/supabase';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
        return NextResponse.redirect(new URL('/login?error=no_code', request.url));
    }

    try {
        // 1. Troca o código pelo Token do Trakt
        const traktTokenData = await exchangeCodeForToken(code);

        // 2. Obtém o perfil do usuário para identificar quem é
        const profile = await getTraktUserProfile(traktTokenData.access_token);

        // 3. Aqui você pode salvar o token no Supabase ou em um Cookie seguro
        // Por enquanto, vamos apenas redirecionar para a home
        const response = NextResponse.redirect(new URL('/', request.url));

        // Salvando o token do Trakt em um cookie para uso posterior nas APIs
        response.cookies.set('trakt_token', traktTokenData.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: traktTokenData.expires_in,
        });

        return response;
    } catch (error) {
        console.error('Erro no callback do Trakt:', error);
        return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
    }
}
