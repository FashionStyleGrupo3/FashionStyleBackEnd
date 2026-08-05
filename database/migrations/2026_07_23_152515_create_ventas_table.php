<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
<<<<<<< HEAD
    public function up(): void
    {
        // Tabla de ventas
        Schema::create('ventas', function (Blueprint $table) {
            $table->unsignedInteger('ID_Venta')->primary()->autoIncrement();
            $table->string('Numero_Comprobante', 30)->unique();
            $table->unsignedBigInteger('ID_Usuario');
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
            $table->foreign('ID_Usuario')->references('id')->on('usuarios');
        });

    }

=======
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ventas', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
>>>>>>> a0ccae56a2448c859b8df04148bb599b4068acab
    public function down(): void
    {
        Schema::dropIfExists('ventas');
    }
<<<<<<< HEAD
};
=======
};
>>>>>>> a0ccae56a2448c859b8df04148bb599b4068acab
