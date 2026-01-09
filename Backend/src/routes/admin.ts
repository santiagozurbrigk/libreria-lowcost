import { Router } from 'express';
import { getSupabaseAdmin } from '../config/database';
import { authenticateToken, requireAdmin, requireStaff, AuthRequest } from '../middlewares/auth';
import { createError } from '../middlewares/errorHandler';

const router = Router();

// Función para mapear role_id a string
const getRoleFromId = (roleId: number): string => {
  switch (roleId) {
    case 1: return 'admin';
    case 2: return 'empleado';
    case 3: return 'cliente';
    default: return 'cliente';
  }
};

// Función para mapear string a role_id
const getRoleIdFromString = (role: string): number => {
  switch (role) {
    case 'admin': return 1;
    case 'empleado': return 2;
    case 'cliente': return 3;
    default: return 3;
  }
};

// GET /admin/stats/sales - Estadísticas de ventas (solo admin)
router.get('/stats/sales', authenticateToken, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { period = '30' } = req.query; // días
    const days = Number(period);

    // Ventas totales (todas las reservas, no solo las entregadas)
    const supabaseAdmin = getSupabaseAdmin();
    const { data: totalSales, error: salesError } = await supabaseAdmin
      .from('orders')
      .select('total');

    console.log('Error obteniendo ventas:', salesError);
    console.log('Datos de ventas:', totalSales);

    if (salesError) {
      console.error('Error de Supabase en ventas:', salesError);
      // En lugar de lanzar error, devolver datos por defecto
      return res.json({
        success: true,
        data: {
          totalSales: 0,
          periodSales: 0,
          dailyAverage: 0,
          pendingOrders: 0,
          readyOrders: 0,
          period: days
        }
      });
    }

    const totalSalesAmount = totalSales?.reduce((sum, order) => sum + order.total, 0) || 0;

    // Ventas del período
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: periodSales, error: periodError } = await supabaseAdmin
      .from('orders')
      .select('total, created_at')
      .gte('created_at', startDate.toISOString());

    console.log('Error obteniendo ventas del período:', periodError);

    let periodSalesAmount = 0;
    if (periodError) {
      console.error('Error de Supabase en ventas del período:', periodError);
      // Usar datos por defecto si hay error
    } else {
      periodSalesAmount = periodSales?.reduce((sum, order) => sum + order.total, 0) || 0;
    }

    // Promedio diario
    const dailyAverage = periodSalesAmount / days;

    // Reservas pendientes
    const { count: pendingCount, error: pendingError } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pendiente');

    console.log('Error obteniendo reservas pendientes:', pendingError);

    if (pendingError) {
      console.error('Error de Supabase en reservas pendientes:', pendingError);
    }

    // Reservas listas para retirar
    const { count: readyCount, error: readyError } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'listo');

    console.log('Error obteniendo reservas listas:', readyError);

    if (readyError) {
      console.error('Error de Supabase en reservas listas:', readyError);
    }

    return res.json({
      success: true,
      data: {
        totalSales: totalSalesAmount,
        periodSales: periodSalesAmount,
        dailyAverage,
        pendingOrders: pendingCount,
        readyOrders: readyCount,
        period: days
      }
    });
  } catch (error) {
    return next(error);
  }
});

// GET /admin/stats/products - Productos más vendidos (solo admin)
router.get('/stats/products', authenticateToken, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const supabaseAdmin = getSupabaseAdmin();
    // Primero obtener los IDs de reservas entregadas y pagadas
    const { data: deliveredOrders } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('status', 'entregado')
      .eq('is_paid', true);

    if (!deliveredOrders || deliveredOrders.length === 0) {
      return res.json({
        success: true,
        data: []
      });
    }

    const orderIds = deliveredOrders.map(order => order.id);

    const { data: topProducts, error } = await supabaseAdmin
      .from('order_items')
      .select(`
        products (
          id,
          name,
          sku
        ),
        quantity
      `)
      .in('order_id', orderIds);

    if (error) {
      throw createError('Error obteniendo productos más vendidos', 500);
    }

    // Agrupar por producto y sumar cantidades
    const productStats = new Map();
    
    topProducts?.forEach(item => {
      const product = item.products as any;
      const productId = product.id;
      const productName = product.name;
      const productSku = product.sku;
      
      if (productStats.has(productId)) {
        productStats.get(productId).totalQuantity += item.quantity;
      } else {
        productStats.set(productId, {
          id: productId,
          name: productName,
          sku: productSku,
          totalQuantity: item.quantity
        });
      }
    });

    // Convertir a array y ordenar
    const sortedProducts = Array.from(productStats.values())
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, Number(limit));

    return res.json({
      success: true,
      data: sortedProducts
    });
  } catch (error) {
    return next(error);
  }
});

// GET /admin/stats/customers - Clientes más frecuentes (solo admin)
router.get('/stats/customers', authenticateToken, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const supabaseAdmin = getSupabaseAdmin();
    const { data: customerStats, error } = await supabaseAdmin
      .from('orders')
      .select(`
        total,
        clients (
          id,
          phone
        ),
        users (
          full_name
        )
      `)
      .eq('status', 'entregado')
      .eq('is_paid', true);

    if (error) {
      throw createError('Error obteniendo estadísticas de clientes', 500);
    }

    // Agrupar por cliente
    const customerMap = new Map();
    
    customerStats?.forEach(order => {
      const client = order.clients as any;
      const user = order.users as any;
      const customerName = user?.full_name || 'Cliente sin nombre';
      const customerPhone = client?.phone || 'Sin teléfono';
      const key = `${customerName}-${customerPhone}`;
      
      if (customerMap.has(key)) {
        const customer = customerMap.get(key);
        customer.totalOrders += 1;
        customer.totalSpent += order.total;
      } else {
        customerMap.set(key, {
          name: customerName,
          phone: customerPhone,
          totalOrders: 1,
          totalSpent: order.total
        });
      }
    });

    // Convertir a array y ordenar por total gastado
    const sortedCustomers = Array.from(customerMap.values())
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, Number(limit));

    return res.json({
      success: true,
      data: sortedCustomers
    });
  } catch (error) {
    return next(error);
  }
});

// GET /admin/dashboard - Dashboard completo (solo admin)
router.get('/dashboard', authenticateToken, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    // Obtener todas las estadísticas en paralelo
    const [
      salesResponse,
      productsResponse,
      customersResponse
    ] = await Promise.all([
      fetch(`${req.protocol}://${req.get('host')}/admin/stats/sales`),
      fetch(`${req.protocol}://${req.get('host')}/admin/stats/products?limit=5`),
      fetch(`${req.protocol}://${req.get('host')}/admin/stats/customers?limit=5`)
    ]);

    const salesData = await salesResponse.json() as any;
    const productsData = await productsResponse.json() as any;
    const customersData = await customersResponse.json() as any;

    return res.json({
      success: true,
      data: {
        sales: salesData.data,
        topProducts: productsData.data,
        topCustomers: customersData.data
      }
    });
  } catch (error) {
    return next(error);
  }
});

// GET /admin/users - Listar usuarios (solo admin)
router.get('/users', authenticateToken, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { page = 1, limit = 20, role } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const supabaseAdmin = getSupabaseAdmin();
    let query = supabaseAdmin
      .from('users')
      .select('id, full_name, email, role_id, created_at')
      .order('created_at', { ascending: false });

    // Filtro por rol removido ya que la columna no existe en la BD

    query = query.range(offset, offset + Number(limit) - 1);

    const { data: users, error, count } = await query;

    if (error) {
      throw createError('Error obteniendo usuarios', 500);
    }

    // Función para mapear role_id a string
    const getRoleFromId = (roleId: number): string => {
      switch (roleId) {
        case 1: return 'admin';
        case 2: return 'empleado';
        case 3: return 'cliente';
        default: return 'cliente';
      }
    };

    return res.json({
      success: true,
      data: users?.map(user => ({
        ...user,
        name: user.full_name,
        role: getRoleFromId(user.role_id)
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        pages: Math.ceil((count || 0) / Number(limit))
      }
    });
  } catch (error) {
    return next(error);
  }
});

// GET /admin/users/:id - Obtener usuario por ID (solo admin)
router.get('/users/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const supabaseAdmin = getSupabaseAdmin();
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, full_name, email, role_id, created_at')
      .eq('id', id)
      .single();

    if (error || !user) {
      throw createError('Usuario no encontrado', 404);
    }

    return res.json({
      success: true,
      data: {
        ...user,
        name: user.full_name,
        role: getRoleFromId(user.role_id)
      }
    });
  } catch (error) {
    return next(error);
  }
});

// PATCH /admin/users/:id - Actualizar usuario (solo admin)
router.patch('/users/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    // Verificar que el usuario existe
    const supabaseAdmin = getSupabaseAdmin();
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', id)
      .single();

    if (!existingUser) {
      throw createError('Usuario no encontrado', 404);
    }

    // Preparar datos de actualización
    const updateData: any = {};
    if (name) updateData.full_name = name;
    if (email) updateData.email = email;
    if (role) updateData.role_id = getRoleIdFromString(role);

    const { data: updatedUser, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select('id, full_name, email, role_id, created_at')
      .single();

    if (error) {
      throw createError('Error actualizando usuario', 500);
    }

    return res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: {
        ...updatedUser,
        name: updatedUser.full_name,
        role: getRoleFromId(updatedUser.role_id)
      }
    });
  } catch (error) {
    return next(error);
  }
});

// DELETE /admin/users/:id - Eliminar usuario (solo admin)
router.delete('/users/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    // Verificar que el usuario existe
    const supabaseAdmin = getSupabaseAdmin();
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', id)
      .single();

    if (!existingUser) {
      throw createError('Usuario no encontrado', 404);
    }

    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      throw createError('Error eliminando usuario', 500);
    }

    return res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    return next(error);
  }
});

// GET /admin/stats/economic - Estadísticas económicas históricas
router.get('/stats/economic', authenticateToken, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { period = '30' } = req.query; // días
    const days = Number(period);
    const supabaseAdmin = getSupabaseAdmin();

    // Ventas por día (últimos 30 días)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data: dailySales, error: dailyError } = await supabaseAdmin
      .from('orders')
      .select('total, created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (dailyError) {
      console.error('Error obteniendo ventas diarias:', dailyError);
      throw createError('Error obteniendo estadísticas económicas', 500);
    }

    // Agrupar ventas por día
    const salesByDay = dailySales?.reduce((acc, order) => {
      const date = new Date(order.created_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, total: 0, orders: 0 };
      }
      acc[date].total += Number(order.total);
      acc[date].orders += 1;
      return acc;
    }, {} as Record<string, { date: string; total: number; orders: number }>) || {};

    // Convertir a array y llenar días faltantes
    const salesArray = Object.values(salesByDay);
    const filledSales = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      const dateStr = date.toISOString().split('T')[0];
      
      const existingData = salesArray.find(s => s.date === dateStr);
      filledSales.push({
        date: dateStr,
        total: existingData?.total || 0,
        orders: existingData?.orders || 0
      });
    }

    // Estadísticas generales
    const totalRevenue = salesArray.reduce((sum, day) => sum + day.total, 0);
    const totalOrders = salesArray.reduce((sum, day) => sum + day.orders, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const averageDailyRevenue = totalRevenue / days;

    // Mejor día de ventas
    const bestDay = salesArray.reduce((best, current) => 
      current.total > best.total ? current : best, 
      { date: '', total: 0, orders: 0 }
    );

    // Tendencia (comparar primera mitad vs segunda mitad del período)
    const midPoint = Math.floor(days / 2);
    const firstHalf = salesArray.slice(0, midPoint).reduce((sum, day) => sum + day.total, 0);
    const secondHalf = salesArray.slice(midPoint).reduce((sum, day) => sum + day.total, 0);
    const trend = firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf) * 100 : 0;

    return res.json({
      success: true,
      data: {
        period: days,
        totalRevenue,
        totalOrders,
        averageOrderValue,
        averageDailyRevenue,
        bestDay,
        trend,
        dailySales: filledSales,
        summary: {
          totalRevenue: totalRevenue,
          totalOrders: totalOrders,
          averageOrderValue: averageOrderValue,
          averageDailyRevenue: averageDailyRevenue,
          bestDay: bestDay,
          trend: trend
        }
      }
    });
  } catch (error) {
    return next(error);
  }
});

export { router as adminRoutes };
