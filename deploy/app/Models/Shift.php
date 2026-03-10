<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Shift extends Model
{
    protected $fillable = ['messenger_id', 'date', 'start_time', 'end_time', 'status', 'location'];

    protected $casts = [
        // 'date' => 'date', // Disabled to avoid updateOrCreate issues
    ];

    public function messenger()
    {
        return $this->belongsTo(Messenger::class);
    }
}
