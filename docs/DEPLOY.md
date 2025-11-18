## Despliegue: Backend en Render y Frontend en Vercel

### Variables de entorno Backend (Render)
Crea las siguientes variables en el panel de Render (Environment):

- NODE_ENV=production
- PORT=4000
- FRONTEND_URL=https://tu-frontend.vercel.app
- SUPABASE_URL=...
- SUPABASE_ANON_KEY=...
- SUPABASE_SERVICE_ROLE_KEY=...
- SUPABASE_BUCKET=product-images
- JWT_SECRET=...
- N8N_WEBHOOK_URL=https://tu-n8n/render-or-cloud/webhook/order-notifications
- WHATSAPP_TOKEN=...
- WHATSAPP_PHONE_NUMBER_ID=...

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
