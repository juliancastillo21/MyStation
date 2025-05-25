import { Navigate, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { HomePage } from "../events/pages/HomePage";
import { LoginPage } from "../auth/pages/LoginPage";
import { RegisterPage } from "../auth/pages/RegisterPage";
import SpotifyCallback from "../pages/SpotifyCallback";
import ProtectedRoute from "./ProtectedRoute";
import { DashboardPage } from "../events/pages/DashboardPage";
import FirebaseAuthDiagnostic from "../auth/pages/FirebaseAuthDiagnostic";

const generateRandomString = (length: number): string => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from({ length }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
};

export const AppRouter = () => {
    useEffect(() => {
        const state = generateRandomString(16);
        localStorage.setItem("spotify_auth_state", state);
    }, []);

    return (
        <Routes>            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/callback" element={<SpotifyCallback />} />
            <Route path="/firebase-diagnostico" element={<FirebaseAuthDiagnostic />} />
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <DashboardPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/home"
                element={
                    <ProtectedRoute>
                        <HomePage />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
};
