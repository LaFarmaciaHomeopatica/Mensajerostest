<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Shift extends Model
{
    protected $fillable = ['messenger_id', 'date', 'start_time', 'end_time'];

    protected $casts = [
        'date' => 'date',
    ];

    public function messenger()
    {
        return $this->belongsTo(Messenger::class);
    }
}
