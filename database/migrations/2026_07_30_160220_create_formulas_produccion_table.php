<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('formulas_produccion', function (Blueprint $table) {
            $table->id('id_formula');
            $table->foreignId('producto_id')->constrained('productos', 'id_producto')->onDelete('cascade');
            $table->foreignId('materia_prima_id')->constrained('materias_primas', 'id_material')->onDelete('restrict');
            $table->decimal('cantidad', 10, 2);
            $table->foreignId('unidad_medida_id')->nullable()
                ->constrained('unidades_medida', 'id')->onDelete('set null');
            $table->decimal('desperdicio_porcentaje', 5, 2)->default(0);
            $table->decimal('costo_unitario_estimado', 10, 2)->nullable();
            $table->foreignId('proveedor_id')->nullable()
                ->constrained('proveedors', 'id')->onDelete('set null');
            $table->text('notas')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('formulas_produccion');
    }
};
