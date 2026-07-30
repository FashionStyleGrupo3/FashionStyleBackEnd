<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Tabla de ventas
        Schema::create('ventas', function (Blueprint $table) {
            $table->integer('ID_Venta')->primary()->autoIncrement();
            $table->string('Numero_Comprobante', 30)->unique();
            $table->integer('ID_Usuario');
            $table->string('Descripcion', 255)->nullable();
            $table->string('Categoria', 50)->nullable();
            $table->text('Notas')->nullable();
            $table->dateTime('Fecha_Venta');
            $table->decimal('Monto_Total', 10, 2);
            $table->string('Medio_Pago', 50);
            $table->string('Estado', 20)->default('pendiente');
            $table->boolean('Cancelada')->default(false);

            // Índices
            $table->index('Numero_Comprobante');
            $table->index('Fecha_Venta');
            $table->index('Estado');
            $table->index('Medio_Pago');
            
            // Llave foránea
            $table->foreign('ID_Usuario')->references('id')->on('users');
        });

        // Tabla de detalles de venta
        Schema::create('detalles_venta', function (Blueprint $table) {
            $table->integer('ID_Detalle')->primary()->autoIncrement();
            $table->integer('ID_Venta');
            $table->integer('ID_Producto');
            $table->integer('Cantidad');
            $table->decimal('Precio_Unitario', 10, 2);
            $table->decimal('Subtotal', 10, 2);
            $table->decimal('Descuento', 10, 2)->default(0);
            $table->decimal('Total', 10, 2);

            // Índices
            $table->index('ID_Venta');
            $table->index('ID_Producto');
            
            // Llaves foráneas
            $table->foreign('ID_Venta')->references('ID_Venta')->on('ventas')->onDelete('cascade');
            $table->foreign('ID_Producto')->references('ID_Producto')->on('productos');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detalles_venta');
        Schema::dropIfExists('ventas');
    }
};