# Instrucciones de Despliegue - Mensajeros LFH

## 1. Subir Archivos
Descomprime el archivo `produccion_LFH_YYYYMMDD.zip` en el directorio de tu servidor web (ej: `/var/www/mensajeros`).

## 2. Configurar Entorno
Renombra el archivo de ejemplo y configúralo con tus datos reales (base de datos, url, etc):
```bash
cp .env.production.example .env
nano .env
```
Asegúrate de que `APP_ENV=production` y `APP_DEBUG=false`.

## 3. Instalar Dependencias (Si es necesario)
El paquete ya incluye `vendor` compatible con PHP 8.2/8.3. 

Si necesitas reinstalar, usa:
```bash
composer install --optimize-autoloader --no-dev
```

## 4. Permisos
Asegúrate de que las carpetas de almacenamiento tengan permisos de escritura (775 o 755 dependiendo del servidor):
```bash
chmod -R 775 storage bootstrap/cache
```
*Nota: Si estás en un hosting compartido, generalmente el usuario ya es el propietario. Si usas VPS, ajusta el propietario con `chown`.*

## 5. Base de Datos
Ejecuta los siguientes comandos en orden para configurar la base de datos:

```bash
# Crear tablas
php artisan migrate --force

# Poblar datos base (Mensajeros y Locaciones)
php artisan db:seed --force

# Poblar preguntas del preoperacional
php artisan db:seed --class=PreoperationalQuestionSeeder --force

# Crear Usuarios y Roles (Admin, Lider, etc)
php artisan db:seed --class=RBACSeeder --force
```

## 6. Enlaces Simbólicos
Para que las imágenes funcionen:
```bash
php artisan storage:link
```

## 7. Optimización y Cache
Para mejorar el rendimiento:
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## Usuarios por Defecto
| Usuario       | Correo                   | Contraseña | Rol           |
| ------------- | ------------------------ | ---------- | ------------- |
| Administrador | admin@lafarmacia.com     | asd123     | administrador |
| Lider         | despachos@lafarmacia.com | asd123     | lider         |
| Regente       | regente@lafarmacia.com   | asd123     | regente       |
| Trámites      | tramites@lafarmacia.com  | asd123     | tramites      |

---
**Solución de Problemas Comunes**:
- **Error 500**: Revisa `storage/logs/laravel.log`.
- **Error de PHP**: Este paquete requiere PHP >= 8.2. Tu servidor tiene 8.3.30, lo cual es compatible.
