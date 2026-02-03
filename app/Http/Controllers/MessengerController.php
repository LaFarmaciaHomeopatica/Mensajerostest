<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Messenger;
use Inertia\Inertia;

class MessengerController extends Controller
{
    public function index()
    {
        return Inertia::render('Messengers/Index', [
            'messengers' => Messenger::all()
        ]);
    }

    public function create()
    {
        return Inertia::render('Messengers/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'vehicle' => 'required|string|max:255|unique:messengers',
            'beetrack_id' => 'nullable|string',
            'lunch_duration' => 'required|integer|min:1',
            'location' => 'required|string', // principal, teusaquillo
            'is_active' => 'boolean'
        ]);

        Messenger::create($validated);

        return redirect()->route('messengers.index')->with('success', 'Mensajero creado correctamente.');
    }

    public function edit(Messenger $messenger)
    {
        return Inertia::render('Messengers/Edit', [
            'messenger' => $messenger
        ]);
    }

    public function update(Request $request, Messenger $messenger)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'vehicle' => 'required|string|max:255|unique:messengers,vehicle,' . $messenger->id,
            'beetrack_id' => 'nullable|string',
            'lunch_duration' => 'required|integer|min:1',
            'location' => 'required|string',
            'is_active' => 'boolean'
        ]);

        $messenger->update($validated);

        return redirect()->route('messengers.index')->with('success', 'Mensajero actualizado correctamente.');
    }

    public function destroy(Messenger $messenger)
    {
        $messenger->delete();
        return redirect()->route('messengers.index')->with('success', 'Mensajero eliminado.');
    }
}
