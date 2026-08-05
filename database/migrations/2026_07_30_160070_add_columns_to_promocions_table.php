<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('promocions', function (Blueprint $table) {
            if (!Schema::hasColumn('promocions', 'nombre')) {
                $table->string('nombre')->after('id');
            }
            if (!Schema::hasColumn('promocions', 'descripcion')) {
                $table->text('descripcion')->nullable()->after('nombre');
            }
            if (!Schema::hasColumn('promocions', 'tipo')) {
                $table->string('tipo', 50)->nullable()->after('descripcion');
            }
            if (!Schema::hasColumn('promocions', 'valor')) {
                $table->decimal('valor', 10, 2)->nullable()->after('tipo');
            }
            if (!Schema::hasColumn('promocions', 'fecha_inicio')) {
                $table->dateTime('fecha_inicio')->nullable()->after('valor');
            }
            if (!Schema::hasColumn('promocions', 'fecha_fin')) {
                $table->dateTime('fecha_fin')->nullable()->after('fecha_inicio');
            }
            if (!Schema::hasColumn('promocions', 'activa')) {
                $table->boolean('activa')->default(1)->after('fecha_fin');
            }
            if (!Schema::hasColumn('promocions', 'producto_id')) {
                $table->foreignId('producto_id')->nullable()->after('activa')
                    ->constrained('productos', 'id_producto')->onDelete('cascade');
            }
            if (!Schema::hasColumn('promocions', 'usuario_id')) {
                $table->foreignId('usuario_id')->after('producto_id')
                    ->constrained('usuarios', 'id_usuario')->onDelete('restrict');
            }
        });
    }

    public function down(): void
    {
        Schema::table('promocions', function (Blueprint $table) {
            $table->dropForeign(['producto_id']);
            $table->dropForeign(['usuario_id']);
            $table->dropColumn([
                'nombre', 'descripcion', 'tipo', 'valor', 'fecha_inicio', 'fecha_fin',
                'activa', 'producto_id', 'usuario_id',
            ]);
        });
    }
};
