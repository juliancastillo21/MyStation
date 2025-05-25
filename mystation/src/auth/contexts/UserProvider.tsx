import { useReducer, useContext, ReactNode } from 'react';
import { UserContext } from './UserContext';
import { authReducer } from '../reducers/authReducer';
import { useAuthenticate } from "../../hooks/useAuthenticate";
import { AuthState, User } from '../types/authTypes';

const authInitialState: AuthState = {
    logged: false,
    user: null,
    errorMessage: null,
    checking: true,
    spotifyConnected: false
};

const init = (): AuthState => {
    try {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            return { ...authInitialState, checking: false };
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
        console.warn("Invalid user in localStorage", e);
        return { ...authInitialState, checking: false };
    }
};

interface UserProviderProps {
    children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
    const [userState, dispatch] = useReducer(authReducer, authInitialState, init);
    const { login, logout } = useAuthenticate(dispatch);

    return (
        <UserContext.Provider value={{ userState, login, logout }}>
            {children}
        </UserContext.Provider>
    );
};
