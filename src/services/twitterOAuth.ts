import { generateRandomString, calculatePKCECodeChallenge } from './pkceUtils';

// Constants for Twitter OAuth
const TWITTER_OAUTH_URL = 'https://x.com/i/oauth2/authorize';
const TWITTER_TOKEN_URL = 'https://api.x.com/2/oauth2/token';
const TWITTER_USER_URL = 'https://api.x.com/2/users/me';

// Twitter OAuth client - ideally these would come from env vars
const TWITTER_CLIENT_ID = process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID || '';
const TWITTER_REDIRECT_URI = `${process.env.NEXT_PUBLIC_BASE_URL}/api/twitter/callback`;

// PKCE and state storage keys
const PKCE_CODE_VERIFIER_KEY = 'twitter_pkce_code_verifier';
const OAUTH_STATE_KEY = 'twitter_oauth_state';

// Twitter OAuth interfaces
export interface TwitterTokenResponse {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    scope: string;
    token_type: string;
}

export interface TwitterUser {
    id: string;
    name: string;
    username: string;
}

/**
 * Initiates the Twitter OAuth flow by generating the necessary PKCE values
 * and redirecting the user to the Twitter authorization page.
 */
export const initiateTwitterOAuth = async () => {
    try {
        // Generate PKCE values
        const codeVerifier = generateRandomString(64);
        const state = generateRandomString(32);

        // Calculate the code challenge (handled server-side)
        const response = await fetch('/api/twitter/authorize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                codeVerifier,
                state,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to initialize OAuth flow');
        }

        const { authUrl } = await response.json();

        // Redirect the user to the Twitter authorization page
        window.location.href = authUrl;
    } catch (error) {
        console.error('Error initiating Twitter OAuth:', error);
        throw error;
    }
};

/**
 * Exchanges an authorization code for an access token using the PKCE code verifier.
 * @param code The authorization code received from Twitter after user authorization
 * @param state The state parameter returned from Twitter to verify against CSRF
 * @returns The Twitter token response containing the access token
 */
export const exchangeCodeForToken = async (code: string, state: string): Promise<TwitterTokenResponse> => {
    // Retrieve the code verifier and stored state from sessionStorage
    const codeVerifier = sessionStorage.getItem(PKCE_CODE_VERIFIER_KEY);
    const storedState = sessionStorage.getItem(OAUTH_STATE_KEY);

    // Verify the state to prevent CSRF attacks
    if (state !== storedState) {
        throw new Error('Invalid state parameter');
    }

    // If code verifier is missing, the flow cannot be completed
    if (!codeVerifier) {
        throw new Error('Code verifier not found');
    }

    // Prepare the request body as form data
    const body = new URLSearchParams({
        client_id: TWITTER_CLIENT_ID,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: TWITTER_REDIRECT_URI,
        code_verifier: codeVerifier,
    });

    // Make the token request to Twitter
    const response = await fetch(TWITTER_TOKEN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
    });

    if (!response.ok) {
        throw new Error(`Twitter token request failed: ${response.statusText}`);
    }

    // Parse and return the token response
    const data: TwitterTokenResponse = await response.json();
    return data;
};

/**
 * Retrieves the authenticated user's information using the access token.
 * @param accessToken The access token received from Twitter OAuth
 * @returns The Twitter user information including username
 */
export const getTwitterUser = async (accessToken: string): Promise<TwitterUser> => {
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
};

/**
 * Gets the current Twitter user information from cookies set by the server
 */
export const getCurrentTwitterUser = (): TwitterUser | null => {
    try {
        const userDataCookie = getCookie('twitter_user');

        if (userDataCookie) {
            return JSON.parse(decodeURIComponent(userDataCookie));
        }
    } catch (e) {
        console.error('Error parsing Twitter user data:', e);
    }

    return null;
};

/**
 * Helper function to get a cookie by name
 */
export function getCookie(name: string): string | undefined {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop()?.split(';').shift();
    }
    return undefined;
} 