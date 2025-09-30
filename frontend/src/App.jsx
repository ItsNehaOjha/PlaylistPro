import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';

// Lazy load pages with preloading
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));
const FuturisticDashboard = React.lazy(() => import('./pages/FuturisticDashboard'));
const MultiPlaylistDashboard = React.lazy(() => import('./pages/MultiPlaylistDashboard'));

// Preload critical routes
const preloadDashboard = () => import('./pages/FuturisticDashboard');
const preloadPlaylists = () => import('./pages/MultiPlaylistDashboard');

// Components (keep these as regular imports since they're small)
import FuturisticNavbar from './components/FuturisticNavbar';

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
    <div className="glass-card p-8 rounded-xl text-center">
      <CircularProgress 
        size={48} 
        sx={{ 
          color: '#00D4FF',
          mb: 2
        }} 
      />
      <p className="text-white">Loading your learning journey...</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children, preload }) => {
  const { user, loading } = useAuth();
  
  // Preload routes when user is authenticated
  React.useEffect(() => {
    if (user && preload) {
      preload();
    }
  }, [user, preload]);
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return user ? <Navigate to="/dashboard" /> : children;
};

function App() {
  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 80%, rgba(0, 212, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 107, 53, 0.1) 0%, transparent 50%)',
          pointerEvents: 'none',
          zIndex: 0
        }
      }}
    >
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
         
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          
          {/* Protected Routes with preloading */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute preload={preloadPlaylists}>
                <FuturisticNavbar />
                <FuturisticDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/playlists" 
            element={
              <ProtectedRoute preload={preloadDashboard}>
                <FuturisticNavbar />
                <MultiPlaylistDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
      
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(15, 23, 42, 0.9)',
            color: '#fff',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
          },
          success: {
            iconTheme: {
              primary: '#00D4FF',
              secondary: '#0f172a',
            },
          },
          error: {
            iconTheme: {
              primary: '#FF6B35',
              secondary: '#0f172a',
            },
          },
        }}
      />
    </Box>
  );
}

export default App;
