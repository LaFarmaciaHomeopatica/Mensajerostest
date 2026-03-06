<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Messenger extends Model
{
    protected $fillable = ['name', 'vehicle', 'beetrack_id', 'lunch_duration', 'location', 'is_active', 'exclude_from_analytics'];

    public function lunchLogs()
    {
        return $this->hasMany(LunchLog::class);
    }

    public function shiftCompletions()
    {
        return $this->hasMany(ShiftCompletion::class);
    }

    public function shifts()
    {
        return $this->hasMany(Shift::class);
    }

    public function preoperationalReports()
    {
        return $this->hasMany(PreoperationalReport::class);
    }
}
