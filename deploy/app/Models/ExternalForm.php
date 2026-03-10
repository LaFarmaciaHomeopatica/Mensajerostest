<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExternalForm extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'url',
        'is_active',
    ];
}
