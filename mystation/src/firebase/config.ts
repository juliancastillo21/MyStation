import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCK8_cjKtFLVip10hh_j_QbSfHk8iAz83M",
  authDomain: "my-status2.firebaseapp.com",
  projectId: "my-status2",
  storageBucket: "my-status2.firebasestorage.app",
  messagingSenderId: "1070715956882",
  appId: "1:1070715956882:web:889ed608c3591d66a1c04b",
  measurementId: "G-L6WGVB7RMC"
};
// Validar configuración mínima requerida
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
    console.error("❌ Configuración de Firebase incompleta. Verifica apiKey, authDomain y projectId.");
}

// Variables para exportar
let app;
let auth;
let googleProvider;
let facebookProvider;

try {
    // Verificar si Firebase ya está inicializado
    const apps = getApps();
    if (apps.length === 0) {
        console.log("📲 Inicializando Firebase por primera vez...");
        app = initializeApp(firebaseConfig);
        console.log("✅ Firebase inicializado correctamente:", app.name);
    } else {
        app = getApp();
        console.log("ℹ️ Usando instancia existente de Firebase:", app.name);
    }

    // Inicializar auth
    auth = getAuth(app);
    console.log("🔐 Auth inicializado con authDomain:", auth.app.options.authDomain);
    
    // Configurar el proveedor de Google
    googleProvider = new GoogleAuthProvider();
    // Añadir todos los scopes necesarios para mejorar la experiencia
    googleProvider.addScope('profile');
    googleProvider.addScope('email');
    googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
    googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');
    
    // Configurar parámetros personalizados - estos son importantes
    googleProvider.setCustomParameters({
        prompt: 'select_account',
        access_type: 'offline', // Para obtener un refresh token
        login_hint: '' // Opcional, si quieres pre-llenar el email
    });
    
    // Inicializar proveedor de Facebook
    facebookProvider = new FacebookAuthProvider();
    
    console.log("🔄 Proveedores de autenticación configurados");
} catch (error) {
    console.error("❌ Error al inicializar Firebase:", error);
    throw new Error("No se pudo inicializar Firebase correctamente");
}

// Exportar las instancias inicializadas
export { app, auth, googleProvider, facebookProvider };

// Verificar que auth está disponible
if (auth) {
    console.log("Autenticación de Firebase inicializada correctamente");
    // Verificamos y mostramos la información del tenant
    console.log("Información del proyecto Firebase:");
    console.log("- authDomain:", auth.app.options.authDomain);
    console.log("- projectId:", auth.app.options.projectId);
} else {
    console.error("ATENCIÓN: La autenticación de Firebase NO está inicializada correctamente");
}
