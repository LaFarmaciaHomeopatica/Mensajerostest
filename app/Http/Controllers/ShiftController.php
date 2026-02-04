<?php

namespace App\Http\Controllers;

use App\Models\Messenger;
use App\Models\Shift;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class ShiftController extends Controller
{
    public function index(Request $request)
    {
        // Default to current week start if no date provided
        $date = $request->input('date') ? Carbon::parse($request->input('date')) : now();
        $startOfWeek = $date->copy()->startOfWeek();
        $endOfWeek = $date->copy()->endOfWeek();

        // Fetch messengers with shifts for the specific week
        $messengers = Messenger::with([
            'shifts' => function ($query) use ($startOfWeek, $endOfWeek) {
                $query->whereBetween('date', [$startOfWeek->format('Y-m-d'), $endOfWeek->format('Y-m-d')]);
            }
        ])->get();

        return Inertia::render('Shifts/Index', [
            'messengers' => $messengers,
            'weekStart' => $startOfWeek->format('Y-m-d'),
            'weekEnd' => $endOfWeek->format('Y-m-d'),
        ]);
    }

    public function store(Request $request)
    {
        file_put_contents(base_path('debug_shifts.txt'), "Store Request: " . json_encode($request->all()) . "\n", FILE_APPEND);
        \Illuminate\Support\Facades\Log::info('Shift store request:', $request->all());

        $validated = $request->validate([
            'messenger_id' => 'required|exists:messengers,id',
            'date' => 'required|date',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i|after:start_time',
            'status' => 'required|in:present,absent',
            'location' => 'required|string',
        ]);

        // Constraint: One shift per messenger per day
        Shift::updateOrCreate(
            [
                'messenger_id' => $validated['messenger_id'],
                'date' => $validated['date'],
            ],
            [
                'start_time' => $validated['status'] === 'absent' ? null : $validated['start_time'],
                'end_time' => $validated['status'] === 'absent' ? null : $validated['end_time'],
                'status' => $validated['status'],
                'location' => $validated['location'],
            ]
        );

        return redirect()->back()->with('success', 'Turno actualizado correctamente.');
    }

    public function destroy($id)
    {
        $shift = Shift::findOrFail($id);
        $shift->delete();

        return redirect()->back()->with('success', 'Turno eliminado correctamente.');
    }
}
