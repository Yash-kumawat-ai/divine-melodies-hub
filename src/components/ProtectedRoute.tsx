import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

function AuthLoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading, isAdmin } = useAuth();

  // Initial boot only — keep the page mounted if we already have a user
  // (token refresh must not unmount meditation / upload / account).
  if (loading && !user) {
    return <AuthLoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  // Owner profile / admin role is loaded in fetchUserProfile. Do not send
  // moderators home while isAdmin is still false during that fetch.
  if (requireAdmin && loading && !isAdmin) {
    return <AuthLoadingScreen />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
