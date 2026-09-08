import { Suspense, lazy, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuthContext } from '@/providers/AuthProvider';
import { Layout } from '@/components/layout/Layout';
import { PageSkeleton } from '@/components/ui/PageSkeleton';

// Code splitting / Lazy-loaded routes for instant initial page paint
const Home = lazy(() => import('@/pages/Home').then((m) => ({ default: m.Home })));
const About = lazy(() => import('@/pages/About').then((m) => ({ default: m.About })));
const Schedule = lazy(() => import('@/pages/Schedule').then((m) => ({ default: m.Schedule })));
const Auth = lazy(() => import('@/pages/Auth').then((m) => ({ default: m.Auth })));
const Dashboard = lazy(() => import('@/pages/Dashboard').then((m) => ({ default: m.Dashboard })));

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/login" element={<Auth />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <AppRoutes />
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
