import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'empleado' | 'cliente';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirigir al login si no está autenticado
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    // Verificar si el usuario tiene permisos suficientes
    if (requiredRole === 'empleado' && user?.role === 'admin') {
      // Los admins pueden acceder a rutas de empleado
      return <>{children}</>;
    }
    
    // Si el usuario no tiene el rol requerido, mostrar mensaje de acceso denegado
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Acceso Denegado</h1>
          <p className="text-muted-foreground mb-4">
            No tienes permisos para acceder a esta sección.
          </p>
          <p className="text-sm text-muted-foreground">
            Tu rol actual: <span className="font-medium capitalize">{user?.role}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Rol requerido: <span className="font-medium capitalize">{requiredRole}</span>
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
