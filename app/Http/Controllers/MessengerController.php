<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Messenger;
use Inertia\Inertia;

class MessengerController extends Controller
{
    use \App\Traits\BroadcastsMessengerStatus;
    public function index(Request $request)
    {
        $query = Messenger::query();

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('vehicle', 'like', "%{$search}%");
            });
        }

        return Inertia::render('Messengers/Index', [
            'messengers' => $query->orderBy('name')->paginate(10)->withQueryString(),
            'filters' => $request->only(['search'])
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
            'is_active' => 'boolean',
            'exclude_from_analytics' => 'boolean'
        ]);

        Messenger::create($validated);

        $this->broadcastStatus();

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
            'is_active' => 'boolean',
            'exclude_from_analytics' => 'boolean'
        ]);

        $messenger->update($validated);

        $this->broadcastStatus();

        return redirect()->route('messengers.index')->with('success', 'Mensajero actualizado correctamente.');
    }

    public function destroy(Messenger $messenger)
    {
        $messenger->delete();
        $this->broadcastStatus();
        return redirect()->route('messengers.index')->with('success', 'Mensajero eliminado.');
    }
}
