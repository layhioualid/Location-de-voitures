<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::create('payments', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('reservation_id');
        $table->decimal('amount', 10, 2); // montant payé
        $table->string('currency')->default('eur');
        $table->string('payment_method')->nullable(); // exemple : "stripe"
        $table->string('status')->default('succeeded'); // succeeded, failed, refunded...
        $table->string('transaction_id')->nullable(); // ID Stripe ou autre
        $table->timestamps();

        // Clé étrangère vers la réservation
        $table->foreign('reservation_id')->references('id')->on('reservations')->onDelete('cascade');
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
