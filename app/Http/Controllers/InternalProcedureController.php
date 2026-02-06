<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\InternalProcedure;
use App\Models\Messenger;
use App\Services\BeetrackService;
use Inertia\Inertia;

class InternalProcedureController extends Controller
{
    public function index(Request $request)
    {
        $query = InternalProcedure::with('messenger');

        // Filter by status
        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        // Filter by messenger
        if ($request->has('messenger_id') && $request->messenger_id !== '') {
            $query->where('messenger_id', $request->messenger_id);
        }

        $procedures = $query->orderBy('created_at', 'desc')->paginate(20);

        return Inertia::render('InternalProcedures/Index', [
            'procedures' => $procedures,
            'messengers' => Messenger::where('is_active', true)->orderBy('name')->get(),
            'filters' => $request->only(['status', 'messenger_id'])
        ]);
    }

    public function create()
    {
        return Inertia::render('InternalProcedures/Create', [
            'messengers' => Messenger::where('is_active', true)->orderBy('name')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'messenger_id' => 'nullable|exists:messengers,id',
            'description' => 'required|string|max:1000',
            'destination_address' => 'required|string|max:500',
            'contact_name' => 'required|string|max:255',
            'contact_phone' => 'required|string|max:50',
            'contact_email' => 'nullable|email|max:255',
        ]);

        $procedure = InternalProcedure::create($validated);

        return redirect()->route('internal-procedures.index')
            ->with('success', "Trámite {$procedure->code} creado exitosamente.");
    }

    public function sync($id, BeetrackService $beetrack)
    {
        $procedure = InternalProcedure::findOrFail($id);

        if ($procedure->status === 'synced') {
            return back()->withErrors(['sync' => 'Este trámite ya fue sincronizado.']);
        }

        try {
            $result = $beetrack->createDispatch([
                'guide' => $procedure->code,
                'contact' => $procedure->contact_name,
                'phone' => $procedure->contact_phone,
                'email' => $procedure->contact_email,
                'address' => $procedure->destination_address,
                'description' => $procedure->description,
                'messenger_id' => $procedure->messenger_id,
            ]);

            if ($result['success']) {
                $procedure->update([
                    'status' => 'synced',
                    'beetrack_id' => $result['dispatch_id'] ?? null
                ]);

                return back()->with('success', "Trámite {$procedure->code} sincronizado con Beetrack.");
            } else {
                $procedure->update(['status' => 'failed']);
                return back()->withErrors(['sync' => $result['message'] ?? 'Error al sincronizar.']);
            }
        } catch (\Exception $e) {
            $procedure->update(['status' => 'failed']);
            return back()->withErrors(['sync' => 'Error: ' . $e->getMessage()]);
        }
    }
}
