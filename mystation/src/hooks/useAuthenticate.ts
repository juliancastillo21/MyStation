import { Dispatch } from 'react';
import { AuthAction, User, authTypes } from '../auth/types/authTypes';
import { loginWithEmailPassword, logoutFirebase } from '../firebase/auth.ts';

export interface UseAuthenticateReturn {
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

export const useAuthenticate = (dispatch: Dispatch<AuthAction>): UseAuthenticateReturn => {
    const login = async (email: string, password: string): Promise<void> => {
        dispatch({ type: authTypes.checkingFinish }); // Iniciar el checking
        try {
            const user = await loginWithEmailPassword(email, password);
            if (user) {
                const userData: User = {
                    uid: user.uid,
                    email: user.email || '',
                    displayName: user.displayName || undefined,
                    photoURL: user.photoURL || undefined
                };
                
                localStorage.setItem('user', JSON.stringify(userData));
                dispatch({
                    type: authTypes.login,
                    payload: userData
                });
            }
        } catch (error) {
            console.error('Error in login:', error);
            dispatch({
                type: authTypes.errors,
                payload: error instanceof Error ? error.message : 'Error en el inicio de sesión'
            });
            throw error; // Propagar el error para manejo en componentes
        }
    };

    const logout = async (): Promise<void> => {
        try {
            await logoutFirebase();
            localStorage.removeItem('user');
            dispatch({ type: authTypes.logout });
        } catch (error) {
            console.error('Error in logout:', error);
            dispatch({
                type: authTypes.errors,
                payload: error instanceof Error ? error.message : 'Error al cerrar sesión'
            });
            throw error; // Propagar el error para manejo en componentes
        }
    };

    return { login, logout };
};