<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddDetailsToReservationsTable extends Migration
{
    public function up()
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->string('license_file_path')->nullable();
        });
    }

    public function down()
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn(['first_name', 'last_name', 'phone', 'address', 'license_file_path']);
        });
    }
}
