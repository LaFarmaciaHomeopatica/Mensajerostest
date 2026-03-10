<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\LunchLog;
use App\Models\Messenger;
use App\Models\DispatchLocation;
use App\Services\BeetrackService;
use Inertia\Inertia;

class UnifiedController extends Controller
{
    protected $statusService;

    public function __construct(\App\Services\MessengerStatusService $statusService)
    {
        $this->statusService = $statusService;
    }

    public function index()
    {
        $status = $this->statusService->getLocalStatus();

        return Inertia::render('Dashboard', [
            'messengers' => $status['messengers'],
            'dispatch_locations' => DispatchLocation::all(),
            'beetrack_data' => null,
        ]);
    }

    public function getMessengerStatus()
    {
        $status = $this->statusService->getLocalStatus();

        return response()->json([
            'messengers' => $status['messengers'],
            'timestamp' => now()->toDateTimeString()
        ]);
    }

    public function getBeetrackAsync()
    {
        $beetrackData = $this->statusService->getBeetrackStatus();

        return response()->json([
            'beetrack_data' => $beetrackData,
            'timestamp' => now()->toDateTimeString()
        ]);
    }
}
