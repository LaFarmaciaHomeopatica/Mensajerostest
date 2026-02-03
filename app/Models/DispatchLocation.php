<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DispatchLocation extends Model
{
    protected $fillable = ['name', 'address', 'prefix', 'current_consecutive'];
}
