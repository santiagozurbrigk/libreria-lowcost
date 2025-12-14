# 📚 Guía de Usuario - Librería Low Cost

**Versión:** 1.0  
**Fecha:** Diciembre 2024

---

## 📋 Tabla de Contenidos

1. [Acceso al Sistema](#acceso-al-sistema)
2. [Roles y Permisos](#roles-y-permisos)
3. [Rutas del Sistema](#rutas-del-sistema)
4. [Creación del Primer Usuario Admin](#creación-del-primer-usuario-admin)
5. [Guía de Uso para Clientes](#guía-de-uso-para-clientes)
6. [Guía de Uso para Administradores](#guía-de-uso-para-administradores)
7. [Guía de Uso para Empleados](#guía-de-uso-para-empleados)
8. [API del Backend](#api-del-backend)

---

## 🔐 Acceso al Sistema

### URLs de Producción

- **Frontend (Cliente):** `https://tu-frontend.vercel.app`
- **Backend API:** `https://tu-backend.onrender.com`
- **Panel Admin:** `https://tu-frontend.vercel.app/admin`

### Credenciales por Defecto

**⚠️ IMPORTANTE:** El sistema no viene con usuarios predefinidos. Debes crear el primer usuario administrador siguiendo las instrucciones en la sección [Creación del Primer Usuario Admin](#creación-del-primer-usuario-admin).

---

## 👥 Roles y Permisos

El sistema tiene tres tipos de usuarios con diferentes niveles de acceso:

### 🔴 Administrador (`admin`)
- **Acceso completo** al sistema
- Puede ver estadísticas y reportes
- Puede gestionar productos, pedidos y usuarios
- Acceso a todas las rutas administrativas

**Rutas accesibles:**
- `/admin` - Dashboard con estadísticas
- `/admin/products` - Gestión de productos
- `/admin/orders` - Gestión de pedidos
- `/admin/users` - Gestión de usuarios

### 🔵 Empleado (`empleado`)
- Puede gestionar productos y pedidos
- **NO** puede ver estadísticas ni gestionar usuarios
- Acceso limitado al panel administrativo

**Rutas accesibles:**
- `/admin/products` - Gestión de productos
- `/admin/orders` - Gestión de pedidos

### 🟢 Cliente (`cliente`)
- Acceso solo al catálogo público
- Puede realizar pedidos sin necesidad de registro
- No tiene acceso al panel administrativo

**Rutas accesibles:**
- `/` - Catálogo de productos
- `/checkout` - Proceso de pedido

---

## 🗺️ Rutas del Sistema

### 🌐 Rutas Públicas (Frontend)

| Ruta | Descripción | Acceso |
|------|-------------|--------|
| `/` | Catálogo de productos | Público |
| `/checkout` | Proceso de pedido | Público |
| `/login` | Inicio de sesión | Público |
| `/register` | Registro de nuevo usuario | Público |

### 🔒 Rutas Administrativas (Frontend)

| Ruta | Descripción | Rol Requerido |
|------|-------------|----------------|
| `/admin` | Dashboard con estadísticas | `admin` |
| `/admin/products` | Gestión de productos | `empleado` o `admin` |
| `/admin/orders` | Gestión de pedidos | `empleado` o `admin` |
| `/admin/users` | Gestión de usuarios | `admin` |

**Nota:** Los administradores pueden acceder a todas las rutas de empleado.

---

## 👤 Creación del Primer Usuario Admin

Como el sistema no tiene usuarios predefinidos, necesitas crear el primer administrador. Tienes dos opciones:

### Opción 1: Crear usuario mediante registro (Recomendado)

1. Ve a la ruta de registro: `https://tu-frontend.vercel.app/register`
2. Completa el formulario con tus datos
3. **IMPORTANTE:** El registro por defecto crea usuarios con rol `cliente`
4. Después del registro, necesitarás cambiar el rol manualmente en la base de datos (ver Opción 2, paso 3)

### Opción 2: Crear usuario directamente en Supabase

1. Accede a tu panel de Supabase
2. Ve a la tabla `users`
3. Inserta un nuevo registro con los siguientes datos:
   ```sql
   INSERT INTO users (full_name, email, password_hash, role_id, created_at)
   VALUES (
     'Tu Nombre',
     'admin@libreria.com',
     '$2a$12$TuHashDeContraseñaAqui', -- Ver nota abajo
     1, -- 1 = admin, 2 = empleado, 3 = cliente
     NOW()
   );
   ```

   **Para generar el hash de contraseña:**
   - Usa un generador de bcrypt online (https://bcrypt-generator.com/)
   - O ejecuta en Node.js:
     ```javascript
     const bcrypt = require('bcryptjs');
     const hash = await bcrypt.hash('tu_contraseña', 12);
     console.log(hash);
     ```

4. Guarda el registro
5. Ahora puedes iniciar sesión con:
   - **Email:** `admin@libreria.com`
   - **Contraseña:** La contraseña que usaste para generar el hash

### Opción 3: Usar el endpoint de registro con modificación manual

1. Registra un usuario normal en `/register`
2. Ve a Supabase → Tabla `users`
3. Encuentra tu usuario recién creado
4. Cambia el campo `role_id` de `3` (cliente) a `1` (admin)
5. Guarda los cambios

---

## 🛒 Guía de Uso para Clientes

### Navegar el Catálogo

1. Accede a la página principal: `https://tu-frontend.vercel.app`
2. Explora los productos disponibles
3. Usa la barra de búsqueda para encontrar productos específicos
4. Haz clic en un producto para ver más detalles

### Agregar Productos al Carrito

1. En el catálogo, haz clic en **"Agregar al Carrito"** en el producto deseado
2. El botón flotante del carrito (esquina inferior derecha) mostrará la cantidad de items
3. Haz clic en el botón del carrito para ver los productos agregados
4. Puedes ajustar las cantidades o eliminar productos desde el carrito

### Realizar un Pedido

1. Abre el carrito (botón flotante)
2. Verifica los productos y cantidades
3. Haz clic en **"Proceder al Pedido"**
4. Completa el formulario con tus datos:
   - **Nombre completo**
   - **Email**
   - **Teléfono**
5. Haz clic en **"Confirmar Pedido"**
6. Recibirás una confirmación de que tu pedido fue recibido

### Seguimiento del Pedido

- Los clientes **no tienen un panel de seguimiento** en esta versión
- Recibirás una notificación por WhatsApp cuando tu pedido esté listo para retirar
- El estado del pedido se actualiza en el panel administrativo

---

## 🎛️ Guía de Uso para Administradores

### Acceso al Panel

1. Ve a: `https://tu-frontend.vercel.app/login`
2. Inicia sesión con tus credenciales de administrador
3. Serás redirigido automáticamente al Dashboard (`/admin`)

### Dashboard (`/admin`)

El dashboard muestra:
- **Estadísticas de ventas:** Total de ventas, ventas del período
- **Estadísticas de productos:** Total de productos, productos con bajo stock
- **Estadísticas de clientes:** Total de clientes registrados
- **Gráficos:** Ventas por período, productos más vendidos
- **Estadísticas económicas:** Ingresos históricos

### Gestión de Productos (`/admin/products`)

#### Crear un Producto

1. Haz clic en **"Nuevo Producto"**
2. Completa el formulario:
   - **Nombre** (requerido)
   - **Descripción** (opcional)
   - **Precio** (requerido)
   - **Stock** (requerido)
   - **SKU** (opcional)
   - **Código de Barras** (opcional)
   - **Imagen:** Sube una imagen del producto
3. Haz clic en **"Crear Producto"**

#### Editar un Producto

1. En la lista de productos, haz clic en el ícono de **editar** (lápiz)
2. Modifica los campos necesarios
3. Haz clic en **"Actualizar Producto"**

#### Eliminar un Producto

1. En la lista de productos, haz clic en el ícono de **eliminar** (papelera)
2. Confirma la eliminación

#### Buscar Productos

- Usa la barra de búsqueda para filtrar por nombre o SKU
- Los resultados se actualizan automáticamente

### Gestión de Pedidos (`/admin/orders`)

#### Ver Pedidos

1. Accede a `/admin/orders`
2. Verás una lista de todos los pedidos
3. Puedes filtrar por estado usando el selector
4. Puedes buscar por cliente o ID de pedido

#### Actualizar Estado de un Pedido

1. Haz clic en el ícono de **editar** (lápiz) en el pedido deseado
2. Selecciona el nuevo estado:
   - **Pendiente:** Pedido recibido, en espera
   - **Preparando:** Pedido en proceso de preparación
   - **Listo:** Pedido listo para retirar (envía notificación WhatsApp)
   - **Entregado:** Pedido retirado por el cliente
3. Marca si el pedido fue **Pagado**
4. Haz clic en **"Actualizar Pedido"**

**⚠️ IMPORTANTE:** Cuando cambias el estado a "Listo" o "Entregado", se envía automáticamente una notificación por WhatsApp al cliente.

#### Ver Detalles de un Pedido

1. Haz clic en el ícono de **ver** (ojo) en el pedido deseado
2. Verás:
   - Información del cliente
   - Lista de productos del pedido
   - Total del pedido
   - Estado actual
   - Fecha de creación

#### Eliminar un Pedido

1. Haz clic en el ícono de **eliminar** (papelera)
2. Confirma la eliminación
3. **Nota:** Esto eliminará también todos los items asociados al pedido

### Gestión de Usuarios (`/admin/users`)

#### Ver Usuarios

1. Accede a `/admin/users`
2. Verás una lista de todos los usuarios registrados
3. Puedes filtrar por rol usando el selector
4. Puedes buscar por nombre o email

#### Crear un Usuario

1. Haz clic en **"Nuevo Usuario"**
2. Completa el formulario:
   - **Nombre completo** (requerido)
   - **Email** (requerido, debe ser único)
   - **Contraseña** (mínimo 6 caracteres)
   - **Rol:** Selecciona entre Admin, Empleado o Cliente
   - **Teléfono** (opcional)
3. Haz clic en **"Crear Usuario"**

#### Editar un Usuario

1. Haz clic en el ícono de **editar** (lápiz) en el usuario deseado
2. Modifica los campos necesarios
3. **Nota:** Si cambias el rol, el usuario perderá o ganará permisos inmediatamente
4. Haz clic en **"Actualizar Usuario"**

#### Eliminar un Usuario

1. Haz clic en el ícono de **eliminar** (papelera)
2. Confirma la eliminación
3. **⚠️ ADVERTENCIA:** Esta acción no se puede deshacer

---

## 👨‍💼 Guía de Uso para Empleados

### Acceso al Panel

1. Ve a: `https://tu-frontend.vercel.app/login`
2. Inicia sesión con tus credenciales de empleado
3. Serás redirigido automáticamente a la página de Productos (`/admin/products`)

### Gestión de Productos

Los empleados tienen acceso completo a la gestión de productos:
- Ver lista de productos
- Crear nuevos productos
- Editar productos existentes
- Eliminar productos
- Subir imágenes de productos
- Buscar productos

**Ver sección:** [Gestión de Productos](#gestión-de-productos-adminproducts) (misma funcionalidad que admin)

### Gestión de Pedidos

Los empleados tienen acceso completo a la gestión de pedidos:
- Ver lista de pedidos
- Actualizar estado de pedidos
- Ver detalles de pedidos
- Eliminar pedidos
- Filtrar y buscar pedidos

**Ver sección:** [Gestión de Pedidos](#gestión-de-pedidos-adminorders) (misma funcionalidad que admin)

### Limitaciones

Los empleados **NO** pueden:
- Acceder al Dashboard con estadísticas (`/admin`)
- Gestionar usuarios (`/admin/users`)
- Ver reportes económicos

---

## 🔌 API del Backend

### Autenticación

#### POST `/auth/register`
Registrar un nuevo usuario.

**Body:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "contraseña123",
  "role": "cliente" // opcional: "admin" | "empleado" | "cliente"
}
```

#### POST `/auth/login`
Iniciar sesión.

**Body:**
```json
{
  "email": "juan@example.com",
  "password": "contraseña123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_aqui",
  "user": {
    "id": "uuid",
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "role": "cliente"
  }
}
```

#### GET `/auth/profile`
Obtener perfil del usuario autenticado.

**Headers:**
```
Authorization: Bearer jwt_token_aqui
```

### Productos

#### GET `/products`
Listar productos (público).

**Query params:**
- `page` (opcional): Número de página
- `limit` (opcional): Items por página
- `search` (opcional): Búsqueda por nombre
- `category` (opcional): Filtrar por categoría

#### GET `/products/:id`
Obtener un producto por ID (público).

#### POST `/products`
Crear un producto (requiere autenticación de staff).

**Headers:**
```
Authorization: Bearer jwt_token_aqui
```

**Body:**
```json
{
  "name": "Lapicera Bic Azul",
  "description": "Lapicera azul de punta fina",
  "price": 150.00,
  "stock": 50,
  "sku": "LAP-BIC-AZ-001",
  "barcode": "1234567890123",
  "image_url": "https://..."
}
```

#### PATCH `/products/:id`
Actualizar un producto (requiere autenticación de staff).

#### DELETE `/products/:id`
Eliminar un producto (requiere autenticación de staff).

#### POST `/products/upload-image`
Subir imagen de producto (requiere autenticación de staff).

**Headers:**
```
Authorization: Bearer jwt_token_aqui
Content-Type: multipart/form-data
```

**Body:** FormData con campo `image`

### Pedidos

#### POST `/orders`
Crear un pedido (público, autenticación opcional).

**Body:**
```json
{
  "customer_name": "Juan Pérez",
  "customer_email": "juan@example.com",
  "customer_phone": "+5491123456789",
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "price": 150.00
    }
  ],
  "total": 300.00
}
```

#### GET `/orders`
Listar pedidos del usuario autenticado.

**Headers:**
```
Authorization: Bearer jwt_token_aqui
```

#### GET `/orders/:id`
Obtener un pedido por ID (requiere autenticación).

#### PATCH `/orders/:id`
Actualizar estado de pedido (requiere autenticación de staff).

**Body:**
```json
{
  "status": "listo", // "pendiente" | "preparando" | "listo" | "entregado"
  "is_paid": true
}
```

#### DELETE `/orders/:id`
Eliminar un pedido (requiere autenticación de staff).

### Administración

#### GET `/admin/dashboard`
Obtener estadísticas del dashboard (requiere rol admin).

#### GET `/admin/stats/sales`
Obtener estadísticas de ventas (requiere rol admin).

#### GET `/admin/stats/products`
Obtener estadísticas de productos (requiere rol admin).

#### GET `/admin/stats/customers`
Obtener estadísticas de clientes (requiere rol admin).

#### GET `/admin/stats/economic`
Obtener estadísticas económicas (requiere rol admin).

#### GET `/admin/users`
Listar usuarios (requiere rol admin).

#### GET `/admin/users/:id`
Obtener usuario por ID (requiere rol admin).

#### PATCH `/admin/users/:id`
Actualizar usuario (requiere rol admin).

#### DELETE `/admin/users/:id`
Eliminar usuario (requiere rol admin).

### Health Check

#### GET `/health`
Verificar estado del servidor.

#### GET `/health/detailed`
Verificar estado detallado del servidor y conexión a base de datos.

---

## 🔔 Notificaciones Automáticas

El sistema está configurado para enviar notificaciones automáticas por WhatsApp cuando:

1. **Pedido listo para retirar:** Cuando un empleado o admin marca un pedido como "Listo", se envía un mensaje al cliente informándole que su pedido está listo.
2. **Pedido entregado:** Cuando un empleado o admin marca un pedido como "Entregado", se envía un mensaje de confirmación al cliente.

**Configuración requerida:**
- n8n workflow configurado y activo
- WhatsApp Business API configurado
- Webhook URL configurado en el backend (`N8N_WEBHOOK_URL`)

---

## 🆘 Solución de Problemas

### No puedo iniciar sesión

1. Verifica que estés usando el email y contraseña correctos
2. Asegúrate de que el usuario existe en la base de datos
3. Verifica que el rol del usuario esté correctamente asignado (`role_id`: 1=admin, 2=empleado, 3=cliente)

### No puedo acceder a una ruta administrativa

1. Verifica que hayas iniciado sesión
2. Verifica que tu usuario tenga el rol necesario
3. Los administradores pueden acceder a todas las rutas de empleado

### Las notificaciones de WhatsApp no se envían

1. Verifica que el workflow de n8n esté activo
2. Verifica que la URL del webhook esté correctamente configurada en el backend
3. Verifica que el número de teléfono del cliente esté en formato internacional (+54...)
4. Revisa los logs de n8n para ver si hay errores

### Error al subir imágenes

1. Verifica que el archivo sea una imagen (jpg, png, gif, etc.)
2. Verifica que el tamaño no exceda 5MB
3. Verifica que el bucket de Supabase Storage esté configurado correctamente

---

## 📞 Soporte

Para problemas técnicos o consultas, contacta al equipo de desarrollo.

---

**Última actualización:** Diciembre 2024  
**Versión del sistema:** 1.0

