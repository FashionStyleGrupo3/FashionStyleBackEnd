<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pedidos', function (Blueprint $table) {
            if (!Schema::hasColumn('pedidos', 'usuario_id')) {
                $table->foreignId('usuario_id')->after('id')->constrained('usuarios', 'id_usuario')->onDelete('restrict');
            }
            if (!Schema::hasColumn('pedidos', 'carrito_id')) {
                $table->foreignId('carrito_id')->nullable()->after('usuario_id')
                    ->constrained('carrito_de_compras', 'id')->onDelete('set null');
            }
            if (!Schema::hasColumn('pedidos', 'fecha_pedido')) {
                $table->timestamp('fecha_pedido')->useCurrent()->after('carrito_id');
            }
            if (!Schema::hasColumn('pedidos', 'estado')) {
                $table->string('estado', 30)->default('Pendiente_Pago')->after('fecha_pedido');
            }
            if (!Schema::hasColumn('pedidos', 'monto_subtotal')) {
                $table->decimal('monto_subtotal', 10, 2)->after('estado');
            }
            if (!Schema::hasColumn('pedidos', 'costo_envio')) {
                $table->decimal('costo_envio', 10, 2)->default(0)->after('monto_subtotal');
            }
            if (!Schema::hasColumn('pedidos', 'monto_total')) {
                $table->decimal('monto_total', 10, 2)->after('costo_envio');
            }
            if (!Schema::hasColumn('pedidos', 'direccion_envio')) {
                $table->string('direccion_envio')->after('monto_total');
            }
            if (!Schema::hasColumn('pedidos', 'ciudad_envio')) {
                $table->string('ciudad_envio', 100)->after('direccion_envio');
            }
            if (!Schema::hasColumn('pedidos', 'departamento_envio')) {
                $table->string('departamento_envio', 100)->after('ciudad_envio');
            }
            if (!Schema::hasColumn('pedidos', 'telefono_contacto')) {
                $table->string('telefono_contacto', 20)->after('departamento_envio');
            }
            if (!Schema::hasColumn('pedidos', 'empresa_transportadora')) {
                $table->string('empresa_transportadora', 100)->nullable()->after('telefono_contacto');
            }
            if (!Schema::hasColumn('pedidos', 'numero_guia')) {
                $table->string('numero_guia', 100)->nullable()->after('empresa_transportadora');
            }
            if (!Schema::hasColumn('pedidos', 'metodo_pago')) {
                $table->string('metodo_pago', 50)->nullable()->after('numero_guia');
            }
            if (!Schema::hasColumn('pedidos', 'referencia_pasarela')) {
                $table->string('referencia_pasarela', 100)->nullable()->after('metodo_pago');
            }
            if (!Schema::hasColumn('pedidos', 'notas_cliente')) {
                $table->text('notas_cliente')->nullable()->after('referencia_pasarela');
            }
        });
    }

    public function down(): void
    {
        Schema::table('pedidos', function (Blueprint $table) {
            $table->dropForeign(['usuario_id']);
            $table->dropForeign(['carrito_id']);
            $table->dropColumn([
                'usuario_id', 'carrito_id', 'fecha_pedido', 'estado', 'monto_subtotal',
                'costo_envio', 'monto_total', 'direccion_envio', 'ciudad_envio',
                'departamento_envio', 'telefono_contacto', 'empresa_transportadora',
                'numero_guia', 'metodo_pago', 'referencia_pasarela', 'notas_cliente',
            ]);
        });
    }
};
