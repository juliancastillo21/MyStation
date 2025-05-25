import { getApp, getApps } from 'firebase/app';
import { getAuth, fetchSignInMethodsForEmail } from 'firebase/auth';

/**
 * Verifica el estado actual de la autenticación de Firebase
 * @returns Información detallada sobre el estado de la autenticación
 */
export function checkAuthenticationStatus() {
  try {
    // Verificamos si hay alguna app inicializada
    const apps = getApps();
    if (apps.length === 0) {
      console.error("No hay aplicaciones Firebase inicializadas");
      return {
        appInitialized: false,
        authInitialized: false,
        appName: null,
        projectId: null,
        authDomain: null,
        hasApiKey: false,
        error: "No hay aplicaciones Firebase inicializadas"
      };
    }
    
    const app = getApp();
    const auth = getAuth(app);
    
    const status = {
      appInitialized: !!app,
      authInitialized: !!auth,
      appName: app ? app.name : null,
      projectId: app && app.options ? app.options.projectId : null,
      authDomain: app && app.options ? app.options.authDomain : null,
      apiKey: app && app.options ? app.options.apiKey : null,
      hasApiKey: app && app.options ? !!app.options.apiKey : false,
      currentURL: window.location.origin
    };
    
    console.log("Estado actual de Firebase Authentication:", status);
    return status;
    
  } catch (error) {
    console.error("Error al verificar estado de autenticación:", error);
    return {
      appInitialized: false,
      authInitialized: false,
      appName: null,
      projectId: null,
      authDomain: null,
      hasApiKey: false,
      error: error
    };
  }
}

/**
 * Verifica si Firebase está correctamente configurado para la autenticación
 * @returns Un objeto con el estado de configuración y detalles
 */
export function isFirebaseAuthConfigured() {
  const status = checkAuthenticationStatus();
  
  // Verificamos que los componentes básicos estén inicializados y tengan valores
  const isConfigured = status.appInitialized && 
                      status.authInitialized && 
                      status.projectId && 
                      status.authDomain && 
                      status.hasApiKey;
  
  // Información detallada sobre la configuración
  const details = {
    isConfigured,
    status,
    problems: [] as string[]
  };
  
  // Identificar problemas específicos
  if (!status.appInitialized) details.problems.push('App de Firebase no inicializada');
  if (!status.authInitialized) details.problems.push('Autenticación de Firebase no inicializada');
  if (!status.projectId) details.problems.push('Project ID no configurado');
  if (!status.authDomain) details.problems.push('Auth domain no configurado');
  if (!status.hasApiKey) details.problems.push('API key no configurada');
  
  // Verificar si el dominio actual podría no estar autorizado
  if (status.authDomain && status.currentURL) {
    const authDomainURL = `https://${status.authDomain}`;
    if (!status.currentURL.includes(status.authDomain) && 
        !status.currentURL.includes('localhost') && 
        !status.currentURL.includes('127.0.0.1')) {
      details.problems.push(`El dominio actual (${status.currentURL}) podría no estar autorizado en Firebase`);
    }
  }
  
  console.log("¿Firebase Auth está correctamente configurado?", isConfigured);
  console.log("Detalles de la configuración:", details);
  
  return details;
}
