<?php

namespace App\Traits;

use App\Events\MessengerStatusUpdated;
use App\Models\Messenger;
use App\Services\MessengerStatusService;
use Illuminate\Support\Facades\Log;

trait BroadcastsMessengerStatus
{
    protected function broadcastStatus($clearCache = false, $messenger = null, $statusMessage = null)
    {
        if ($clearCache) {
            app(\App\Services\BeetrackService::class)->clearCache();
        }

        $service = app(MessengerStatusService::class);

        $data = [];
        if ($messenger) {
            $data['messenger'] = $service->getSingleStatus($messenger->id);
            $data['trigger'] = [
                'id' => $messenger->id,
                'name' => $messenger->name,
                'status' => $statusMessage ?? 'ha actualizado su estado',
            ];
        } else {
            // If no specific messenger, we could send a refresh flag
            // for now, we'll avoid sending full list as it causes "Payload too large"
            $data['refresh'] = true;
        }

        \broadcast(new MessengerStatusUpdated($data));
    }
}
