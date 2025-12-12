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
En Vercel, define variables en Project Settings → Environment Variables:

- VITE_API_URL=https://tu-backend.onrender.com

Rebuild después de cambiar variables.

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
4. Deploy.

### Health Check
Backend expone `GET /health` y `GET /`. Configura en Render opcionalmente.

### Notas
- Si usas dominios custom, agrega la URL final a `FRONTEND_URL` (separadas por coma si son varias).
- Para previsualizaciones en Vercel (`*.vercel.app`) ya están permitidas por CORS.
- El archivo `.npmrc` en `Frontend/` está configurado con `legacy-peer-deps=true` para resolver conflictos de dependencias con React 19.
