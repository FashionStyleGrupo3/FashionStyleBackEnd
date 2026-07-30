<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('productos_variantes', function (Blueprint $table) {
            $table->id('id_variante');
            $table->unsignedBigInteger('producto_id');
            $table->string('talla', 20);
            $table->string('color', 50);
            $table->integer('stock')->default(0);
            $table->string('sku', 100)->nullable()->unique();
            $table->timestamps();

            $table->foreign('producto_id')
                ->references('id_producto')->on('productos')
                ->cascadeOnDelete();

            $table->unique(['producto_id', 'talla', 'color'], 'idx_producto_talla_color');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('productos_variantes');
    }
};