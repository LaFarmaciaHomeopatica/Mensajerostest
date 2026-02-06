<?php

namespace App\Traits;

use App\Events\MessengerStatusUpdated;
use App\Services\MessengerStatusService;

trait BroadcastsMessengerStatus
{
    protected function broadcastStatus($clearCache = false)
    {
        if ($clearCache) {
            app(\App\Services\BeetrackService::class)->clearCache();
        }

        $service = app(MessengerStatusService::class);
        $status = $service->getFullStatus();

        broadcast(new MessengerStatusUpdated($status))->toOthers();
    }
}
