<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ShiftCompletion;
use App\Models\Messenger;

class ShiftCompletionController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'messenger_id' => 'required|exists:messengers,id',
        ]);

        $messenger = Messenger::findOrFail($request->messenger_id);

        if (!$messenger->is_active) {
            return back()->withErrors(['messenger_inactive' => 'Tu usuario está inactivo.']);
        }

        // Check if already completed today
        $existing = ShiftCompletion::where('messenger_id', $messenger->id)
            ->whereDate('finished_at', today())
            ->first();

        if ($existing) {
            return back()->withErrors([
                'shift_duplicate' => 'Ya has reportado tu fin de turno hoy.'
            ]);
        }

        ShiftCompletion::create([
            'messenger_id' => $messenger->id,
            'finished_at' => now(),
        ]);

        return back()->with('success', 'Turno finalizado correctamente.');
    }
}
