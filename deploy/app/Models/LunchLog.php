<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LunchLog extends Model
{
    protected $fillable = ['messenger_id', 'start_time', 'end_time', 'status'];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
    ];

    public function messenger()
    {
        return $this->belongsTo(Messenger::class);
    }
}
