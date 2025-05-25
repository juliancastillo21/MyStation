import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../auth/contexts/UserContext";

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
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>¡Bienvenido a tu Dashboard!</h1>

                {userState.user ? (
                    <div style={styles.userInfo}>
                        <img
                            src={
                                spotifyProfile?.images?.[0]?.url ||
                                userState.user.photoURL ||
                                "https://via.placeholder.com/150"
                            }
                            alt="User avatar"
                            style={styles.avatar}
                        />
                        <p><strong>Nombre:</strong> {spotifyProfile?.display_name || userState.user.displayName}</p>
                        <p><strong>Email:</strong> {spotifyProfile?.email || userState.user.email}</p>
                        <p><strong>UID:</strong> {userState.user.uid}</p>

                        <button style={styles.logoutBtn} onClick={handleLogout}>
                            Cerrar sesión
                        </button>

                        {accessToken && (
                            <div style={styles.spotifySection}>
                                <h2>🎧 Tu música en Spotify</h2>

                                <h3>🎵 Canciones reproducidas recientemente</h3>
                                <ul>
                                    {recentTracks.map((item, index) => (
                                        <li key={index}>
                                            {item.track.name} – {item.track.artists.map(artist => artist.name).join(", ")}
                                        </li>
                                    ))}
                                </ul>

                                <h3>🌟 Artistas favoritos</h3>
                                <ul>
                                    {topArtists.map((artist, index) => (
                                        <li key={index}>{artist.name}</li>
                                    ))}
                                </ul>

                                <h3>🎶 Canciones favoritas</h3>
                                <ul>
                                    {topTracks.map((track, index) => (
                                        <li key={index}>
                                            {track.name} – {track.artists.map(artist => artist.name).join(", ")}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ) : (
                    <p>No hay información de usuario.</p>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f0f4f8",
    },
    card: {
        background: "white",
        padding: "2rem",
        borderRadius: "10px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        maxWidth: "600px",
        width: "100%",
    },
    title: {
        color: "#1DB954",
        marginBottom: "1.5rem",
        textAlign: "center",
    },
    userInfo: {
        textAlign: "center",
    },
    avatar: {
        width: "120px",
        height: "120px",
        borderRadius: "50%",
        marginBottom: "1rem",
    },
    logoutBtn: {
        backgroundColor: "#dc3545",
        color: "#fff",
        border: "none",
        padding: "0.5rem 1rem",
        borderRadius: "5px",
        cursor: "pointer",
        marginTop: "1rem",
    },
    spotifySection: {
        marginTop: "2rem",
        textAlign: "left",
    },
} as const;

// Eliminamos la exportación por defecto para mantener consistencia
