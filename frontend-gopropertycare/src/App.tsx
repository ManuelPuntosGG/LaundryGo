import { Suspense, lazy, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuthContext } from '@/providers/AuthProvider';
import { Layout } from '@/components/layout/Layout';
import { PageSkeleton } from '@/components/ui/PageSkeleton';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ScrollToTop } from '@/components/layout/ScrollToTop';

// Code splitting / Lazy-loaded routes for instant initial page paint
const Home = lazy(() => import('@/pages/Home').then((m) => ({ default: m.Home })));
const Residential = lazy(() => import('@/pages/Residential').then((m) => ({ default: m.Residential })));
const Commercial = lazy(() => import('@/pages/Commercial').then((m) => ({ default: m.Commercial })));
const About = lazy(() => import('@/pages/About').then((m) => ({ default: m.About })));
const FAQ = lazy(() => import('@/pages/FAQ').then((m) => ({ default: m.FAQ })));
const Schedule = lazy(() => import('@/pages/Schedule').then((m) => ({ default: m.Schedule })));
const OrderSuccess = lazy(() => import('@/pages/OrderSuccess').then((m) => ({ default: m.OrderSuccess })));
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
        <Route path="/residential" element={<Residential />} />
        <Route path="/commercial" element={<Commercial />} />
        <Route path="/services" element={<Navigate to="/residential" replace />} />
        <Route path="/about" element={<About />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/schedule/success" element={<Navigate to="/order-success" replace />} />
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
    <ErrorBoundary>
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <Layout>
            <AppRoutes />
          </Layout>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
