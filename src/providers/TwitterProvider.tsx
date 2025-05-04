"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { TwitterUser } from '@/services/twitterOAuth';

interface TwitterContextType {
    twitterUser: TwitterUser | null;
    accessToken: string | null;
    isConnecting: boolean;
    setTwitterUser: (user: TwitterUser | null) => void;
    setAccessToken: (token: string | null) => void;
    setIsConnecting: (isConnecting: boolean) => void;
    clearTwitterConnection: () => void;
}

const TwitterContext = createContext<TwitterContextType>({
    twitterUser: null,
    accessToken: null,
    isConnecting: false,
    setTwitterUser: () => { },
    setAccessToken: () => { },
    setIsConnecting: () => { },
    clearTwitterConnection: () => { },
});

export function TwitterProvider({ children }: { children: ReactNode }) {
    const [twitterUser, setTwitterUser] = useState<TwitterUser | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);

    const clearTwitterConnection = useCallback(() => {
        setTwitterUser(null);
        setAccessToken(null);
        sessionStorage.removeItem('twitter_user');
        sessionStorage.removeItem('twitter_access_token');
    }, []);

    return (
        <TwitterContext.Provider
            value={{
                twitterUser,
                accessToken,
                isConnecting,
                setTwitterUser,
                setAccessToken,
                setIsConnecting,
                clearTwitterConnection,
            }}
        >
            {children}
        </TwitterContext.Provider>
    );
}

export function useTwitter() {
    return useContext(TwitterContext);
} 