<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\InternalProcedure;
use App\Models\Messenger;
use App\Services\BeetrackService;
use Inertia\Inertia;

class InternalProcedureController extends Controller
{
    use \App\Traits\BroadcastsMessengerStatus;
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
            'item_name' => 'nullable|string|max:255',
            'item_quantity' => 'nullable|integer|min:1',
            'item_code' => 'nullable|string|max:100',
            'contact_identifier' => 'nullable|string|max:100',
            'destination_address' => 'required|string|max:500',
            'destination_city' => 'nullable|string|max:255',
            'contact_name' => 'required|string|max:255',
            'contact_phone' => 'nullable|string|max:50',
            'contact_email' => 'nullable|email|max:255',
            'min_delivery_at' => 'nullable|date',
            'max_delivery_at' => 'nullable|date',
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
                'item_name' => $procedure->item_name,
                'item_quantity' => $procedure->item_quantity,
                'item_code' => $procedure->item_code,
                'contact_identifier' => $procedure->contact_identifier,
                'contact_name' => $procedure->contact_name,
                'contact_phone' => $procedure->contact_phone,
                'contact_email' => $procedure->contact_email,
                'address' => $procedure->destination_address,
                'city' => $procedure->destination_city,
                'min_delivery_at' => $procedure->min_delivery_at,
                'max_delivery_at' => $procedure->max_delivery_at,
                'priority' => 'Normal', // Default or removed from DB, but API might need it? Beetrack usually defaults. Let's send 'Normal' hardcoded or remove it.
                // Assuming Beetrack defaults if missing or we just send Normal.
                // Let's remove it if db column is gone, but the API might expect it.
                // If the user wants to remove the field from UI and DB, we can hardcode a default for the API call if required.
                // 'priority' => 'Normal', 
                'messenger_id' => $procedure->messenger_id,

            ]);

            if ($result['success']) {
                $procedure->update([
                    'status' => 'synced',
                    'beetrack_id' => $result['dispatch_id'] ?? null
                ]);

                $this->broadcastStatus(true); // Clear cache because Beetrack status changed

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

    public function syncBulk(Request $request, BeetrackService $beetrack)
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'required|integer|exists:internal_procedures,id'
        ]);

        $procedures = InternalProcedure::whereIn('id', $validated['ids'])
            ->where('status', '!=', 'synced')
            ->get();

        if ($procedures->isEmpty()) {
            return back()->withErrors(['sync' => 'No hay trámites válidos para sincronizar.']);
        }

        $results = [
            'success' => [],
            'failed' => [],
            'skipped' => []
        ];

        foreach ($procedures as $procedure) {
            try {
                $result = $beetrack->createDispatch([
                    'guide' => $procedure->code,
                    'item_name' => $procedure->item_name,
                    'item_quantity' => $procedure->item_quantity,
                    'item_code' => $procedure->item_code,
                    'contact_identifier' => $procedure->contact_identifier,
                    'contact_name' => $procedure->contact_name,
                    'contact_phone' => $procedure->contact_phone,
                    'contact_email' => $procedure->contact_email,
                    'address' => $procedure->destination_address,
                    'city' => $procedure->destination_city,
                    'min_delivery_at' => $procedure->min_delivery_at,
                    'max_delivery_at' => $procedure->max_delivery_at,
                    'priority' => 'Normal',
                    'messenger_id' => $procedure->messenger_id,
                ]);

                if ($result['success']) {
                    $procedure->update([
                        'status' => 'synced',
                        'beetrack_id' => $result['dispatch_id'] ?? null
                    ]);
                    $results['success'][] = $procedure->code;
                } else {
                    $procedure->update(['status' => 'failed']);
                    $results['failed'][] = $procedure->code;
                }
            } catch (\Exception $e) {
                $procedure->update(['status' => 'failed']);
                $results['failed'][] = $procedure->code;
            }
        }

        $this->broadcastStatus(true); // Clear cache

        $successCount = count($results['success']);
        $failedCount = count($results['failed']);

        if ($successCount > 0 && $failedCount === 0) {
            return back()->with('success', "Se sincronizaron {$successCount} trámite(s) exitosamente.");
        } elseif ($successCount > 0 && $failedCount > 0) {
            return back()->with('warning', "Se sincronizaron {$successCount} trámite(s). {$failedCount} fallaron.");
        } else {
            return back()->withErrors(['sync' => "No se pudo sincronizar ningún trámite."]);
        }
    }
}
