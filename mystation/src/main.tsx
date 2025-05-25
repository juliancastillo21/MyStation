import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { SpotifyProvider } from './auth/contexts/SpotifyContext';
import { UserProvider } from './auth/contexts/UserContext';
import EventApp from './EventApp';

// Importamos explícitamente la configuración de Firebase para asegurarnos de que se inicialice
import './firebase/config';

import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/login.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <UserProvider>
        <SpotifyProvider>
          <EventApp />
        </SpotifyProvider>
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>
);
