<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('detalle_carrito', function (Blueprint $table) {
            $table->id();
            $table->foreignId('carrito_id')->constrained('carrito_de_compras', 'id')->onDelete('cascade');
            $table->foreignId('producto_id')->constrained('productos', 'id_producto')->onDelete('cascade');
            $table->foreignId('producto_variante_id')->nullable()
                ->constrained('productos_variantes', 'id_variante')->onDelete('set null');
            $table->integer('cantidad')->default(1);
            $table->decimal('precio', 10, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detalle_carrito');
    }
};
