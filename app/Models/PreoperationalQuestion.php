<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PreoperationalQuestion extends Model
{
    protected $fillable = [
        'category',
        'label',
        'key',
        'active',
        'order',
    ];
}
