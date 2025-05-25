import { AuthState, AuthAction, authTypes } from '../types/authTypes';

export const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case authTypes.login:
            return {
                ...state,
                logged: true,
                user: action.payload,
                errorMessage: null,
                checking: false,
                spotifyConnected: state.spotifyConnected
            };

        case authTypes.logout:
            return {
                logged: false,
                user: null,
                errorMessage: null,
                checking: false,
                spotifyConnected: false
            };

        case authTypes.errors:
            return {
                ...state,
                errorMessage: action.payload,
                checking: false
            };

        case authTypes.spotifyConnect:
            return {
                ...state,
                spotifyConnected: action.payload
            };

        case authTypes.checkingFinish:
            return {
                ...state,
                checking: false
            };

        case authTypes.clearError:
            return {
                ...state,
                errorMessage: null
            };

        default:
            return state;
    }
};
