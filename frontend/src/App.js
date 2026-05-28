import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';
import { SkeletonTheme } from 'react-loading-skeleton';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import ClientDashboard from './components/ClientDashboard';
import SellerDashboard from './components/SellerDashboard';
import ReferralPage from './components/ReferralPage';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import { CenteredLoaderSkeleton } from './components/ui/PageSkeleton';

function ProtectedRoute({ children, adminOnly = false, vendorOnly = false }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <CenteredLoaderSkeleton />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (adminOnly && !user.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  if (vendorOnly && !user.is_vendor) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

function PublicRoute({ children, allowAuthenticated = false }) {
  const { user } = useAuth();
  
  // If allowAuthenticated is true, allow access even when signed in
  if (allowAuthenticated) {
    return children;
  }
  
  // If already signed in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <Routes>
      {/* Landing Page - Accessible to everyone */}
      <Route 
        path="/" 
        element={
          <PublicRoute allowAuthenticated={true}>
            <LandingPage />
          </PublicRoute>
        } 
      />
      
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      <Route 
        path="/forgot-password" 
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        } 
      />
      <Route 
        path="/reset-password/:token" 
        element={
          <PublicRoute>
            <ResetPassword />
          </PublicRoute>
        } 
      />
      <Route path="/referral/:linkCode" element={<ReferralPage />} />
      
      {/* Protected Routes */}
      <Route 
        path="/admin/*" 
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/vendor/*" 
        element={
          <ProtectedRoute vendorOnly={true}>
            <SellerDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          user?.is_admin ? <Navigate to="/admin" replace /> :
          user?.is_vendor ? <Navigate to="/vendor" replace /> :
          <ProtectedRoute>
            <ClientDashboard />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

function AppWithTheme() {
  const { isDark } = useTheme();
  const toastStyle = isDark
    ? {
        background: '#1e293b',
        color: '#e2e8f0',
        boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.5)',
        border: '1px solid #334155',
        borderRadius: '12px',
      }
    : {
        background: '#fff',
        color: '#374151',
        boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.15)',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
      };

  return (
    <SkeletonTheme
      baseColor={isDark ? '#1e293b' : '#e9edf5'}
      highlightColor={isDark ? '#334155' : '#f7f9fc'}
      borderRadius="12px"
      duration={1.2}
    >
      <Router>
        <div className="min-h-screen">
          <AppRoutes />
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: toastStyle,
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: isDark ? '#1e293b' : '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: isDark ? '#1e293b' : '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </SkeletonTheme>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ThemeProvider>
          <AuthProvider>
            <AppWithTheme />
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
