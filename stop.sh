#!/bin/bash

echo "🛑 Deteniendo servicios de Mensajeros LFH..."

# Puertos estándar del proyecto
fuser -k 8000/tcp 8080/tcp 5173/tcp 8001/tcp 5174/tcp 2>/dev/null

# Matar procesos por nombre en caso de que no estén en los puertos estándar
pkill -f "artisan serve"
pkill -f "artisan reverb:start"
pkill -f "artisan queue:work"
pkill -f "vite"

# Restaurar .env a localhost para desarrollo local
sed -i "s|^APP_URL=.*|APP_URL=http://localhost|" .env
sed -i 's|^REVERB_HOST=.*|REVERB_HOST="localhost"|' .env
sed -i 's|^VITE_REVERB_HOST=.*|VITE_REVERB_HOST="${REVERB_HOST}"|' .env

echo "✅ Servicios detenidos."
