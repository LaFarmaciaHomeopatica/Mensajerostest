<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MessengerMetric extends Model
{
    protected $fillable = [
        'date',
        'messenger_id',
        'vehicle_plate',
        'total_routes',
        'completed_routes',
        'active_routes',
        'avg_time_per_route',
        'total_deliveries',
        'successful_deliveries',
        'failed_deliveries',
        'on_time_deliveries',
        'late_deliveries',
        'completion_rate',
        'on_time_rate',
        'last_synced_at',
    ];

    protected $casts = [
        'date' => 'date',
        'avg_time_per_route' => 'decimal:2',
        'completion_rate' => 'decimal:2',
        'on_time_rate' => 'decimal:2',
        'last_synced_at' => 'datetime',
    ];

    public function messenger(): BelongsTo
    {
        return $this->belongsTo(Messenger::class);
    }

    /**
     * Get success rate percentage
     */
    public function getSuccessRateAttribute(): float
    {
        if ($this->total_deliveries === 0) {
            return 0;
        }
        return round(($this->successful_deliveries / $this->total_deliveries) * 100, 2);
    }

    /**
     * Get failure rate percentage
     */
    public function getFailureRateAttribute(): float
    {
        if ($this->total_deliveries === 0) {
            return 0;
        }
        return round(($this->failed_deliveries / $this->total_deliveries) * 100, 2);
    }

    /**
     * Check if metrics are fresh (synced within last hour)
     */
    public function isFresh(): bool
    {
        if (!$this->last_synced_at) {
            return false;
        }
        return $this->last_synced_at->diffInMinutes(now()) < 60;
    }
}
