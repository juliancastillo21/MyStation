import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../auth/contexts/UserContext";
import Loader from "../../components/Loader";
import "../../styles/dashboard.css";

interface SpotifyProfile {
    display_name?: string;
    email?: string;
    images?: Array<{ url: string }>;
}

interface SpotifyTrack {
    name: string;
    artists: Array<{ name: string }>;
}

interface RecentTrackItem {
    track: SpotifyTrack;
}

interface Artist {
    name: string;
}

export const DashboardPage: React.FC = () => {
    const { userState, logout } = useUser();
    const navigate = useNavigate();

    const [spotifyProfile, setSpotifyProfile] = useState<SpotifyProfile | null>(null);
    const [recentTracks, setRecentTracks] = useState<RecentTrackItem[]>([]);
    const [topArtists, setTopArtists] = useState<Artist[]>([]);
    const [topTracks, setTopTracks] = useState<SpotifyTrack[]>([]);

    const accessToken = localStorage.getItem("spotify_access_token");

    useEffect(() => {
        if (!accessToken) return;

        const fetchSpotifyData = async () => {
            try {
                const headers = {
                    Authorization: `Bearer ${accessToken}`,
                };

                // Perfil
                const profileRes = await fetch("https://api.spotify.com/v1/me", { headers });
                const profileData = await profileRes.json();
                setSpotifyProfile(profileData);

                // Reproducidas recientemente
                const recentRes = await fetch("https://api.spotify.com/v1/me/player/recently-played?limit=5", { headers });
                const recentData = await recentRes.json();
                setRecentTracks(recentData.items || []);

                // Top artistas
                const artistsRes = await fetch("https://api.spotify.com/v1/me/top/artists?limit=5", { headers });
                const artistsData = await artistsRes.json();
                setTopArtists(artistsData.items || []);

                // Top canciones
                const tracksRes = await fetch("https://api.spotify.com/v1/me/top/tracks?limit=5", { headers });
                const tracksData = await tracksRes.json();
                setTopTracks(tracksData.items || []);
            } catch (error) {
                console.error("Error al obtener datos de Spotify:", error);
            }
        };

        fetchSpotifyData();
    }, [accessToken]);

    const handleLogout = () => {
        logout();
        localStorage.clear();
        navigate("/login");
    };    return (
        <div className="dashboard-container">
            <div className="dashboard-card">
                {userState.checking ? (
                    <div className="loading-container">
                        <Loader size="large" />
                    </div>
                ) : userState.user ? (
                    <>
                        <h1 className="dashboard-title">¡Bienvenido a tu Dashboard!</h1>
                        <div className="user-info">
                            <img
                                src={
                                    spotifyProfile?.images?.[0]?.url ||
                                    userState.user.photoURL ||
                                    "https://via.placeholder.com/150"
                                }
                                alt="User avatar"
                                className="user-avatar"
                            />
                            <div className="user-details">
                                <h2 className="user-name">
                                    {spotifyProfile?.display_name || userState.user.displayName || "Usuario"}
                                </h2>
                                <p className="info-text">
                                    <strong>Email:</strong> {spotifyProfile?.email || userState.user.email}
                                </p>
                                <p className="info-text">
                                    <strong>ID de Usuario:</strong> {userState.user.uid}
                                </p>
                            </div>

                            {accessToken && (
                                <div className="spotify-section">
                                    <h2 className="section-title">
                                        🎧 Tu música en Spotify
                                    </h2>

                                    <div>
                                        <h3 className="section-title subsection">
                                            🎵 Reproducidas recientemente
                                        </h3>
                                        <ul className="track-list">
                                            {recentTracks.map((item, index) => (
                                                <li key={index} className="track-item">
                                                    {item.track.name}
                                                    <div className="info-text">
                                                        {item.track.artists.map(artist => artist.name).join(", ")}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>

                                        <h3 className="section-title subsection">
                                            🌟 Artistas favoritos
                                        </h3>
                                        <ul className="track-list">
                                            {topArtists.map((artist, index) => (
                                                <li key={index} className="track-item">
                                                    {artist.name}
                                                </li>
                                            ))}
                                        </ul>

                                        <h3 className="section-title subsection">
                                            🎶 Canciones favoritas
                                        </h3>
                                        <ul className="track-list">
                                            {topTracks.map((track, index) => (
                                                <li key={index} className="track-item">
                                                    {track.name}
                                                    <div className="info-text">
                                                        {track.artists.map(artist => artist.name).join(", ")}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            <button 
                                className="logout-btn"
                                onClick={handleLogout}
                            >
                                Cerrar sesión
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="user-info">
                        <p className="info-text">
                            No hay información de usuario disponible.
                            Por favor, inicia sesión nuevamente.
                        </p>
                        <button 
                            className="logout-btn"
                            onClick={() => navigate("/login")}
                        >
                            Ir al Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// Los estilos han sido movidos a src/styles/dashboard.css

// Eliminamos la exportación por defecto para mantener consistencia
