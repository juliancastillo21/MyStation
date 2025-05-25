import { useEffect, useState, createContext, useContext, ReactNode } from "react";
import { refreshSpotifyToken } from "../../utils/refreshToken";

interface SpotifyContextType {
    token: string | null;
    setToken: (token: string | null) => void;
    setTokens: (access: string, refresh: string) => void;
    accessToken: string | null;
    refreshToken: string | null;
    isTokenValid: boolean;
}

const SpotifyContext = createContext<SpotifyContextType | undefined>(undefined);

export const SpotifyProvider = ({ children }: { children: ReactNode }) => {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isTokenValid, setIsTokenValid] = useState<boolean>(false);

    const refreshAccessToken = async () => {
        if (refreshToken) {
            try {
                const newToken = await refreshSpotifyToken(refreshToken);
                if (newToken) {
                    setAccessToken(newToken);
                    setIsTokenValid(true);
                    localStorage.setItem("spotify_access_token", newToken);
                    return true;
                }
            } catch (error) {
                console.error("Error refreshing token:", error);
                setIsTokenValid(false);
            }
        }
        return false;
    };

    // Set up automatic token refresh (every 50 minutes)
    useEffect(() => {
        if (accessToken) {
            const refreshInterval = setInterval(() => {
                refreshAccessToken();
            }, 50 * 60 * 1000); // 50 minutes

            return () => clearInterval(refreshInterval);
        }
    }, [accessToken, refreshToken]);

    useEffect(() => {
        const storedAccessToken = localStorage.getItem("spotify_access_token");
        const storedRefreshToken = localStorage.getItem("spotify_refresh_token");

        if (storedRefreshToken) {
            setRefreshToken(storedRefreshToken);
            refreshAccessToken();
        } else if (storedAccessToken) {
            setAccessToken(storedAccessToken);
            setIsTokenValid(true);
        }
    }, []);

    const setTokens = (access: string, refresh: string) => {
        setAccessToken(access);
        setRefreshToken(refresh);
        setIsTokenValid(true);
        localStorage.setItem("spotify_access_token", access);
        localStorage.setItem("spotify_refresh_token", refresh);
    };

    return (
        <SpotifyContext.Provider value={{ 
            token, 
            setToken, 
            setTokens, 
            accessToken, 
            refreshToken,
            isTokenValid 
        }}>
            {children}
        </SpotifyContext.Provider>
    );
};

export const useSpotify = () => {
    const context = useContext(SpotifyContext);
    if (!context) {
        throw new Error("useSpotify must be used within a SpotifyProvider");
    }
    return context;
};
