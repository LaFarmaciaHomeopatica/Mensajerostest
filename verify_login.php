<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$email = 'despachoslfh@lafarmacia.com';
$password = 'asd123';

$user = User::where('email', $email)->first();

if (!$user) {
    echo "User NOT FOUND\n";
    exit(1);
}

echo "User Found: {$user->email}\n";
echo "Stored Hash: {$user->password}\n";

if (Hash::check($password, $user->password)) {
    echo "Hash Check: MATCH (Login should work)\n";
} else {
    echo "Hash Check: FAIL (Login will fail)\n";

    // Attempt fix
    echo "Attempting FIX...\n";
    $user->password = $password; // Model 'hashed' cast will handle hashing
    $user->save();
    echo "New Hash: {$user->password}\n";

    if (Hash::check($password, $user->password)) {
        echo "Hash Check After Fix: MATCH\n";
    } else {
        echo "Hash Check After Fix: STLLL FAILING\n";
    }
}
