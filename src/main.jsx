import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './components/ThemeProvider.jsx';
import { store } from './store/store.js';
import { initializeTheme } from './utils/theme.js';
import 'leaflet/dist/leaflet.css';
import './index.css';
import App from './App.jsx';

initializeTheme();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              borderRadius: '18px',
              background: 'rgba(15, 23, 42, 0.94)',
              color: '#f8fafc',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 26px 60px -26px rgba(15, 23, 42, 0.5)',
              padding: '14px 16px',
            },
          }}
        />
      </ThemeProvider>
    </Provider>
  </StrictMode>,
);
