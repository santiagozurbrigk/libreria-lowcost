## Despliegue: Backend en Render y Frontend en Vercel

### Variables de entorno Backend (Render)
Crea las siguientes variables en el panel de Render (Environment):

NODE_ENV=production
PORT=4000
FRONTEND_URL=https://tu-frontend.vercel.app
SUPABASE_URL=https://fkiikzcinkncvisxnkwo.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZraWlremNpbmtuY3Zpc3hua3dvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzOTE4NzgsImV4cCI6MjA3NTk2Nzg3OH0.9F9rkoACOgfgqFzShnRR5iZAauz-58o1F7zqkbNJkc8
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZraWlremNpbmtuY3Zpc3hua3dvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDM5MTg3OCwiZXhwIjoyMDc1OTY3ODc4fQ.o2wgN8VDylyEAgz7ezyNlROmjQ1YJ10qFqMqX_BRW98
SUPABASE_BUCKET=product-images
JWT_SECRET=d810a7e7ff5975a471e224a2b2a6aa04f6942399f1df22acba4ab1b967c3ddf4
N8N_WEBHOOK_URL=https://tu-n8n/render-or-cloud/webhook/order-notifications
WHATSAPP_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...

Build Command: `npm run build`
Start Command: `npm start`
Node Version: 18+

### Variables de entorno Frontend (Vercel)
**IMPORTANTE:** Las variables de entorno deben configurarse ANTES del primer deploy o requerirán un rebuild.

1. Ve a tu proyecto en Vercel → **Settings** → **Environment Variables**
2. Agrega la siguiente variable:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://tu-backend.onrender.com` (reemplaza con tu URL real de Render)
   - **Environment:** Selecciona todas (Production, Preview, Development)
3. **Guarda** y luego ve a **Deployments** → Click en los 3 puntos del último deploy → **Redeploy**

**Nota:** Vite solo expone variables que empiezan con `VITE_` al cliente. Después de agregar/modificar variables, SIEMPRE necesitas hacer un rebuild.

### CORS Backend
El backend permite orígenes definidos en `FRONTEND_URL` y dominios `*.vercel.app` automáticamente. En desarrollo permite `http://localhost:5173` y `http://localhost:3000`.

### Pasos Backend en Render
1. New → Web Service → Conecta el repo → Carpeta `Backend/`.
2. Runtime: Node 18+. Build: `npm run build`. Start: `npm start`.
3. Environment: agrega variables anteriores.
4. Deploy.

### Pasos Frontend en Vercel
1. New Project → Importa repo → Root `Frontend/`.
2. Framework: Vite. Build: `npm run build`. Output: `dist` (auto).
3. Variables: `VITE_API_URL` apuntando al Render.
4. **IMPORTANTE:** El archivo `vercel.json` está incluido en el proyecto para manejar el routing de React Router. Sin este archivo, las rutas directas (como `/admin`, `/checkout`) devolverán 404.
5. Deploy.

### Health Check
Backend expone `GET /health` y `GET /`. Configura en Render opcionalmente.

### Notas
- Si usas dominios custom, agrega la URL final a `FRONTEND_URL` (separadas por coma si son varias).
- Para previsualizaciones en Vercel (`*.vercel.app`) ya están permitidas por CORS.
- El archivo `.npmrc` en `Frontend/` está configurado con `legacy-peer-deps=true` para resolver conflictos de dependencias con React 19.
- El archivo `vercel.json` en `Frontend/` configura rewrites para que todas las rutas se redirijan a `index.html`, permitiendo que React Router maneje el routing del lado del cliente (SPA).
