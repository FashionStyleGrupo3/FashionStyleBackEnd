<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('materias_primas', function (Blueprint $table) {
            $table->id('id_material');
            $table->string('codigo', 30)->unique();
            $table->string('nombre');
            $table->string('clasificacion')->nullable();
            $table->foreignId('categoria_id')->nullable()
                ->constrained('categorias', 'id_categoria')->onDelete('set null');
            $table->integer('stock')->default(0);
            $table->integer('stock_min')->default(0);
            $table->decimal('costo_unitario', 10, 2);
            $table->string('imagen')->nullable();
            $table->foreignId('unidad_medida_id')->nullable()
                ->constrained('unidades_medida', 'id')->onDelete('set null');
            $table->boolean('activo')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('materias_primas');
    }
};
