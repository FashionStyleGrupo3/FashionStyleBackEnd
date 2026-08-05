<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ventas', function (Blueprint $table) {
            if (!Schema::hasColumn('ventas', 'numero_comprobante')) {
                $table->string('numero_comprobante', 30)->unique()->after('id');
            }
            if (!Schema::hasColumn('ventas', 'pedido_id')) {
                $table->foreignId('pedido_id')->nullable()->unique()->after('numero_comprobante')
                    ->constrained('pedidos', 'id')->onDelete('restrict');
            }
            if (!Schema::hasColumn('ventas', 'usuario_id')) {
                $table->foreignId('usuario_id')->after('pedido_id')     
                    ->constrained('usuarios', 'id_usuario')->onDelete('restrict');
            }
            if (!Schema::hasColumn('ventas', 'descripcion')) {
                $table->string('descripcion')->nullable()->after('usuario_id');
            }
            if (!Schema::hasColumn('ventas', 'categoria')) {
                $table->string('categoria', 50)->nullable()->after('descripcion');
            }
            if (!Schema::hasColumn('ventas', 'notas')) {
                $table->text('notas')->nullable()->after('categoria');
            }
            if (!Schema::hasColumn('ventas', 'fecha_venta')) {
                $table->timestamp('fecha_venta')->useCurrent()->after('notas');
            }
            if (!Schema::hasColumn('ventas', 'monto_total')) {
                $table->decimal('monto_total', 10, 2)->after('fecha_venta');
            }
            if (!Schema::hasColumn('ventas', 'medio_pago')) {
                $table->string('medio_pago', 50)->nullable()->after('monto_total');
            }
            if (!Schema::hasColumn('ventas', 'estado')) {
                $table->string('estado', 20)->default('Completada')->after('medio_pago');
            }
            if (!Schema::hasColumn('ventas', 'cancelada')) {
                $table->boolean('cancelada')->default(0)->after('estado');
            }
        });
    }

    public function down(): void
    {
        Schema::table('ventas', function (Blueprint $table) {
            $table->dropForeign(['pedido_id']);
            $table->dropForeign(['usuario_id']);
            $table->dropColumn([
                'numero_comprobante', 'pedido_id', 'usuario_id', 'descripcion', 'categoria',
                'notas', 'fecha_venta', 'monto_total', 'medio_pago', 'estado', 'cancelada',
            ]);
        });
    }
};
