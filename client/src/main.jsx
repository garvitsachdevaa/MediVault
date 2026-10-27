import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ProfileProvider } from './context/ProfileContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import { TooltipProvider } from './components/ui/Tooltip.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_relativeSplatPath: true }}>
      <MotionConfig reducedMotion="user">
        <TooltipProvider>
          <AuthProvider>
            <ProfileProvider>
              <SocketProvider>
                <NotificationProvider>
                  <App />
                  <Toaster
                    position="top-right"
                    toastOptions={{
                      duration: 4000,
                      className:
                        '!rounded-xl !border !border-ink-200/80 !bg-white !text-ink-800 !shadow-lift',
                      style: { fontSize: '0.875rem' },
                      success: { iconTheme: { primary: '#0d8378', secondary: '#ffffff' } },
                    }}
                  />
                </NotificationProvider>
              </SocketProvider>
            </ProfileProvider>
          </AuthProvider>
        </TooltipProvider>
      </MotionConfig>
    </BrowserRouter>
  </React.StrictMode>
);
