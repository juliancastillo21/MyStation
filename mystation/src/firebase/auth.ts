import { 
    signInWithPopup, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    UserCredential,
    User
} from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from './config';

export const signInWithGoogle = async (): Promise<User | undefined> => {
    try {
        console.log("🔶 Iniciando proceso de autenticación con Google...");
        console.log("Estado de autenticación:", auth ? "✓ Auth inicializado" : "✗ Auth NO inicializado");
        
        // Verificación preliminar de configuración
        if (!auth) {
            console.error("✗ Auth no está inicializado, no se puede continuar");
            throw new Error("Firebase Auth no está inicializado correctamente");
        }
        
        // Validar configuración completa
        if (auth && auth.app) {
            console.log("📋 Información de autenticación con Google:");
            console.log("- authDomain:", auth.app.options.authDomain);
            console.log("- projectId:", auth.app.options.projectId);
            console.log("- apiKey presente:", !!auth.app.options.apiKey);
            console.log("- URL actual:", window.location.origin);
            
            // Validar si el dominio puede ser un problema
            if (!window.location.origin.includes('localhost') && 
                !window.location.origin.includes('127.0.0.1') && 
                !window.location.origin.includes(auth.app.options.authDomain)) {
                console.warn("⚠️ El dominio actual podría no estar autorizado en Firebase");
            }
        }
        
        // Verificar que el proveedor de Google esté configurado
        if (!googleProvider) {
            console.error("✗ El proveedor de Google no está configurado");
            throw new Error("Proveedor de Google no configurado correctamente");
        }
        
        console.log("🔄 Iniciando popup de autenticación con Google...");
        
        // Intentar iniciar sesión con Google con reintentos
        try {
            const result = await signInWithPopup(auth, googleProvider);
            console.log("✅ Autenticación con Google exitosa");
            console.log("- Usuario:", result.user.email);
            console.log("- UID:", result.user.uid);
            return result.user;
        } catch (popupError: any) {
            // Si es un error de configuración, intentamos una vez más con redirección
            if (popupError.code === 'auth/configuration-not-found') {
                console.warn("⚠️ Reintentando con método alternativo...");
                
                // Aquí podrías implementar un método alternativo
                // Por ahora solo propagamos el error con información adicional
                throw {
                    ...popupError,
                    message: "Error de configuración en Firebase. La autenticación con Google no está habilitada o el dominio no está autorizado."
                };
            }
            throw popupError;
        }
    } catch (error: any) {
        console.error("❌ Error al iniciar sesión con Google:", error);
        
        // Análisis detallado del error
        if (error.code === 'auth/configuration-not-found') {
            console.error("Error de configuración en Firebase para Google Auth:");
            console.error("1. Verifica que la autenticación con Google esté habilitada en la consola de Firebase");
            console.error("2. Confirma que el dominio actual esté en la lista de dominios autorizados");
            console.error("3. Asegúrate que la API key no tenga restricciones que bloqueen la autenticación");
            console.error("4. Verifica que el proyecto de Firebase esté correctamente configurado");
            
            // Enriquecer el error para mejor manejo en la UI
            error.uiMessage = "No se pudo iniciar sesión con Google debido a un error de configuración. Por favor contacta al administrador.";
            error.debug = {
                currentDomain: window.location.origin,
                authDomain: auth?.app?.options?.authDomain,
                apiKeyPresent: !!auth?.app?.options?.apiKey
            };
        } else if (error.code === 'auth/popup-closed-by-user') {
            error.uiMessage = "Cerraste la ventana de Google antes de completar el inicio de sesión.";
        } else if (error.code === 'auth/cancelled-popup-request') {
            error.uiMessage = "La solicitud de inicio de sesión fue cancelada.";
        } else if (error.code === 'auth/popup-blocked') {
            error.uiMessage = "El navegador bloqueó la ventana emergente. Por favor permite ventanas emergentes para este sitio.";
        } else {
            error.uiMessage = "Error al iniciar sesión con Google. Por favor intenta nuevamente.";
        }
        
        throw error;
    }
};

export const signInWithFacebook = async (): Promise<User | undefined> => {
    try {
        const result = await signInWithPopup(auth, facebookProvider);
        const user = result.user;
        return user;
    } catch (error) {
        console.error("Error al iniciar sesión con Facebook", error);
        throw error;
    }
};

export const loginWithEmailPassword = async (email: string, password: string): Promise<User> => {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return result.user;
    } catch (error) {
        console.error("Error al iniciar sesión con email/password", error);
        throw error;
    }
};

export const registerWithEmailPassword = async (email: string, password: string): Promise<User> => {
    try {
        console.log("Intentando registrar con email:", email);
        console.log("Longitud de contraseña:", password.length);
        console.log("Estado de autenticación:", auth ? "Auth inicializado" : "Auth NO inicializado");
        
        // Verificamos información del proyecto
        if (auth && auth.app) {
            console.log("Información de la app para registro:");
            console.log("- authDomain:", auth.app.options.authDomain);
            console.log("- projectId:", auth.app.options.projectId);
            console.log("- apiKey presente:", !!auth.app.options.apiKey);
        }
        
        // Validación local adicional
        if (password.length < 6) {
            throw { code: 'auth/weak-password', message: 'La contraseña debe tener al menos 6 caracteres.' };
        }
        
        // Validar formato de email con regex básico
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw { code: 'auth/invalid-email', message: 'Formato de email inválido.' };
        }
        
        // Verificar si auth está disponible
        if (!auth) {
            throw new Error("Auth no está inicializado correctamente");
        }
        
        // Intentar crear el usuario con manejo de reintentos
        try {
            console.log("Ejecutando createUserWithEmailAndPassword...");
            const result = await createUserWithEmailAndPassword(auth, email, password);
            console.log("Usuario creado exitosamente:", result.user);
            return result.user;
        } catch (createError: any) {
            // Manejar específicamente el error de configuración
            if (createError.code === 'auth/configuration-not-found') {
                console.error("Error de configuración de Firebase. Asegúrate de que:");
                console.error("1. La autenticación por email/password está habilitada en la consola de Firebase");
                console.error("2. La API key es correcta y está activa");
                console.error("3. El proyecto de Firebase está correctamente configurado");
                throw {
                    code: 'auth/configuration-not-found',
                    message: 'La autenticación por email/password no está habilitada o hay un problema con la configuración de Firebase. Por favor, contacta al administrador.'
                };
            }
            throw createError;
        }
    } catch (error: any) {
        console.error("Error al registrar usuario:", error);
        console.error("Código de error:", error.code);
        console.error("Mensaje de error:", error.message);
        
        // Log adicional para depuración
        if (error.code === 'auth/configuration-not-found') {
            console.error("Error de configuración de Firebase. Verifique que la configuración sea correcta y que la app esté registrada en Firebase.");
        } else if (error.code === 'auth/email-already-in-use') {
            console.error("El email ya está en uso. Intente con otro email.");
        } else if (error.code === 'auth/invalid-email') {
            console.error("Formato de email inválido.");
        } else if (error.code === 'auth/weak-password') {
            console.error("La contraseña es demasiado débil. Debe tener al menos 6 caracteres.");
        } else if (error.code === 'auth/operation-not-allowed') {
            console.error("La operación no está permitida. Verifica que la autenticación por email/contraseña esté habilitada en Firebase.");
        } else if (error.code === 'auth/network-request-failed') {
            console.error("Error de red. Verifica tu conexión a internet.");
        }
        
        throw error;
    }
};

export const logoutFirebase = async (): Promise<void> => {
    try {
        await auth.signOut();
    } catch (error) {
        console.error("Error al cerrar sesión", error);
        throw error;
    }
};
