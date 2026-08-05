<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inventarios', function (Blueprint $table) {
            if (!Schema::hasColumn('inventarios', 'producto_id')) {
                $table->foreignId('producto_id')->nullable()->after('ID_Inventario')
                    ->constrained('productos', 'id_producto')->onDelete('set null');
            }
            if (!Schema::hasColumn('inventarios', 'usuario_id')) {
                $table->foreignId('usuario_id')->after('producto_id')
                    ->constrained('usuarios', 'id_usuario')->onDelete('restrict');
            }
            if (!Schema::hasColumn('inventarios', 'tipo_movimiento')) {
                $table->string('tipo_movimiento', 50)->after('usuario_id');
            }
            if (!Schema::hasColumn('inventarios', 'concepto')) {
                $table->string('concepto', 100)->nullable()->after('tipo_movimiento');
            }
            if (!Schema::hasColumn('inventarios', 'observaciones')) {
                $table->text('observaciones')->nullable()->after('concepto');
            }
            if (!Schema::hasColumn('inventarios', 'cantidad')) {
                $table->integer('cantidad')->after('observaciones');
            }
            if (!Schema::hasColumn('inventarios', 'fecha_registro')) {
                $table->timestamp('fecha_registro')->useCurrent()->after('cantidad');
            }
            if (!Schema::hasColumn('inventarios', 'costo_unitario')) {
                $table->decimal('costo_unitario', 10, 2)->nullable()->after('fecha_registro');
            }
            if (!Schema::hasColumn('inventarios', 'costo_total')) {
                $table->decimal('costo_total', 10, 2)->nullable()->after('costo_unitario');
            }
            if (!Schema::hasColumn('inventarios', 'estado')) {
                $table->string('estado', 20)->default('Activo')->after('costo_total');
            }
            if (!Schema::hasColumn('inventarios', 'diferencia')) {
                $table->integer('diferencia')->default(0)->after('estado');
            }
        });
    }

    public function down(): void
    {
        Schema::table('inventarios', function (Blueprint $table) {
            $table->dropForeign(['producto_id']);
            $table->dropForeign(['usuario_id']);
            $table->dropColumn([
                'producto_id', 'usuario_id', 'tipo_movimiento', 'concepto', 'observaciones',
                'cantidad', 'fecha_registro', 'costo_unitario', 'costo_total', 'estado', 'diferencia',
            ]);
        });
    }
};
