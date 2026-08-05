<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('detalle_venta', function (Blueprint $table) {
            $table->id();
<<<<<<< HEAD
            $table->unsignedInteger('venta_id');
            $table->unsignedBigInteger('producto_id');
=======
            $table->foreignId('venta_id')->constrained('ventas', 'id')->onDelete('cascade');
            $table->foreignId('producto_id')->constrained('productos', 'id_producto')->onDelete('restrict');
>>>>>>> a0ccae56a2448c859b8df04148bb599b4068acab
            $table->integer('cantidad');
            $table->decimal('precio_unitario', 10, 2);
            $table->decimal('subtotal', 10, 2);
            $table->timestamps();
<<<<<<< HEAD

            // Índices
            $table->index('venta_id');
            $table->index('producto_id');

            // Llaves foráneas
            $table->foreign('venta_id')->references('ID_Venta')->on('ventas')->onDelete('cascade');
            $table->foreign('producto_id')->references('id_producto')->on('productos')->onDelete('restrict');
=======
>>>>>>> a0ccae56a2448c859b8df04148bb599b4068acab
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detalle_venta');
    }
};
