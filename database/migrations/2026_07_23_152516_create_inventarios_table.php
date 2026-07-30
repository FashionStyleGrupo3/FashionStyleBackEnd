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
            
            // Foreign keys
            $table->integer('ID_Producto')->nullable();
            $table->integer('Materia_prima_id')->nullable();
            $table->integer('Usuario_id');
            
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

            // Foreign key constraints
            $table->foreign('ID_Producto')
                  ->references('ID_Producto')
                  ->on('productos')
                  ->onDelete('set null');

            $table->foreign('Materia_prima_id')
                  ->references('ID_Materia_Prima')
                  ->on('materias_primas')
                  ->onDelete('set null');

            $table->foreign('Usuario_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade');

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