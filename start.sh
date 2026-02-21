#!/bin/bash

# Script simplificado para desarrollo local (localhost)

# Limpiar procesos previos
pkill -f "php artisan" 2>/dev/null
pkill -f "vite" 2>/dev/null
fuser -k 8000/tcp 8080/tcp 5173/tcp 2>/dev/null
sleep 1

# Fijar .env para localhost
sed -i "s|^APP_URL=.*|APP_URL=http://localhost:8000|" .env
sed -i "s|^REVERB_HOST=.*|REVERB_HOST=\"localhost\"|" .env
sed -i "s|^VITE_REVERB_HOST=.*|VITE_REVERB_HOST=\"localhost\"|" .env

echo ""
echo "🚀 Iniciando Mensajeros LFH (localhost)..."
echo "   ➜  http://localhost:8000"
echo ""

# Usar concurrently para ejecutar todos los servicios
npx concurrently \
    --names "BACK,FRONT,REVERB,QUEUE" \
    --prefix-colors "blue,green,magenta,yellow" \
    "php artisan serve --port=8000" \
    "npm run dev" \
    "php artisan reverb:start" \
    "php artisan queue:work"
