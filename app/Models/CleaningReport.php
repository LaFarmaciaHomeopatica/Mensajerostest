<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CleaningReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'messenger_id',
        'type',
        'answers',
        'evidence_path',
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
