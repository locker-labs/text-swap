import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Twitter API endpoints
const TWITTER_TOKEN_URL = 'https://api.x.com/2/oauth2/token';
const TWITTER_USER_URL = 'https://api.x.com/2/users/me';

// Add client secret for confidential clients (if using a confidential client type)
const TWITTER_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET || '';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    // Get stored state and code verifier from cookies (read-only)
    const reqCookies = await cookies();
    const storedState = reqCookies.get('twitter_oauth_state')?.value;
    const codeVerifier = reqCookies.get('twitter_pkce_code_verifier')?.value;

    // Log for debugging
    console.log('Received state:', state);
    console.log('Stored state:', storedState);
    console.log('Has code verifier:', !!codeVerifier);

    // Validate state to prevent CSRF attacks
    if (!code || !state || state !== storedState) {
        console.log('State validation failed', {
            receivedState: state,
            storedState: storedState,
            hasCode: !!code
        });
        return NextResponse.redirect(new URL('/?error=invalid_state', request.url));
    }

    // Validate code verifier
    if (!codeVerifier) {
        return NextResponse.redirect(new URL('/?error=missing_verifier', request.url));
    }

    try {
        // Use the configured base URL for consistency
        const configuredBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;
        // Get the base URL that was used for this request
        const requestBaseUrl = new URL(request.url).origin;
        // Use configured base URL for redirect URI to match what we registered with Twitter
        const redirectUri = `${configuredBaseUrl}/api/twitter/callback`;

        // Exchange the code for an access token
        const tokenResponse = await exchangeCodeForToken(
            code,
            codeVerifier,
            process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID || '',
            redirectUri
        );

        // Fetch Twitter user data
        const userData = await getTwitterUser(tokenResponse.access_token);

        // Always redirect back to the configured base URL, not the request URL
        // This ensures we redirect to the same hostname where cookies were set
        const response = NextResponse.redirect(`${configuredBaseUrl}/?twitter_connected=true`);

        // Store tokens and user data in cookies (secure in production)
        response.cookies.set('twitter_access_token', tokenResponse.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: tokenResponse.expires_in,
            path: '/',
        });

        if (tokenResponse.refresh_token) {
            response.cookies.set('twitter_refresh_token', tokenResponse.refresh_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/',
            });
        }

        // Store user data in a cookie (readable by client JS)
        response.cookies.set('twitter_user', JSON.stringify(userData), {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            maxAge: tokenResponse.expires_in,
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Twitter OAuth error:', error);
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.redirect(`${baseUrl}/?error=auth_failed&message=${encodeURIComponent(errorMessage)}`);
    }
}

async function exchangeCodeForToken(
    code: string,
    codeVerifier: string,
    clientId: string,
    redirectUri: string
) {
    const body = new URLSearchParams({
        client_id: clientId,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
    });

    // Check if we have a client secret for confidential client (Web App)
    const headers: Record<string, string> = {
        'Content-Type': 'application/x-www-form-urlencoded',
    };

    // If we have a client secret, use it for Basic Auth
    if (TWITTER_CLIENT_SECRET) {
        const authString = Buffer.from(`${clientId}:${TWITTER_CLIENT_SECRET}`).toString('base64');
        headers['Authorization'] = `Basic ${authString}`;
    }

    const response = await fetch(TWITTER_TOKEN_URL, {
        method: 'POST',
        headers,
        body: body.toString(),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Twitter token request failed: ${response.status} ${errorText}`);
    }

    return await response.json();
}

async function getTwitterUser(accessToken: string) {
    const response = await fetch(TWITTER_USER_URL, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch Twitter user: ${response.statusText}`);
    }

    const data = await response.json();
    return {
        id: data.data.id,
        name: data.data.name,
        username: data.data.username,
    };
} 