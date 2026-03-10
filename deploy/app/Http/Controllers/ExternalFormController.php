<?php

namespace App\Http\Controllers;

use App\Models\ExternalForm;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExternalFormController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/ExternalForms', [
            'forms' => ExternalForm::orderBy('created_at', 'desc')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'url' => 'required|url',
        ]);

        ExternalForm::create($validated);

        return back()->with('success', 'Formulario agregado correctamente.');
    }

    public function destroy(ExternalForm $externalForm)
    {
        $externalForm->delete();
        return back()->with('success', 'Formulario eliminado.');
    }
}
