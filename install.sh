#!/bin/bash

echo "🚀 Instalando ZOLUTIONS Librerías..."

# Verificar que Node.js esté instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor, instala Node.js primero."
    exit 1
fi

# Verificar que npm esté instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado. Por favor, instala npm primero."
    exit 1
fi

echo "✅ Node.js y npm están instalados"

# Instalar dependencias del backend
echo "📦 Instalando dependencias del backend..."
cd Backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Error instalando dependencias del backend"
    exit 1
fi
echo "✅ Backend instalado correctamente"

# Instalar dependencias del frontend
echo "📦 Instalando dependencias del frontend..."
cd ../Frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Error instalando dependencias del frontend"
    exit 1
fi
echo "✅ Frontend instalado correctamente"

cd ..

echo ""
echo "🎉 ¡Instalación completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Configura las variables de entorno:"
echo "   - Backend: Copia 'Backend/env.example' a 'Backend/.env' y configura tus valores"
echo "   - Frontend: Copia 'Frontend/env.example' a 'Frontend/.env.local' y configura tus valores"
echo ""
echo "2. Inicia el backend:"
echo "   cd Backend && npm run dev"
echo ""
echo "3. Inicia el frontend (en otra terminal):"
echo "   cd Frontend && npm run dev"
echo ""
echo "4. Abre http://localhost:5173 en tu navegador"
echo ""
echo "📚 Para más información, consulta el README.md"
