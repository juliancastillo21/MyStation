
export const authTypes = {
    login: '[AUTH] login',
    logout: '[AUTH] logout',
    errors: '[AUTH] errors',
    spotifyConnect: '[AUTH] spotify_connect',
    checkingFinish: '[AUTH] checking_finish',
    clearError: '[AUTH] clear_error',
} as const;

export type AuthActionType = typeof authTypes[keyof typeof authTypes];

export interface User {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
}

export interface AuthState {
    logged: boolean;
    user: User | null;
    errorMessage: string | null;
    checking: boolean;
    spotifyConnected?: boolean;
}

export type AuthAction =
    | { type: typeof authTypes.login; payload: User }
    | { type: typeof authTypes.logout }
    | { type: typeof authTypes.errors; payload: string }
    | { type: typeof authTypes.spotifyConnect; payload: boolean }
    | { type: typeof authTypes.checkingFinish }
    | { type: typeof authTypes.clearError };


