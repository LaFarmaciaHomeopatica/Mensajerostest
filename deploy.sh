#!/bin/bash
set -e

echo "🚀 Iniciando despliegue de producción..."

# 1. Instalar dependencias de PHP
echo "📦 Instalando dependencias de Composer..."
composer install --no-dev --optimize-autoloader

# 2. Instalar dependencias de JS y generar build
echo "✅ Assets ya compilados en local (carpeta public/build), saltando Vite."
# npm install
# npm run build

# 3. Crear carpetas de cache temporales (requerido por Laravel)
echo "📁 Verificando carpetas temporales..."
mkdir -p storage/framework/views
mkdir -p storage/framework/cache/data
mkdir -p storage/framework/sessions
chmod -R 775 storage bootstrap/cache

# 4. Ejecutar migraciones (sin seeders por seguridad, a menos que se fuerce)
echo "📂 Ejecutando migraciones..."
php artisan migrate --force

# 4. Optimizar aplicaciones Laravel
echo "✨ Optimizando Laravel (config, routes, views)..."
php artisan optimize
php artisan view:cache
php artisan event:cache

# 5. Reiniciar colas y WebSockets si es necesario
echo "🔄 Reiniciando Reverb y colas..."
php artisan reverb:restart || true
php artisan queue:restart || true

echo "✅ ¡Despliegue completado con éxito!"
