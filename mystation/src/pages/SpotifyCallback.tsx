// src/pages/Callback.jsx
import { useEffect } from "react";
import axios from "axios";
import { useSpotify } from "../auth/contexts/SpotifyContext";
import { useNavigate } from "react-router-dom";
import { useUser } from "../auth/contexts/UserContext";

const CLIENT_ID = "d0d04f92a7d7456393e677a9ccf4341c";
const REDIRECT_URI = "https://my-station-8ad14.web.app/callback";

interface SpotifyProfile {
    email: string;
    id: string;
    display_name: string;
    images?: Array<{ url: string }>;

}

const Callback = () => {
    const { setTokens } = useSpotify();
    const { userState, login } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        const codeVerifier = localStorage.getItem("spotify_code_verifier");

        if (!code || !codeVerifier) {
            console.error("❌ Falta 'code' o 'code_verifier' para autenticación con Spotify.");
            localStorage.removeItem("spotify_code_verifier");
            navigate("/");
            return;
        }

        exchangeCodeForToken(code, codeVerifier);
    }, [navigate, setTokens]);

    const exchangeCodeForToken = async (code: string, codeVerifier: string) => {
        try {
            const body = new URLSearchParams({
                grant_type: "authorization_code",
                code,
                redirect_uri: REDIRECT_URI,
                client_id: CLIENT_ID,
                code_verifier: codeVerifier,
            });

            const tokenResponse = await axios.post<{
                access_token: string;
                refresh_token?: string;
            }>(
                "https://accounts.spotify.com/api/token",
                body.toString(),
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );

            const { access_token, refresh_token } = tokenResponse.data;

            if (!access_token) {
                console.error("No se recibió un access_token:", tokenResponse.data);
                throw new Error("No access token received.");
            }

            const profileResponse = await axios.get<SpotifyProfile>(
                "https://api.spotify.com/v1/me",
                {
                    headers: {
                        Authorization: `Bearer ${access_token}`,
                    },
                }
            );

            const profile = profileResponse.data;
            const emailToUse = profile.email || 'spotify_user@example.com';

            // Intentar iniciar sesión con las credenciales de Spotify
            try {
                await login(emailToUse, access_token);
                setTokens(access_token, refresh_token || "");
                navigate("/dashboard");
            } catch (loginError) {
                console.error("Error al iniciar sesión:", loginError);
                navigate("/");
            }

        } catch (error) {
            console.error("❌ Error durante la autenticación con Spotify:", error);
            localStorage.removeItem("spotify_code_verifier");
            navigate("/");
        }
    };

    if (userState.checking) {
        return <div className="loading">🔄 Conectando con Spotify...</div>;
    }

    return <div>Procesando autenticación...</div>;
};

export default Callback;

