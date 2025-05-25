import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { LoginPage } from './auth/pages/LoginPage';
import { RegisterPage } from './auth/pages/RegisterPage';
import { DashboardPage } from './events/pages/DashboardPage';
import SpotifyCallback from './pages/SpotifyCallback';
import ProtectedRoute from './router/ProtectedRoute';
import DiagnosticPage from './auth/pages/DiagnosticPage';

const EventApp: React.FC = () => {  return (    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/callback" element={<SpotifyCallback />} />
      <Route path="/diagnostic" element={<DiagnosticPage />} />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

export default EventApp;
