<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\LunchLog;
use App\Models\Messenger;
use App\Services\BeetrackService;
use Inertia\Inertia;

class LunchController extends Controller
{
    public function index()
    {
        return Inertia::render('Landing');
    }

    public function checkPlate(Request $request)
    {
        $request->validate(['plate' => 'required|string']);

        // Search loosely (case insensitive and partial perhaps, but specific for now)
        $messenger = Messenger::where('vehicle', $request->plate)->first();

        if (!$messenger) {
            return response()->json(['error' => 'Placa no encontrada'], 404);
        }

        if (!$messenger->is_active) {
            return response()->json(['error' => 'Mensajero inactivo. Contacte a su líder.'], 403);
        }

        $activeLunch = $messenger->lunchLogs()
            ->where('status', 'active')
            ->latest()
            ->first();

        \Log::info('Check Plate Debug', [
            'plate' => $request->plate,
            'messenger_id' => $messenger->id,
            'active_lunch_found' => (bool) $activeLunch,
            'active_lunch_data' => $activeLunch
        ]);

        $response = [
            'id' => $messenger->id,
            'name' => $messenger->name,
            'vehicle' => $messenger->vehicle
        ];

        if ($activeLunch) {
            $response['active_lunch'] = [
                'start' => $activeLunch->start_time->format('H:i'),
                'end' => $activeLunch->end_time->format('H:i'),
            ];
        }

        return response()->json($response);
    }

    public function report(Request $request)
    {
        $query = LunchLog::with('messenger')->orderBy('created_at', 'desc');

        if ($request->has('date') && $request->date) {
            $query->whereDate('start_time', $request->date);
        }

        $logs = $query->paginate(20)->withQueryString();

        return Inertia::render('Reports/Lunch', [
            'logs' => $logs,
            'filters' => $request->only(['date'])
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'messenger_id' => 'required|exists:messengers,id',
        ]);

        $messenger = Messenger::findOrFail($request->messenger_id);

        $startTime = now();
        $endTime = $startTime->copy()->addMinutes($messenger->lunch_duration);

        // Check if already active? For simplicity, we just create a new log.
        // Or we could check:
        // $active = LunchLog::where('messenger_id', $messenger->id)->where('status', 'active')->first();
        // if ($active) return back()->withErrors(...);

        LunchLog::create([
            'messenger_id' => $messenger->id,
            'start_time' => $startTime,
            'end_time' => $endTime,
            'status' => 'active',
        ]);

        return back()->with('success', [
            'message' => '¡A disfrutar! 🍔',
            'return_time' => $endTime->format('H:i'),
            'messenger_name' => $messenger->name,
        ]);
    }



    // Dashboard method moved to UnifiedController
    // public function dashboard() { ... }
}
