<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PreoperationalQuestion extends Model
{
    use HasFactory;

    protected $fillable = [
        'category',
        'label',
        'key',
        'type',
        'active',
        'order',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];
}
