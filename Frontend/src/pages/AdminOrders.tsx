import { useState } from 'react';
import { Search, Eye, Edit, Trash2, ShoppingBag, Clock, CheckCircle, Package, Truck, Scan, Download, FileSpreadsheet } from 'lucide-react';
import { useOrders, useUpdateOrder, useDeleteOrder, type Order } from '../hooks/useOrders';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { AdminNavbar } from '../components/AdminNavbar';
import { OrderDetails } from '../components/OrderDetails';
import { OrderStatusUpdate } from '../components/OrderStatusUpdate';
import { OrderBarcodeScanner } from '../components/OrderBarcodeScanner';
import { exportOrdersToExcel } from '../lib/exportToExcel';
import { api } from '../lib/api';

export function AdminOrders() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<number>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  
  const limit = 10;

  const { data, isLoading, error } = useOrders({
    page,
    limit,
    search: search || undefined,
    status: statusFilter || undefined,
  });

  const updateOrder = useUpdateOrder();
  const deleteOrder = useDeleteOrder();

  const handleStatusUpdate = async (orderId: string, data: any) => {
    try {
      await updateOrder.mutateAsync({ id: orderId, data });
      setEditingOrder(null);
    } catch (error) {
      console.error('Error actualizando reserva:', error);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await deleteOrder.mutateAsync(orderId);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error eliminando reserva:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendiente':
        return <Clock className="h-4 w-4" />;
      case 'preparando':
        return <Package className="h-4 w-4" />;
      case 'listo':
        return <CheckCircle className="h-4 w-4" />;
      case 'entregado':
        return <Truck className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendiente':
        return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      case 'preparando':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'listo':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'entregado':
        return 'bg-gray-50 text-gray-700 border border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const orders = data?.data || [];
  const pagination = data?.pagination;

  // Manejar selección de reservas
  const handleToggleSelect = (orderId: number) => {
    setSelectedOrderIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedOrderIds.size === orders.length) {
      setSelectedOrderIds(new Set());
    } else {
      setSelectedOrderIds(new Set(orders.map(o => o.id)));
    }
  };

  // Exportar reservas seleccionadas
  const handleExportSelected = () => {
    const selectedOrders = orders.filter(order => selectedOrderIds.has(order.id));
    if (selectedOrders.length === 0) {
      alert('Por favor selecciona al menos una reserva para exportar');
      return;
    }
      exportOrdersToExcel(selectedOrders, `reservas_seleccionadas`);
    setSelectedOrderIds(new Set());
  };

  // Exportar todas las reservas
  const handleExportAll = async () => {
    setIsExporting(true);
    try {
      // Obtener todas las reservas sin paginación
      const response = await api.get('/orders', {
        params: {
          limit: 10000, // Número grande para obtener todos
          search: search || undefined,
          status: statusFilter || undefined,
        }
      });
      
      const allOrders = response.data.data || [];
      exportOrdersToExcel(allOrders, 'todas_las_reservas');
    } catch (error) {
      console.error('Error exportando reservas:', error);
      alert('Error al exportar reservas. Por favor intenta de nuevo.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Gestión de Reservas</h1>
                <p className="text-muted-foreground">
                  Administra y actualiza el estado de las reservas
                </p>
              </div>
              <div className="flex items-center gap-2">
                {selectedOrderIds.size > 0 && (
                  <Button
                    variant="default"
                    onClick={handleExportSelected}
                    className="transition-all duration-200 hover:scale-105"
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Exportar Seleccionados ({selectedOrderIds.size})
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={handleExportAll}
                  disabled={isExporting}
                  className="transition-all duration-200 hover:scale-105"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {isExporting ? 'Exportando...' : 'Exportar Todos'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowScanner(true)}
                  className="transition-all duration-200 hover:scale-105"
                >
                  <Scan className="mr-2 h-4 w-4" />
                  Escanear Código
                </Button>
              </div>
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
                    placeholder="Buscar por cliente o ID de reserva..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Todos los estados</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="preparando">Preparando</option>
                  <option value="listo">Listo</option>
                  <option value="entregado">Entregado</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Reservas ({pagination?.total || 0})
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
                  <p className="text-destructive">Error cargando reservas</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No hay reservas</h3>
                  <p className="text-muted-foreground">
                    {search || statusFilter ? 'No se encontraron reservas con esos criterios.' : 'No hay reservas registradas.'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-4 w-12">
                            <input
                              type="checkbox"
                              checked={selectedOrderIds.size === orders.length && orders.length > 0}
                              onChange={handleSelectAll}
                              className="cursor-pointer"
                            />
                          </th>
                          <th className="text-left p-4">ID</th>
                          <th className="text-left p-4">Cliente</th>
                          <th className="text-left p-4">Total</th>
                          <th className="text-left p-4">Estado</th>
                          <th className="text-left p-4">Pago</th>
                          <th className="text-left p-4">Fecha</th>
                          <th className="text-right p-4">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order.id} className="border-b hover:bg-muted/50">
                            <td className="p-4">
                              <input
                                type="checkbox"
                                checked={selectedOrderIds.has(order.id)}
                                onChange={() => handleToggleSelect(order.id)}
                                className="cursor-pointer"
                              />
                            </td>
                            <td className="p-4">
                              <span className="font-mono text-sm">#{order.id}</span>
                            </td>
                            <td className="p-4">
                              <div>
                                <div className="font-medium">
                                  {order.customer_name || 'Cliente sin nombre'}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {order.customer_email || 'Sin email'}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {order.customer_phone || order.clients?.phone || 'Sin teléfono'}
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="font-medium">${order.total.toFixed(2)}</span>
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                {getStatusIcon(order.status)}
                                <span className="ml-1 capitalize">{order.status}</span>
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                order.is_paid 
                                  ? 'bg-green-50 text-green-700 border border-green-200' 
                                  : 'bg-red-50 text-red-700 border border-red-200'
                              }`}>
                                {order.is_paid ? 'Pagado' : 'Pendiente'}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="text-sm">
                                <div>{new Date(order.created_at).toLocaleDateString('es-ES')}</div>
                                <div className="text-muted-foreground">
                                  {new Date(order.created_at).toLocaleTimeString('es-ES', { 
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
                                  onClick={() => setSelectedOrder(order)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingOrder(order)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setDeleteConfirm(order.id.toString())}
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
                        Mostrando {((page - 1) * limit) + 1} a {Math.min(page * limit, pagination.total)} de {pagination.total} reservas
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
      {selectedOrder && (
        <OrderDetails
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {editingOrder && (
        <OrderStatusUpdate
          order={editingOrder}
          onSubmit={handleStatusUpdate}
          onCancel={() => setEditingOrder(null)}
          isLoading={updateOrder.isPending}
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
                ¿Estás seguro de que quieres eliminar esta reserva? Esta acción no se puede deshacer.
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
                  onClick={() => handleDeleteOrder(deleteConfirm)}
                  disabled={deleteOrder.isPending}
                >
                  {deleteOrder.isPending ? 'Eliminando...' : 'Eliminar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showScanner && (
        <OrderBarcodeScanner
          onClose={() => setShowScanner(false)}
          onOrderFound={(order) => {
            setSelectedOrder(order);
            setShowScanner(false);
          }}
          onOrderNotFound={(barcode) => {
            // No cerrar automáticamente, solo mostrar el error en el modal
            console.log(`Reserva no encontrada con código: ${barcode}`);
          }}
        />
      )}
    </div>
  );
}
