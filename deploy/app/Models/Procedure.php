<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Procedure extends Model
{
    protected $fillable = [
        'guide',
        'product',
        'quantity',
        'client_id',
        'contact_name',
        'phone',
        'email',
        'address',
        'start_date',
        'end_date',
        'priority',
        'info',
        'management_notes',
        'status',
        'user_id',
        'messenger_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function messenger()
    {
        return $this->belongsTo(Messenger::class);
    }
}
