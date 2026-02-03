<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Messenger extends Model
{
    protected $fillable = ['name', 'vehicle', 'beetrack_id', 'lunch_duration', 'location'];

    public function lunchLogs()
    {
        return $this->hasMany(LunchLog::class);
    }
}
