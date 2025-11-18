# 📚 ZOLUTIONS Librerías

Sistema integral de gestión y pedidos online para librerías minoristas.

## 🚀 Descripción General

ZOLUTIONS Librerías es una plataforma web diseñada para optimizar la operación de librerías minoristas. Incluye un **portal público** donde los clientes pueden realizar pedidos y retirarlos en el local, pagando en efectivo al momento de la entrega.

## 🧩 Estructura del Proyecto

```
/
├── Backend/          → API REST (Node.js + Express + TypeScript)
├── Frontend/         → React + Vite (portal público)
└── docs/            → Documentación técnica
```

## ⚙️ Tecnologías

| Capa | Stack |
|------|--------|
| Frontend | React + Vite + TailwindCSS + React Query + Zustand |
| Backend | Node.js + Express + TypeScript |
| Base de Datos | Supabase (PostgreSQL) |
| Hosting | Vercel (frontend) + Render (backend) |

## 🧱 Instalación

### 1. Clonar el repositorio

```bash
git clone <tu-repositorio>
cd libreria-damian
```

### 2. Configurar Backend

```bash
cd Backend
npm install
```

Crear archivo `.env` basado en `env.example`:

```env
PORT=4000
SUPABASE_URL=tu_supabase_url
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
SUPABASE_ANON_KEY=tu_anon_key
JWT_SECRET=tu_jwt_secret
NODE_ENV=development
```

### 3. Configurar Frontend

```bash
cd ../Frontend
npm install
```

Crear archivo `.env.local` basado en `env.example`:

```env
VITE_API_URL=http://localhost:4000
```

## 🧮 Scripts de Desarrollo

### Backend

```bash
cd Backend
npm run dev       # Inicia servidor en desarrollo
npm run build     # Compila TypeScript
npm start         # Ejecuta versión compilada
```

### Frontend

```bash
cd Frontend
npm run dev       # Ejecuta en localhost:5173
npm run build     # Build para producción
npm run preview   # Preview del build
```

## 🧠 Flujo de Operación

### Portal de Cliente

1. El cliente navega productos, agrega al carrito y genera un pedido
2. No hay pago online: el pedido queda "pendiente"
3. El personal lo prepara y marca como "listo para retirar"
4. n8n envía notificación por WhatsApp
5. Cuando el cliente retira y paga, el pedido se marca "entregado y pagado"

## 🧰 Endpoints Principales (Backend)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/health` | Estado del servidor |
| `POST` | `/auth/register` | Registrar usuario |
| `POST` | `/auth/login` | Iniciar sesión |
| `GET` | `/products` | Listar productos |
| `POST` | `/orders` | Crear pedido |
| `PATCH` | `/orders/:id` | Actualizar estado |

## 🎨 Características del Frontend

- **Diseño oscuro** por defecto [[memory:7251808]]
- **Responsive** para móvil y desktop [[memory:3486388]]
- **Carrito flotante** sin navbar [[memory:8472558]]
- **Catálogo de productos** con búsqueda
- **Proceso de pedido** simplificado
- **Integración con backend** via API REST

## 🔧 Configuración de Base de Datos

El sistema utiliza **Supabase** (PostgreSQL). Las tablas principales son:

- `users` - Usuarios del sistema
- `products` - Catálogo de productos
- `orders` - Pedidos de clientes
- `order_items` - Detalle de productos por pedido
- `notifications` - Historial de notificaciones

## 📱 Características Principales

- ✅ Portal público sin autenticación
- ✅ Catálogo de productos con búsqueda
- ✅ Carrito de compras persistente
- ✅ Proceso de pedido simplificado
- ✅ Diseño responsive y moderno
- ✅ Tema oscuro por defecto
- ✅ Integración completa con backend

## 🚀 Despliegue

### Frontend (Vercel)
1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Deploy automático desde `main`

### Backend (Render)
1. Conectar repositorio a Render
2. Configurar variables de entorno
3. Build automático y deploy

## 📈 Próximos Pasos

- [ ] Panel administrativo completo
- [ ] Integración con n8n para WhatsApp
- [ ] Sistema de notificaciones
- [ ] Estadísticas y reportes
- [ ] Gestión de usuarios y roles

## 📬 Contacto

**ZOLUTIONS Team**  
Desarrollo: Santiago Zurbrigk  
Versión: 1.0.0  
Última actualización: Diciembre 2024
