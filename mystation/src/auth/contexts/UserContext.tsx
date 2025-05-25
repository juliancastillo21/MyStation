import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { useAuthenticate, UseAuthenticateReturn } from "../../hooks/useAuthenticate";
import { authReducer } from "../reducers/authReducer";
import { AuthState, User } from "../types/authTypes";

interface UserContextType extends UseAuthenticateReturn {
    userState: AuthState;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

const authInitialState: AuthState = {
    logged: false,
    user: null,
    errorMessage: null,
    checking: true, // Cambiado a true inicialmente
    spotifyConnected: false
};

const init = (): AuthState => {
    try {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            return {
                ...authInitialState,
                checking: false // Se marca como false después de verificar
            };
        }

        const user = JSON.parse(storedUser) as User;
        return {
            logged: true,
            user,
            errorMessage: null,
            checking: false,
            spotifyConnected: false
        };
    } catch (e) {
        console.warn("Error parsing user from localStorage", e);
        return {
            ...authInitialState,
            checking: false
        };
    }
};

interface UserProviderProps {
    children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {    const [userState, dispatch] = useReducer(authReducer, authInitialState, init);
    const authMethods = useAuthenticate(dispatch);
    
    // Nos aseguramos de que los tipos coincidan exactamente
    const contextValue: UserContextType = {
        userState,
        login: authMethods.login,
        logout: authMethods.logout
    };

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser debe usarse dentro de un UserProvider");
    }
    return context;
};
