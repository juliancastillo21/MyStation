import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { redirectToSpotifyLogin } from '../spotifyAuth';
import '../../styles/login.css';
import {
    signInWithGoogle,
    signInWithFacebook
} from '../../firebase/auth';

interface LoginPageProps {}

export const LoginPage: React.FC<LoginPageProps> = () => {
    const { login } = useUser();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();    useEffect(() => {
        console.log("LoginPage montado");
        
        // Verificar si venimos de un registro exitoso
        const registrationSuccess = localStorage.getItem("registration_success");
        if (registrationSuccess) {
            console.log("Usuario redirigido después de un registro exitoso");
            localStorage.removeItem("registration_success");
        }
        
        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== "http://127.0.0.1:3000") return;
            const user = event.data;
            // ...existing code...
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/');
        } catch (error) {
            console.error('Error logging in:', error);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Iniciar Sesión</h2>
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Correo electrónico"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Contraseña"
                            required
                        />
                    </div>
                    <button type="submit" className="login-button">
                        Iniciar Sesión
                    </button>
                </form>

                <div className="social-login">
                    <button 
                        onClick={() => signInWithGoogle()} 
                        className="google-button"
                    >
                        Continuar con Google
                    </button>
                    <button 
                        onClick={() => signInWithFacebook()} 
                        className="facebook-button"
                    >
                        Continuar con Facebook
                    </button>
                    <button 
                        onClick={redirectToSpotifyLogin} 
                        className="spotify-button"
                    >
                        Continuar con Spotify
                    </button>
                </div>                <p className="register-link">
                    ¿No tienes una cuenta? <Link to="/register">Regístrate</Link>
                </p>
                  <div className="diagnostic-link">
                    <Link to="/firebase-diagnostico">
                        Diagnosticar problemas de autenticación
                    </Link>
                </div>
            </div>
        </div>
    );
};
