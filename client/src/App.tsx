import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from './components/common/Navbar';
import { EmergencyEscalationBanner } from './components/common/EmergencyEscalationBanner';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { WoundsListPage } from './pages/WoundsListPage';
import { WoundDetailPage } from './pages/WoundDetailPage';
import { NewEntryWizardPage } from './pages/NewEntryWizardPage';
import { WoundComparePage } from './pages/WoundComparePage';
import { HospitalsFinderPage } from './pages/HospitalsFinderPage';
import { PublicDoctorPortalPage } from './pages/PublicDoctorPortalPage';
import { HeartPulse, ShieldCheck } from 'lucide-react';
import { useAppStore } from './store/useAppStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5 // 5 minutes
    }
  }
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAppStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isPublicShare = location.pathname.startsWith('/share/');
  const isAuth =
    location.pathname.startsWith('/auth/') ||
    location.pathname === '/login' ||
    location.pathname === '/register';

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Persistent Clinical Emergency Escalation Alert Banner */}
      <EmergencyEscalationBanner />

      {/* Main Navigation (hidden on public doctor view and auth pages) */}
      {!isPublicShare && !isAuth && <Navbar />}

      {/* Page Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      {!isPublicShare && !isAuth && (
        <footer className="border-t border-slate-900 bg-slate-950 py-8 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-teal-400" />
              <span className="font-bold text-slate-300">HealTrack AI Platform</span>
              <span>•</span>
              <span>Clinical Decision-Support &amp; Remote Wound Monitoring</span>
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
                <span>HIPAA / Non-Diagnostic Compliant</span>
              </span>
              <span>v1.0.0 (Production Blueprint)</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  const { isAuthenticated } = useAppStore();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <Routes>
            {/* Root redirect */}
            <Route
              path="/"
              element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
            />

            {/* Authentication Pages */}
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />
            <Route path="/auth/login" element={<AuthPage />} />
            <Route path="/auth/register" element={<AuthPage />} />

            {/* Protected Clinical Pages */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wounds"
              element={
                <ProtectedRoute>
                  <WoundsListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wounds/:woundId"
              element={
                <ProtectedRoute>
                  <WoundDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wounds/:woundId/new-entry"
              element={
                <ProtectedRoute>
                  <NewEntryWizardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wounds/:woundId/compare"
              element={
                <ProtectedRoute>
                  <WoundComparePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hospitals"
              element={
                <ProtectedRoute>
                  <HospitalsFinderPage />
                </ProtectedRoute>
              }
            />

            {/* Public Doctor-Share View (Unauthenticated Zero-Knowledge Token) */}
            <Route path="/share/:token" element={<PublicDoctorPortalPage />} />

            {/* Catch-all */}
            <Route
              path="*"
              element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
            />
          </Routes>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
