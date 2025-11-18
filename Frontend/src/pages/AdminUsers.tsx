import { useState } from 'react';
import { Search, Filter, Plus, Edit, Trash2, Users, Shield, UserCheck, User as UserIcon } from 'lucide-react';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser, type User } from '../hooks/useUsers';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { AdminNavbar } from '../components/AdminNavbar';
import { UserForm } from '../components/UserForm';

export function AdminUsers() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  const limit = 10;

  const { data, isLoading, error } = useUsers({
    page,
    limit,
    search: search || undefined,
    role: roleFilter || undefined,
  });

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const handleCreateUser = async (userData: any) => {
    try {
      await createUser.mutateAsync(userData);
      setShowForm(false);
    } catch (error) {
      console.error('Error creando usuario:', error);
    }
  };

  const handleUpdateUser = async (userData: any) => {
    if (!editingUser) return;
    
    try {
      await updateUser.mutateAsync({
        id: editingUser.id,
        data: userData
      });
      setEditingUser(null);
    } catch (error) {
      console.error('Error actualizando usuario:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser.mutateAsync(userId);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error eliminando usuario:', error);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'empleado':
        return <UserCheck className="h-4 w-4" />;
      case 'cliente':
        return <UserIcon className="h-4 w-4" />;
      default:
        return <UserIcon className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-50 text-red-700 border border-red-200';
      case 'empleado':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'cliente':
        return 'bg-green-50 text-green-700 border border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const users = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Gestión de Usuarios</h1>
                <p className="text-muted-foreground">
                  Administra usuarios del sistema
                </p>
              </div>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Usuario
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o email..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Todos los roles</option>
                  <option value="admin">Administrador</option>
                  <option value="empleado">Empleado</option>
                  <option value="cliente">Cliente</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Usuarios ({pagination?.total || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="animate-pulse flex space-x-4">
                      <div className="h-12 bg-muted rounded w-12" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-destructive">Error cargando usuarios</p>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No hay usuarios</h3>
                  <p className="text-muted-foreground">
                    {search || roleFilter ? 'No se encontraron usuarios con esos criterios.' : 'No hay usuarios registrados.'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-4">Usuario</th>
                          <th className="text-left p-4">Email</th>
                          <th className="text-left p-4">Rol</th>
                          <th className="text-left p-4">Fecha de Registro</th>
                          <th className="text-right p-4">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id} className="border-b hover:bg-muted/50">
                            <td className="p-4">
                              <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                                  <UserIcon className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                  <div className="font-medium">{user.full_name}</div>
                                  <div className="text-sm text-muted-foreground">ID: {user.id.slice(0, 8)}...</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="text-sm">{user.email}</span>
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                                {getRoleIcon(user.role)}
                                <span className="ml-1 capitalize">{user.role}</span>
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="text-sm">
                                <div>{new Date(user.created_at).toLocaleDateString('es-ES')}</div>
                                <div className="text-muted-foreground">
                                  {new Date(user.created_at).toLocaleTimeString('es-ES', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingUser(user)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setDeleteConfirm(user.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {pagination && pagination.pages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                      <div className="text-sm text-muted-foreground">
                        Mostrando {((page - 1) * limit) + 1} a {Math.min(page * limit, pagination.total)} de {pagination.total} usuarios
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(page - 1)}
                          disabled={page === 1}
                        >
                          Anterior
                        </Button>
                        <span className="text-sm">
                          Página {page} de {pagination.pages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(page + 1)}
                          disabled={page === pagination.pages}
                        >
                          Siguiente
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      {showForm && (
        <UserForm
          onSubmit={handleCreateUser}
          onCancel={() => setShowForm(false)}
          isLoading={createUser.isPending}
        />
      )}

      {editingUser && (
        <UserForm
          user={editingUser}
          onSubmit={handleUpdateUser}
          onCancel={() => setEditingUser(null)}
          isLoading={updateUser.isPending}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md border shadow-lg" style={{ backgroundColor: 'white' }}>
            <CardHeader>
              <CardTitle>Confirmar eliminación</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                ¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirm(null)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteUser(deleteConfirm)}
                  disabled={deleteUser.isPending}
                >
                  {deleteUser.isPending ? 'Eliminando...' : 'Eliminar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
