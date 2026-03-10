#!/bin/bash

# Deployment script for Logística LFH

echo "🚀 Iniciando despliegue..."

# Optimizar composer
echo "📦 Instalando dependencias de PHP..."
composer install --no-dev --optimize-autoloader

# Instalar dependencias de NPM y construir assets
echo "🏗️ Construyendo assets del frontend..."
npm install
npm run build

# Ejecutar migraciones
echo "🗄️ Ejecutando migraciones..."
php artisan migrate --force

# Limpiar y cachear configuración
echo "🧹 Limpiando caché..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "✅ Despliegue completado con éxito!"
