import { Router } from 'express';
import { z } from 'zod';
import { getSupabaseAdmin } from '../config/database';
import { authenticateToken, requireStaff, AuthRequest } from '../middlewares/auth';
import { createError } from '../middlewares/errorHandler';
import multer from 'multer';

const router = Router();

// Configuración de multer para subida de archivos
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

// Esquemas de validación
const productSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  description: z.string().optional(),
  price: z.number().positive('El precio debe ser positivo'),
  stock: z.number().int().min(0, 'El stock no puede ser negativo'),
  image_url: z.string().url().optional().or(z.literal(''))
});

const updateProductSchema = productSchema.partial().refine((data) => {
  // Al menos un campo debe ser proporcionado
  return Object.keys(data).length > 0;
}, {
  message: "Al menos un campo debe ser proporcionado para actualizar"
});

// GET /products - Listar productos (público)
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, category } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const supabaseAdmin = getSupabaseAdmin();
    let query = supabaseAdmin
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    // Filtro de búsqueda
    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,barcode.ilike.%${search}%`);
    }

    // Paginación
    query = query.range(offset, offset + Number(limit) - 1);

    const { data: products, error, count } = await query;

    if (error) {
      throw createError('Error obteniendo productos', 500);
    }

    res.json({
      success: true,
      data: products,
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

// GET /products/:id - Obtener producto por ID (público)
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const supabaseAdmin = getSupabaseAdmin();
    const { data: product, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !product) {
      throw createError('Producto no encontrado', 404);
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
});

// POST /products - Crear producto (solo staff)
router.post('/', authenticateToken, requireStaff, async (req: AuthRequest, res, next) => {
  try {
    const validatedData = productSchema.parse(req.body);

    // Verificar si el SKU ya existe (solo si se proporciona)
    const supabaseAdmin = getSupabaseAdmin();
    if (validatedData.sku) {
      const { data: existingProduct } = await supabaseAdmin
        .from('products')
        .select('id')
        .eq('sku', validatedData.sku)
        .single();

      if (existingProduct) {
        throw createError('El SKU ya existe', 400);
      }
    }

    // Filtrar campos vacíos o undefined
    const cleanData = Object.fromEntries(
      Object.entries(validatedData).filter(([_, value]) => 
        value !== undefined && value !== null && value !== ''
      )
    );
    
    console.log('Datos validados para crear producto:', validatedData);
    console.log('Datos limpios para crear producto:', cleanData);
    
    const { data: newProduct, error } = await supabaseAdmin
      .from('products')
      .insert(cleanData)
      .select('*')
      .single();

    console.log('Error de Supabase al crear producto:', error);
    console.log('Producto creado:', newProduct);

    if (error) {
      console.error('Error detallado de Supabase:', error);
      throw createError(`Error creando producto: ${error.message}`, 500);
    }

    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: newProduct
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /products/:id - Actualizar producto (solo staff)
router.patch('/:id', authenticateToken, requireStaff, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    console.log('Actualizando producto ID:', id);
    console.log('Datos recibidos:', req.body);
    
    const validatedData = updateProductSchema.parse(req.body);
    console.log('Datos validados:', validatedData);
    
    // Filtrar campos vacíos o undefined
    const cleanData = Object.fromEntries(
      Object.entries(validatedData).filter(([_, value]) => 
        value !== undefined && value !== null && value !== ''
      )
    );
    console.log('Datos limpios:', cleanData);

    // Verificar si el producto existe
    const supabaseAdmin = getSupabaseAdmin();
    const { data: existingProduct } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('id', id)
      .single();

    if (!existingProduct) {
      throw createError('Producto no encontrado', 404);
    }

    // Si se está actualizando el SKU, verificar que no exista
    if (cleanData.sku) {
      const { data: skuExists } = await supabaseAdmin
        .from('products')
        .select('id')
        .eq('sku', cleanData.sku)
        .neq('id', id)
        .single();

      if (skuExists) {
        throw createError('El SKU ya existe', 400);
      }
    }

    console.log('Ejecutando update con datos:', cleanData);
    const { data: updatedProduct, error } = await supabaseAdmin
      .from('products')
      .update(cleanData)
      .eq('id', id)
      .select('*')
      .single();
    
    console.log('Resultado del update:', { updatedProduct, error });

    if (error) {
      console.error('Error actualizando producto:', error);
      throw createError('Error actualizando producto', 500);
    }

    res.json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: updatedProduct
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /products/:id - Eliminar producto (solo admin)
router.delete('/:id', authenticateToken, requireStaff, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    // Verificar si el producto existe
    const supabaseAdmin = getSupabaseAdmin();
    const { data: existingProduct } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('id', id)
      .single();

    if (!existingProduct) {
      throw createError('Producto no encontrado', 404);
    }

    // Verificar si el producto está en algún pedido
    const { data: orderItems } = await supabaseAdmin
      .from('order_items')
      .select('id')
      .eq('product_id', id)
      .limit(1);

    if (orderItems && orderItems.length > 0) {
      throw createError('No se puede eliminar un producto que está en pedidos', 400);
    }

    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      throw createError('Error eliminando producto', 500);
    }

    res.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

// GET /products/search/:barcode - Buscar producto por código de barras
router.get('/search/:barcode', async (req, res, next) => {
  try {
    const { barcode } = req.params;

    const supabaseAdmin = getSupabaseAdmin();
    const { data: product, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('barcode', barcode)
      .single();

    if (error || !product) {
      throw createError('Producto no encontrado', 404);
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
});

// POST /products/upload-image - Subir imagen de producto
router.post('/upload-image', authenticateToken, requireStaff, upload.single('image'), async (req: AuthRequest, res, next) => {
  try {
    if (!req.file) {
      throw createError('No se proporcionó ninguna imagen', 400);
    }

    const supabaseAdmin = getSupabaseAdmin();
    
    // Generar nombre único para el archivo
    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    // Subir archivo a Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('product-images')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (error) {
      console.error('Error subiendo imagen:', error);
      throw createError('Error subiendo imagen a Supabase Storage', 500);
    }

    // Obtener URL pública de la imagen
    const { data: urlData } = supabaseAdmin.storage
      .from('product-images')
      .getPublicUrl(filePath);

    res.json({
      success: true,
      message: 'Imagen subida exitosamente',
      data: {
        url: urlData.publicUrl,
        path: filePath
      }
    });
  } catch (error) {
    next(error);
  }
});

export { router as productRoutes };