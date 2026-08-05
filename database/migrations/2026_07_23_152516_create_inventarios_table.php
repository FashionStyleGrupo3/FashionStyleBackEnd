<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventarios', function (Blueprint $table) {
            // Primary key
            $table->integer('ID_Inventario')->primary()->autoIncrement();
            
            // Foreign key columns (constraints added in later migrations)
            $table->unsignedBigInteger('ID_Producto')->nullable();
            $table->unsignedBigInteger('Materia_prima_id')->nullable();
            $table->unsignedBigInteger('Usuario_id');
            
            // Movement details
            $table->string('Tipo_Movimiento', 50);
            $table->string('Concepto', 100);
            $table->text('Observaciones')->nullable();
            $table->integer('Cantidad');
            
            // Cost fields (nuevos)
            $table->decimal('Costo_unitario', 10, 2)->nullable();
            $table->decimal('Costo_total', 10, 2)->nullable();
            
            // Date
            $table->dateTime('Fecha_Registro');

            // Indexes for performance
            $table->index('Tipo_Movimiento');
            $table->index('Fecha_Registro');
            $table->index('Concepto');
            $table->index(['ID_Producto', 'Materia_prima_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventarios');
    }
};