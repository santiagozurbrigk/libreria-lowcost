import { Router } from 'express';
import { z } from 'zod';
import { getSupabaseAdmin } from '../config/database';
import { authenticateToken, requireStaff, optionalAuth, AuthRequest } from '../middlewares/auth';
import { createError } from '../middlewares/errorHandler';
import axios from 'axios';

const router = Router();

// Función para enviar notificaciones a n8n
const sendNotificationToN8N = async (type: string, data: any) => {
  try {
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!n8nWebhookUrl) {
      console.log('N8N_WEBHOOK_URL no configurado, saltando notificación');
      return;
    }

    await axios.post(n8nWebhookUrl, {
      type,
      data,
      timestamp: new Date().toISOString()
    }, {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ Notificación enviada a n8n: ${type}`);
  } catch (error) {
    console.error('❌ Error enviando notificación a n8n:', error);
  }
};

// Esquemas de validación
const orderItemSchema = z.object({
  product_id: z.number().int().positive('ID de producto inválido'),
  quantity: z.number().int().positive('La cantidad debe ser positiva'),
  subtotal: z.number().positive('El subtotal debe ser positivo')
});

const createOrderSchema = z.object({
  customer_name: z.string().min(2, 'El nombre del cliente es requerido'),
  customer_phone: z.string().min(8, 'El teléfono del cliente es requerido'),
  customer_email: z.string().email('Email inválido').optional(),
  items: z.array(orderItemSchema).min(1, 'Debe incluir al menos un producto'),
  total: z.number().positive('El total debe ser positivo')
});

const updateOrderSchema = z.object({
  status: z.enum(['pendiente', 'preparando', 'listo', 'entregado']).optional(),
  is_paid: z.boolean().optional()
});

// POST /orders - Crear pedido (público, pero con autenticación opcional)
router.post('/', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const validatedData = createOrderSchema.parse(req.body);
    const { customer_name, customer_phone, customer_email, items, total } = validatedData;

    // Verificar que todos los productos existen y tienen stock suficiente
    const supabaseAdmin = getSupabaseAdmin();
    for (const item of items) {
      const { data: product, error } = await supabaseAdmin
        .from('products')
        .select('id, name, stock, price')
        .eq('id', item.product_id)
        .single();

      if (error || !product) {
        throw createError(`Producto no encontrado: ${item.product_id}`, 400);
      }

      if (product.stock < item.quantity) {
        throw createError(`Stock insuficiente para ${product.name}`, 400);
      }

      // Verificar que el subtotal sea correcto
      const expectedSubtotal = product.price * item.quantity;
      if (Math.abs(item.subtotal - expectedSubtotal) > 0.01) {
        throw createError(`Subtotal incorrecto para ${product.name}`, 400);
      }
    }

    // Crear o encontrar el cliente
    let clientId;
    if (req.user?.id) {
      // Si el usuario está autenticado, usar su ID
      clientId = req.user.id;
    } else {
      // Si no está autenticado, crear un cliente temporal
      const { data: existingClient } = await supabaseAdmin
        .from('clients')
        .select('id')
        .eq('phone', customer_phone)
        .single();

      if (existingClient) {
        clientId = existingClient.id;
      } else {
        // Crear nuevo cliente sin usuario (solo con datos del checkout)
        const { data: newClient, error: clientError } = await supabaseAdmin
          .from('clients')
          .insert({
            phone: customer_phone,
            address: null
          })
          .select('id')
          .single();

        if (clientError) {
          console.error('Error creando cliente:', clientError);
          throw createError('Error creando cliente', 500);
        }
        clientId = newClient.id;
      }
    }

    // Crear el pedido
    const { data: newOrder, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        client_id: clientId,
        total,
        status: 'pendiente',
        is_paid: false,
        // Almacenar datos del cliente en el pedido
        customer_name: customer_name,
        customer_email: customer_email,
        customer_phone: customer_phone
      })
      .select('*')
      .single();

    if (orderError) {
      throw createError('Error creando pedido', 500);
    }

    // Crear los items del pedido
    const orderItems = items.map(item => ({
      order_id: newOrder.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.subtotal / item.quantity // Precio unitario
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error inserting order items:', itemsError);
      // Si falla la creación de items, eliminar el pedido
      await supabaseAdmin.from('orders').delete().eq('id', newOrder.id);
      throw createError('Error creando items del pedido', 500);
    }

    // Actualizar stock de productos
    for (const item of items) {
      // Primero obtener el stock actual
      const { data: product } = await supabaseAdmin
        .from('products')
        .select('stock')
        .eq('id', item.product_id)
        .single();

      if (product) {
        const newStock = product.stock - item.quantity;
        const { error: stockError } = await supabaseAdmin
          .from('products')
          .update({ stock: newStock })
          .eq('id', item.product_id);

        if (stockError) {
          console.error('Error actualizando stock:', stockError);
        }
      }
    }

    // Obtener el pedido completo con items
    const { data: completeOrder } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        clients (
          id,
          phone,
          address,
          users (
            id,
            full_name,
            email
          )
        ),
        order_items (
          id,
          quantity,
          price,
          products (
            id,
            name,
            sku
          )
        )
      `)
      .eq('id', newOrder.id)
      .single();

    res.status(201).json({
      success: true,
      message: 'Pedido creado exitosamente',
      data: completeOrder
    });
  } catch (error) {
    next(error);
  }
});

// GET /orders - Listar pedidos (según rol)
router.get('/', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const { page = 1, limit = 20, status, customer_phone } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const supabaseAdmin = getSupabaseAdmin();
    let query = supabaseAdmin
      .from('orders')
      .select(`
        *,
        clients (
          id,
          phone,
          address,
          users (
            id,
            full_name,
            email
          )
        ),
        order_items (
          id,
          quantity,
          price,
          products (
            id,
            name,
            sku
          )
        )
      `)
      .order('created_at', { ascending: false });

    // Filtros según rol
    if (req.user?.role === 'cliente') {
      // Para clientes, necesitamos filtrar después de obtener los datos
      // ya que no podemos usar eq en relaciones anidadas directamente
    }

    // Filtros adicionales
    if (status) {
      query = query.eq('status', status);
    }

    if (customer_phone) {
      // Para filtrar por teléfono, necesitamos hacer una consulta más compleja
      // Por ahora, lo manejaremos después de obtener los datos
    }

    // Paginación
    query = query.range(offset, offset + Number(limit) - 1);

    const { data: orders, error, count } = await query;

    if (error) {
      throw createError('Error obteniendo pedidos', 500);
    }

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        pages: Math.ceil((count || 0) / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /orders/:id - Obtener pedido por ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const supabaseAdmin = getSupabaseAdmin();
    let query = supabaseAdmin
      .from('orders')
      .select(`
        *,
        clients (
          id,
          phone,
          address,
          users (
            id,
            full_name,
            email
          )
        ),
        order_items (
          id,
          quantity,
          price,
          products (
            id,
            name,
            sku
          )
        )
      `)
      .eq('id', id)
      .single();

    // Si es cliente, solo puede ver sus propios pedidos
    if (req.user?.role === 'cliente') {
      // Para clientes, necesitamos filtrar después de obtener los datos
      // ya que no podemos usar eq en relaciones anidadas directamente
    }

    const { data: order, error } = await query;

    if (error || !order) {
      throw createError('Pedido no encontrado', 404);
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /orders/:id - Actualizar pedido (solo staff)
router.patch('/:id', authenticateToken, requireStaff, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const validatedData = updateOrderSchema.parse(req.body);

    // Verificar que el pedido existe
    const supabaseAdmin = getSupabaseAdmin();
    const { data: existingOrder } = await supabaseAdmin
      .from('orders')
      .select('id, status, customer_name, customer_phone, customer_email, total')
      .eq('id', id)
      .single();

    if (!existingOrder) {
      throw createError('Pedido no encontrado', 404);
    }

    const { data: updatedOrder, error } = await supabaseAdmin
      .from('orders')
      .update(validatedData)
      .eq('id', id)
      .select(`
        *,
        clients (
          id,
          phone,
          address,
          users (
            id,
            full_name,
            email
          )
        ),
        order_items (
          id,
          quantity,
          price,
          products (
            id,
            name,
            sku
          )
        )
      `)
      .single();

    if (error) {
      throw createError('Error actualizando pedido', 500);
    }

    // Enviar notificaciones cuando el status cambia
    if (validatedData.status && validatedData.status !== existingOrder.status) {
      if (validatedData.status === 'listo') {
        // Notificar que el pedido está listo para retirar
        await sendNotificationToN8N('order_ready', {
          order_id: id,
          customer_name: existingOrder.customer_name,
          customer_phone: existingOrder.customer_phone,
          customer_email: existingOrder.customer_email,
          total: existingOrder.total,
          status: 'listo'
        });
      } else if (validatedData.status === 'entregado') {
        // Notificar que el pedido fue retirado
        await sendNotificationToN8N('order_delivered', {
          order_id: id,
          customer_name: existingOrder.customer_name,
          customer_phone: existingOrder.customer_phone,
          customer_email: existingOrder.customer_email,
          total: existingOrder.total,
          status: 'entregado'
        });
      }
    }

    res.json({
      success: true,
      message: 'Pedido actualizado exitosamente',
      data: updatedOrder
    });
  } catch (error) {
    next(error);
  }
});

// Eliminar pedido
router.delete('/:id', authenticateToken, requireStaff, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const supabaseAdmin = getSupabaseAdmin();

    // Verificar que el pedido existe
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (orderError || !order) {
      throw createError('Pedido no encontrado', 404);
    }

    // Eliminar items del pedido primero (por las foreign keys)
    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .delete()
      .eq('order_id', id);

    if (itemsError) {
      console.error('Error eliminando items del pedido:', itemsError);
      throw createError('Error eliminando items del pedido', 500);
    }

    // Eliminar el pedido
    const { error: deleteError } = await supabaseAdmin
      .from('orders')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error eliminando pedido:', deleteError);
      throw createError('Error eliminando pedido', 500);
    }

    return res.json({
      success: true,
      message: 'Pedido eliminado exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

export { router as orderRoutes };
