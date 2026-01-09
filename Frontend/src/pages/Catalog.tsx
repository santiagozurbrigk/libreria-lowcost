import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { AuthStatus } from '../components/AuthStatus';

export function Catalog() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data, isLoading, error } = useProducts({
    page,
    limit,
    search: search || undefined,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-square bg-muted" />
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-3 bg-muted rounded mb-4" />
                <div className="h-10 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Error al cargar productos</h2>
            <p className="text-muted-foreground">
              No se pudieron cargar los productos. Por favor, intenta de nuevo.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const products = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary border-b border-primary/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img src="/logo.png" alt="Librería Low Cost" className="h-8 w-8" />
              <h1 className="text-2xl font-bold text-primary-foreground">Librería Low Cost</h1>
            </div>
            <AuthStatus />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Catálogo de Productos</h2>
          <p className="text-muted-foreground">
            Explora nuestra selección de libros y productos
          </p>
        </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <Button type="submit" className="transition-all duration-200 hover:scale-105">
              <Search className="mr-2 h-4 w-4" />
              Buscar
            </Button>
            <Button variant="outline" className="transition-all duration-200 hover:scale-105">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {products.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">No se encontraron productos</h2>
            <p className="text-muted-foreground">
              {search ? 'Intenta con otros términos de búsqueda.' : 'No hay productos disponibles en este momento.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {products.map((product, index) => (
              <div 
                key={product.id} 
                className="animate-slide-in-bottom"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="transition-all duration-200 hover:scale-105"
              >
                Anterior
              </Button>
              
              <span className="text-sm text-muted-foreground">
                Página {page} de {pagination.pages}
              </span>
              
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={page === pagination.pages}
                className="transition-all duration-200 hover:scale-105"
              >
                Siguiente
              </Button>
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
}
