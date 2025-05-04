/**
 * Generates a random string of specified length for use in PKCE and state parameters.
 * @param length The length of the random string to generate
 * @returns A random string of the specified length
 */
export function generateRandomString(length: number): string {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let text = '';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}

/**
 * Calculates the PKCE code challenge from a code verifier using the S256 method.
 * @param codeVerifier The code verifier string to hash
 * @returns The code challenge derived from the code verifier
 */
export async function calculatePKCECodeChallenge(codeVerifier: string): Promise<string> {
    // Hash the code verifier using SHA-256
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);

    // Convert the hash to a base64url string
    return base64UrlEncode(digest);
}

/**
 * Encodes an ArrayBuffer to a base64url string.
 * @param buffer The ArrayBuffer to encode
 * @returns A base64url encoded string
 */
function base64UrlEncode(buffer: ArrayBuffer): string {
    // Convert the buffer to a base64 string
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));

    // Convert the base64 string to a base64url string
    return base64
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
} 