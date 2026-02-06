<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function loginView()
    {
        return Inertia::render('Auth/Login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();
            \Log::info('Login Success');
            if (in_array(Auth::user()->role, ['lider', 'administrador'])) {
                return redirect()->intended('dashboard');
            }

            if (Auth::user()->role === 'regente') {
                return redirect()->intended(route('reports.preoperational'));
            }

            if (Auth::user()->role === 'tramites') {
                return redirect()->intended(route('internal-procedures.index'));
            }

            return redirect()->intended('messenger');
        }

        return back()->withErrors([
            'email' => 'Las credenciales proporcionadas no coinciden con nuestros registros.',
        ])->onlyInput('email');
    }

    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
