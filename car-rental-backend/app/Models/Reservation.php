<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    protected $fillable = [
  'user_id','car_id','start_date','end_date',
  'pickup_location','dropoff_location','first_name','last_name',
  'phone','address','email','license_file_path',
  'payment_method','payment_status','total_amount','amount_paid',
  'paid_at','payment_reference',
];



// App\Models\Reservation.php

public function user()
{
    return $this->belongsTo(User::class);
}

public function car()
{
    return $this->belongsTo(Car::class);
}
public function payment()
{
    return $this->hasOne(Payment::class);
}

}
