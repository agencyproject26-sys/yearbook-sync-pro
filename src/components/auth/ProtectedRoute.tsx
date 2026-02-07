import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, roles, hasRole } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user only has calendar_only role
  const isCalendarOnly = roles.length === 1 && hasRole('calendar_only');
  const calendarPaths = ['/kalender', '/kalender-publik'];
  
  // If user is calendar_only and trying to access non-calendar pages, redirect to calendar
  if (isCalendarOnly && !calendarPaths.includes(location.pathname)) {
    return <Navigate to="/kalender" replace />;
  }

  return <>{children}</>;
}
