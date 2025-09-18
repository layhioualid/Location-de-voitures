<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
public function up()
{
    Schema::create('cars', function (Blueprint $table) {
        $table->id();
        $table->string('brand');
        $table->string('model');
        $table->integer('year');
        $table->decimal('price_per_day', 8, 2);
        $table->boolean('available')->default(true);
        $table->string('image_url')->nullable();
        $table->timestamps();
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cars');
    }
};
