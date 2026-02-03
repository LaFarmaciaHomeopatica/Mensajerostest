<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('verify:login', function () {
    $email = 'despachoslfh@lafarmacia.com';
    $password = 'asd123';

    $u = App\Models\User::where('email', $email)->first();
    if (!$u) {
        $this->error("User not found: $email");
        return;
    }

    $this->info("User found: {$u->email}");
    $this->info("Current Hash: {$u->password}");

    if (Illuminate\Support\Facades\Hash::check($password, $u->password)) {
        $this->info("MATCH! Password is correct.");
    } else {
        $this->error("FAIL! Password mismatch.");
        $this->info("Fixing...");
        $u->password = $password; // Rely on cast
        $u->save();
        $this->info("New Hash: {$u->password}");

        if (Illuminate\Support\Facades\Hash::check($password, $u->password)) {
            $this->info("MATCH after fix!");
        } else {
            $this->error("STILL FAILING after fix!");
        }
    }
});
