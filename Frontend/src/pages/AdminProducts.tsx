import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2, Eye, Package, Scan } from 'lucide-react';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, type Product } from '../hooks/useProducts';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { AdminNavbar } from '../components/AdminNavbar';
import { ProductForm } from '../components/ProductForm';
import { ProductDetails } from '../components/ProductDetails';
import { BarcodeScanner } from '../components/BarcodeScanner';

export function AdminProducts() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [newProductBarcode, setNewProductBarcode] = useState<string | null>(null);
  
  const queryClient = useQueryClient();
  const limit = 10;

  const { data, isLoading, error } = useProducts({
    page,
    limit,
    search: search || undefined,
  });

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const handleCreateProduct = async (productData: any) => {
    try {
      await createProduct.mutateAsync(productData);
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (error) {
      console.error('Error creando producto:', error);
    }
  };

  const handleUpdateProduct = async (productData: any) => {
    if (!editingProduct) return;
    
    try {
      await updateProduct.mutateAsync({
        id: editingProduct.id,
        data: productData
      });
      setEditingProduct(null);
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (error) {
      console.error('Error actualizando producto:', error);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct.mutateAsync(productId);
      setDeleteConfirm(null);
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (error) {
      console.error('Error eliminando producto:', error);
    }
  };

  const products = data?.data || [];
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
                <h1 className="text-3xl font-bold text-foreground">Gestión de Productos</h1>
                <p className="text-muted-foreground">
                  Administra el catálogo de productos
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowScanner(true)}
                  className="transition-all duration-200 hover:scale-105"
                >
                  <Scan className="mr-2 h-4 w-4" />
                  Escanear Código
                </Button>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Producto
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
                    placeholder="Buscar productos por nombre, SKU o código de barras..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowScanner(true)}
                  className="transition-all duration-200 hover:scale-105"
                >
                  <Scan className="mr-2 h-4 w-4" />
                  Escanear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Products Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="mr-2 h-5 w-5" />
                Productos ({pagination?.total || 0})
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
                  <p className="text-destructive">Error cargando productos</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No hay productos</h3>
                  <p className="text-muted-foreground mb-4">
                    {search ? 'No se encontraron productos con ese criterio.' : 'Comienza agregando tu primer producto.'}
                  </p>
                  {!search && (
                    <Button onClick={() => setShowForm(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar Producto
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-4">Imagen</th>
                          <th className="text-left p-4">Producto</th>
                          <th className="text-left p-4">SKU</th>
                          <th className="text-left p-4">Precio</th>
                          <th className="text-left p-4">Stock</th>
                          <th className="text-left p-4">Estado</th>
                          <th className="text-right p-4">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product, index) => (
                          <tr 
                            key={product.id} 
                            className="border-b hover:bg-muted/50 transition-colors duration-200 animate-slide-in-left"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <td className="p-4">
                              <div className="h-12 w-12 rounded-md overflow-hidden border">
                                {product.image_url ? (
                                  <img 
                                    src={product.image_url} 
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                      // Si la imagen falla al cargar, mostrar el ícono por defecto
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      const parent = target.parentElement;
                                      if (parent) {
                                        parent.innerHTML = '<div class="h-full w-full bg-muted flex items-center justify-center"><svg class="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                                      }
                                    }}
                                  />
                                ) : (
                                  <div className="h-full w-full bg-muted flex items-center justify-center">
                                    <Package className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              <div>
                                <div className="font-medium">{product.name}</div>
                                {product.description && (
                                  <div className="text-sm text-muted-foreground truncate max-w-xs">
                                    {product.description}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="font-mono text-sm">{product.sku || 'N/A'}</span>
                            </td>
                            <td className="p-4">
                              <span className="font-medium text-primary">${product.price.toFixed(2)}</span>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                product.stock > 10 
                                  ? 'bg-green-50 text-green-700 border border-green-200' 
                                  : product.stock > 0 
                                    ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                                    : 'bg-red-50 text-red-700 border border-red-200'
                              }`}>
                                {product.stock} unidades
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                product.stock > 0 
                                  ? 'bg-green-50 text-green-700 border border-green-200' 
                                  : 'bg-red-50 text-red-700 border border-red-200'
                              }`}>
                                {product.stock > 0 ? 'Disponible' : 'Agotado'}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setViewingProduct(product)}
                                  className="transition-all duration-200 hover:scale-110 hover:bg-primary/10"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingProduct(product)}
                                  className="transition-all duration-200 hover:scale-110 hover:bg-green-50"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setDeleteConfirm(product.id)}
                                  className="text-destructive hover:text-destructive transition-all duration-200 hover:scale-110 hover:bg-red-50"
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
                        Mostrando {((page - 1) * limit) + 1} a {Math.min(page * limit, pagination.total)} de {pagination.total} productos
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
        <ProductForm
          product={newProductBarcode ? { barcode: newProductBarcode } as any : undefined}
          onSubmit={(data) => {
            handleCreateProduct(data);
            setNewProductBarcode(null);
          }}
          onCancel={() => {
            setShowForm(false);
            setNewProductBarcode(null);
          }}
          isLoading={createProduct.isPending}
        />
      )}

      {showScanner && (
        <BarcodeScanner
          onClose={() => setShowScanner(false)}
          onProductFound={(product) => {
            setViewingProduct(product);
            setShowScanner(false);
            queryClient.invalidateQueries({ queryKey: ['products'] });
          }}
          onProductNotFound={(barcode) => {
            setNewProductBarcode(barcode);
            setShowScanner(false);
            setShowForm(true);
          }}
        />
      )}

      {editingProduct && (
        <ProductForm
          product={editingProduct}
          onSubmit={handleUpdateProduct}
          onCancel={() => setEditingProduct(null)}
          isLoading={updateProduct.isPending}
        />
      )}

      {viewingProduct && (
        <ProductDetails
          product={viewingProduct}
          onClose={() => setViewingProduct(null)}
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
                ¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.
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
                  onClick={() => handleDeleteProduct(deleteConfirm)}
                  disabled={deleteProduct.isPending}
                >
                  {deleteProduct.isPending ? 'Eliminando...' : 'Eliminar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
