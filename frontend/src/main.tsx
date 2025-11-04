import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { GoalProvider } from './context/GoalContext.tsx';
import { LoadingProvider } from './context/LoadingContext.tsx';
import './index.css';

// Add spinner animation CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <LoadingProvider>
            <GoalProvider>
              <App />
              <Toaster 
                position="top-center"
                toastOptions={{
                  // Default options
                  duration: 4000,
                  style: {
                    background: 'white',
                    color: '#363636',
                    padding: '16px',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    maxWidth: '500px',
                    fontSize: '14px',
                    fontWeight: '500',
                  },
                  // Success
                  success: {
                    duration: 3000,
                    style: {
                      background: '#10B981',
                      color: 'white',
                    },
                    iconTheme: {
                      primary: 'white',
                      secondary: '#10B981',
                    },
                  },
                  // Error
                  error: {
                    duration: 5000,
                    style: {
                      background: '#EF4444',
                      color: 'white',
                    },
                    iconTheme: {
                      primary: 'white',
                      secondary: '#EF4444',
                    },
                  },
                  // Loading
                  loading: {
                    style: {
                      background: '#3B82F6',
                      color: 'white',
                    },
                    iconTheme: {
                      primary: 'white',
                      secondary: '#3B82F6',
                    },
                  },
                }}
              />
            </GoalProvider>
          </LoadingProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
);