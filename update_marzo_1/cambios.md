# Guía de Reemplazo de Archivos - Update Marzo 1

Este archivo detalla la ruta exacta donde debe ser copiado cada archivo contenido en esta carpeta `update_marzo_1`.

## 📂 Estructura de Rutas

| Archivo                                             | Ruta en Producción (Desde la raíz del proyecto)                         |
| :-------------------------------------------------- | :---------------------------------------------------------------------- |
| **Backend**                                         |                                                                         |
| `AuthController.php`                                | `app/Http/Controllers/AuthController.php`                               |
| `PreoperationalController.php`                      | `app/Http/Controllers/PreoperationalController.php`                     |
| `web.php`                                           | `routes/web.php`                                                        |
| `2026_03_05_182323_create_external_forms_table.php` | `database/migrations/2026_03_05_182323_create_external_forms_table.php` |
| `DatabaseSeeder.php`                                | `database/seeders/DatabaseSeeder.php`                                   |
| **Frontend (React)**                                |                                                                         |
| `LeaderLayout.jsx`                                  | `resources/js/Layouts/LeaderLayout.jsx`                                 |
| `PreoperationalQuestions.jsx`                       | `resources/js/Pages/Reports/PreoperationalQuestions.jsx`                |
| `Create.jsx`                                        | `resources/js/Pages/Messengers/Create.jsx`                              |
| `Edit.jsx`                                          | `resources/js/Pages/Messengers/Edit.jsx`                                |
| `ExternalForms.jsx`                                 | `resources/js/Pages/Admin/ExternalForms.jsx`                            |
| `DataPurgeModal.jsx`                                | `resources/js/Components/DataPurgeModal.jsx`                            |
| **Archivos Compilados (Build)**                     |                                                                         |
| `build/` (Directorio y su contenido)                | `public/build/`                                                         |
| **Otros**                                           |                                                                         |
| `usuarios.md`                                       | `usuarios.md`                                                           |
| `actualizacion aplicacion.md`                       | `actualizacion aplicacion.md`                                           |

## 🛠️ Pasos de Comandos (En el Servidor)

Después de reemplazar los archivos anteriores (incluyendo la carpeta `public/build`), ejecute estos comandos:

1. **Migraciones:** Crea la tabla de formularios.
   ```bash
   php artisan migrate --force
   ```

2. **Seed (Opcional):** Si desea recrear los usuarios con sus nuevos roles.
   ```bash
   php artisan db:seed --class=DatabaseSeeder
   ```

3. **Limpiar Caché:**
   ```bash
   php artisan optimize:clear
   ```

> **Nota:** La compilación de React (`npm run build`) ya fue realizada e incluida en esta carpeta dentro de `public/build/`. No es necesario instalar Node.js ni ejecutar el build en el servidor SIEMPRE Y CUANDO reemplace la antigua carpeta `public/build` del servidor con la de esta carpeta de actualización.
