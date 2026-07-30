<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('proveedors', function (Blueprint $table) {
            if (!Schema::hasColumn('proveedors', 'nombre')) {
                $table->string('nombre')->after('id');
            }
            if (!Schema::hasColumn('proveedors', 'contacto')) {
                $table->string('contacto')->nullable()->after('nombre');
            }
            if (!Schema::hasColumn('proveedors', 'telefono')) {
                $table->string('telefono')->nullable()->after('contacto');
            }
            if (!Schema::hasColumn('proveedors', 'email')) {
                $table->string('email')->nullable()->after('telefono');
            }
            if (!Schema::hasColumn('proveedors', 'direccion')) {
                $table->string('direccion')->nullable()->after('email');
            }
            if (!Schema::hasColumn('proveedors', 'notas')) {
                $table->text('notas')->nullable()->after('direccion');
            }
            if (!Schema::hasColumn('proveedors', 'activo')) {
                $table->boolean('activo')->default(1)->after('notas');
            }
        });
    }

    public function down(): void
    {
        Schema::table('proveedors', function (Blueprint $table) {
            $table->dropColumn(['nombre', 'contacto', 'telefono', 'email', 'direccion', 'notas', 'activo']);
        });
    }
};
