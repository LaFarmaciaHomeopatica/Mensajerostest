<?php
echo "<h1>Verificación de Entorno</h1>";
echo "PHP Version: " . phpversion() . "<br>";
echo "SAPI: " . php_sapi_name() . "<br>";

$extensions = ['bcmath', 'ctype', 'fileinfo', 'json', 'mbstring', 'openssl', 'pdo', 'tokenizer', 'xml', 'curl'];
echo "<h2>Extensiones:</h2><ul>";
foreach ($extensions as $ext) {
    if (extension_loaded($ext)) {
        echo "<li>✅ $ext</li>";
    } else {
        echo "<li>❌ $ext (FALTA)</li>";
    }
}
echo "</ul>";

$folders = ['storage', 'storage/logs', 'bootstrap/cache'];
echo "<h2>Permisos de Carpetas:</h2><ul>";
foreach ($folders as $folder) {
    $path = __DIR__ . '/' . $folder;
    if (is_writable($path)) {
        echo "<li>✅ $folder es escribible</li>";
    } else {
        echo "<li>❌ $folder NO es escribible (o no existe)</li>";
    }
}
echo "</ul>";

if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    echo "<li>✅ vendor/autoload.php existe</li>";
} else {
    echo "<li>❌ vendor/autoload.php NO existe (Debes ejecutar composer install)</li>";
}
echo "</ul>";
