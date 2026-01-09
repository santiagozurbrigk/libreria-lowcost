import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { AdminNavbar } from '../components/AdminNavbar';
import { ShoppingBag, TrendingUp, DollarSign, Calendar, Target, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';

export function AdminDashboard() {
  const { data: economicStats, isLoading: economicLoading } = useQuery({
    queryKey: ['admin-economic-stats'],
    queryFn: async () => {
      const response = await api.get('/admin/stats/economic');
      return response.data;
    },
  });

  if (economicLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNavbar />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded mb-2" />
                    <div className="h-8 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-AR', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Dashboard Económico</h1>
            <p className="text-muted-foreground">
              Análisis financiero y estadísticas de ventas
            </p>
          </div>

          {/* Estadísticas Principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="transition-all duration-300 hover:shadow-lg hover:scale-[1.02] animate-slide-in-bottom">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Ingresos Totales
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(economicStats?.data?.totalRevenue || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Últimos {economicStats?.data?.period || 30} días
                </p>
              </CardContent>
            </Card>

            <Card className="transition-all duration-300 hover:shadow-lg hover:scale-[1.02] animate-slide-in-bottom" style={{ animationDelay: '100ms' }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Promedio Diario
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(economicStats?.data?.averageDailyRevenue || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Ingreso promedio por día
                </p>
              </CardContent>
            </Card>

            <Card className="transition-all duration-300 hover:shadow-lg hover:scale-[1.02] animate-slide-in-bottom" style={{ animationDelay: '200ms' }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Reservas
                </CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {economicStats?.data?.totalOrders || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Reservas en el período
                </p>
              </CardContent>
            </Card>

            <Card className="transition-all duration-300 hover:shadow-lg hover:scale-[1.02] animate-slide-in-bottom" style={{ animationDelay: '300ms' }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Ticket Promedio
                </CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(economicStats?.data?.averageOrderValue || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Valor promedio por reserva
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-slide-in-bottom" style={{ animationDelay: '400ms' }}>
            {/* Gráfico de Ventas Diarias */}
            <Card>
              <CardHeader>
                <CardTitle>Ventas Diarias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full overflow-x-auto">
                  <LineChart 
                    data={economicStats?.data?.dailySales || []} 
                    width={600} 
                    height={300}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Ventas']}
                      labelFormatter={(label) => `Fecha: ${formatDate(label)}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      stroke="#0d3f8f" 
                      strokeWidth={2}
                      dot={{ fill: '#0d3f8f', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </div>
              </CardContent>
            </Card>

            {/* Gráfico de Reservas Diarias */}
            <Card>
              <CardHeader>
                <CardTitle>Reservas Diarias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full overflow-x-auto">
                  <BarChart 
                    data={economicStats?.data?.dailySales || []} 
                    width={600} 
                    height={300}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value: number) => [value, 'Reservas']}
                      labelFormatter={(label) => `Fecha: ${formatDate(label)}`}
                    />
                    <Bar dataKey="orders" fill="#10b981" />
                  </BarChart>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Estadísticas Adicionales */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Mejor Día de Ventas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {formatCurrency(economicStats?.data?.bestDay?.total || 0)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {economicStats?.data?.bestDay?.date ? 
                      new Date(economicStats.data.bestDay.date).toLocaleDateString('es-AR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Sin datos'
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {economicStats?.data?.bestDay?.orders || 0} reservas
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tendencia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    {economicStats?.data?.trend > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`text-2xl font-bold ${
                      economicStats?.data?.trend > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {Math.abs(economicStats?.data?.trend || 0).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {economicStats?.data?.trend > 0 ? 'Crecimiento' : 'Descenso'} en el período
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resumen del Período</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Período:</span>
                    <span className="font-medium">{economicStats?.data?.period || 30} días</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Ingresos:</span>
                    <span className="font-medium">{formatCurrency(economicStats?.data?.totalRevenue || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Reservas:</span>
                    <span className="font-medium">{economicStats?.data?.totalOrders || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}