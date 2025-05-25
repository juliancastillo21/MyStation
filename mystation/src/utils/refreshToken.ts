// src/utils/refreshToken.ts
import axios from "axios";

interface SpotifyTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
    refresh_token?: string;
}

const CLIENT_ID = "d0d04f92a7d7456393e677a9ccf4341c";
const REDIRECT_URI = "https://my-station-8ad14.web.app/callback";

export const refreshSpotifyToken = async (refreshToken: string): Promise<string | null> => {
    try {
        if (!refreshToken) {
            throw new Error("No refresh token provided");
        }

        const res = await axios.post<SpotifyTokenResponse>(
            "https://accounts.spotify.com/api/token",
            new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: refreshToken,
                client_id: CLIENT_ID,
                redirect_uri: REDIRECT_URI,
            }),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );

        const { access_token } = res.data;
        
        if (!access_token) {
            throw new Error("No access token received from Spotify");
        }

        // Si recibimos un nuevo refresh token, actualizarlo
        if (res.data.refresh_token) {
            localStorage.setItem("spotify_refresh_token", res.data.refresh_token);
        }

        // Guardar el nuevo access token
        localStorage.setItem("spotify_access_token", access_token);

        return access_token;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Error refreshing Spotify token:", {
                status: error.response?.status,
                message: error.response?.data?.error || error.message
            });

            // Si el error es por token inválido, limpiar tokens almacenados
            if (error.response?.status === 401) {
                localStorage.removeItem("spotify_access_token");
                localStorage.removeItem("spotify_refresh_token");
            }
        } else {
            console.error("Error refreshing Spotify token:", error);
        }
        return null;
    }
};
