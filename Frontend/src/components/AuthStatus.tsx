import { useAuthStore } from '../store/auth';
import { Button } from './ui/Button';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AuthStatus() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return null; // No mostrar nada cuando no esté autenticado
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <User className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">{user?.name}</span>
        <span className="text-xs text-muted-foreground capitalize">
          ({user?.role})
        </span>
      </div>
      
      {user?.role === 'admin' || user?.role === 'empleado' ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/admin')}
        >
          Panel Admin
        </Button>
      ) : null}
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => logout()}
      >
        Cerrar Sesión
      </Button>
    </div>
  );
}
