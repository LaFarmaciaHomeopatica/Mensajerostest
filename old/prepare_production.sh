#!/bin/bash

# ====================================================
# Script de Preparación para Producción
# Mensajeros LFH
# ====================================================

set -e

echo "=========================================="
echo "  PREPARACIÓN PARA PRODUCCIÓN"
echo "  Mensajeros LFH"
echo "=========================================="

# Directorio de origen y destino
SOURCE_DIR="/home/carlos/Desktop/mensajeros_lfh"
PROD_DIR="/home/carlos/Desktop/mensajeros_lfh/produccion"

# Paso 1: Limpiar y crear directorio de producción
echo ""
echo "[1/7] Limpiando directorio de producción..."
rm -rf "$PROD_DIR"
mkdir -p "$PROD_DIR"

# Paso 2: Build de assets para producción
echo ""
echo "[2/7] Compilando assets para producción..."
cd "$SOURCE_DIR"
npm run build

# Paso 3: Optimizar dependencias de Composer
echo ""
echo "[3/7] Optimizando dependencias de Composer..."
composer install --optimize-autoloader --no-dev

# Paso 4: Copiar archivos necesarios
echo ""
echo "[4/7] Copiando archivos al directorio de producción..."

# Directorios principales
cp -r "$SOURCE_DIR/app" "$PROD_DIR/"
cp -r "$SOURCE_DIR/bootstrap" "$PROD_DIR/"
cp -r "$SOURCE_DIR/config" "$PROD_DIR/"
cp -r "$SOURCE_DIR/database" "$PROD_DIR/"
cp -r "$SOURCE_DIR/public" "$PROD_DIR/"
cp -r "$SOURCE_DIR/resources" "$PROD_DIR/"
cp -r "$SOURCE_DIR/routes" "$PROD_DIR/"
cp -r "$SOURCE_DIR/storage" "$PROD_DIR/"
cp -r "$SOURCE_DIR/vendor" "$PROD_DIR/"

# Archivos individuales
cp "$SOURCE_DIR/artisan" "$PROD_DIR/"
cp "$SOURCE_DIR/composer.json" "$PROD_DIR/"
cp "$SOURCE_DIR/composer.lock" "$PROD_DIR/"
cp "$SOURCE_DIR/package.json" "$PROD_DIR/"
cp "$SOURCE_DIR/vite.config.js" "$PROD_DIR/" 2>/dev/null || true

# Paso 5: Crear .env.example para producción
echo ""
echo "[5/7] Creando archivo .env.example..."
cat > "$PROD_DIR/.env.example" << 'ENVFILE'
APP_NAME="Mensajeros LFH"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://tu-dominio.com

APP_LOCALE=es
APP_FALLBACK_LOCALE=es
APP_FAKER_LOCALE=es_CO

LOG_CHANNEL=stack
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mensajeros_lfh
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_password

SESSION_DRIVER=database
SESSION_LIFETIME=840

FILESYSTEM_DISK=public
QUEUE_CONNECTION=database
CACHE_STORE=database
ENVFILE

# Paso 6: Limpiar archivos innecesarios del directorio de producción
echo ""
echo "[6/7] Limpiando archivos innecesarios..."
rm -rf "$PROD_DIR/.git"
rm -rf "$PROD_DIR/node_modules"
rm -rf "$PROD_DIR/tests"
rm -rf "$PROD_DIR/.env"
rm -rf "$PROD_DIR/*.php" 2>/dev/null || true  # Scripts temporales
find "$PROD_DIR" -name "*.log" -delete 2>/dev/null || true
find "$PROD_DIR" -name ".DS_Store" -delete 2>/dev/null || true

# Paso 7: Crear archivo de instrucciones
echo ""
echo "[7/7] Creando instrucciones de despliegue..."
cat > "$PROD_DIR/DEPLOY.md" << 'DEPLOYMD'
# Instrucciones de Despliegue - Mensajeros LFH

## Requisitos del Servidor
- PHP >= 8.2
- MySQL >= 8.0
- Composer
- Extensiones PHP: BCMath, Ctype, Fileinfo, JSON, Mbstring, OpenSSL, PDO, Tokenizer, XML

## Pasos de Instalación

### 1. Subir Archivos
Extraer todos los archivos al directorio web del servidor (ej: /var/www/mensajeros)

### 2. Configurar Permisos
```bash
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

### 3. Configurar Entorno
```bash
cp .env.example .env
nano .env  # Editar con credenciales reales
```

### 4. Generar Clave de Aplicación
```bash
php artisan key:generate
```

### 5. Ejecutar Migraciones
```bash
php artisan migrate --force
```

### 6. Ejecutar Seeders (Primera vez)
```bash
php artisan db:seed --class=PreoperationalQuestionSeeder --force
php artisan db:seed --class=RBACSeeder --force
```

### 7. Crear Link de Storage
```bash
php artisan storage:link
```

### 8. Cachear Configuración
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 9. Configurar Virtual Host (Apache)
```apache
<VirtualHost *:80>
    ServerName tu-dominio.com
    DocumentRoot /var/www/mensajeros/public
    
    <Directory /var/www/mensajeros/public>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

### 10. Configurar HTTPS (Recomendado)
```bash
sudo certbot --apache -d tu-dominio.com
```

## Usuarios por Defecto

| Email | Contraseña | Rol |
|-------|------------|-----|
| admin@lafarmacia.com | asd123 | administrador |
| despachos@lafarmacia.com | asd123 | lider |
| regente@lafarmacia.com | asd123 | regente |
| tramites@lafarmacia.com | asd123 | tramites |

**IMPORTANTE**: Cambiar las contraseñas después del primer login.

## Verificación
1. Acceder a https://tu-dominio.com
2. Iniciar sesión con admin@lafarmacia.com
3. Verificar acceso al Dashboard

## Soporte
En caso de problemas, revisar logs en:
- `storage/logs/laravel.log`
DEPLOYMD

# Establecer permisos correctos
echo ""
echo "Estableciendo permisos..."
chmod -R 755 "$PROD_DIR"
chmod -R 775 "$PROD_DIR/storage"
chmod -R 775 "$PROD_DIR/bootstrap/cache"

# Resumen
echo ""
echo "=========================================="
echo "  ¡PREPARACIÓN COMPLETADA!"
echo "=========================================="
echo ""
echo "Directorio de producción: $PROD_DIR"
echo ""
echo "Contenido creado:"
ls -la "$PROD_DIR"
echo ""
echo "Tamaño total:"
du -sh "$PROD_DIR"
echo ""
echo "Siguiente paso: Copiar el contenido de '$PROD_DIR' al servidor de producción"
echo ""
