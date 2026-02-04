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

        $shiftFinished = $messenger->shiftCompletions()
            ->whereDate('finished_at', today())
            ->exists();

        $activeLunch = $messenger->lunchLogs()
            ->where('status', 'active')
            ->whereDate('start_time', today())
            ->latest()
            ->first();

        // Initialize response with basic info
        $response = [
            'id' => $messenger->id,
            'name' => $messenger->name,
            'vehicle' => $messenger->vehicle,
            'shift_finished' => $shiftFinished,
        ];

        if ($activeLunch) {
            $response['active_lunch'] = [
                'start' => $activeLunch->start_time->format('H:i'),
                'end' => $activeLunch->end_time->format('H:i'),
            ];
        }

        // Fetch shifts for the entire current week
        $startOfWeek = now()->startOfWeek();
        $endOfWeek = now()->endOfWeek();

        $dbShifts = $messenger->shifts()
            ->whereDate('date', '>=', $startOfWeek)
            ->whereDate('date', '<=', $endOfWeek)
            ->get()
            ->keyBy('date');

        $shifts = collect();
        $currentDate = $startOfWeek->copy();

        while ($currentDate <= $endOfWeek) {
            $dateStr = $currentDate->format('Y-m-d');
            $shift = $dbShifts->get($dateStr);

            $shifts->push([
                'date' => $currentDate->locale('es')->isoFormat('dddd D [de] MMMM'),
                'start_time' => $shift ? ($shift->start_time ? substr($shift->start_time, 0, 5) : null) : null,
                'end_time' => $shift ? ($shift->end_time ? substr($shift->end_time, 0, 5) : null) : null,
                'status' => $shift ? $shift->status : 'no_shift',
                'location' => $shift ? ucfirst($shift->location) : 'Sin Programación',
                'is_today' => $dateStr === today()->format('Y-m-d'),
            ]);

            $currentDate->addDay();
        }

        $response['shifts'] = $shifts;

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

        // Check if already registered lunch today
        $existingLunch = LunchLog::where('messenger_id', $messenger->id)
            ->whereDate('start_time', today())
            ->first();

        if ($existingLunch) {
            return back()->withErrors([
                'lunch_duplicate' => 'Ya has registrado tu almuerzo hoy.',
                'lunch_end_time' => $existingLunch->end_time->format('H:i')
            ]);
        }

        $startTime = now();
        $endTime = $startTime->copy()->addMinutes($messenger->lunch_duration);

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
