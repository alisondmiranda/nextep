// services/trakt.ts

const CLIENT_ID = process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID;
const CLIENT_SECRET = process.env.TRAKT_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`;

export const getTraktAuthUrl = () => {
    return `https://trakt.tv/oauth/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}`;
};

export async function exchangeCodeForToken(code: string) {
    const response = await fetch('https://api.trakt.tv/oauth/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            code,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            redirect_uri: REDIRECT_URI,
            grant_type: 'authorization_code',
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error_description || 'Falha ao trocar código por token no Trakt');
    }

    return response.json(); // Retorna { access_token, refresh_token, created_at, expires_in }
}

export async function getTraktUserProfile(accessToken: string) {
    const response = await fetch('https://api.trakt.tv/users/settings', {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'trakt-api-version': '2',
            'trakt-api-key': CLIENT_ID!,
        },
    });

    if (!response.ok) {
        throw new Error('Falha ao obter perfil do Trakt');
    }

    return response.json();
}
