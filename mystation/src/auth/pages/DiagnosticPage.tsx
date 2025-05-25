import React, { useState, useEffect } from 'react';
import { auth } from '../../firebase/config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { verifyFirebaseAuth } from '../../firebase/auth-verifier';

const DiagnosticPage = () => {
    const [result, setResult] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    // Test email y contraseña único para diagnóstico
    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = 'Test123456';    const runDiagnostic = async () => {
        setLoading(true);
        setResult('');
        setError('');
        
        try {
            // 1. Verificar que auth está inicializado
            if (!auth) {
                throw new Error('Auth no está inicializado');
            }
              setResult(prev => prev + '✓ Auth está inicializado\n');              // Verificar si la autenticación por email/password está habilitada
            let emailAuthEnabled = false;
            try {
                const providersStatus = verifyFirebaseAuth();
                emailAuthEnabled = !!providersStatus.emailPasswordEnabled;
                
                if (providersStatus.error) {
                    setResult(prev => prev + `⚠️ No se pudo verificar los proveedores de autenticación: ${providersStatus.error}\n`);
                } else {
                    setResult(prev => prev + `✓ Autenticación por Email/Password: ${providersStatus.emailPasswordEnabled ? 'HABILITADA' : 'NO HABILITADA'}\n`);
                    setResult(prev => prev + `✓ Autenticación por Google: ${providersStatus.googleEnabled ? 'HABILITADA' : 'NO HABILITADA'}\n`);
                    setResult(prev => prev + `✓ Autenticación por Facebook: ${providersStatus.facebookEnabled ? 'HABILITADA' : 'NO HABILITADA'}\n`);
                }
            } catch (err) {
                console.error("Error al verificar proveedores:", err);
                setResult(prev => prev + `⚠️ Error al verificar proveedores de autenticación. Ver consola para detalles.\n`);
                // Por defecto, asumimos que está habilitado para permitir la prueba
                emailAuthEnabled = true;
            }
            
            // Solo intentar crear un usuario si Email/Password está habilitado
            if (emailAuthEnabled) {
                // 2. Intentar crear un usuario de prueba
                console.log('Intentando crear usuario de prueba:', testEmail);
                try {
                    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
                    setResult(prev => prev + `✓ Usuario de prueba creado con éxito: ${userCredential.user.uid}\n`);
                    
                    // Eliminar el usuario de prueba si se creó exitosamente
                    try {
                        await userCredential.user.delete();
                        setResult(prev => prev + '✓ Usuario de prueba eliminado correctamente\n');
                    } catch (deleteErr) {
                        console.error('Error al eliminar usuario de prueba:', deleteErr);
                        setResult(prev => prev + '⚠️ No se pudo eliminar el usuario de prueba automáticamente\n');
                    }
                } catch (authError: any) {
                    console.error('Error de autenticación:', authError);
                    
                    if (authError.code === 'auth/email-already-in-use') {
                        setResult(prev => prev + '✓ Autenticación funciona, pero el email ya está en uso\n');
                    } else if (authError.code === 'auth/operation-not-allowed') {
                        setError('❌ La autenticación por email/password NO está habilitada en Firebase. Ve a la consola de Firebase, sección Authentication > Sign-in method y habilita Email/Password.');
                    } else {
                        setError(`❌ Error al probar la autenticación: ${authError.message} (${authError.code})\n`);
                    }
                }
            } else {
                setError('❌ La autenticación por email/password NO está habilitada en Firebase. Ve a la consola de Firebase, sección Authentication > Sign-in method y habilita Email/Password.');
            }
            
            // 3. Mostrar información de configuración (sin exponer claves)
            setResult(prev => prev + `\nInformación de configuración:\n`);
            setResult(prev => prev + `- authDomain: ${auth.app.options.authDomain}\n`);
            setResult(prev => prev + `- projectId: ${auth.app.options.projectId}\n`);
            
        } catch (error: any) {
            console.error('Error diagnóstico general:', error);
            setError(`Error en el diagnóstico: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'monospace' }}>
            <h1>Diagnóstico de Firebase Authentication</h1>
            
            <button 
                onClick={runDiagnostic} 
                disabled={loading}
                style={{
                    padding: '10px 20px',
                    backgroundColor: '#4285F4',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: loading ? 'wait' : 'pointer',
                    marginBottom: '20px'
                }}
            >
                {loading ? 'Ejecutando diagnóstico...' : 'Ejecutar diagnóstico'}
            </button>
            
            {loading && <p>Procesando...</p>}
            
            {result && (
                <div style={{ 
                    background: '#f0f0f0', 
                    padding: '15px', 
                    borderRadius: '4px',
                    whiteSpace: 'pre-line'
                }}>
                    <h3>Resultados:</h3>
                    {result}
                </div>
            )}
            
            {error && (
                <div style={{ 
                    background: '#ffebee', 
                    color: '#c62828',
                    padding: '15px', 
                    borderRadius: '4px',
                    marginTop: '20px',
                    whiteSpace: 'pre-line'
                }}>
                    <h3>Error:</h3>
                    {error}
                </div>
            )}
              <div style={{ 
                background: '#e8f5e9', 
                padding: '15px', 
                borderRadius: '4px',
                marginTop: '20px'
            }}>
                <h3>Recomendaciones:</h3>
                <ol>
                    <li>Verifica que la autenticación por Email/Password esté habilitada en la consola de Firebase</li>
                    <li>Asegúrate de que la API key de Firebase es válida</li>
                    <li>Revisa la consola del navegador para ver errores adicionales</li>
                </ol>
                
                <h3>Posibles soluciones para el error 400 (Bad Request):</h3>
                <ol>
                    <li><strong>Habilitar autenticación por email/password</strong>: Ve a la consola de Firebase, sección Authentication {'>'} Sign-in method y habilita Email/Password</li>
                    <li><strong>Verificar longitud de contraseña</strong>: Firebase requiere contraseñas de al menos 6 caracteres</li>
                    <li><strong>Verificar formato de email</strong>: Asegúrate de que el email tenga un formato válido</li>
                    <li><strong>Revisar proyecto de Firebase</strong>: Verifica que el proyecto esté correctamente configurado y activo</li>
                    <li><strong>Comprobar API key</strong>: La API key podría no ser válida o estar restringida por dominio</li>
                </ol>
            </div>
        </div>
    );
};

export default DiagnosticPage;
