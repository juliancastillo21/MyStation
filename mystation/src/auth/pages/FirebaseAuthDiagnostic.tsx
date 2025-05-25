import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auth, googleProvider } from '../../firebase/config';
import { isFirebaseAuthConfigured } from '../../firebase/auth-status-checker';
import { verifyFirebaseAuth } from '../../firebase/auth-verifier';

// Estilos para la página de diagnóstico
const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    backgroundColor: '#f4f4f4',
    padding: '15px',
    borderRadius: '5px',
    marginBottom: '20px',
  },
  section: {
    marginBottom: '25px',
    padding: '15px',
    border: '1px solid #ddd',
    borderRadius: '5px',
  },
  sectionTitle: {
    borderBottom: '1px solid #eee',
    paddingBottom: '10px',
    marginBottom: '15px',
  },
  item: {
    padding: '8px 0',
  },
  label: {
    fontWeight: 'bold',
    marginRight: '8px',
  },
  success: {
    color: 'green',
  },
  error: {
    color: 'red',
  },
  warning: {
    color: 'orange',
  },
  infoText: {
    backgroundColor: '#e8f4fd',
    padding: '10px',
    borderRadius: '5px',
    fontSize: '0.9em',
  },
  backLink: {
    display: 'inline-block',
    marginTop: '20px',
    padding: '8px 16px',
    backgroundColor: '#4A90E2',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '4px',
  }
};

const FirebaseAuthDiagnostic: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [authConfig, setAuthConfig] = useState<any>(null);
  const [authProviders, setAuthProviders] = useState<any>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  useEffect(() => {
    const runDiagnostics = async () => {
      try {
        // Verificar configuración de Firebase
        const configDetails = isFirebaseAuthConfigured();
        setAuthConfig(configDetails);
        
        // Si hay problemas, añadirlos a los errores
        if (configDetails && configDetails.problems && configDetails.problems.length > 0) {
          setErrors(prev => [...prev, ...configDetails.problems]);
        }
        
        // Verificar proveedores de autenticación
        const providers = verifyFirebaseAuth();
        setAuthProviders(providers);
        
        // Añadir advertencias basadas en el estado de los proveedores
        if (!providers.emailPasswordEnabled) {
          setWarnings(prev => [...prev, "La autenticación por email/password podría no estar habilitada"]);
        }
        if (!providers.googleEnabled) {
          setWarnings(prev => [...prev, "La autenticación con Google podría no estar correctamente configurada"]);
        }
        
        // Verificar si estamos en localhost o en un dominio que podría no estar autorizado
        const currentDomain = window.location.origin;
        const authDomain = auth?.app?.options?.authDomain;
        
        if (authDomain && 
            !currentDomain.includes('localhost') && 
            !currentDomain.includes('127.0.0.1') && 
            !currentDomain.includes(authDomain)) {
          setWarnings(prev => [...prev, `El dominio actual (${currentDomain}) podría no estar autorizado en Firebase. Verifica los dominios autorizados en la consola de Firebase.`]);
        }
        
      } catch (error) {
        console.error("Error en diagnóstico:", error);
        setErrors(prev => [...prev, `Error al ejecutar diagnóstico: ${error}`]);
      } finally {
        setLoading(false);
      }
    };

    runDiagnostics();
  }, []);

  if (loading) {
    return <div style={styles.container}>Ejecutando diagnóstico de Firebase Auth...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Diagnóstico de Firebase Authentication</h1>
        <p>Esta página muestra el estado actual de la configuración de autenticación de Firebase.</p>
      </div>

      {errors.length > 0 && (
        <div style={{...styles.section, borderColor: 'red', backgroundColor: '#ffebee'}}>
          <h2 style={styles.sectionTitle}>Errores Críticos</h2>
          <ul>
            {errors.map((error, index) => (
              <li key={index} style={styles.error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {warnings.length > 0 && (
        <div style={{...styles.section, borderColor: 'orange', backgroundColor: '#fff8e1'}}>
          <h2 style={styles.sectionTitle}>Advertencias</h2>
          <ul>
            {warnings.map((warning, index) => (
              <li key={index} style={styles.warning}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Configuración de Firebase</h2>
        {authConfig && (
          <div>
            <div style={styles.item}>
              <span style={styles.label}>App Inicializada:</span> 
              <span style={authConfig.status?.appInitialized ? styles.success : styles.error}>
                {authConfig.status?.appInitialized ? "Sí ✓" : "No ✗"}
              </span>
            </div>
            <div style={styles.item}>
              <span style={styles.label}>Auth Inicializado:</span> 
              <span style={authConfig.status?.authInitialized ? styles.success : styles.error}>
                {authConfig.status?.authInitialized ? "Sí ✓" : "No ✗"}
              </span>
            </div>
            <div style={styles.item}>
              <span style={styles.label}>Nombre de App:</span> {authConfig.status?.appName || "N/A"}
            </div>
            <div style={styles.item}>
              <span style={styles.label}>Project ID:</span> {authConfig.status?.projectId || "No configurado ✗"}
            </div>
            <div style={styles.item}>
              <span style={styles.label}>Auth Domain:</span> {authConfig.status?.authDomain || "No configurado ✗"}
            </div>
            <div style={styles.item}>
              <span style={styles.label}>API Key:</span> 
              <span style={authConfig.status?.hasApiKey ? styles.success : styles.error}>
                {authConfig.status?.hasApiKey ? "Configurada ✓" : "No configurada ✗"}
              </span>
            </div>
            <div style={styles.item}>
              <span style={styles.label}>Dominio Actual:</span> {authConfig.status?.currentURL || window.location.origin}
            </div>
          </div>
        )}
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Estado de Proveedores de Autenticación</h2>
        {authProviders ? (
          <div>
            <div style={styles.item}>
              <span style={styles.label}>Email/Password:</span> 
              <span style={authProviders.emailPasswordEnabled ? styles.success : styles.warning}>
                {authProviders.emailPasswordEnabled ? "Habilitado ✓" : "No verificado ⚠️"}
              </span>
            </div>
            <div style={styles.item}>
              <span style={styles.label}>Google:</span> 
              <span style={authProviders.googleEnabled ? styles.success : styles.warning}>
                {authProviders.googleEnabled ? "Configurado ✓" : "No configurado correctamente ⚠️"}
              </span>
            </div>
            <div style={styles.item}>
              <span style={styles.label}>Facebook:</span> 
              <span style={authProviders.facebookEnabled ? styles.success : styles.warning}>
                {authProviders.facebookEnabled ? "Configurado ✓" : "No verificado ⚠️"}
              </span>
            </div>
          </div>
        ) : (
          <p style={styles.error}>No se pudo obtener información de los proveedores de autenticación</p>
        )}

        {authProviders && authProviders.recommendations && (
          <div style={{...styles.infoText, marginTop: '15px'}}>
            <h3>Recomendaciones:</h3>
            <ul>
              {authProviders.recommendations.map((rec: string, index: number) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Pasos para resolver problemas comunes</h2>
        <ol>
          <li style={{marginBottom: '10px'}}>
            <strong>Habilitar métodos de autenticación:</strong> Ve a la consola de Firebase &gt; Authentication &gt; Sign-in method y asegúrate de que los métodos que necesitas estén habilitados.
          </li>
          <li style={{marginBottom: '10px'}}>
            <strong>Autorizar dominios:</strong> En la misma sección, ve a la pestaña "Authorized domains" y asegúrate de que tu dominio esté en la lista.
          </li>
          <li style={{marginBottom: '10px'}}>
            <strong>Verificar API Key:</strong> Asegúrate de que tu API key no tenga restricciones que impidan su uso para autenticación.
          </li>
          <li style={{marginBottom: '10px'}}>
            <strong>Configuración correcta:</strong> Verifica que todos los valores en tu archivo de configuración de Firebase coincidan exactamente con los de tu proyecto en la consola de Firebase.
          </li>
        </ol>
      </div>

      <Link to="/login" style={styles.backLink}>Volver a Inicio de Sesión</Link>
    </div>
  );
};

export default FirebaseAuthDiagnostic;
