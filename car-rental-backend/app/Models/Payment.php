<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'reservation_id',
        'amount',
        'currency',
        'payment_method',
        'status',
        'transaction_id',
    ];

    public function reservation()
    {
        return $this->belongsTo(Reservation::class);
    }
}

