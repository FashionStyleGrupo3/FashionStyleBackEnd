<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('detalle_ventas', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('venta_id');
            $table->unsignedBigInteger('producto_id')->nullable();
            $table->unsignedBigInteger('materia_prima_id')->nullable();
            $table->integer('cantidad');
            $table->decimal('precio_unitario', 10, 2);
            $table->decimal('subtotal', 10, 2);
            $table->timestamps();

            $table->foreign('venta_id')->references('id_venta')->on('ventas')->onDelete('cascade');
            $table->foreign('producto_id')->references('id_producto')->on('productos')->onDelete('set null');
            $table->foreign('materia_prima_id')->references('id_material')->on('materiales')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::dropIfExists('detalle_ventas');
    }
};