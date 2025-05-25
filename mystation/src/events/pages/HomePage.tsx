import { useEffect, useState } from "react";

interface SpotifyUserData {
    display_name?: string;
    email?: string;
    images?: Array<{ url: string }>;
    id?: string;
    country?: string;
    followers?: { total: number };
    product?: string;
}

export const HomePage: React.FC = () => {
    const [userData, setUserData] = useState<SpotifyUserData | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            const accessToken = localStorage.getItem("spotify_access_token");
            if (!accessToken) return;

            try {
                const response = await fetch("https://api.spotify.com/v1/me", {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                const data = await response.json();

                if (response.ok) {
                    setUserData(data);
                } else {
                    console.error("Error al obtener datos de usuario:", data);
                }
            } catch (error) {
                console.error("Error:", error);
            }
        };

        fetchUserData();
    }, []);

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Perfil de Spotify</h1>
            {userData ? (
                <div style={styles.profile}>
                    {userData.images && userData.images[0] && (
                        <img 
                            src={userData.images[0].url} 
                            alt="Profile" 
                            style={styles.avatar} 
                        />
                    )}
                    <h2>{userData.display_name}</h2>
                    <p><strong>Email:</strong> {userData.email}</p>
                    <p><strong>ID:</strong> {userData.id}</p>
                    <p><strong>País:</strong> {userData.country}</p>
                    <p><strong>Seguidores:</strong> {userData.followers?.total}</p>
                    <p><strong>Tipo de cuenta:</strong> {userData.product}</p>
                </div>
            ) : (
                <p>Cargando datos de usuario...</p>
            )}
        </div>
    );
};

const styles = {
    container: {
        maxWidth: "800px",
        margin: "0 auto",
        padding: "2rem",
    },
    title: {
        textAlign: "center" as const,
        color: "#1DB954",
        marginBottom: "2rem",
    },
    profile: {
        backgroundColor: "#fff",
        padding: "2rem",
        borderRadius: "10px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        textAlign: "center" as const,
    },
    avatar: {
        width: "150px",
        height: "150px",
        borderRadius: "50%",
        objectFit: "cover" as const,
        marginBottom: "1rem",
    }
};

// Eliminamos la exportación por defecto ya que estamos usando exportación nombrada
