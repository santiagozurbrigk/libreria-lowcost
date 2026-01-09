import { LogOut, ShoppingBag, Users, BarChart3, Package } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { useLogout } from '../hooks/useAuth';
import { Button } from './ui/Button';

export function AdminNavbar() {
  const { user } = useAuthStore();
  const logout = useLogout();
  const location = useLocation();

  const handleLogout = () => {
    logout.mutate();
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <img src="/logo.png" alt="Librería Low Cost" className="h-8 w-8" />
              <span className="ml-2 text-xl font-bold">Librería Low Cost</span>
            </div>
            
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {user?.role === 'admin' && (
                <a
                  href="/admin"
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center transition-all duration-200 hover:scale-105 ${
                    isActive('/admin') 
                      ? 'text-primary bg-primary/10' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Dashboard
                </a>
              )}
              <a
                href="/admin/products"
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center transition-all duration-200 hover:scale-105 ${
                  isActive('/admin/products') 
                    ? 'text-primary bg-primary/10' 
                    : 'text-muted-foreground hover:text-primary'
                }`}
              >
                <Package className="h-4 w-4 mr-2" />
                Productos
              </a>
              <a
                href="/admin/orders"
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center transition-all duration-200 hover:scale-105 ${
                  isActive('/admin/orders') 
                    ? 'text-primary bg-primary/10' 
                    : 'text-muted-foreground hover:text-primary'
                }`}
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Reservas
              </a>
              {user?.role === 'admin' && (
                <a
                  href="/admin/users"
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center transition-all duration-200 hover:scale-105 ${
                    isActive('/admin/users') 
                      ? 'text-primary bg-primary/10' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Usuarios
                </a>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="text-sm">
                <p className="font-medium">{user?.name}</p>
                <p className="text-muted-foreground capitalize">{user?.role}</p>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={logout.isPending}
              className="transition-all duration-200 hover:scale-105 hover:bg-red-50 hover:border-red-200"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
