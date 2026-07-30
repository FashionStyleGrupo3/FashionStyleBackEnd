<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inventarios', function (Blueprint $table) {
            if (!Schema::hasColumn('inventarios', 'materia_prima_id')) {
                $table->foreignId('materia_prima_id')->nullable()->after('producto_id')
                    ->constrained('materias_primas', 'id_material')->onDelete('set null');
            }
        });
    }

    public function down(): void
    {
        Schema::table('inventarios', function (Blueprint $table) {
            $table->dropForeign(['materia_prima_id']);
            $table->dropColumn('materia_prima_id');
        });
    }
};
