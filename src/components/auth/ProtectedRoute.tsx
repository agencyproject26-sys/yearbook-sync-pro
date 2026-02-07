import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, LogOut } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, roles, hasRole, isApproved, signOut } = useAuth();
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

  // Check if user is approved
  if (!isApproved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="bg-amber-500/10 p-4 rounded-full">
                <Clock className="h-12 w-12 text-amber-500" />
              </div>
            </div>
            <CardTitle className="text-2xl">Menunggu Approval</CardTitle>
            <CardDescription className="text-base">
              Akun Anda sedang dalam proses verifikasi oleh admin. 
              Silakan tunggu hingga akun Anda di-approve.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Anda akan menerima akses setelah admin menyetujui pendaftaran Anda.
            </p>
            <Button 
              variant="outline" 
              onClick={signOut}
              className="w-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    );
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
