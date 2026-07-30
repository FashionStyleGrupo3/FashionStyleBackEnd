<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clientes', function (Blueprint $table) {
            if (!Schema::hasColumn('clientes', 'usuario_id')) {
                $table->foreignId('usuario_id')
                    ->after('id')
                    ->constrained('usuarios', 'id_usuario')
                    ->onDelete('cascade');
            }
            if (!Schema::hasColumn('clientes', 'nombre_completo')) {
                $table->string('nombre_completo')->after('usuario_id');
            }
            if (!Schema::hasColumn('clientes', 'correo')) {
                $table->string('correo')->after('nombre_completo');
            }
            if (!Schema::hasColumn('clientes', 'telefono')) {
                $table->string('telefono')->nullable()->after('correo');
            }
        });
    }

    public function down(): void
    {
        Schema::table('clientes', function (Blueprint $table) {
            $table->dropForeign(['usuario_id']);
            $table->dropColumn(['usuario_id', 'nombre_completo', 'correo', 'telefono']);
        });
    }
};
