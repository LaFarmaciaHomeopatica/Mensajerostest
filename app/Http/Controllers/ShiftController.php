<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Messenger;
use App\Models\ShiftCompletion;

class ShiftController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'messenger_id' => 'required|exists:messengers,id',
        ]);

        $messenger = Messenger::findOrFail($request->messenger_id);

        ShiftCompletion::create([
            'messenger_id' => $messenger->id,
            'finished_at' => now(),
        ]);

        return back()->with('success', [
            'type' => 'shift_finished',
            'messenger_name' => $messenger->name,
            'message' => '¡Buen descanso! Hasta mañana.'
        ]);
    }
}
