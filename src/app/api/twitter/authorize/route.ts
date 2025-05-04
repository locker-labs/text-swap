import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

// Twitter OAuth config
const TWITTER_OAUTH_URL = 'https://x.com/i/oauth2/authorize';

// Helper function to generate code challenge
function generateCodeChallenge(codeVerifier: string): string {
    const base64Hash = crypto
        .createHash('sha256')
        .update(codeVerifier)
        .digest('base64');

    return base64Hash
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

export async function POST(request: NextRequest) {
    try {
        const { codeVerifier, state } = await request.json();

        // Verify we have the required data
        if (!codeVerifier || !state) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        // Generate code challenge from code verifier
        const codeChallenge = generateCodeChallenge(codeVerifier);

        // Define the scopes needed
        const scope = 'tweet.read users.read offline.access';

        // Resolve base URL from environment (falls back to request origin if missing)
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin;

        // Construct the authorization URL using the env-configured redirect URI
        const redirectUri = `${baseUrl}/api/twitter/callback`;

        const params = new URLSearchParams({
            response_type: 'code',
            client_id: process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID as string,
            redirect_uri: redirectUri,
            scope,
            state,
            code_challenge: codeChallenge,
            code_challenge_method: 'S256',
        });

        const authUrl = `${TWITTER_OAUTH_URL}?${params.toString()}`;

        const response = NextResponse.json({ authUrl });

        // Store the code verifier and state in HTTP-only cookies via the response object
        response.cookies.set('twitter_pkce_code_verifier', codeVerifier, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 10, // 10 minutes
            path: '/',
        });

        response.cookies.set('twitter_oauth_state', state, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 10, // 10 minutes
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Error in authorize route:', error);
        return NextResponse.json(
            { error: 'Server error' },
            { status: 500 }
        );
    }
} 