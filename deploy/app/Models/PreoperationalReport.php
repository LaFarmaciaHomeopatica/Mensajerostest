<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PreoperationalReport extends Model
{
    protected $fillable = [
        'messenger_id',
        'answers',
        'observations',
    ];

    protected $casts = [
        'answers' => 'array',
    ];

    public function messenger()
    {
        return $this->belongsTo(Messenger::class);
    }
}
