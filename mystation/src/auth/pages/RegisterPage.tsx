import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerWithEmailPassword } from '../../firebase/auth';
import { checkFirebaseStatus } from '../../firebase/checkStatus';
import { verifyFirebaseAuth } from '../../firebase/auth-verifier';
import { isFirebaseAuthConfigured } from '../../firebase/auth-status-checker';
import '../../styles/login.css';

interface RegisterForm {
    email: string;
    password: string;
    confirmPassword: string;
}

export const RegisterPage: React.FC = () => {
    const [form, setForm] = useState<RegisterForm>({ email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState<string | null>(null);
    const [firebaseStatus, setFirebaseStatus] = useState<any>(null);
    const navigate = useNavigate();    useEffect(() => {
        // Verificamos el estado de Firebase cuando el componente se monta
        const status = checkFirebaseStatus();
        console.log("Estado de Firebase:", status);
        setFirebaseStatus(status);
        
        if (!status.initialized) {
            setError("Error: Firebase no está inicializado correctamente");
            return;
        }        
        
        // Verificación avanzada de configuración de Firebase
        const isAuthConfigured = isFirebaseAuthConfigured();
        console.log("¿Firebase Auth está configurado correctamente?", isAuthConfigured);
        
        if (!isAuthConfigured) {
            console.warn("Configuración de Firebase Auth incompleta, la autenticación podría fallar");
        }
        
        // Verificar si la autenticación por email/password está habilitada
        const checkEmailAuthEnabled = async () => {
            try {
                console.log("Intentando verificar los proveedores de autenticación...");
                const providersStatus = verifyFirebaseAuth();
                console.log("Estado de proveedores:", providersStatus);
                
                if (providersStatus && !providersStatus.emailPasswordEnabled) {
                    setError("Error: La autenticación por email/password no está habilitada en Firebase. Por favor, contacta al administrador.");
                }
            } catch (error) {
                console.error("Error al verificar proveedores:", error);
                // No mostramos error al usuario para no bloquear el registro
                // si la verificación falla, pero mostramos un log en la consola
            }
        };
        
        // Intentamos verificar los proveedores, pero continuamos aunque falle
        checkEmailAuthEnabled().catch(err => {
            console.error("Error en la verificación de proveedores:", err);
        });
    }, []);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };    const validatePassword = (password: string): string | null => {
        // Validamos longitud mínima de contraseña
        if (password.length < 6) {
            return 'La contraseña debe tener al menos 6 caracteres';
        }
        
        // Firebase requiere contraseñas de al menos 6 caracteres
        // También podemos añadir más validaciones si se necesitan
        /*
        // Validación de complejidad adicional si la necesitamos en el futuro
        if (!/[A-Z]/.test(password)) {
            return 'La contraseña debe contener al menos una letra mayúscula';
        }
        if (!/[0-9]/.test(password)) {
            return 'La contraseña debe contener al menos un número';
        }
        */
        
        return null;
    };

    const onRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Iniciando proceso de registro...");
        setError(null); // Limpiar errores previos
        
        const { email, password, confirmPassword } = form;

        if (password !== confirmPassword) {
            console.log("Error: Las contraseñas no coinciden");
            return setError('Las contraseñas no coinciden');
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
            console.log("Error de validación:", passwordError);
            return setError(passwordError);
        }        try {
            console.log("Intentando registrar usuario con email:", email);
            console.log("Firebase status antes de registro:", firebaseStatus);
            
            // Verificación adicional antes de registrar
            if (!firebaseStatus?.initialized) {
                setError("Firebase no está inicializado correctamente. Por favor, recarga la página.");
                return;
            }
            
            const user = await registerWithEmailPassword(email, password);
            console.log("Usuario registrado exitosamente:", user);
            
            // Guarda el éxito en localStorage para fines de depuración
            localStorage.setItem("registration_success", "true");
            
            // Redirección explícita
            console.log("Redirigiendo a /login");
            navigate('/login');
        } catch (error: any) {
            console.error('Error registrando usuario:', error);
            
            // Manejar errores específicos de Firebase
            if (error.code === 'auth/email-already-in-use') {
                setError('Este correo electrónico ya está en uso');
            } else if (error.code === 'auth/invalid-email') {
                setError('El formato del correo electrónico es inválido');
            } else if (error.code === 'auth/weak-password') {
                setError('La contraseña es demasiado débil. Debe tener al menos 6 caracteres');            } else if (error.code === 'auth/operation-not-allowed') {
                setError('El registro con email/password no está habilitado en Firebase');
            } else if (error.code === 'auth/configuration-not-found') {
                setError('Error de configuración en Firebase. La autenticación por email/password podría no estar habilitada o el proyecto no está correctamente configurado.');
            } else if (error.code === 'auth/network-request-failed') {
                setError('Error de conexión a internet. Verifica tu red.');
            } else if (error.code === 'auth/too-many-requests') {
                setError('Demasiados intentos fallidos. Intenta más tarde.');
            } else if (error instanceof Error) {
                setError(error.message);
            } else {
                setError('Error al registrar usuario. Verifica la consola para más detalles.');
            }
            
            // Log detallado para fines de depuración
            console.log("Detalles completos del error:", {
                code: error.code,
                message: error.message,
                fullError: error
            });
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Crear cuenta</h2>
                
                {error && (
                    <div className="error-message" style={{
                        background: "#ffebee", 
                        color: "#c62828",
                        padding: "10px",
                        borderRadius: "4px",
                        marginBottom: "15px",
                        textAlign: "center"
                    }}>
                        {error}
                    </div>
                )}
                
                <form onSubmit={onRegister} className="login-form">
                    <div className="form-group">
                        <input
                            type="email"
                            name="email"
                            placeholder="Correo electrónico"
                            value={form.email}
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            name="password"
                            placeholder="Contraseña"
                            value={form.password}
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirmar contraseña"
                            value={form.confirmPassword}
                            onChange={onChange}
                            required
                        />
                    </div>
                    <button type="submit" className="login-button">
                        Registrarse
                    </button>
                </form>
                  <p className="register-link">
                    ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
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
