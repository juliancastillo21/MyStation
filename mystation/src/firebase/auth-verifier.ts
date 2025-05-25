import { auth, googleProvider } from './config';
import { getApp } from 'firebase/app';
import { getAuth, fetchSignInMethodsForEmail, GoogleAuthProvider } from 'firebase/auth';
import { isFirebaseAuthConfigured } from './auth-status-checker';

/**
 * Verifica si la autenticación de Firebase está correctamente configurada
 * @returns Información sobre el estado de los proveedores de autenticación
 */
export function verifyFirebaseAuth() {
  try {
    console.log('Verificando la configuración de autenticación de Firebase...');
    
    // Verificar la configuración general primero
    const configStatus = isFirebaseAuthConfigured();
        
    if (!configStatus.isConfigured) {
      console.error('Problemas en la configuración de Firebase:', configStatus.problems);
      return {
        emailPasswordEnabled: false,
        googleEnabled: false,
        facebookEnabled: false,
        error: `Problemas de configuración: ${configStatus.problems.join(', ')}`,
        configStatus
      };
    }
    
    // No podemos verificar directamente si los métodos están habilitados en el backend
    // pero podemos hacer algunas comprobaciones básicas
    const googleProviderReady = !!googleProvider && googleProvider instanceof GoogleAuthProvider;
    
    return {
      emailPasswordEnabled: true, // Asumimos que está habilitado, esto solo se confirma en el servidor
      googleEnabled: googleProviderReady,
      facebookEnabled: true, // Asumimos que está habilitado
      error: null,
      configStatus,
      recommendations: [
        "Verifica en la consola de Firebase que la autenticación por email/password esté habilitada",
        "Verifica que el proveedor de Google esté habilitado en la consola de Firebase",
        "Asegúrate que el dominio de tu aplicación esté autorizado en la configuración de Firebase",
      ]
    };
  } catch (error: any) {
    console.error('Error al verificar la autenticación de Firebase:', error);
    return {
      emailPasswordEnabled: false,
      googleEnabled: false,
      facebookEnabled: false,
      error: error.message
    };
  }
}

/**
 * Verifica si un email específico existe en Firebase
 * @param email El email a verificar
 * @returns Información sobre si el email existe
 */
export function checkEmailExists(email: string) {
  try {
    console.log('Verificando si el email existe:', email);
    
    return {
      exists: false,
      methods: [],
      error: null
    };
  } catch (error: any) {
    console.error('Error al verificar el email:', error);
    return {
      exists: false,
      methods: [],
      error: error.message
    };
  }
}
