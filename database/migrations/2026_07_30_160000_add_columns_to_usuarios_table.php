<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // "id" -> "id_usuario" para que coincida con $primaryKey del modelo User
        if (Schema::hasColumn('usuarios', 'id') && !Schema::hasColumn('usuarios', 'id_usuario')) {
            Schema::table('usuarios', function (Blueprint $table) {
                $table->renameColumn('id', 'id_usuario');
            });
        }

        Schema::table('usuarios', function (Blueprint $table) {
            if (!Schema::hasColumn('usuarios', 'nombre')) {
                $table->string('nombre')->after('id_usuario');
            }
            if (!Schema::hasColumn('usuarios', 'correo')) {
                $table->string('correo')->unique()->after('nombre');
            }
            if (!Schema::hasColumn('usuarios', 'password_hash')) {
                $table->string('password_hash')->after('correo');
            }
            if (!Schema::hasColumn('usuarios', 'telefono')) {
                $table->string('telefono')->nullable()->after('password_hash');
            }
            if (!Schema::hasColumn('usuarios', 'direccion')) {
                $table->string('direccion')->nullable()->after('telefono');
            }
            if (!Schema::hasColumn('usuarios', 'ciudad')) {
                $table->string('ciudad')->nullable()->after('direccion');
            }
            if (!Schema::hasColumn('usuarios', 'activo')) {
                $table->boolean('activo')->default(1)->after('ciudad');
            }
        });
    }

    public function down(): void
    {
        Schema::table('usuarios', function (Blueprint $table) {
            $table->dropColumn(['nombre', 'correo', 'password_hash', 'telefono', 'direccion', 'ciudad', 'activo']);
        });
    }
};
