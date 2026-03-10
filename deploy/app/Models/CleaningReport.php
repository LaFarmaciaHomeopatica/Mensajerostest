<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CleaningReport extends Model
{
    protected $fillable = [
        'messenger_id',
        'item',
        'type',
        'observations',
    ];

    public function messenger()
    {
        return $this->belongsTo(Messenger::class);
    }
}
