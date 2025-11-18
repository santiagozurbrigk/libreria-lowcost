import { useLocation } from 'react-router-dom';
import { Cart } from './Cart';

export function ConditionalCart() {
  const location = useLocation();
  
  // No mostrar el carrito en rutas de administración
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  if (isAdminRoute) {
    return null;
  }
  
  return <Cart />;
}
