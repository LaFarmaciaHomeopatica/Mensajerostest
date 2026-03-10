<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DispatchLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'messenger_id',
        'location_id',
        'consecutive',
        'guides_count',
        'date',
    ];

    public function messenger()
    {
        return $this->belongsTo(Messenger::class);
    }

    public function location()
    {
        return $this->belongsTo(DispatchLocation::class, 'location_id');
    }
}
