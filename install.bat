@echo off
echo 🚀 Instalando ZOLUTIONS Librerías...

REM Verificar que Node.js esté instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado. Por favor, instala Node.js primero.
    pause
    exit /b 1
)

REM Verificar que npm esté instalado
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm no está instalado. Por favor, instala npm primero.
    pause
    exit /b 1
)

echo ✅ Node.js y npm están instalados

REM Instalar dependencias del backend
echo 📦 Instalando dependencias del backend...
cd Backend
npm install
if %errorlevel% neq 0 (
    echo ❌ Error instalando dependencias del backend
    pause
    exit /b 1
)
echo ✅ Backend instalado correctamente

REM Instalar dependencias del frontend
echo 📦 Instalando dependencias del frontend...
cd ..\Frontend
npm install
if %errorlevel% neq 0 (
    echo ❌ Error instalando dependencias del frontend
    pause
    exit /b 1
)
echo ✅ Frontend instalado correctamente

cd ..

echo.
echo 🎉 ¡Instalación completada!
echo.
echo 📋 Próximos pasos:
echo 1. Configura las variables de entorno:
echo    - Backend: Copia 'Backend\env.example' a 'Backend\.env' y configura tus valores
echo    - Frontend: Copia 'Frontend\env.example' a 'Frontend\.env.local' y configura tus valores
echo.
echo 2. Inicia el backend:
echo    cd Backend ^&^& npm run dev
echo.
echo 3. Inicia el frontend (en otra terminal):
echo    cd Frontend ^&^& npm run dev
echo.
echo 4. Abre http://localhost:5173 en tu navegador
echo.
echo 📚 Para más información, consulta el README.md
pause
