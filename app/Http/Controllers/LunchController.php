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
        return Inertia::render('Landing', [
            'messengers' => Messenger::all(['id', 'name']),
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
            'message' => 'Disfruta tu almuerzo!',
            'return_time' => $endTime->format('H:i'),
            'messenger_name' => $messenger->name,
        ]);
    }



    // Dashboard method moved to UnifiedController
    // public function dashboard() { ... }
}
