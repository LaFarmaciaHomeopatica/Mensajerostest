<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InternalProcedure extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'messenger_id',
        'description',
        'destination_address',
        'contact_name',
        'contact_phone',
        'contact_email',
        'status',
        'beetrack_id'
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (!$model->code) {
                // Get the last record id to increment (approximate)
                // Or better: lock and count? 
                // Simple approach: get Max ID + 1. 
                // Since ID is not yet assigned, we can check max ID in DB.
                // However, ID might not be contiguous if deletions happen.
                // Relying on ID is risky if ID resets or gaps.
                // Better to check MAX code logic or just use ID after creation?
                // But we want code BEFORE creation to verify uniqueness?
                // Let's query the latest code.

                $latest = static::latest('id')->first();
                $nextId = $latest ? $latest->id + 1 : 1;

                // Format: TINT + 8 digits
                $model->code = 'TINT' . str_pad($nextId, 8, '0', STR_PAD_LEFT);
            }
        });
    }

    public function messenger()
    {
        return $this->belongsTo(Messenger::class);
    }
}
