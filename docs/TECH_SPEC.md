# 🧩 TECH_SPEC.md – ZOLUTIONS Librerías  
**Versión:** 1.1  
**Propósito:** Documento técnico oficial para el desarrollo del sistema de gestión y ventas online de librerías minoristas.  
**Destinatario:** Equipo de desarrollo (Cursor).  

---

## 1. Objetivo del Proyecto

Desarrollar una **plataforma completa para librerías** que permita:

- Gestionar **productos, stock, pedidos, clientes y reportes** desde un panel administrativo.  
- Permitir a los clientes **realizar pedidos online** (sin pago en línea).  
- Facilitar la **entrega física y el pago en el local**.  
- Notificar automáticamente al cliente cuando su pedido esté listo para ser retirado.  
- Brindar estadísticas precisas de ventas, stock y rendimiento operativo.  

---

## 2. Arquitectura General

| Capa | Tecnología | Descripción |
|------|-------------|-------------|
| **Frontend (Portal + Panel)** | React vite + TailwindCSS + shadcn/ui + React Query / Zustand | Portal e-commerce y panel administrativo con diseño moderno. |
| **Backend (API REST)** | Node.js + Express + TypeScript | API central de negocio, autenticación, control de permisos y conexión a Supabase. |
| **Base de Datos** | Supabase (PostgreSQL gestionado) | Tablas principales, auth, storage e integraciones. |
| **Automatización** | n8n + WhatsApp Cloud API | Notificaciones automáticas cuando el pedido esté listo. |
| **Hosting Frontend** | Vercel | CI/CD desde GitHub. |
| **Hosting Backend** | Render | Auto build + logs + escalado automático. |
| **Base de Datos** | Supabase | PostgreSQL con triggers. |
| **Pagos** | *No integrados (solo efectivo en retiro)*. |

---

## 3. Flujo de Operación

### 3.1 Portal de Cliente
0. No hay vista de Login, se redirige directamente al catalogo. (aclaración)
1. El cliente navega el catálogo y agrega productos al carrito.  
2. Completa sus datos de contacto y confirma el pedido (sin pago).  
3. El pedido se guarda con estado inicial **“pendiente”**.  
4. El panel administrativo muestra el nuevo pedido.  
5. Cuando el pedido está preparado, el empleado lo marca como **“listo para retirar”**.  
6. Se dispara un **Webhook a n8n**, que envía un mensaje por WhatsApp notificando al cliente.  
7. Cuando el cliente retira y paga en efectivo, el empleado marca el pedido como **“entregado y pagado”**.  

### 3.2 Panel Administrativo
1. Acceso por roles (admin / empleado / gerencia).  
2. Visualización de pedidos, stock y clientes.  
3. Actualización de estados del pedido:  
   - `pendiente` → recién creado  
   - `listo` → preparado para retirar  
   - `entregado` → cliente retiró y pagó  
4. Estadísticas de ventas se basan en los pedidos con estado `entregado`.  

---

## 4. Roles y Permisos

| Rol | Permisos | Descripción |
|------|-----------|-------------|
| **Admin** | Acceso total | CRUD de todo, reportes, usuarios y finanzas. |
| **Empleado** | Gestión operativa | Ver productos, actualizar stock, cambiar estados de pedido. |
| **Cliente** | Portal público | Ver catálogo, crear pedidos, recibir notificaciones. |

### Módulos por Rol

| Módulo | Admin | Empleado | Cliente |
|---------|--------|-----------|----------|
| Productos | CRUD | Editar stock | Ver |
| Pedidos | CRUD | Cambiar estado | Ver propios |
| Clientes | CRUD | Ver | Ver propio |
| Finanzas | Ver estadísticas | ❌ | ❌ |
| Reportes | Ver/Exportar | ❌ | ❌ |
| Configuración | Usuarios, roles | ❌ | ❌ |

---

## 5. Estructura de Base de Datos (Supabase)

```sql
users (
  id UUID PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  password_hash TEXT,
  role TEXT CHECK (role IN ('admin','empleado','cliente')),
  phone TEXT,
  created_at TIMESTAMP DEFAULT now()
);

products (
  id UUID PRIMARY KEY,
  name TEXT,
  sku TEXT UNIQUE,
  barcode TEXT,
  description TEXT,
  price NUMERIC(10,2),
  stock INTEGER,
  supplier TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT now()
);

orders (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  total NUMERIC(10,2),
  status TEXT CHECK (status IN ('pendiente','listo','entregado')),
  payment_method TEXT DEFAULT 'efectivo',
  paid BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);

order_items (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  product_id UUID REFERENCES products(id),
  quantity INTEGER,
  subtotal NUMERIC(10,2)
);

notifications (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  type TEXT,
  sent_at TIMESTAMP
);


## 6. API REST (Backend Express)

Autenticación
POST /auth/register
POST /auth/login
GET /auth/profile

Productos
GET /products
GET /products/:id
POST /products
PATCH /products/:id
DELETE /products/:id

Pedidos
POST /orders             // crear pedido (cliente)
PATCH /orders/:id        // actualizar estado (empleado/admin)
GET /orders              // listar pedidos (según rol)
GET /orders/:id          // detalle

Estadísticas
GET /admin/stats/sales
GET /admin/stats/products
GET /admin/stats/customers

Notificaciones
POST /notifications/send // enviar mensaje manual
GET /notifications       // historial


## 7. Estructura del Panel Administrativo
Módulos:

Dashboard: resumen general, ventas del día (pedidos entregados), pedidos pendientes.

Productos: CRUD, importación CSV, lectura por código de barras.

Pedidos: listado, filtros, actualización de estados.

Clientes: historial, contacto, cantidad de pedidos.

Estadísticas:

Total de ventas (solo paid=true)

Productos más vendidos

Promedio de ticket diario

Ranking de clientes por compras

Configuración: usuarios y roles.


## 8. Integración con Codigo de Barras

El sistema debe aceptar lectura con un lector USB conectado al equipo.

Si el producto escaneado existe → se muestra su información.

Si no existe → se crea un nuevo registro y el sistema genera un barcode interno (para imprimir y pegar).


## 8. Automatización con n8n + WhatsApp Cloud API

Flujo:

Trigger desde Supabase cuando orders.status = 'listo'.

n8n obtiene los datos del pedido y del cliente.

Envío automático del mensaje:
Hola {{nombre}}, tu pedido #{{id}} ya está listo para retirar. 
Te esperamos en la librería. Gracias por tu compra 🛍️

Registra el envío en la tabla notifications.


## 10. Variables de Entorno
PORT=4000
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ANON_KEY=
N8N_WEBHOOK_URL=
WHATSAPP_TOKEN=


## 11. Despliegue
| Capa                   | Plataforma    | Entorno    | Descripción                |
| ---------------------- | ------------- | ---------- | -------------------------- |
| **Frontend (React vite)** | Vercel        | Producción | Conexión a repo principal. |
| **Backend (Express)**  | Render       | Producción | Logs, escalado y CI/CD.    |
| **Supabase (DB)**      | Supabase      | Producción | PostgreSQL + Storage.      |
| **n8n**                | Render / VPS | Producción | Webhooks automáticos.      |


## 12. CI/CD Pipeline

Frontend (Vercel): despliegue automático en push a main.

Backend (Render): build + test + deploy continuo.

Supabase CLI: migraciones SQL versionadas.

Tests automáticos:

Validación lint

Health check de API

Verificación de endpoints críticos


## 13. Monitoreo y Logs

Vercel Analytics: métricas de frontend.

Render Logs: errores y requests.

Supabase Dashboard: rendimiento y consultas.


## 14. Roadmap de Desarrollo (IMPORTANTE aclarar siempre tareas que se van realizando, documentarlas en /docs para poder guiarse correctamente)
| Fase       | Entregables                                               |
| ---------- | --------------------------------------------------------- |
| **Fase 1** | Backend base + DB Supabase + Auth + Productos             |
| **Fase 2** | Panel administrativo funcional (pedidos, stock, clientes) |
| **Fase 3** | Portal e-commerce público sin pagos                       |
| **Fase 4** | Automatización WhatsApp + n8n                             |
| **Fase 5** | Estadísticas y refinamiento visual                        |
| **Fase 6** | Pruebas finales y deploy                                  |


## 15. Estructura de Repositorio Sugerida
/backend
  /src
    /controllers
    /routes
    /middlewares
    /services
    /utils
/frontend
  /app
  /components
  /hooks
  /lib
  /pages
/docs
  TECH_SPEC.md


## 16. Recomendaciones Técnicas para el Equipo

Implementar TypeScript full stack.

Validar inputs con Zod.

Usar JWT Auth en el backend.

Modularizar rutas por dominio (products, orders, users).

Crear middleware authorizeRole().

Implementar seed inicial: usuarios (admin/empleado), productos de muestra.

Crear endpoint /health para monitoreo.

Incluir Swagger UI (/docs) para documentación de endpoints.


✅ Notas finales:

El sistema ya no integra pagos online.

El flujo financiero depende exclusivamente del estado entregado + paid=true.

Las métricas deben basarse en esa condición.

Mantener diseño escalable para futuras integraciones (por ejemplo, si el cliente decide agregar pagos en línea más adelante).

© ZOLUTIONS – Documento Técnico Oficial
Autor: Equipo Zolutions | Preparado para desarrollo en Cursor
