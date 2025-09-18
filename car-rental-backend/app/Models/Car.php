<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Car extends Model
{
    use HasFactory;

    protected $fillable = [
    'brand', 'model', 'year', 'price_per_day', 'available', 'image_url',
    'fuel_type', 'transmission', 'color', 'seats', 'trunk_size'
];
    protected $casts = [
    'available' => 'boolean',
];

public function reservations()
{
    return $this->hasMany(\App\Models\Reservation::class);
}
}
