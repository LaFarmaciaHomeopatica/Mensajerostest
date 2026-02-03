$email = 'despachoslfh@lafarmacia.com';
$password = 'asd123';
echo "\n--- START VERIFY ---\n";
$u = App\Models\User::where('email', $email)->first();
if ($u) {
echo "User found: " . $u->email . "\n";
echo "Current Hash: " . $u->password . "\n";
$match = Illuminate\Support\Facades\Hash::check($password, $u->password);
echo "Hash Check ('$password'): " . ($match ? "MATCH" : "FAIL") . "\n";

if (!$match) {
echo "Attempting FIX...\n";
$u->password = $password;
$u->save();
$u->refresh();
echo "New Hash: " . $u->password . "\n";
echo "Recheck: " . (Illuminate\Support\Facades\Hash::check($password, $u->password) ? "MATCH" : "FAIL") . "\n";
}
} else {
echo "User NOT FOUND\n";
}
echo "--- END VERIFY ---\n";
exit