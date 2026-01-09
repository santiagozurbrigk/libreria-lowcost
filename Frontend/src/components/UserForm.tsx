import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, User as UserIcon, Mail, Lock, Shield, UserCheck, Users } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import type { User, CreateUserData, UpdateUserData } from '../hooks/useUsers';

interface UserFormProps {
  user?: User;
  onSubmit: (data: CreateUserData | UpdateUserData) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const userSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional(),
  role: z.enum(['admin', 'empleado', 'cliente']),
});

type UserFormData = z.infer<typeof userSchema>;

export function UserForm({ user, onSubmit, onCancel, isLoading }: UserFormProps) {
  const isEditing = !!user;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: user?.full_name || '',
      email: user?.email || '',
      password: '',
      role: (user?.role as 'admin' | 'empleado' | 'cliente') || 'cliente',
    },
  });

  const handleFormSubmit = (data: UserFormData) => {
    // Si es edición y no se proporcionó contraseña, no incluirla
    if (isEditing && !data.password) {
      const { password, ...updateData } = data;
      onSubmit(updateData);
    } else {
      onSubmit(data);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'empleado':
        return <UserCheck className="h-4 w-4" />;
      case 'cliente':
        return <Users className="h-4 w-4" />;
      default:
        return <UserIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md border shadow-lg" style={{ backgroundColor: 'white' }}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <UserIcon className="h-5 w-5" />
            <CardTitle>
              {isEditing ? `Editar Usuario` : 'Nuevo Usuario'}
            </CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            {/* Nombre */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Nombre completo *
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="name"
                  type="text"
                  {...register('name')}
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Nombre completo"
                />
              </div>
              {errors.name && (
                <p className="text-sm text-destructive mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="usuario@ejemplo.com"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Contraseña {isEditing ? '(opcional)' : '*'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="password"
                  type="password"
                  {...register('password')}
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder={isEditing ? 'Dejar vacío para mantener la actual' : 'Mínimo 6 caracteres'}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-destructive mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Rol */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium mb-2">
                Rol *
              </label>
              <select
                id="role"
                {...register('role')}
                className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="cliente">Cliente</option>
                <option value="empleado">Empleado</option>
                <option value="admin">Administrador</option>
              </select>
              {errors.role && (
                <p className="text-sm text-destructive mt-1">
                  {errors.role.message}
                </p>
              )}
            </div>

            {/* Información del rol */}
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="text-sm font-medium mb-2">Información de roles:</div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center space-x-2">
                  {getRoleIcon('admin')}
                  <span><strong>Administrador:</strong> Acceso completo al sistema</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getRoleIcon('empleado')}
                  <span><strong>Empleado:</strong> Gestión de productos y reservas</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getRoleIcon('cliente')}
                  <span><strong>Cliente:</strong> Solo puede realizar reservas</span>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    {isEditing ? 'Actualizando...' : 'Creando...'}
                  </>
                ) : (
                  isEditing ? 'Actualizar Usuario' : 'Crear Usuario'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
