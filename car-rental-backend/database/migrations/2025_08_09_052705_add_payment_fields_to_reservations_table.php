<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('reservations', function (Blueprint $t) {
            // Méthode & statut
            $t->string('payment_method')->default('card');      // 'card' | 'cash'
            $t->string('payment_status')->default('pending');   // 'pending' | 'paid' | 'failed' | 'refunded'

            // Montants
            $t->decimal('total_amount', 10, 2)->default(0);     // TTC prévu
            $t->decimal('amount_paid', 10, 2)->default(0);      // encaissé

            // Traçabilité
            $t->timestamp('paid_at')->nullable();
            $t->string('payment_reference')->nullable();        // id Stripe / reçu caisse
        });
    }

    public function down(): void {
        Schema::table('reservations', function (Blueprint $t) {
            $t->dropColumn([
                'payment_method','payment_status','total_amount',
                'amount_paid','paid_at','payment_reference',
            ]);
        });
    }
};
