// Este archivo es para verificar que Firebase esté correctamente configurado
import { getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

// Función para verificar el estado de Firebase
export const checkFirebaseStatus = () => {
  try {
    const apps = getApps();
    console.log("Firebase apps inicializadas:", apps.length);
    
    if (apps.length > 0) {
      const app = getApp();
      console.log("Firebase app activa:", app.name);
      
      const auth = getAuth(app);
      console.log("Auth inicializado:", !!auth);
      
      return {
        initialized: true,
        appName: app.name,
        authInitialized: !!auth
      };
    }
    
    return {
      initialized: false,
      appName: null,
      authInitialized: false
    };
  } catch (error) {
    console.error("Error verificando Firebase:", error);
    return {
      initialized: false,
      error: error
    };
  }
};
